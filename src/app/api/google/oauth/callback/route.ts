import { google } from "googleapis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  // IMPORTANT: This is sensitive. Log only temporarily to capture it, then remove.
  console.log("ACCESS TOKEN PRESENT:", Boolean(tokens.access_token));
  console.log("SCOPE:", tokens.scope);

  if (!tokens.refresh_token) {
    return NextResponse.json(
      {
        success: false,
        message:
          "OAuth succeeded but Google did not return a refresh token. " +
          "Revoke the app's access in your Google Account security settings, then run /api/google/oauth/start again.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "OAuth successful. Copy the refresh token from server logs into GOOGLE_OAUTH_REFRESH_TOKEN.",
  });
}