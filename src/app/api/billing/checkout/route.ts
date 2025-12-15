import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createCheckoutSession, type PlanType } from '@/lib/stripe';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';

const checkoutSchema = z.object({
  planType: z.enum(['solo', 'studio', 'upgrade', 'business']),
});

// POST - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Validate request body
    const { data, error } = await validateBody(request, checkoutSchema);
    if (error) {
      return error;
    }

    const { planType } = data;

    // Get workspace
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
      include: {
        owner: true,
      },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Only owner can purchase
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can manage billing');
    }

    // Determine if this is a Studio -> Business upgrade
    const isUpgradeFromStudio = planType === 'business' && workspace.plan === 'STUDIO';

    // Validate purchase based on current plan
    if (planType === 'solo') {
      if (workspace.plan !== 'UNPAID') {
        return errorResponse('You already have a plan', 400);
      }
    } else if (planType === 'studio') {
      if (workspace.plan !== 'UNPAID') {
        return errorResponse('You already have a plan. Use upgrade instead.', 400);
      }
    } else if (planType === 'upgrade') {
      if (workspace.plan !== 'SOLO') {
        return errorResponse('Upgrade is only available for Solo plan users', 400);
      }
    } else if (planType === 'business') {
      if (workspace.plan === 'BUSINESS') {
        return errorResponse('You already have the Business plan', 400);
      }
      // Allow SOLO to purchase Business (full price, no special upgrade path)
      // Allow STUDIO to purchase Business (with $10 upgrade fee via isUpgradeFromStudio)
      // Allow UNPAID to purchase Business
    }

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      workspaceId: workspace.id,
      userEmail: workspace.owner.email,
      planType: planType as PlanType,
      successUrl: `${config.appUrl}/app/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${config.appUrl}/app/billing?canceled=true`,
      isUpgradeFromStudio,
    });

    // Create pending purchase record
    const pricing = config.pricing[planType as keyof typeof config.pricing];
    
    // For business, the amount recorded in DB is the recurring amount
    // We could add the upgrade fee to the DB record, but for simplicity let's just record the plan amount
    await db.purchase.create({
      data: {
        workspaceId: workspace.id,
        stripeSessionId: checkoutSession.id,
        type: planType.toUpperCase() as 'SOLO' | 'STUDIO' | 'UPGRADE' | 'BUSINESS',
        amount: pricing.amount,
        tax: pricing.tax,
        status: 'PENDING',
      },
    });

    return successResponse({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET - Get billing info
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Get workspace
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
      include: {
        purchases: {
          where: {
            status: 'COMPLETED',
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    const isOwner = workspace.ownerId === session.userId;
    
    let maxMembers = 0;
    if (workspace.plan === 'STUDIO') maxMembers = config.limits.studio.maxMembers;
    else if (workspace.plan === 'SOLO') maxMembers = config.limits.solo.maxMembers;
    else if (workspace.plan === 'BUSINESS') maxMembers = config.limits.business.maxMembers;

    return successResponse({
      plan: workspace.plan,
      isOwner,
      memberCount: workspace._count.members,
      maxMembers,
      canUpgrade: (workspace.plan === 'SOLO' && isOwner) || (workspace.plan === 'STUDIO' && isOwner), // Can upgrade from SOLO (to Studio) or STUDIO (to Business)
      purchases: workspace.purchases.map((p) => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        tax: p.tax,
        total: p.amount + p.tax,
        currency: p.currency,
        createdAt: p.createdAt,
      })),
      pricing: {
        solo: {
          amount: config.pricing.solo.amount / 100,
          tax: config.pricing.solo.tax / 100,
          total: config.pricing.solo.total / 100,
        },
        studio: {
          amount: config.pricing.studio.amount / 100,
          tax: config.pricing.studio.tax / 100,
          total: config.pricing.studio.total / 100,
        },
        upgrade: {
          amount: config.pricing.upgrade.amount / 100,
          tax: config.pricing.upgrade.tax / 100,
          total: config.pricing.upgrade.total / 100,
        },
        business: {
          amount: config.pricing.business.amount / 100,
          tax: config.pricing.business.tax / 100,
          total: config.pricing.business.total / 100,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}