import PageWrapper from "@/components/PageWrapper";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "Read about how PrepZii collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: "When you use PrepZii, we may collect personal information such as your name, email address, phone number, and educational background. We also automatically collect usage data including test scores, time spent on questions, and platform navigation patterns to help improve your personalized learning experience."
  },
  {
    title: "2. How We Use Your Information",
    content: "The data we collect is primarily used to provide, maintain, and improve our services. Specifically, we use your performance data to generate AI-driven analytics, recommend study paths, and identify your weak areas. We may also use your email to send important account updates and promotional offers (which you can opt out of)."
  },
  {
    title: "3. Payment Information",
    content: "When you purchase a PrepZii Pro subscription, your payment is processed securely by our third-party payment provider (Cashfree Payments). PrepZii does not store or have direct access to your full credit card numbers or bank account details. We only retain the transaction IDs and subscription status."
  },
  {
    title: "4. Data Security",
    content: "We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure. Your data is stored on secure cloud servers, and all communications between your browser and our platform are encrypted via SSL/TLS."
  },
  {
    title: "5. Third-Party Services",
    content: "We may employ third-party companies and services (such as Clerk for authentication and Supabase for database management) to facilitate our platform. These third parties have access to your personal data only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose."
  },
  {
    title: "6. Policy Updates",
    content: "We may update our Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page and updating the 'Last Updated' date."
  }
];

export default function PrivacyPage() {
  return (
    <PageWrapper 
      title="Privacy Policy" 
      subtitle="How we protect and manage your data." 
      badge="LEGAL"
      badgeVariant="slate"
    >
      <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-slideUp">
        
        {/* Header Info */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-[var(--border-subtle)]/50">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium">Data Protection & Privacy</span>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)] text-slate-600 dark:text-slate-400">
            Last Updated: July 2026
          </span>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            At PrepZii, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>

          <div className="space-y-8">
            {SECTIONS.map((section, i) => (
              <div key={i} className="space-y-3">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200/60 dark:border-[var(--border-subtle)]/50">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:contact.prepzii@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">contact.prepzii@gmail.com</a>.
            </p>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
