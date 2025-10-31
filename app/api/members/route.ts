import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectDb();

    const members = await Member.find();

    if (!members) {
      return NextResponse.json(
        { error: "No members found" },
        { status: 404 }
      );
    }

    return NextResponse.json(members, { status: 200 });
  } catch (error: any) {
    console.error("Get error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};


