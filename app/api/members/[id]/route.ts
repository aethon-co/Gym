import { connectDb } from "@/db";
import Member from "@/models/member";
import Payment from "@/models/payments";
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
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
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
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();
    const { id } = await context.params;

    const member = await Member.findById(id);

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    console.log("Member email:", member.email);
    console.log("Full member:", JSON.stringify(member, null, 2));

    const payments = await Payment.find({ memberId: id })
      .sort({ createdAt: -1 })
      .select("amount paymentMethod notes createdAt duration");

    const memberData = {
      _id: member._id.toString(),
      name: member.name,
      age: member.age,
      email: member.email,
      phoneNumber: member.phoneNumber,
      address: member.address,
      membershipType: member.membershipType,
      status: member.status,
      subscriptionEndDate: member.subscriptionEndDate,
      subscriptionStartDate: member.subscriptionStartDate,
      paymentAmount: member.paymentAmount,
      duration: member.duration,
      customAmount: member.customAmount,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };

    const paymentsData = payments.map((payment) => ({
      _id: payment._id.toString(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes,
      createdAt: payment.createdAt,
      memberId: payment.memberId?.toString(),
      duration: payment.duration,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          member: memberData,
          payments: paymentsData,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get member error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();
    const { id } = await context.params;

    const deletedMember = await Member.findByIdAndDelete(id);

    if (!deletedMember) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    await Payment.deleteMany({ memberId: id });

    return NextResponse.json(
      {
        success: true,
        message: "Member deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete member error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
