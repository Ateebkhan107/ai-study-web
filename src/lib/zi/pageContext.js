"use client";

import { usePathname } from "next/navigation";
import { useZiEntityContext } from "@/lib/zi/ZiEntityContext";

export const ZI_PAGE_TYPES = [
  "dashboard",
  "test",
  "pyq",
  "revision",
  "analytics",
  "profile",
  "community",
  "arena",
  "unknown",
];

export function getZiPageType(pathname) {
  const path = typeof pathname === "string" ? pathname : "";

  if (path === "/dashboard" || path.startsWith("/dashboard/")) return "dashboard";
  if (path === "/test" || path.startsWith("/test/")) return "test";
  if (path === "/jee/mock-tests" || path.startsWith("/jee/mock-tests/")) return "test";
  if (path === "/neet/mock-tests" || path.startsWith("/neet/mock-tests/")) return "test";
  if (path === "/pyq" || path.startsWith("/pyq/")) return "pyq";
  if (path === "/jee/pyq" || path.startsWith("/jee/pyq/")) return "pyq";
  if (path === "/neet/pyq" || path.startsWith("/neet/pyq/")) return "pyq";
  if (path === "/formula-cards" || path.startsWith("/formula-cards/")) return "revision";
  if (path === "/formula-books" || path.startsWith("/formula-books/")) return "revision";
  if (path === "/analytics" || path.startsWith("/analytics/")) return "analytics";
  if (path === "/profile" || path.startsWith("/profile/")) return "profile";
  if (path === "/community" || path.startsWith("/community/")) return "community";
  if (path === "/battle" || path.startsWith("/battle/")) return "arena";
  if (path === "/battle-arena" || path.startsWith("/battle-arena/")) return "arena";

  return "unknown";
}

export function useZiPageContext() {
  const pathname = usePathname();
  const { entity } = useZiEntityContext();
  const pageType = getZiPageType(pathname);
  const entityMatchesPage =
    (pageType === "pyq" && entity?.type === "pyq_question") ||
    (pageType === "revision" && entity?.type === "revision_card") ||
    (pageType === "test" && (
      entity?.type === "test_question" ||
      entity?.type === "test_result"
    ));

  if (!entityMatchesPage) return { pageType };

  return { pageType, entity };
}
