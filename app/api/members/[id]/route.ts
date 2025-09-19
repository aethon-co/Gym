import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/members/:id
export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDb();

    const body = await req.json();

    const updatedMember = await Member.findByIdAndUpdate(
      params.id,
      { $set: body },  // apply only passed fields
      { new: true }    // return updated doc
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
