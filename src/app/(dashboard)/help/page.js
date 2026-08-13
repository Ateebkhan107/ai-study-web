import HelpClient from "./HelpClient";

export const metadata = {
  title: "Help Center",
  description: "Find answers to frequently asked questions about PrepZii, XP, rankings, and subscriptions.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return <HelpClient />;
}
