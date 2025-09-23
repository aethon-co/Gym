import { connectDb } from "@/db";
import Member from "@/models/member";
import { NextResponse ,NextRequest } from "next/server";

export const POST = async(request: NextRequest)=>{
    try{
        await connectDb();
        const {memberId} = await request.json();
        if(!memberId){
            return NextResponse.json({error: "Member ID is required"}, {status: 400});
        }
        const member = await Member.findById(memberId);
        if(!member){
            return NextResponse.json({error: "Member not found"}, {status: 404});
        }
        member.status = 'Suspended';
        await member.save();
        return NextResponse.json({message: "Member suspended successfully"}, {status: 200});

    }catch(err){
        console.error("Suspend error:", err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }   

}