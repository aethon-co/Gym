import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/db";
import Member from "@/models/member";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Invalid member ID format" },
        { status: 400 }
      );
    }

    const member = await Member.findById(id);

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const currentDate = new Date();
    if (member.subscriptionEndDate < currentDate && member.status === 'Active') {
      member.status = 'Expired';
      await member.save();
    }

    const memberData = {
      _id: member._id.toString(),
      name: member.name,
      age: member.age,
      phoneNumber: member.phoneNumber, 
      email: member.email || null, 
      address: member.address || null,
      membershipType: member.membershipType,
      status: member.status,
      subscriptionStartDate: member.subscriptionStartDate.toISOString(),
      subscriptionEndDate: member.subscriptionEndDate.toISOString(),
      paymentAmount: member.paymentAmount,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
      isCurrentlyActive: member.isActive,
      daysRemaining: Math.ceil((member.subscriptionEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    };

    return NextResponse.json(memberData, { status: 200 });

  } catch (error: any) {
    console.error("GET member error:", error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: "Invalid member ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
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

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();
    const { id } = await context.params;
    const body = await req.json();
        const allowedUpdates = [
      'name', 
      'age', 
      'phoneNumber', 
      'membershipType', 
      'subscriptionStartDate', 
      'subscriptionEndDate', 
      'status', 
      'paymentAmount'
    ];
    
    const updates = Object.keys(body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return NextResponse.json(
        { error: "Invalid updates. Only allowed fields can be updated." },
        { status: 400 }
      );
    }

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const memberData = {
      _id: updatedMember._id.toString(),
      name: updatedMember.name,
      age: updatedMember.age,
      phone: updatedMember.phoneNumber,
      membershipType: updatedMember.membershipType,
      status: updatedMember.status,
      subscriptionStartDate: updatedMember.subscriptionStartDate.toISOString(),
      subscriptionEndDate: updatedMember.subscriptionEndDate.toISOString(),
      paymentAmount: updatedMember.paymentAmount,
      updatedAt: updatedMember.updatedAt.toISOString()
    };

    return NextResponse.json(
      { message: "Member updated successfully", member: memberData },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Update error:", error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Phone number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};