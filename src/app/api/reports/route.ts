// TODO: Implement reports API in Section 5
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // TODO: Return paginated list of reports for authenticated user
  return NextResponse.json({ reports: [] });
}

export async function POST(req: NextRequest) {
  // TODO: Generate a new report
  return NextResponse.json({ report: null }, { status: 501 });
}
