<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifySubscriptionActive
{
    /**
     * Handle an incoming request inside the tenant context.
     * Ensure the tenant's free trial or subscription is active.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        if (!$tenant) {
            return $next($request);
        }

        // If subscription is explicitly active, bypass all locks
        if ($tenant->subscription_status === 'active') {
            return $next($request);
        }

        // Check if the trial has expired
        if ($tenant->subscription_status === 'trial' && $tenant->trial_ends_at) {
            $trialEndsAt = \Carbon\Carbon::parse($tenant->trial_ends_at);
            // Allow a 3-day grace period past expiration
            $graceEndsAt = $trialEndsAt->copy()->addDays(3);

            if (now()->greaterThan($graceEndsAt)) {
                return response()->json([
                    'success' => false,
                    'error_code' => 'SUBSCRIPTION_EXPIRED',
                    'message' => 'Your 30-day free trial has expired. Please purchase a yearly subscription plan to unlock your StoreFlow POS and inventory services.',
                    'trial_ended_at' => $trialEndsAt->toIso8601String(),
                    'grace_ended_at' => $graceEndsAt->toIso8601String(),
                    'pricing_plan' => '$149.00 / Year'
                ], 402); // 402 Payment Required
            }
        }

        // If subscription is expired or cancelled
        if ($tenant->subscription_status === 'expired') {
            return response()->json([
                'success' => false,
                'error_code' => 'SUBSCRIPTION_EXPIRED',
                'message' => 'Your yearly subscription has expired. Please authorize a subscription renewal payment.',
                'pricing_plan' => '$149.00 / Year'
            ], 402);
        }

        return $next($request);
    }
}
