"use client";

import { useEffect } from "react";
import { captureTracking } from "@/lib/utm-tracker";

export default function UtmCapture() {
  useEffect(() => { captureTracking(); }, []);
  return null;
}
