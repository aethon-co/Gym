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

const authorizeDevice = (req: NextRequest) => {
  const deviceSecret = process.env.FINGERPRINT_DEVICE_KEY;
  const incomingDeviceSecret = req.headers.get("x-device-key");
  if (deviceSecret && incomingDeviceSecret !== deviceSecret) {
    return NextResponse.json({ error: "Unauthorized device" }, { status: 401 });
  }
  return null;
};

export const GET = async (req: NextRequest) => {
  try {
    await connectDb();
    await syncMemberStatuses();

    const authError = authorizeDevice(req);
    if (authError) return authError;

    const members = await Member.find({
      fingerprintId: { $gte: 1, $lte: 255 },
    })
      .select("fingerprintId")
      .sort({ fingerprintId: 1 })
      .lean();

    return NextResponse.json(
      members.map((member: any) => ({
        fp: member.fingerprintId,
      })),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fingerprint members list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();
    await syncMemberStatuses();

    const authError = authorizeDevice(req);
    if (authError) return authError;

    const body = await req.json();
    const fingerprintId = body.fp || body.fingerprintId;
    const normalizedFingerprintId = Number(fingerprintId);

    // Process verification if a valid ID is provided
    if (Number.isInteger(normalizedFingerprintId) && normalizedFingerprintId >= 1 && normalizedFingerprintId <= 255) {
      const member = await Member.findOne({ fingerprintId: normalizedFingerprintId });
      if (member) {
        member.updateStatus();
        await member.save();

        if (member.status === "Active" || member.status === "Expired") {
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
        }
      }
    }

    // Always return the full list of fingerprints
    const members = await Member.find({
      fingerprintId: { $gte: 1, $lte: 255 },
    })
      .select("fingerprintId")
      .sort({ fingerprintId: 1 })
      .lean();

    return NextResponse.json(
      members.map((member: any) => ({
        fp: member.fingerprintId,
      })),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fingerprint verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
