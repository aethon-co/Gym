import { connectDb } from "@/db";
import { syncMemberStatuses } from "@/lib/memberStatus";
import Attendance from "@/models/attendance";
import Member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";

type ViewType = "day" | "week" | "month" | "range";

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const getDateRangeFromQuery = (params: URLSearchParams) => {
  const view = (params.get("view") || "day") as ViewType;
  const dateParam = params.get("date");
  const startParam = params.get("startDate");
  const endParam = params.get("endDate");

  const baseDate = dateParam ? new Date(dateParam) : new Date();
  if (Number.isNaN(baseDate.getTime())) return null;

  const dayStart = startOfDay(baseDate);

  if (view === "day") {
    return { view, start: dayStart, end: addDays(dayStart, 1) };
  }

  if (view === "week") {
    const day = dayStart.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = addDays(dayStart, mondayOffset);
    return { view, start: weekStart, end: addDays(weekStart, 7) };
  }

  if (view === "month") {
    const monthStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), 1);
    const nextMonth = new Date(dayStart.getFullYear(), dayStart.getMonth() + 1, 1);
    return { view, start: monthStart, end: nextMonth };
  }

  if (!startParam || !endParam) return null;
  const start = startOfDay(new Date(startParam));
  const end = addDays(startOfDay(new Date(endParam)), 1);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return null;
  return { view: "range" as const, start, end };
};

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    await syncMemberStatuses();
    const { memberId, date } = await req.json();

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    member.updateStatus();
    await member.save();
    if (member.status !== "Active") {
      return NextResponse.json({ error: `Cannot mark attendance. Member is ${member.status}` }, { status: 403 });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    if (Number.isNaN(attendanceDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const start = startOfDay(attendanceDate);
    const end = addDays(start, 1);
    const existingAttendance = await Attendance.findOne({
      memberId,
      date: { $gte: start, $lt: end },
    });

    if (existingAttendance) {
      return NextResponse.json({ message: "Attendance already marked for this day", attendance: existingAttendance }, { status: 200 });
    }

    const attendance = await Attendance.create({
      memberId,
      date: attendanceDate,
    });

    return NextResponse.json({ message: "Attendance marked", attendance }, { status: 201 });
  } catch (error: any) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    await syncMemberStatuses();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const range = getDateRangeFromQuery(searchParams);

    if (!range) {
      return NextResponse.json({ error: "Invalid date filters" }, { status: 400 });
    }

    const attendance = await Attendance.find({
      date: { $gte: range.start, $lt: range.end },
    })
      .populate("memberId", "name fingerprintId phoneNumber membershipType status")
      .sort({ date: -1 })
      .lean();

    const filtered = search
      ? attendance.filter((record: any) => {
          const name = String(record.memberId?.name || "").toLowerCase();
          const fingerprint = String(record.memberId?.fingerprintId || "");
          const phone = String(record.memberId?.phoneNumber || "");
          return name.includes(search) || fingerprint.includes(search) || phone.includes(search);
        })
      : attendance;

    return NextResponse.json({
      view: range.view,
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
      total: filtered.length,
      records: filtered.map((record: any) => ({
        _id: String(record._id),
        date: record.date,
        memberId: {
          _id: String(record.memberId?._id || ""),
          name: record.memberId?.name || "Unknown",
          fingerprintId: record.memberId?.fingerprintId,
          phoneNumber: record.memberId?.phoneNumber,
          membershipType: record.memberId?.membershipType,
          status: record.memberId?.status,
        },
      })),
    });
  } catch (error: any) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
