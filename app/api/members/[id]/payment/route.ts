import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDb();

    const { amount } = await req.json();
    if (!amount) {
      return NextResponse.json({ error: "Payment amount is required" }, { status: 400 });
    }
    const member = await Member.findById(params.id);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    member.paymentAmount = amount;

    const newEndDate = new Date(member.subscriptionEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + 1);
    member.subscriptionEndDate = newEndDate;

    member.status = "Active";

    await member.save();

    return NextResponse.json({ message: "Payment successful", member });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
