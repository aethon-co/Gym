import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const parseFingerprintId = (value: unknown): number | undefined | null => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 255) return null;
  return parsed;
};

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const deviceSecret = process.env.FINGERPRINT_DEVICE_KEY;
    const incomingDeviceSecret = req.headers.get("x-device-key");
    if (deviceSecret && incomingDeviceSecret !== deviceSecret) {
      return NextResponse.json({ error: "Unauthorized fingerprint device" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const providedFingerprintId = parseFingerprintId(body?.fingerprintId);

    if (providedFingerprintId === null) {
      return NextResponse.json({ error: "Invalid fingerprint ID (must be 1-255)" }, { status: 400 });
    }
    if (providedFingerprintId === undefined) {
      return NextResponse.json(
        { error: "No fingerprint data received from module. Please scan again." },
        { status: 400 }
      );
    }
    const fingerprintId = providedFingerprintId;

    const existing = await Member.findOne({ fingerprintId }).lean();
    if (existing) {
      return NextResponse.json({ error: "Fingerprint ID already registered. Please retry scan." }, { status: 409 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT secret not set" }, { status: 500 });
    }

    const scanToken = jwt.sign(
      {
        purpose: "fingerprint_enroll",
        fingerprintId,
      },
      secret,
      { expiresIn: "10m" }
    );

    return NextResponse.json({
      success: true,
      message: "Fingerprint scan successful",
      fingerprintId,
      scanToken,
    });
  } catch (error: any) {
    console.error("Fingerprint enroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
