import { connectDb } from "@/db";
import Member from "@/models/member";
import Payment from "@/models/payments";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    const {
      name,
      age,
      email,
      phoneNumber,
      address,
      membershipType,
      duration = 1,
      subscriptionStartDate,
      customAmount,
      paymentMethod,
    } = body;

    if (!name || !age || !phoneNumber || !address || !membershipType) {
      return NextResponse.json(
        { error: "All fields except email and subscription date are required" },
        { status: 400 }
      );
    }

    if (typeof age !== "number" || age < 1 || age > 100) {
      return NextResponse.json(
        { error: "Age must be a number between 1 and 100" },
        { status: 400 }
      );
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    if (
      !["Basic", "Premium", "Couple", "Student", "Custom"].includes(
        membershipType
      )
    ) {
      return NextResponse.json(
        { error: "Invalid membership type" },
        { status: 400 }
      );
    }

    const validDurations = [1, 3, 6, 12];
    if (!validDurations.includes(duration)) {
      return NextResponse.json(
        { error: "Duration must be 1, 3, 6, or 12 months" },
        { status: 400 }
      );
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const existingMember = await Member.findOne({
      $or: [
        { phoneNumber },
        ...(email ? [{ email }] : [])
      ]
    });
    
    if (existingMember) {
      if (existingMember.phoneNumber === phoneNumber) {
        return NextResponse.json(
          { error: "Member with this phone number already exists" },
          { status: 409 }
        );
      }
      if (email && existingMember.email === email) {
        return NextResponse.json(
          { error: "Member with this email already exists" },
          { status: 409 }
        );
      }
    }

    if (membershipType === "Custom") {
      if (
        !customAmount ||
        typeof customAmount !== "number" ||
        customAmount <= 0
      ) {
        return NextResponse.json(
          { error: "Custom plan requires a valid positive amount" },
          { status: 400 }
        );
      }
    }

    const startDate = subscriptionStartDate
      ? new Date(subscriptionStartDate)
      : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);

    const paymentAmounts = {
      Basic: 1000,
      Premium: 2000,
      Couple: 3000,
      Student: 500,
    };

    const paymentAmount =
      membershipType === "Custom"
        ? customAmount
        : paymentAmounts[membershipType as keyof typeof paymentAmounts];

    const member = new Member({
      name: name.trim(),
      age,
      email: email ? email.trim() : undefined,
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      membershipType,
      duration,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      paymentAmount,
      status: "Active",
    });

    await member.save();

    await Payment.create({
      memberId: member._id,
      amount: paymentAmount,
      paymentMethod: paymentMethod || "Cash",
      duration: duration,
      notes: `Initial payment for ${duration} month(s) during registration`,
    });

    return NextResponse.json(
      {
        message: "Member registered successfully",
        member: {
          id: member._id,
          name: member.name,
          email: member.email,
          phoneNumber: member.phoneNumber,
          membershipType: member.membershipType,
          duration: member.duration,
          subscriptionEndDate: member.subscriptionEndDate,
          paymentAmount: member.paymentAmount,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Member registration error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate phone number or email" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const includePayments = searchParams.get("includePayments") === "true";

    if (memberId && includePayments) {
      const payments = await Payment.find({ memberId })
        .sort({ createdAt: -1 })
        .populate("memberId", "name phoneNumber email membershipType duration");

      return NextResponse.json({
        payments,
        total: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      });
    }

    const members = await Member.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ members });
  } catch (error: any) {
    console.error("Get members error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDb();

    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    if (
      updateData.membershipType &&
      !["Basic", "Premium", "Couple", "Student", "Custom"].includes(
        updateData.membershipType
      )
    ) {
      return NextResponse.json(
        { error: "Invalid membership type" },
        { status: 400 }
      );
    }

    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    if (updateData.duration) {
      const member = await Member.findById(id);
      if (member) {
        const newEndDate = new Date(member.subscriptionStartDate);
        newEndDate.setMonth(newEndDate.getMonth() + updateData.duration);
        updateData.subscriptionEndDate = newEndDate;
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (error: any) {
    console.error("Update member error:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const deletedMember = await Member.findByIdAndDelete(id);

    if (!deletedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await Payment.deleteMany({ memberId: id });

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error: any) {
    console.error("Delete member error:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}