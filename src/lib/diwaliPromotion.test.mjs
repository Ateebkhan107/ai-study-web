import assert from "node:assert/strict";
import test from "node:test";
import {
  DIWALI_PROMOTION,
  isDiwaliPromotionActive,
  normalizeCouponCode,
  validateDiwaliCoupon,
} from "./diwaliPromotion.js";

test("normalizes the Diwali coupon", () => {
  assert.equal(normalizeCouponCode("  diwaliprepzii "), DIWALI_PROMOTION.code);
});

test("accepts the coupon for Quarterly before the deadline", () => {
  assert.equal(
    validateDiwaliCoupon({
      code: "diwaliprepzii",
      plan: "quarterly",
      now: new Date("2026-11-15T18:29:59.999Z"),
    }).valid,
    true
  );
});

test("rejects the coupon after the deadline", () => {
  assert.equal(isDiwaliPromotionActive(new Date("2026-11-15T18:30:00.000Z")), false);
});

test("rejects non-quarterly plans", () => {
  assert.match(
    validateDiwaliCoupon({
      code: DIWALI_PROMOTION.code,
      plan: "yearly",
      now: new Date("2026-11-08T00:00:00.000Z"),
    }).message,
    /Quarterly/
  );
});
