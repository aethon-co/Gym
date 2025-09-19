import { connectDb } from "@/db";
import Member from "@/models/member";
import { connect } from "http2";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req:NextRequest
) => {
    try {
        await connectDb();

        const members = await Member.find();

        if (!members) {
            return NextResponse.json(
              { error: "No members found" },
              { status: 404 }
            );
        }

        return NextResponse.json(members, { status: 200 });

    }catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
}