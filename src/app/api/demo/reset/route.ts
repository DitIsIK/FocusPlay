import { NextResponse } from "next/server";

import { isDemoMode } from "@/lib/env";
import { resetDemoData, getDemoProfile } from "@/lib/mock";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Niet beschikbaar" }, { status: 404 });
  }
  resetDemoData();
  return NextResponse.json(getDemoProfile());
}
