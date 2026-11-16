"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Fires one analytics event when a server-rendered page mounts (e.g. a sizing
// result was shown). Params must be primitives so the effect key is stable.
export default function TrackEvent({
  event,
  params,
}: {
  event: string;
  params: Record<string, string | number>;
}) {
  const key = JSON.stringify(params);
  useEffect(() => {
    track(event, JSON.parse(key));
  }, [event, key]);
  return null;
}
