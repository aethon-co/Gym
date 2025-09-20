import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();
    const { id } = await context.params;
    const body = await req.json();

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error: any) {
    console.error("Patch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
