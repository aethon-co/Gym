import { connectDb } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import Member from "@/models/member";

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const { fingerprintId } = await req.json();

    if (!fingerprintId || typeof fingerprintId !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing fingerprint ID" },
        { status: 400 }
      );
    }

    const member = await Member.findOne({ fingerprintId });

    if (!member) {
      return NextResponse.json(
        { error: "No member found for this fingerprint ID" },
        { status: 404 }
      );
    }

    member.updateStatus();
    await member.save();

    if (member.status !== "Active") {
      return NextResponse.json(
        {
          access: false,
          message: `Access denied. Member is ${member.status}`,
          member: {
            name: member.name,
            status: member.status,
            membershipType: member.membershipType,
            fingerprintId: member.fingerprintId,
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        access: true,
        message: "Access granted",
        member: {
          name: member.name,
          phoneNumber: member.phoneNumber,
          membershipType: member.membershipType,
          fingerprintId: member.fingerprintId,
          subscriptionEndDate: member.subscriptionEndDate,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fingerprint verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
