import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const { id } = await context.params; 
        const { amount, membershipType, renewalMonths = 1 } = await req.json();
        
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

        member.paymentAmount = amount;
        member.subscriptionEndDate = newEndDate;
        member.status = "Active";
        
        if (membershipType && ['Basic', 'Premium', 'Couple', 'Student'].includes(membershipType)) {
            member.membershipType = membershipType;
        }

        await member.save();

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