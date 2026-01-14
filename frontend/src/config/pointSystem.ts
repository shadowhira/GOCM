/**
 * Point System Configuration
 * 
 * Centralized configuration for the reward point economy.
 * This file mirrors the backend RewardPointRules.cs for frontend reference.
 * 
 * NOTE: The actual values are enforced by the backend. These values are for:
 * - UI display and validation hints
 * - Form default values
 * - User-facing documentation
 */

// ============================================================================
// DAILY LIMITS
// ============================================================================

export const DailyLimits = {
  /** Maximum points a teacher can manually reward per student per day */
  MAX_MANUAL_REWARD: 200,
  
  /** Maximum penalty points per student per day */
  MAX_PENALTY: 100,
} as const

// ============================================================================
// ACTIVITY POINTS
// ============================================================================

export const ActivityPoints = {
  // === Automatic rewards ===
  /** Points for joining a live room (one-time per room) */
  LIVE_ROOM_JOIN: 20,
  
  /** Bonus for joining live room early (within first 5 mins) */
  LIVE_ROOM_QUICK_BONUS: 10,
  
  /** Points for submitting assignment before deadline */
  ON_TIME_SUBMISSION: 25,
  
  /** Bonus for achieving high grade (≥90%) */
  HIGH_GRADE_BONUS: 30,

  // === Teacher-awarded rewards (default values) ===
  /** Default points for post contribution */
  POST_CONTRIBUTION: 15,
  
  /** Default points for comment contribution */
  COMMENT_CONTRIBUTION: 10,

  // === Penalties ===
  /** Default penalty points */
  MANUAL_PENALTY: 10,
} as const

// ============================================================================
// REWARD RANGES (for teacher manual awards)
// ============================================================================

export const RewardRanges = {
  post: {
    min: 5,
    max: 50,
    default: ActivityPoints.POST_CONTRIBUTION,
  },
  
  comment: {
    min: 5,
    max: 30,
    default: ActivityPoints.COMMENT_CONTRIBUTION,
  },
  
  manual: {
    min: 5,
    max: 100,
  },
  
  penalty: {
    min: 5,
    max: 50,
    default: ActivityPoints.MANUAL_PENALTY,
  },
} as const

// ============================================================================
// THRESHOLDS
// ============================================================================

export const Thresholds = {
  /** Minimum score (0-100) to qualify for high grade bonus */
  HIGH_GRADE_SCORE: 90,
} as const

// ============================================================================
// SHOP ITEM PRICING GUIDELINES
// ============================================================================

import { ShopItemTier } from '@/types/shopItem'

export interface TierPricing {
  minPrice: number
  maxPrice: number
  recommendedPrice: number
  durationDays: number
  description: string
}

export const ShopItemPricing: Record<ShopItemTier, TierPricing> = {
  [ShopItemTier.Basic]: {
    minPrice: 100,
    maxPrice: 200,
    recommendedPrice: 150,
    durationDays: 7,
    description: 'Dễ đạt với 2-5 ngày tham gia tích cực',
  },
  
  [ShopItemTier.Advanced]: {
    minPrice: 300,
    maxPrice: 500,
    recommendedPrice: 400,
    durationDays: 14,
    description: 'Cần 1-2 tuần tham gia đều đặn',
  },
  
  [ShopItemTier.Elite]: {
    minPrice: 600,
    maxPrice: 1000,
    recommendedPrice: 800,
    durationDays: 30,
    description: 'Thành tích đáng kể, cần 2-3 tuần nỗ lực',
  },
  
  [ShopItemTier.Legendary]: {
    minPrice: 1500,
    maxPrice: 3000,
    recommendedPrice: 2000,
    durationDays: 60,
    description: 'Mốc quan trọng, cần 1-2 tháng cống hiến',
  },
}

// ============================================================================
// EARNING ESTIMATES
// ============================================================================

export const EarningEstimates = {
  /** Estimated daily points for active student */
  dailyActive: {
    min: 30,
    max: 200,
    typical: 80,
  },
  
  /** Estimated weekly points (5 days active) */
  weekly: {
    min: 150,
    max: 1000,
    typical: 400,
  },
  
  /** Estimated monthly points (4 weeks) */
  monthly: {
    min: 600,
    max: 4000,
    typical: 1600,
  },
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get pricing info for a given tier
 */
export function getTierPricing(tier: ShopItemTier): TierPricing {
  return ShopItemPricing[tier]
}

/**
 * Check if a price is within valid range for a tier
 */
export function isValidPriceForTier(price: number, tier: ShopItemTier): boolean {
  const pricing = ShopItemPricing[tier]
  return price >= pricing.minPrice && price <= pricing.maxPrice
}

/**
 * Get recommended duration for a tier
 */
export function getRecommendedDuration(tier: ShopItemTier): number {
  return ShopItemPricing[tier].durationDays
}

/**
 * Estimate days to earn enough points for a price
 */
export function estimateDaysToEarn(price: number): { min: number; max: number; typical: number } {
  const daily = EarningEstimates.dailyActive
  return {
    min: Math.ceil(price / daily.max),
    max: Math.ceil(price / daily.min),
    typical: Math.ceil(price / daily.typical),
  }
}
