import PageWrapper from "@/components/PageWrapper";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | PrepZii",
  description: "Read the terms and conditions for using PrepZii.",
};

const SECTIONS = [
  {
    title: "1. Accounts",
    content: "When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account. You are responsible for safeguarding the password that you use to access the service."
  },
  {
    title: "2. Subscriptions",
    content: "Some parts of the Service are billed on a subscription basis ('PrepZii Pro'). You will be billed in advance on a recurring and periodic basis ('Billing Cycle'). At the end of each Billing Cycle, your Subscription will automatically expire unless renewed. All purchases are final, and we do not offer refunds."
  },
  {
    title: "3. Intellectual Property",
    content: "The Service and its original content, features, and functionality are and will remain the exclusive property of PrepZii and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of PrepZii."
  },
  {
    title: "4. Acceptable Use",
    content: "You agree not to use the Service in any way that causes, or may cause, damage to the Service or impairment of the availability or accessibility of the Service; or in any way which is unlawful, illegal, fraudulent or harmful. Any attempt to scrape, reverse-engineer, or distribute our content without permission is strictly prohibited."
  },
  {
    title: "5. Account Suspension",
    content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease."
  },
  {
    title: "6. Disclaimer",
    content: "Your use of the Service is at your sole risk. The Service is provided on an 'AS IS' and 'AS AVAILABLE' basis. PrepZii does not guarantee specific exam outcomes, ranks, or admissions as a result of using our platform. The platform is an educational aid meant to supplement your preparation."
  }
];

export default function TermsPage() {
  return (
    <PageWrapper 
      title="Terms & Conditions" 
      subtitle="The rules governing your use of PrepZii." 
      badge="LEGAL"
      badgeVariant="slate"
    >
      <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-slideUp">
        
        {/* Header Info */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-slate-800/50">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Scale className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium">Terms of Service</span>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Last Updated: July 2026
          </span>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Please read these Terms and Conditions (&quot;Terms&quot;, &quot;Terms and Conditions&quot;) carefully before using the PrepZii website and the PrepZii mobile application (the &quot;Service&quot;) operated by PrepZii (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
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
          
          <div className="pt-8 mt-8 border-t border-slate-200/60 dark:border-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              If you have any questions about these Terms, please contact us at <a href="mailto:contact.prepzii@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">contact.prepzii@gmail.com</a>.
            </p>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
