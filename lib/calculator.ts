// Comfort tier, from fitin.space: a 12 rft kitchen = PKR 7.55–9.19 Lakh. Scaled linearly per running foot.
const RATE_LOW = 7.55 / 12
const RATE_HIGH = 9.19 / 12

export const RFT_MIN = 6
export const RFT_MAX = 30
export const RFT_DEFAULT = 12

export function kitchenEstimate(input: number) {
  const rft = Number.isFinite(input) ? Math.min(RFT_MAX, Math.max(RFT_MIN, Math.round(input))) : RFT_DEFAULT
  return { rft, low: (rft * RATE_LOW).toFixed(2), high: (rft * RATE_HIGH).toFixed(2) }
}
