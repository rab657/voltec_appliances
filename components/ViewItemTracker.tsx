"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Fires a view_item / ViewContent event once per product page mount.
export default function ViewItemTracker({
  id,
  name,
  category,
}: {
  id: string;
  name: string;
  category: string;
}) {
  useEffect(() => {
    track("view_item", { id, name, category });
  }, [id, name, category]);
  return null;
}
