import { NextResponse } from "next/server";
import { apiKey } from "../../../lib/env";
import {
  createUser,
  validateEmail,
  validatePassword
} from "../../../lib/users";
import { issueToken } from "../../../lib/jwt";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const headerKey = request.headers.get("x-api-key");
  if (!headerKey || headerKey !== apiKey) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const email =
    typeof (body as any).email === "string"
      ? (body as any).email
      : "";
  const password =
    typeof (body as any).password === "string"
      ? (body as any).password
      : "";

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email" },
      { status: 400 }
    );
  }

  if (!validatePassword(password)) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 400 }
    );
  }

  try {
    const user = await createUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const token = await issueToken(user);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email
        },
        token
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}

