import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email.includes("teacher")) {
      return NextResponse.json({
        id: "1",
        name: "Teacher User",
        email,
        role: "teacher",
      });
    } else {
      return NextResponse.json({
        id: "2",
        name: "Student User",
        email,
        role: "student",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
