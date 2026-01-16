import { NextResponse } from "next/server";
import { apiKey } from "../../lib/env";
import {
  validateEmail,
  validatePassword,
  verifyUser
} from "../../lib/users";
import { issueToken } from "../../lib/jwt";

export const runtime = "nodejs";

function getStringParam(
  url: URL,
  name: string
): string {
  const value = url.searchParams.get(name);
  return value ? value.toString() : "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const responseType = getStringParam(url, "response_type");
  const clientId = getStringParam(url, "client_id");
  const redirectUri = getStringParam(url, "redirect_uri");
  const prompt = getStringParam(url, "prompt");

  if (responseType !== "token") {
    return NextResponse.json(
      { error: "Unsupported response_type" },
      { status: 400 }
    );
  }

  if (!clientId) {
    return NextResponse.json(
      { error: "Missing client_id" },
      { status: 400 }
    );
  }

  if (!redirectUri) {
    return NextResponse.json(
      { error: "Missing redirect_uri" },
      { status: 400 }
    );
  }

  if (prompt === "none") {
    return new Response(
      `<html><body><script>window.parent.postMessage({type:"AUTH_FAILURE"}, "*");</script></body></html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html"
        }
      }
    );
  }

  return new Response(
    `<html><body><script>window.location.href=${JSON.stringify(
      `/login-popup?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}`
    )};</script></body></html>`,
    {
      status: 302,
      headers: {
        "Content-Type": "text/html"
      }
    }
  );
}

