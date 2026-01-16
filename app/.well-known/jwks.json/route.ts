import { NextResponse } from "next/server";
import { getJwks } from "../../../lib/jwt";

export const runtime = "nodejs";

export async function GET() {
  const jwks = await getJwks();
  return NextResponse.json(jwks);
}

