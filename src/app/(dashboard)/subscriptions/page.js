import PageWrapper from "@/components/PageWrapper";
import { CreditCard, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Subscriptions",
  description: "Learn how PrepZii Pro subscriptions, billing, and access work.",
  alternates: { canonical: "/subscriptions" },
};

export default function SubscriptionsPage() {
  return (
    <PageWrapper 
      title="Subscriptions" 
      subtitle="Everything you need to know about PrepZii Pro plans." 
      badge="BILLING"
      badgeVariant="amber"
    >
      <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-slideUp">
        
        {/* Header Info */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-slate-800/50">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium">Billing & Subscriptions</span>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Last Updated: July 2026
          </span>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-center font-bold px-4 py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-500/30">
            PrepZii subscriptions are fixed-term plans. They remain active until the end of the purchased billing period.
          </p>

          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">1. PrepZii Pro & Premium Features</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                PrepZii offers a premium subscription tier known as PrepZii Pro. Purchasing a Pro plan grants you access to advanced analytics, unlimited full-length mock tests, detailed solutions, and priority support. These features are strictly tied to your active subscription status.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">2. Subscription Plans & Billing Period</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We offer multiple fixed-term plans (e.g., 1 Month, 6 Months, etc.). The duration of your subscription depends entirely on the plan selected at checkout. Payments are processed securely through Cashfree Payments. All features remain fully available to you continuously until the subscription expires.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">3. Subscription Expiry</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                You can view your current subscription status, plan details, and exact expiry date at any time by navigating to your account settings or profile. Once your active billing period concludes and the subscription expires, your account will automatically return to the standard free tier, and access to premium features will be restricted unless another subscription is purchased.
              </p>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200/60 dark:border-slate-800/50">
            <div className="glass-card p-6 rounded-3xl text-center space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Ready to upgrade?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Join thousands of other aspirants taking their preparation to the next level with PrepZii Pro.
              </p>
              <div className="pt-2">
                <Link 
                  href="/pricing" 
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  View Pricing Plans
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
