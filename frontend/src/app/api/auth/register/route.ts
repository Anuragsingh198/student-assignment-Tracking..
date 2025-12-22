import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    return NextResponse.json({
      message: "User registered successfully",
      user: {
        id: Date.now().toString(),
        name,
        email,
        role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
