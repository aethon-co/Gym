import { connectDb } from "@/db";
import { syncMemberStatuses } from "@/lib/memberStatus";
import Member from "@/models/member";
import Payment from "@/models/payments";
import { NextRequest, NextResponse } from "next/server";

const MEMBERSHIP_TYPES = ["Basic", "Premium", "Couple", "Student", "Custom"] as const;
const VALID_DURATIONS = [1, 3, 6, 12] as const;
const VALID_STATUSES = ["Active", "Expired", "Suspended"] as const;

const paymentAmounts = {
  Basic: 1000,
  Premium: 2000,
  Couple: 3000,
  Student: 500,
};

const normalizePhoneNumber = (phone: unknown): string => {
  if (typeof phone !== "string") return "";
  return phone.replace(/\D/g, "");
};

const parseFingerprintId = (value: unknown): number | undefined | null => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 255) return null;
  return parsed;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

const isValidIndianMobileNumber = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();
    const { id } = await context.params;
    const body = await req.json();

    const allowedKeys = new Set([
      "name",
      "age",
      "email",
      "phoneNumber",
      "address",
      "membershipType",
      "status",
      "duration",
      "paymentAmount",
      "customAmount",
      "subscriptionStartDate",
      "subscriptionEndDate",
      "fingerprintId",
    ]);

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.has(key)) updateData[key] = value;
    }

    if (updateData.name !== undefined && typeof updateData.name === "string") {
      updateData.name = updateData.name.trim();
    }

    if (updateData.age !== undefined) {
      const age = Number(updateData.age);
      if (!Number.isInteger(age) || age < 1 || age > 100) {
        return NextResponse.json({ error: "Age must be a number between 1 and 100" }, { status: 400 });
      }
      updateData.age = age;
    }

    if (updateData.email !== undefined) {
      const email = typeof updateData.email === "string" ? updateData.email.trim().toLowerCase() : "";
      if (email && !isValidEmail(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }
      updateData.email = email || undefined;
      if (email) {
        const duplicateEmail = await Member.findOne({ _id: { $ne: id }, email }).lean();
        if (duplicateEmail) {
          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
      }
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

    if (updateData.membershipType !== undefined) {
      if (!MEMBERSHIP_TYPES.includes(updateData.membershipType as (typeof MEMBERSHIP_TYPES)[number])) {
        return NextResponse.json({ error: "Invalid membership type" }, { status: 400 });
      }
      if (updateData.membershipType !== "Custom") {
        updateData.paymentAmount = paymentAmounts[updateData.membershipType as keyof typeof paymentAmounts];
        updateData.customAmount = undefined;
      }
    }

    if (updateData.status !== undefined) {
      if (!VALID_STATUSES.includes(updateData.status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    if (updateData.duration !== undefined) {
      const duration = Number(updateData.duration);
      if (!VALID_DURATIONS.includes(duration as (typeof VALID_DURATIONS)[number])) {
        return NextResponse.json({ error: "Duration must be 1, 3, 6, or 12 months" }, { status: 400 });
      }
      updateData.duration = duration;
    }

    if (updateData.customAmount !== undefined || updateData.membershipType === "Custom") {
      const customAmount = Number(updateData.customAmount);
      if (!customAmount || customAmount <= 0) {
        return NextResponse.json({ error: "Custom amount must be positive for custom memberships" }, { status: 400 });
      }
      updateData.customAmount = customAmount;
      updateData.paymentAmount = customAmount;
      updateData.membershipType = "Custom";
    }

    if (updateData.subscriptionStartDate !== undefined) {
      const subscriptionStartDate = new Date(String(updateData.subscriptionStartDate));
      if (Number.isNaN(subscriptionStartDate.getTime())) {
        return NextResponse.json({ error: "Invalid subscription start date" }, { status: 400 });
      }
      updateData.subscriptionStartDate = subscriptionStartDate;
    }

    if (updateData.subscriptionEndDate !== undefined) {
      const subscriptionEndDate = new Date(String(updateData.subscriptionEndDate));
      if (Number.isNaN(subscriptionEndDate.getTime())) {
        return NextResponse.json({ error: "Invalid subscription end date" }, { status: 400 });
      }
      updateData.subscriptionEndDate = subscriptionEndDate;
    }

    if (updateData.fingerprintId !== undefined) {
      const fingerprintId = parseFingerprintId(updateData.fingerprintId);
      if (fingerprintId === null) {
        return NextResponse.json({ error: "Fingerprint ID must be an integer between 1 and 255" }, { status: 400 });
      }
      updateData.fingerprintId = fingerprintId;
      if (fingerprintId) {
        const duplicateFingerprint = await Member.findOne({
          _id: { $ne: id },
          fingerprintId,
        }).lean();
        if (duplicateFingerprint) {
          return NextResponse.json({ error: "Fingerprint ID is already assigned to another member" }, { status: 409 });
        }
      }
    }

    if (updateData.duration !== undefined || updateData.subscriptionStartDate !== undefined) {
      const currentMember = await Member.findById(id).select("subscriptionStartDate duration");
      if (currentMember) {
        const startDate = (updateData.subscriptionStartDate as Date) ?? currentMember.subscriptionStartDate;
        const duration = (updateData.duration as number) ?? currentMember.duration;
        const subscriptionEndDate = new Date(startDate);
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + duration);
        updateData.subscriptionEndDate = subscriptionEndDate;
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error: any) {
    console.error("Patch error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Duplicate value for phone/email/fingerprint ID" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();
    await syncMemberStatuses();
    const { id } = await context.params;

    const member = await Member.findById(id).populate("couplePartnerId", "name phoneNumber email membershipType status");
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    const paymentQuery =
      member.coupleGroupId
        ? {
            $or: [{ memberId: id }, { coupleGroupId: member.coupleGroupId }],
          }
        : { memberId: id };

    const payments = await Payment.find(paymentQuery)
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
      fingerprintId: member.fingerprintId,
      coupleGroupId: member.coupleGroupId,
      couplePartnerId: member.couplePartnerId ? (member.couplePartnerId as any)._id?.toString?.() : null,
      couplePartner: member.couplePartnerId
        ? {
            _id: (member.couplePartnerId as any)._id?.toString?.(),
            name: (member.couplePartnerId as any).name,
            phoneNumber: (member.couplePartnerId as any).phoneNumber,
            email: (member.couplePartnerId as any).email,
            membershipType: (member.couplePartnerId as any).membershipType,
            status: (member.couplePartnerId as any).status,
          }
        : null,
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

    return NextResponse.json({ success: true, data: { member: memberData, payments: paymentsData } }, { status: 200 });
  } catch (error: any) {
    console.error("Get member error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
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
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    await Payment.deleteMany({ memberId: id });
    return NextResponse.json({ success: true, message: "Member deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete member error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};
