import { connectDb } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "@/models/admin";

export const POST = async (request: NextRequest) => {
  try {
    await connectDb();

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
    }

    const user = await Admin.findOne({ name });
    if (!user || typeof user.password !== "string") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT secret not set" }, { status: 500 });
    }

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "5d" });
    return NextResponse.json({ token }, { status: 200 });
  } catch (error: any) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
