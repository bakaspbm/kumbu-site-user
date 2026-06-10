"use client";

import { installFetchGuard } from "@/lib/browser/install-fetch-guard";
import { useEffect } from "react";

export function FetchGuard() {
  useEffect(() => {
    installFetchGuard();
  }, []);

  return null;
}
