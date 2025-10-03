import type { Locale } from 'next-intl';

/**
 * Interval types for subscription plans
 */
export type PlanInterval = PlanIntervals.MONTH | PlanIntervals.YEAR;

export enum PlanIntervals {
  MONTH = 'month',
  YEAR = 'year',
}

/**
 * Payment type (subscription or one-time)
 */
export type PaymentType = PaymentTypes.SUBSCRIPTION | PaymentTypes.ONE_TIME;

export enum PaymentTypes {
  SUBSCRIPTION = 'subscription',  // Regular recurring subscription
  ONE_TIME = 'one_time',          // One-time payment
}

/**
 * Status of a payment or subscription
 */
export type PaymentStatus =
  | 'active'                         // Subscription is active
  | 'canceled'                       // Subscription has been canceled
  | 'incomplete'                     // Payment not completed
  | 'incomplete_expired'             // Payment not completed and expired
  | 'past_due'                       // Payment is past due
  | 'paused'                         // Subscription is paused
  | 'trialing'                       // In trial period
  | 'unpaid'                         // Payment failed
  | 'completed'                      // One-time payment completed
  | 'processing'                     // Payment is processing
  | 'failed';                        // Payment failed

/**
 * Price definition for a plan
 */
export interface Price {
  type: PaymentType;                 // Type of payment (subscription or one_time)
  priceId: string;                   // Stripe price ID (not product id)
  amount: number;                    // Price amount in currency units (dollars, euros, etc.)
  currency: string;                  // Currency code (e.g., USD)
  interval?: PlanInterval;           // Billing interval for recurring payments
  trialPeriodDays?: number;          // Free trial period in days
  allowPromotionCode?: boolean;      // Whether to allow promotion code for this price
  disabled?: boolean;                // Whether to disable this price in UI
}

/**
 * Credits configuration for a plan
 */
export interface Credits {
  enable: boolean;                   // Whether to enable credits for this plan
  amount: number;                    // Number of credits provided per month
  expireDays?: number;               // Number of days until credits expire, undefined means no expiration
}

/**
 * Price plan definition
 *
 * 1. When to set the plan disabled?
 * When the plan is not available anymore, but you should keep it for existing users
 * who have already purchased it, otherwise they can not see the plan in the Billing page.
 *
 * 2. When to set the price disabled?
 * When the price is not available anymore, but you should keep it for existing users
 * who have already purchased it, otherwise they can not see the price in the Billing page.
 */
export interface PricePlan {
  id: string;                        // Unique identifier for the plan
  name?: string;                     // Display name of the plan
  description?: string;              // Description of the plan features
  features?: string[];               // List of features included in this plan
  limits?: string[];                 // List of limits for this plan
  prices: Price[];                   // Available prices for this plan
  isFree: boolean;                   // Whether this is a free plan
  isLifetime: boolean;               // Whether this is a lifetime plan
  popular?: boolean;                 // Whether to mark this plan as popular in UI
  disabled?: boolean;                // Whether to disable this plan in UI
  credits?: Credits;                 // Credits configuration for this plan
}

/**
 * Customer data
 */
export interface Customer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

/**
 * Subscription data
 */
export interface Subscription {
  id: string;
  customerId: string;
  status: PaymentStatus;
  priceId: string;
  type: PaymentType;
  interval?: PlanInterval;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  createdAt: Date;
}

/**
 * Payment data
 */
export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  metadata?: Record<string, string>;
}

/**
 * Parameters for creating a checkout session
 */
export interface CreateCheckoutParams {
  planId: string;
  priceId: string;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  locale?: Locale;
}

/**
 * Parameters for creating a credit checkout session
 */
export interface CreateCreditCheckoutParams {
  packageId: string;
  priceId: string;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  locale?: Locale;
}

/**
 * Result of creating a checkout session
 */
export interface CheckoutResult {
  url: string;
  id: string;
}

/**
 * Parameters for creating a customer portal
 */
export interface CreatePortalParams {
  customerId: string;
  returnUrl?: string;
  locale?: Locale;
}

/**
 * Result of creating a customer portal
 */
export interface PortalResult {
  url: string;
}

/**
 * Parameters for getting customer subscriptions
 */
export interface getSubscriptionsParams {
  userId: string;
}

/**
 * Payment provider interface
 */
export interface PaymentProvider {
  /**
   * Create a checkout session
   */
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;

  /**
   * Create a credit checkout session
   */
  createCreditCheckout(params: CreateCreditCheckoutParams): Promise<CheckoutResult>;

  /**
   * Create a customer portal session
   */
  createCustomerPortal(params: CreatePortalParams): Promise<PortalResult>;

  /**
   * Get customer subscriptions
   */
  getSubscriptions(params: getSubscriptionsParams): Promise<Subscription[]>;

  /**
   * Handle webhook events
   */
  handleWebhookEvent(payload: string, signature: string): Promise<void>;
}
