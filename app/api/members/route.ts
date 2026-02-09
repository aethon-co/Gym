import { connectDb } from "@/db";
import { syncMemberStatuses } from "@/lib/memberStatus";
import Member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectDb();
    await syncMemberStatuses();

    const membersWithoutFingerprint = await Member.find({
      $or: [{ fingerprintId: { $exists: false } }, { fingerprintId: null }],
    })
      .sort({ createdAt: 1 })
      .select("_id");

    if (membersWithoutFingerprint.length) {
      const taken = await Member.find({ fingerprintId: { $gte: 1, $lte: 255 } })
        .select("fingerprintId")
        .lean();
      const usedIds = new Set<number>(
        taken
          .map((member: any) => member.fingerprintId)
          .filter((id: unknown): id is number => Number.isInteger(id))
      );

      let nextId = 1;
      for (const member of membersWithoutFingerprint) {
        while (usedIds.has(nextId) && nextId <= 255) {
          nextId += 1;
        }
        if (nextId > 255) break;
        await Member.updateOne(
          { _id: member._id, $or: [{ fingerprintId: { $exists: false } }, { fingerprintId: null }] },
          { $set: { fingerprintId: nextId } }
        );
        usedIds.add(nextId);
      }
    }

    const members = await Member.find().sort({ createdAt: -1 });

    if (!members) {
      return NextResponse.json(
        { error: "No members found" },
        { status: 404 }
      );
    }

    return NextResponse.json(members, { status: 200 });
  } catch (error: any) {
    console.error("Get error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
