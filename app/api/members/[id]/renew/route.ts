import { connectDb } from "@/db";
import Member from "@/models/member";
import Payment from "@/models/payments";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const { id } = await context.params; 
        const { amount, membershipType, renewalMonths = 1, paymentMethod = "Cash" } = await req.json();
        
        if (!amount || amount <= 0) {
            return NextResponse.json({ 
                error: "Valid payment amount is required" 
            }, { status: 400 });
        }

        if (renewalMonths <= 0 || renewalMonths > 12) {
            return NextResponse.json({ 
                error: "Renewal months must be between 1 and 12" 
            }, { status: 400 });
        }

        const member = await Member.findById(id);
        if (!member) {
            return NextResponse.json({ 
                error: "Member not found" 
            }, { status: 404 });
        }

        let newEndDate;
        const today = new Date();
        const currentEndDate = new Date(member.subscriptionEndDate);

        if (currentEndDate <= today || member.status === 'Expired') {
            newEndDate = new Date(today);
        } else {
            newEndDate = new Date(currentEndDate);
        }
        
        newEndDate.setMonth(newEndDate.getMonth() + renewalMonths);

        const targetMembershipType =
          membershipType && ["Basic", "Premium", "Couple", "Student", "Custom"].includes(membershipType)
            ? membershipType
            : member.membershipType;

        member.paymentAmount = amount;
        member.subscriptionEndDate = newEndDate;
        member.status = "Active";
        member.membershipType = targetMembershipType;
        await member.save();

        if (member.coupleGroupId) {
          await Member.updateMany(
            {
              coupleGroupId: member.coupleGroupId,
              _id: { $ne: member._id },
            },
            {
              $set: {
                subscriptionEndDate: newEndDate,
                status: "Active",
                membershipType: "Couple",
                paymentAmount: amount,
              },
            }
          );
        }

        await Payment.create({
            memberId: id,
            coupleGroupId: member.coupleGroupId || null,
            amount: amount,
            paymentMethod: paymentMethod,
            duration: renewalMonths,
            notes: `${member.coupleGroupId ? "Couple " : ""}membership renewal - ${renewalMonths} month(s) - ${targetMembershipType}`
        });

        return NextResponse.json({ 
            success: true,
            message: `Membership renewed successfully for ${renewalMonths} month(s)`,
            member: {
                _id: member._id,
                name: member.name,
                membershipType: member.membershipType,
                status: member.status,
                subscriptionStartDate: member.subscriptionStartDate,
                subscriptionEndDate: member.subscriptionEndDate,
                paymentAmount: member.paymentAmount
            }
        });

    } catch (error: any) {
        console.error('Renewal error:', error);
        return NextResponse.json({ 
            error: error.message || "Internal server error" 
        }, { status: 500 });
    }
}
