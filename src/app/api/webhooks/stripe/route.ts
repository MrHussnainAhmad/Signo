import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature, getReceiptUrl } from '@/lib/stripe';
import { sendEmail } from '@/lib/email/transporter';
import {
  paymentReceiptTemplate,
  upgradeConfirmationTemplate,
} from '@/lib/email/templates';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Stripe webhook: No signature provided');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        await handlePaymentFailed(paymentIntent);
        break;
      }

      // Subscription events - suppress unhandled logs for now
      case 'invoice.payment_succeeded':
      case 'customer.subscription.updated':
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  const { workspaceId, planType } = session.metadata || {};

  if (!workspaceId || !planType) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Find the purchase record
  const purchase = await db.purchase.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (!purchase) {
    console.error('Purchase not found for session:', session.id);
    return;
  }

  if (purchase.status === 'COMPLETED') {
    console.log('Purchase already completed:', purchase.id);
    return;
  }

  // Update purchase status
  await db.purchase.update({
    where: { id: purchase.id },
    data: {
      status: 'COMPLETED',
      stripePaymentId: session.payment_intent,
    },
  });

  // Update workspace plan
  const newPlan = planType === 'upgrade' ? 'STUDIO' : planType.toUpperCase();
  
  const workspace = await db.workspace.update({
    where: { id: workspaceId },
    data: { plan: newPlan },
    include: {
      owner: true,
    },
  });

  // Get receipt URL
  let receiptUrl: string | null = null;
  if (session.payment_intent) {
    receiptUrl = await getReceiptUrl(session.payment_intent);
  }

  // Send appropriate email
  if (planType === 'upgrade') {
    const emailContent = upgradeConfirmationTemplate(
      workspace.owner.name,
      `${config.appUrl}/app/settings`
    );

    await sendEmail({
      to: workspace.owner.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  } else {
    const pricing = config.pricing[planType as keyof typeof config.pricing];
    const planName = planType === 'solo' ? 'Solo' : 'Studio';

    const emailContent = paymentReceiptTemplate(
      workspace.owner.name,
      planName,
      pricing.amount,
      pricing.tax,
      pricing.total,
      receiptUrl || undefined
    );

    await sendEmail({
      to: workspace.owner.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  }

  console.log(`Payment completed for workspace ${workspaceId}, plan: ${newPlan}`);
}

async function handlePaymentFailed(paymentIntent: any) {
  const { workspaceId } = paymentIntent.metadata || {};

  if (!workspaceId) {
    return;
  }

  // Find and update the purchase record
  const purchase = await db.purchase.findFirst({
    where: {
      workspaceId,
      stripePaymentId: paymentIntent.id,
      status: 'PENDING',
    },
  });

  if (purchase) {
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: 'FAILED' },
    });
  }

  console.log(`Payment failed for workspace ${workspaceId}`);
}

// Disable body parsing for webhook
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';