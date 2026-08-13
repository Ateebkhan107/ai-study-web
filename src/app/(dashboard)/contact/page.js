import PageWrapper from "@/components/PageWrapper";
import { Mail, MessageSquare, Clock, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the PrepZii team for support, business inquiries, or general questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageWrapper 
      title="Contact Us" 
      subtitle="We'd love to hear from you." 
      badge="GET IN TOUCH"
      badgeVariant="blue"
    >
      <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-slideUp">
        
        {/* Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* General Support */}
          <div className="glass-card p-8 rounded-3xl group hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">General Support</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Having trouble with your account, tests, or subscriptions? We&apos;re here to help you get back on track.
            </p>
            <a 
              href="mailto:contact.prepzii@gmail.com" 
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline"
            >
              contact.prepzii@gmail.com
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Business Enquiries */}
          <div className="glass-card p-8 rounded-3xl group hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Business Enquiries</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Looking to partner with us, integrate PrepZii into your school, or explore enterprise options?
            </p>
            <a 
              href="mailto:contact.prepzii@gmail.com?subject=Business%20Enquiry" 
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline"
            >
              contact.prepzii@gmail.com
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Response Time Card */}
        <div className="glass-card p-8 rounded-3xl border-slate-200/60 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Average Response Time</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">We aim to respond to all inquiries within 24 hours.</p>
            </div>
          </div>
          <a 
            href="mailto:contact.prepzii@gmail.com"
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg whitespace-nowrap"
          >
            Send an Email
          </a>
        </div>

      </div>
    </PageWrapper>
  );
}
