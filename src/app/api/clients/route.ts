// TODO: Implement clients CRUD API in Section 4
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // TODO: Return paginated list of clients for authenticated user
  return NextResponse.json({ clients: [] });
}

export async function POST(req: NextRequest) {
  // TODO: Create a new client
  return NextResponse.json({ client: null }, { status: 501 });
}
