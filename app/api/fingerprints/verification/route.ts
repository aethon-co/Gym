import { connectDb } from "@/db";
import { syncMemberStatuses } from "@/lib/memberStatus";
import Attendance from "@/models/attendance";
import Member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";

const getDayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();
    await syncMemberStatuses();

    const deviceSecret = process.env.FINGERPRINT_DEVICE_KEY;
    const incomingDeviceSecret = req.headers.get("x-device-key");
    if (deviceSecret && incomingDeviceSecret !== deviceSecret) {
      return NextResponse.json({ error: "Unauthorized device" }, { status: 401 });
    }

    const { fingerprintId } = await req.json();
    const normalizedFingerprintId = Number(fingerprintId);
    if (!Number.isInteger(normalizedFingerprintId) || normalizedFingerprintId < 1 || normalizedFingerprintId > 255) {
      return NextResponse.json({ error: "Invalid or missing fingerprint ID" }, { status: 400 });
    }

    const member = await Member.findOne({ fingerprintId: normalizedFingerprintId });
    if (!member) {
      return NextResponse.json({ access: false, message: "Access denied. Fingerprint not registered" }, { status: 404 });
    }

    member.updateStatus();
    await member.save();

    if (member.status !== "Active") {
      return NextResponse.json(
        {
          access: false,
          message: `Access denied. Member is ${member.status}`,
          member: {
            id: member._id,
            name: member.name,
            status: member.status,
            membershipType: member.membershipType,
            fingerprintId: member.fingerprintId,
          },
        },
        { status: 403 }
      );
    }

    const { start, end } = getDayRange();
    const existingAttendance = await Attendance.findOne({
      memberId: member._id,
      date: { $gte: start, $lt: end },
    }).lean();

    if (!existingAttendance) {
      await Attendance.create({
        memberId: member._id,
        date: new Date(),
      });
    }

    return NextResponse.json(
      {
        access: true,
        message: "Access granted",
        member: {
          id: member._id,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
