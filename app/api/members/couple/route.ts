import { connectDb } from "@/db";
import Member from "@/models/member";
import Payment from "@/models/payments";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { action, memberId, partnerMemberId, individualType = "Basic" } = await req.json();

    if (!action || !memberId) {
      return NextResponse.json({ error: "action and memberId are required" }, { status: 400 });
    }
    if (!mongoose.isValidObjectId(memberId)) {
      return NextResponse.json({ error: "Invalid memberId" }, { status: 400 });
    }

    if (action === "link") {
      if (!partnerMemberId || memberId === partnerMemberId) {
        return NextResponse.json({ error: "Valid partnerMemberId is required" }, { status: 400 });
      }
      if (!mongoose.isValidObjectId(partnerMemberId)) {
        return NextResponse.json({ error: "Invalid partnerMemberId" }, { status: 400 });
      }

      const [member, partner] = await Promise.all([Member.findById(memberId), Member.findById(partnerMemberId)]);
      if (!member || !partner) {
        return NextResponse.json({ error: "Member/partner not found" }, { status: 404 });
      }

      if (member.membershipType !== "Couple" || partner.membershipType !== "Couple") {
        return NextResponse.json(
          { error: "Both members must have membership type set to Couple before linking" },
          { status: 400 }
        );
      }
      if (member.coupleGroupId || partner.coupleGroupId) {
        return NextResponse.json(
          { error: "One of the selected members is already linked in a couple group" },
          { status: 409 }
        );
      }

      const groupId = new mongoose.Types.ObjectId().toString();

      member.membershipType = "Couple";
      member.coupleGroupId = groupId;
      member.couplePartnerId = partner._id;

      partner.membershipType = "Couple";
      partner.coupleGroupId = groupId;
      partner.couplePartnerId = member._id;

      await Promise.all([member.save(), partner.save()]);

      return NextResponse.json({
        message: "Couple membership linked successfully",
        groupId,
      });
    }

    if (action === "unlink") {
      const allowedIndividualTypes = ["Basic", "Premium", "Student", "Custom"];
      if (!allowedIndividualTypes.includes(individualType)) {
        return NextResponse.json({ error: "Invalid individual membership type" }, { status: 400 });
      }

      const member = await Member.findById(memberId);
      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      const groupId = member.coupleGroupId;
      if (groupId) {
        await Member.updateMany(
          { coupleGroupId: groupId },
          {
            $set: {
              membershipType: individualType,
              coupleGroupId: null,
              couplePartnerId: null,
            },
          }
        );
      } else {
        member.couplePartnerId = null;
        member.coupleGroupId = null;
        member.membershipType = individualType;
        await member.save();
      }

      return NextResponse.json({
        message: "Converted to individual membership successfully",
        previousGroupId: groupId,
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    console.error("Couple membership update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const mode = searchParams.get("mode");
    const search = (searchParams.get("search") || "").trim();

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const member: any = await Member.findById(memberId).lean();
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (mode === "candidates") {
      const candidates = await Member.find({
        _id: { $ne: memberId },
        membershipType: "Couple",
        $or: [{ coupleGroupId: null }, { coupleGroupId: { $exists: false } }],
        ...(search
          ? {
              name: {
                $regex: search,
                $options: "i",
              },
            }
          : {}),
      })
        .select("name phoneNumber email membershipType status")
        .sort({ name: 1 })
        .limit(30)
        .lean();

      return NextResponse.json({
        candidates: candidates.map((candidate: any) => ({
          _id: String(candidate._id),
          name: candidate.name,
          phoneNumber: candidate.phoneNumber,
          email: candidate.email,
          membershipType: candidate.membershipType,
          status: candidate.status,
        })),
      });
    }

    if (!member.coupleGroupId) {
      return NextResponse.json({ couple: null, payments: [] });
    }

    const members = await Member.find({ coupleGroupId: member.coupleGroupId })
      .select("name phoneNumber email membershipType status fingerprintId subscriptionEndDate")
      .lean();

    const payments = await Payment.find({ coupleGroupId: member.coupleGroupId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      couple: {
        groupId: member.coupleGroupId,
        members: members.map((m: any) => ({
          _id: String(m._id),
          name: m.name,
          phoneNumber: m.phoneNumber,
          email: m.email,
          membershipType: m.membershipType,
          status: m.status,
          fingerprintId: m.fingerprintId,
          subscriptionEndDate: m.subscriptionEndDate,
        })),
      },
      payments: payments.map((payment: any) => ({
        _id: String(payment._id),
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        notes: payment.notes,
      })),
    });
  } catch (error: any) {
    console.error("Couple membership fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
