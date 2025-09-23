import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextResponse } from "next/server";

export const GET = async()=>{
    try{
        await connectDb();
        const count = await Member.countDocuments();
        return NextResponse.json({count}, {status: 200});

    }catch(err){
        console.error("Count error:", err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}