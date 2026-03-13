import { NextResponse } from "next/server";

import { clearSessionCookie, destroyCurrentSession } from "@/features/auth/server/session";

export async function POST() {
  await destroyCurrentSession();

  const response = NextResponse.json(
    {
      redirectTo: "/"
    },
    { status: 200 }
  );

  clearSessionCookie(response);

  return response;
}
