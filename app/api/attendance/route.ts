import { connectDb } from "@/db";
import Attendance from "@/models/attendance";
import Member from "@/models/member";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req:NextRequest){
    try{
        await connectDb();
        const {memberId,date,status} = await req.json();
        if(!memberId || !date || !status){
            return NextResponse.json({error:"Fill all the fields"},{status:400});
        }
        const member = await Member.findById(memberId);
        if(!member){
            return NextResponse.json({error:"Member not found"},{status:404});
        }
        const attendance = new Attendance({
            memberId,
            date:new Date(date),
        });
        await attendance.save();
        return NextResponse.json({message:"Attendance marked",attendance},{status:201});
    }catch(error:any){
        return NextResponse.json({error:error.message},{status:500});
    }
}

export async function GET() {
  try {
    await connectDb();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendance = await Attendance.find({
      checkIn: { $gte: today, $lt: tomorrow }
    }).populate("memberId", "name");

    const names = attendance.map(a => a.memberId?.name || "Unknown");

    return new Response(JSON.stringify({ date: today.toISOString().slice(0, 10), attendance: names }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
