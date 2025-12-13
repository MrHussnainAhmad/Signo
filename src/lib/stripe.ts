import Stripe from 'stripe';
import { config, APP_NAME } from '@/lib/config';

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export type PlanType = 'solo' | 'studio' | 'upgrade';

export interface CreateCheckoutSessionParams {
  workspaceId: string;
  userEmail: string;
  planType: PlanType;
  successUrl: string;
  cancelUrl: string;
}

// Helper to check if a price ID is valid (starts with price_)
function isValidStripePriceId(priceId: string | undefined): boolean {
  return !!priceId && priceId.startsWith('price_');
}

// Create a Stripe Checkout session
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const { workspaceId, userEmail, planType, successUrl, cancelUrl } = params;

  const pricing = config.pricing[planType];
  const priceId = config.stripe.prices[planType];

  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Plan names and descriptions
  const planInfo: Record<PlanType, { name: string; description: string }> = {
    solo: {
      name: `${APP_NAME} Solo Plan`,
      description: 'One-time purchase. Single user access to all features.',
    },
    studio: {
      name: `${APP_NAME} Studio Plan`,
      description: 'One-time purchase. Up to 5 team members with collaboration features.',
    },
    upgrade: {
      name: `${APP_NAME} Solo to Studio Upgrade`,
      description: 'Upgrade your Solo plan to Studio. Add up to 4 more team members.',
    },
  };

  // Check if we have a valid Stripe Price ID configured
  if (isValidStripePriceId(priceId)) {
    // Use the pre-created Stripe Price
    lineItems.push({
      price: priceId,
      quantity: 1,
    });
  } else {
    // Create price inline using price_data
    // Main product/plan
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: planInfo[planType].name,
          description: planInfo[planType].description,
        },
        unit_amount: pricing.amount,
      },
      quantity: 1,
    });

    // Add tax as a separate line item (for solo and studio, not upgrade)
    if (pricing.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Processing Fee',
            description: 'One-time processing fee',
          },
          unit_amount: pricing.tax,
        },
        quantity: 1,
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: userEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      workspaceId,
      planType,
    },
    payment_intent_data: {
      metadata: {
        workspaceId,
        planType,
      },
    },
    // Add billing address collection for better receipts
    billing_address_collection: 'auto',
    // Allow promotion codes if you want to support them later
    allow_promotion_codes: true,
  });

  return session;
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhookSecret
  );
}

// Get checkout session by ID
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return null;
  }
}

// Get payment intent
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return null;
  }
}

// Create customer portal session (for receipt access)
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Get or create Stripe customer
export async function getOrCreateCustomer(
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      source: APP_NAME.toLowerCase(),
    },
  });

  return customer;
}

// Get invoice/receipt URL
export async function getReceiptUrl(paymentIntentId: string): Promise<string | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
      return charge.receipt_url;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting receipt URL:', error);
    return null;
  }
}