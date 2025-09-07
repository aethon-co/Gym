import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/db";
import Member from "@/models/member";

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDb();

    const deletedMember = await Member.findByIdAndDelete(params.id);

    if (!deletedMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Member deleted successfully", deletedMember },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
