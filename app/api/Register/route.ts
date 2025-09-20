import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req:NextRequest) {
  try {
    await connectDb();
    
    const { name, age, phoneNumber,address, membershipType, subscriptionStartDate } = await req.json();
    
    const member = new Member({
      name,
      age,
      phoneNumber,
      address,
      membershipType,
      subscriptionStartDate,
    });
    console.log(phoneNumber)
    await member.save();
    
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error}, { status: 400 });
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
