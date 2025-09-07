import {connectDb} from "@/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "@/models/admin";

connectDb();


export const POST = async(request:NextRequest) => {
    try{
        const {name,password} = await request.json();
        
        if(!name || !password){
            return NextResponse.json({error:"Fill all the fields"},{status:400});
        }
        const user = await Admin.findOne({name});
        if(!user){
            return NextResponse.json({error:"Admin not found"},{status:404});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return NextResponse.json({error:"Invalid credentials"},{status:401});
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"5d"});
        return NextResponse.json({token},{status:200});
    }catch(err){
        console.log(err);
        return NextResponse.json({error:"Internal Error"},{status:500});
    }
}