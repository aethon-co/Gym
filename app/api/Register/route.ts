import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const data = await req.json();
    const member = new Member(data);
    await member.save();
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectDb();
    await Member.updateMany(
      { subscriptionEndDate: { $lt: new Date() }, status: "Active" },
      { $set: { status: "Expired" } }
    );
    const members = await Member.find();
    return NextResponse.json(members);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
