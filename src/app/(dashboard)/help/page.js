import { publicMetadata } from "@/lib/seo.mjs";
import HelpClient from "./HelpClient";

export const metadata = publicMetadata({
  title: "Help Center",
  description: "Find answers to frequently asked questions about PrepZii, XP, rankings, and subscriptions.",
  path: "/help",
});

export default function HelpPage() {
  return <HelpClient />;
}
