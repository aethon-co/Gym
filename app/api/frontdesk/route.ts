import { connectDb } from "@/db";
import { syncMemberStatuses } from "@/lib/memberStatus";
import { getMemberBaseAmount } from "@/lib/pricing";
import Attendance from "@/models/attendance";
import Member from "@/models/member";
import { NextResponse } from "next/server";

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date) => {
  const copy = startOfDay(date);
  copy.setDate(copy.getDate() + 1);
  return copy;
};

const startOfWeek = (date: Date) => {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + mondayOffset);
  return copy;
};

const toMemberCard = (member: any) => ({
  _id: String(member._id),
  name: member.name,
  phoneNumber: member.phoneNumber,
  membershipType: member.membershipType,
  status: member.status,
  subscriptionEndDate: member.subscriptionEndDate,
  createdAt: member.createdAt,
  pendingAmount: getMemberBaseAmount(member),
});

export async function GET() {
  try {
    await connectDb();
    await syncMemberStatuses();

    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = endOfDay(now);
    const weekStart = startOfWeek(now);
    const renewalsDueEnd = new Date(todayStart);
    renewalsDueEnd.setDate(renewalsDueEnd.getDate() + 7);

    const [expiringTodayRaw, renewalsDueRaw, newJoinersRaw, todayCheckIns, pendingDuesMembersRaw] = await Promise.all([
      Member.find({
        subscriptionEndDate: { $gte: todayStart, $lt: tomorrowStart },
      })
        .sort({ subscriptionEndDate: 1 })
        .lean(),
      Member.find({
        status: { $in: ["Active", "Expired"] },
        subscriptionEndDate: { $gte: todayStart, $lt: renewalsDueEnd },
      })
        .sort({ subscriptionEndDate: 1 })
        .lean(),
      Member.find({
        createdAt: { $gte: weekStart },
      })
        .sort({ createdAt: -1 })
        .lean(),
      Attendance.find({
        date: { $gte: todayStart, $lt: tomorrowStart },
      })
        .populate("memberId", "name membershipType phoneNumber status fingerprintId")
        .sort({ date: -1 })
        .limit(15)
        .lean(),
      Member.find({
        $or: [
          { status: "Expired" },
          { status: "Suspended" },
          { subscriptionEndDate: { $lt: todayStart } },
        ],
      })
        .sort({ subscriptionEndDate: 1 })
        .lean(),
    ]);

    const pendingDuesMembers = pendingDuesMembersRaw.map((member: any) => ({
      ...toMemberCard(member),
      overdueDays: Math.max(
        0,
        Math.ceil((todayStart.getTime() - new Date(member.subscriptionEndDate).getTime()) / (1000 * 60 * 60 * 24))
      ),
    }));

    const todayCheckInRecords = todayCheckIns.map((record: any) => ({
      _id: String(record._id),
      date: record.date,
      member: record.memberId
        ? {
            _id: String(record.memberId._id),
            name: record.memberId.name,
            membershipType: record.memberId.membershipType,
            phoneNumber: record.memberId.phoneNumber,
            status: record.memberId.status,
            fingerprintId: record.memberId.fingerprintId,
          }
        : null,
    }));

    const pendingDuesTotal = pendingDuesMembers.reduce(
      (sum, member) => sum + Number(member.pendingAmount || 0),
      0
    );

    return NextResponse.json({
      summary: {
        expiringToday: expiringTodayRaw.length,
        renewalsDue: renewalsDueRaw.length,
        todayCheckIns: todayCheckInRecords.length,
        newJoinersThisWeek: newJoinersRaw.length,
        pendingDuesTotal,
        pendingDuesMembers: pendingDuesMembers.length,
      },
      expiringToday: expiringTodayRaw.slice(0, 8).map(toMemberCard),
      renewalsDue: renewalsDueRaw.slice(0, 12).map(toMemberCard),
      newJoiners: newJoinersRaw.slice(0, 8).map(toMemberCard),
      todayCheckIns: todayCheckInRecords,
      pendingDues: pendingDuesMembers.slice(0, 12),
    });
  } catch (error) {
    console.error("Front desk dashboard error:", error);
    return NextResponse.json({ error: "Failed to load front desk dashboard" }, { status: 500 });
  }
}
