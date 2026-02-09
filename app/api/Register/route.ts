import { connectDb } from "@/db";
import Member from "@/models/member";
import Payment from "@/models/payments";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const MEMBERSHIP_TYPES = ["Basic", "Premium", "Couple", "Student", "Custom"] as const;
const VALID_DURATIONS = [1, 3, 6, 12] as const;
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "BankTransfer"] as const;

const paymentAmounts = {
  Basic: 1000,
  Premium: 2000,
  Couple: 3000,
  Student: 500,
};

const parseFingerprintId = (value: unknown): number | undefined | null => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 255) return null;
  return parsed;
};

const normalizePhoneNumber = (phone: unknown): string => {
  if (typeof phone !== "string") return "";
  return phone.replace(/\D/g, "");
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

const isValidIndianMobileNumber = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const age = Number(body.age);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phoneNumber = normalizePhoneNumber(body.phoneNumber);
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const membershipType = body.membershipType;
    const duration = Number(body.duration ?? 1);
    const customAmount = body.customAmount !== undefined ? Number(body.customAmount) : undefined;
    const startDate = body.subscriptionStartDate ? new Date(body.subscriptionStartDate) : new Date();
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "Cash";
    const fingerprintId = parseFingerprintId(body.fingerprintId);
    const fingerprintScanToken =
      typeof body.fingerprintScanToken === "string" ? body.fingerprintScanToken : "";

    if (!name || !Number.isInteger(age) || age < 1 || age > 100 || !phoneNumber || !address) {
      return NextResponse.json({ error: "Invalid required fields" }, { status: 400 });
    }

    if (!MEMBERSHIP_TYPES.includes(membershipType)) {
      return NextResponse.json({ error: "Invalid membership type" }, { status: 400 });
    }

    if (!VALID_DURATIONS.includes(duration as (typeof VALID_DURATIONS)[number])) {
      return NextResponse.json({ error: "Duration must be 1, 3, 6, or 12 months" }, { status: 400 });
    }

    if (fingerprintId === null) {
      return NextResponse.json({ error: "Fingerprint ID must be an integer between 1 and 255" }, { status: 400 });
    }
    if (fingerprintId === undefined) {
      return NextResponse.json({ error: "Fingerprint scan is required before registration" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT secret not set" }, { status: 500 });
    }
    if (!fingerprintScanToken) {
      return NextResponse.json({ error: "Missing fingerprint scan token" }, { status: 400 });
    }
    try {
      const payload = jwt.verify(fingerprintScanToken, secret) as {
        purpose?: string;
        fingerprintId?: number;
      };
      if (payload.purpose !== "fingerprint_enroll" || payload.fingerprintId !== fingerprintId) {
        return NextResponse.json({ error: "Invalid fingerprint scan token" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Fingerprint scan token expired or invalid" }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!isValidIndianMobileNumber(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number. Use a valid 10-digit Indian mobile number" }, { status: 400 });
    }

    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Invalid subscription start date" }, { status: 400 });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    if (membershipType === "Custom") {
      if (!customAmount || customAmount <= 0) {
        return NextResponse.json({ error: "Custom plan requires a valid positive amount" }, { status: 400 });
      }
    }

    const duplicateQuery = [
      { phoneNumber },
      ...(email ? [{ email }] : []),
      ...(fingerprintId ? [{ fingerprintId }] : []),
    ];

    const existingMember = await Member.findOne({ $or: duplicateQuery });
    if (existingMember) {
      if (existingMember.phoneNumber === phoneNumber) {
        return NextResponse.json({ error: "Member with this phone number already exists" }, { status: 409 });
      }
      if (email && existingMember.email === email) {
        return NextResponse.json({ error: "Member with this email already exists" }, { status: 409 });
      }
      if (fingerprintId && existingMember.fingerprintId === fingerprintId) {
        return NextResponse.json({ error: "Fingerprint ID is already assigned to another member" }, { status: 409 });
      }
    }

    const paymentAmount =
      membershipType === "Custom"
        ? customAmount
        : paymentAmounts[membershipType as keyof typeof paymentAmounts];
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);

    const member = new Member({
      name,
      age,
      email: email || undefined,
      phoneNumber,
      address,
      membershipType,
      duration,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      paymentAmount,
      customAmount: membershipType === "Custom" ? customAmount : undefined,
      status: "Active",
      fingerprintId,
    });

    await member.save();

    await Payment.create({
      memberId: member._id,
      amount: paymentAmount,
      paymentMethod,
      duration,
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
          fingerprintId: member.fingerprintId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Member registration error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "Duplicate value for phone/email/fingerprint ID" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const { id, ...rawUpdateData } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const allowedKeys = new Set([
      "name",
      "age",
      "email",
      "phoneNumber",
      "address",
      "membershipType",
      "duration",
      "subscriptionStartDate",
      "subscriptionEndDate",
      "paymentAmount",
      "customAmount",
      "status",
      "fingerprintId",
    ]);

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rawUpdateData)) {
      if (allowedKeys.has(key)) updateData[key] = value;
    }

    if (updateData.membershipType && !MEMBERSHIP_TYPES.includes(updateData.membershipType as (typeof MEMBERSHIP_TYPES)[number])) {
      return NextResponse.json({ error: "Invalid membership type" }, { status: 400 });
    }

    if (typeof updateData.name === "string") {
      updateData.name = updateData.name.trim();
    }

    if (updateData.age !== undefined) {
      const age = Number(updateData.age);
      if (!Number.isInteger(age) || age < 1 || age > 100) {
        return NextResponse.json({ error: "Age must be a number between 1 and 100" }, { status: 400 });
      }
      updateData.age = age;
    }

    if (updateData.phoneNumber !== undefined) {
      const phoneNumber = normalizePhoneNumber(updateData.phoneNumber);
      if (!isValidIndianMobileNumber(phoneNumber)) {
        return NextResponse.json({ error: "Invalid phone number. Use a valid 10-digit Indian mobile number" }, { status: 400 });
      }
      updateData.phoneNumber = phoneNumber;
      const duplicatePhone = await Member.findOne({ _id: { $ne: id }, phoneNumber }).lean();
      if (duplicatePhone) {
        return NextResponse.json({ error: "Phone number already in use" }, { status: 409 });
      }
    }

    if (updateData.email !== undefined) {
      const emailValue = typeof updateData.email === "string" ? updateData.email.trim().toLowerCase() : "";
      if (emailValue && !isValidEmail(emailValue)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }
      updateData.email = emailValue || undefined;
      if (emailValue) {
        const duplicateEmail = await Member.findOne({ _id: { $ne: id }, email: emailValue }).lean();
        if (duplicateEmail) {
          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
      }
    }

    if (updateData.fingerprintId !== undefined) {
      const parsedFingerprintId = parseFingerprintId(updateData.fingerprintId);
      if (parsedFingerprintId === null) {
        return NextResponse.json({ error: "Fingerprint ID must be an integer between 1 and 255" }, { status: 400 });
      }
      updateData.fingerprintId = parsedFingerprintId;
      if (parsedFingerprintId) {
        const duplicateFingerprint = await Member.findOne({
          _id: { $ne: id },
          fingerprintId: parsedFingerprintId,
        }).lean();
        if (duplicateFingerprint) {
          return NextResponse.json({ error: "Fingerprint ID is already assigned to another member" }, { status: 409 });
        }
      }
    }

    if (updateData.duration !== undefined) {
      const duration = Number(updateData.duration);
      if (!VALID_DURATIONS.includes(duration as (typeof VALID_DURATIONS)[number])) {
        return NextResponse.json({ error: "Duration must be 1, 3, 6, or 12 months" }, { status: 400 });
      }
      updateData.duration = duration;
    }

    if (updateData.subscriptionStartDate !== undefined) {
      const startDate = new Date(String(updateData.subscriptionStartDate));
      if (Number.isNaN(startDate.getTime())) {
        return NextResponse.json({ error: "Invalid subscription start date" }, { status: 400 });
      }
      updateData.subscriptionStartDate = startDate;
    }

    if (updateData.membershipType && updateData.membershipType !== "Custom") {
      updateData.paymentAmount = paymentAmounts[updateData.membershipType as keyof typeof paymentAmounts];
      updateData.customAmount = undefined;
    }

    if (updateData.membershipType === "Custom" || updateData.customAmount !== undefined) {
      const customAmount = Number(updateData.customAmount);
      if (!customAmount || customAmount <= 0) {
        return NextResponse.json({ error: "Custom plan requires a positive custom amount" }, { status: 400 });
      }
      updateData.paymentAmount = customAmount;
      updateData.customAmount = customAmount;
      updateData.membershipType = "Custom";
    }

    if (updateData.duration !== undefined || updateData.subscriptionStartDate !== undefined) {
      const member = await Member.findById(id).select("subscriptionStartDate duration");
      if (member) {
        const baseStartDate = (updateData.subscriptionStartDate as Date) ?? member.subscriptionStartDate;
        const baseDuration = (updateData.duration as number) ?? member.duration;
        const newEndDate = new Date(baseStartDate);
        newEndDate.setMonth(newEndDate.getMonth() + baseDuration);
        updateData.subscriptionEndDate = newEndDate;
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Member updated successfully", member: updatedMember });
  } catch (error: any) {
    console.error("Update member error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Duplicate value for phone/email/fingerprint ID" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const deletedMember = await Member.findByIdAndDelete(id);
    if (!deletedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await Payment.deleteMany({ memberId: id });
    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error: any) {
    console.error("Delete member error:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
