import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { registerHooks } from "node:module";
import test from "node:test";

const sign = (secret, raw) => createHmac("sha256", secret).update(raw).digest("hex");
const checkoutSecret = "fixture-checkout";
const webhookSecret = "fixture-webhook";
const orderId = "order_test";
const paymentId = "pay_test";
const receipt = "7ba1aa83-2a0f-4db4-97c6-b5092b991d70";
let actor;
let checkout;
let providerOrder;
let providerPayment;
let rpcResult;
let calls;
let subscriptions;
let intentError;

const fixture = {
  auth: async () => ({ userId: actor }),
  profile: async () => ({ examTrack: "JEE" }),
  subscriptions: async () => subscriptions,
  order: async (id) => {
    calls.push("fetch-order");
    assert.equal(id, orderId);
    return providerOrder;
  },
  payment: async (id) => {
    calls.push("fetch-payment");
    assert.equal(id, paymentId);
    return providerPayment;
  },
  create: async (payload) => {
    calls.push("create-provider-order");
    assert.deepEqual(payload.notes, { user_id: "student", plan: "ai_mode", exam_track: "JEE" });
    assert.equal(payload.amount, 199900);
    return { id: orderId, ...payload };
  },
  db: {
    from(table) {
      assert.equal(table, "razorpay_checkout_orders");
      const builder = {
        select: () => builder,
        eq: () => builder,
        is: () => builder,
        insert: async (value) => {
          assert.equal(value.amount_paise, 199900);
          assert.equal(value.clerk_user_id, "student");
          assert.equal(value.exam_track, "JEE");
          calls.push("write-intent");
          return { error: intentError };
        },
        update: (value) => {
          assert.deepEqual(value, { provider_order_id: orderId });
          calls.push("bind-provider-order");
          return builder;
        },
        maybeSingle: async () => {
          calls.push("read-checkout");
          return { data: checkout };
        },
      };
      return builder;
    },
    rpc: async (name, args) => {
      calls.push("redeem");
      assert.equal(name, "redeem_verified_razorpay_payment");
      assert.deepEqual(args, {
        p_order_id: orderId, p_payment_id: paymentId, p_user_id: "student",
        p_amount_paise: 4900, p_currency: "INR",
      });
      return rpcResult;
    },
  },
};
globalThis.__razorpayTestFixture = fixture;
const mocks = {
  "@clerk/nextjs/server": "export const auth=()=>globalThis.__razorpayTestFixture.auth();export const currentUser=async()=>null;",
  "next/server": "export const NextResponse=Response;",
  "@/lib/supabaseAdmin": "export const supabaseAdmin=globalThis.__razorpayTestFixture.db;",
  "@/lib/accessControl": `export const getProfileAccessProfile=()=>globalThis.__razorpayTestFixture.profile();
    export const getActiveSubscriptionsForUser=()=>globalThis.__razorpayTestFixture.subscriptions();
    export const isSubscriptionActive=(subscription)=>subscription.status==='active'&&new Date(subscription.expires_at)>new Date();
    export const normalizeExamTrack=(track)=>track.toUpperCase();`,
  "@/lib/razorpay": `export const getRazorpayOrder=(id)=>globalThis.__razorpayTestFixture.order(id);
    export const getRazorpayPayment=(id)=>globalThis.__razorpayTestFixture.payment(id);
    export const createRazorpayOrder=(body)=>globalThis.__razorpayTestFixture.create(body);
    export const getRazorpayKeyId=()=>'rzp_test_fixture';`,
};
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (mocks[specifier]) return { url: "data:text/javascript," + encodeURIComponent(mocks[specifier]), shortCircuit: true };
  if (specifier === "@/lib/razorpayPayments.server") return next(new URL("../razorpayPayments.server.js", import.meta.url).href, context);
  return next(specifier, context);
} });
const { POST: createOrder } = await import("../../app/api/payment/create-order/route.js");
const { POST: verify } = await import("../../app/api/payment/verify/route.js");
const { POST: webhook } = await import("../../app/api/webhooks/razorpay/route.js");

const env = [process.env.RAZORPAY_KEY_SECRET, process.env.RAZORPAY_WEBHOOK_SECRET];
test.beforeEach(() => {
  actor = "student";
  calls = [];
  subscriptions = [];
  intentError = null;
  checkout = { receipt, provider_order_id: orderId, clerk_user_id: actor, exam_track: "JEE", plan: "monthly", amount_paise: 4900, currency: "INR" };
  providerOrder = {
    id: orderId, receipt, notes: { user_id: actor, exam_track: "JEE", plan: "monthly" },
    amount: 4900, amount_paid: 4900, amount_due: 0, currency: "INR", status: "paid",
  };
  providerPayment = {
    id: paymentId, order_id: orderId, amount: 4900, currency: "INR",
    amount_refunded: 0, status: "captured", captured: true,
  };
  rpcResult = { data: "applied" };
  process.env.RAZORPAY_KEY_SECRET = checkoutSecret;
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
});

const jsonRequest = (body) => new Request("https://fixture.invalid", { method: "POST", body: JSON.stringify(body) });
const verifyRequest = (signature = sign(checkoutSecret, orderId + "|" + paymentId)) => jsonRequest({
  razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature,
});
const webhookBody = '{"event":"payment.captured", "payload":{"payment":{"entity":{"id":"pay_test","order_id":"order_test"}}}}\n';
const webhookRequest = (raw = webhookBody, signature = sign(webhookSecret, webhookBody)) =>
  new Request("https://fixture.invalid", { method: "POST", body: raw, headers: { "x-razorpay-signature": signature } });

test("checkout stores the plan and advertised amount before creating and binding the provider order", async () => {
  const response = await createOrder(jsonRequest({ plan: "ai_mode", examTrack: "JEE", amount: 1 }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).order.amount, 199900);
  assert.deepEqual(calls, ["write-intent", "create-provider-order", "bind-provider-order", "read-checkout"]);
});

test("checkout rejects invalid plans, wrong tracks, active equal or higher plans, and failed intent persistence", async () => {
  assert.equal((await createOrder(jsonRequest({ plan: "constructor", examTrack: "JEE" }))).status, 400);
  assert.equal((await createOrder(jsonRequest({ plan: "ai_mode", examTrack: "NEET" }))).status, 403);
  subscriptions = [{ status: "active", plan: "ai_mode", expires_at: "2099-01-01" }];
  assert.equal((await createOrder(jsonRequest({ plan: "ai_mode", examTrack: "JEE" }))).status, 409);
  assert.deepEqual(calls, []);
  subscriptions = [];
  intentError = { code: "42P01" };
  assert.equal((await createOrder(jsonRequest({ plan: "ai_mode", examTrack: "JEE" }))).status, 503);
  assert.deepEqual(calls, ["write-intent"]);
});

test("checkout verification rejects unsigned, unregistered and cross-account callbacks before provider reads", async () => {
  actor = null;
  assert.equal((await verify(verifyRequest())).status, 401);
  actor = "another-student";
  assert.equal((await verify(verifyRequest())).status, 404);
  actor = "student";
  assert.equal((await verify(verifyRequest("a".repeat(64)))).status, 400);
  checkout = null;
  assert.equal((await verify(verifyRequest())).status, 404);
  assert.ok(calls.every((call) => call === "read-checkout"));
});

test("provider ownership, references, amount, currency, capture and refund are authoritative", async () => {
  const originalOrder = providerOrder;
  const originalPayment = providerPayment;
  for (const change of [
    { notes: { ...providerOrder.notes, user_id: "another-student" } },
    { notes: { ...providerOrder.notes, exam_track: "NEET" } },
    { notes: { ...providerOrder.notes, plan: "yearly" } },
    { receipt: "other" }, { amount: 1 }, { currency: "USD" },
  ]) {
    providerOrder = { ...originalOrder, ...change };
    assert.equal((await verify(verifyRequest())).status, 400);
  }
  providerOrder = originalOrder;
  for (const change of [{ id: "pay_other" }, { order_id: "order_other" }, { amount: 1 }, { currency: "USD" }, { amount_refunded: 1 }]) {
    providerPayment = { ...originalPayment, ...change };
    assert.equal((await verify(verifyRequest())).status, 400);
  }
  providerPayment = { ...originalPayment, status: "authorized", captured: false };
  assert.equal((await verify(verifyRequest())).status, 409);
  assert.ok(!calls.includes("redeem"));
});

test("checkout and webhook use the same verified RPC and acknowledge duplicate delivery", async () => {
  assert.equal((await verify(verifyRequest())).status, 200);
  rpcResult = { data: "already_applied" };
  assert.equal((await webhook(webhookRequest())).status, 200);
  assert.equal(calls.filter((call) => call === "redeem").length, 2);
});

test("webhook authenticates raw bytes and retries temporary capture or persistence failures", async () => {
  assert.equal((await webhook(webhookRequest(webhookBody.trim()))).status, 401);
  assert.deepEqual(calls, []);
  providerOrder = { ...providerOrder, status: "attempted", amount_due: 4900, amount_paid: 0 };
  assert.equal((await webhook(webhookRequest())).status, 503);
  assert.ok(!calls.includes("redeem"));
  providerOrder = { ...providerOrder, status: "paid", amount_due: 0, amount_paid: 4900 };
  rpcResult = { error: { code: "08006" } };
  assert.equal((await webhook(webhookRequest())).status, 503);
  rpcResult = { data: "already_applied" };
  assert.equal((await webhook(webhookRequest())).status, 200);
});

test("a captured superseded order is acknowledged but does not claim checkout success", async () => {
  rpcResult = { data: "superseded" };
  assert.equal((await verify(verifyRequest())).status, 409);
  assert.equal((await (await webhook(webhookRequest())).json()).disposition, "superseded");
});

test.after(() => {
  hooks.deregister();
  delete globalThis.__razorpayTestFixture;
  ["RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"].forEach((name, index) => {
    if (env[index] === undefined) delete process.env[name];
    else process.env[name] = env[index];
  });
});
