export const DIWALI_PROMOTION = Object.freeze({
  code: "DIWALIPREPZII",
  plan: "quarterly",
  regularPrice: 129,
  durationLabel: "3 months",
  endsAt: "2026-11-15T18:29:59.999Z",
});

export function normalizeCouponCode(value) {
  return String(value || "").trim().toUpperCase();
}

export function isDiwaliPromotionActive(now = new Date()) {
  return now.getTime() <= new Date(DIWALI_PROMOTION.endsAt).getTime();
}

export function validateDiwaliCoupon({ code, plan, now = new Date() }) {
  if (normalizeCouponCode(code) !== DIWALI_PROMOTION.code) {
    return { valid: false, message: "Enter a valid coupon code." };
  }
  if (plan !== DIWALI_PROMOTION.plan) {
    return { valid: false, message: "This coupon is available only for the Quarterly plan." };
  }
  if (!isDiwaliPromotionActive(now)) {
    return { valid: false, message: "This Diwali offer expired on 15 November 2026." };
  }
  return { valid: true, message: "Coupon applied. Your total is ₹0." };
}
