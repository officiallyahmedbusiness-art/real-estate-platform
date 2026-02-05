import { NextResponse } from "next/server";
import pkg from "../../../../package.json";

const BUILD_TIMESTAMP = new Date().toISOString();

export async function GET() {
  return NextResponse.json({
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
    buildTimestamp: BUILD_TIMESTAMP,
    version: pkg.version,
  });
}
