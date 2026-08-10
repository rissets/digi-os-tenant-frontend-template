"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function id(key: string) {
  const current = localStorage.getItem(key);
  if (current) return current;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

export function AnalyticsTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path || navigator.doNotTrack === "1") return;
    const consent = localStorage.getItem("analytics-consent") === "granted";
    if (!consent) return;
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: "page_view", path, referrer: document.referrer, anonymous_id: id("site-anonymous-id"), session_id: id("site-session-id"), consent: { analytics: true }, source: "tenant-frontend" }),
    });
  }, [path]);
  return null;
}
