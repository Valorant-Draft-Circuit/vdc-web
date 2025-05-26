import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const res = await request.json();

  console.log(res.test);
  return NextResponse.json({
    message: "Player successfully signed up",
    status: 200,
  });
}
