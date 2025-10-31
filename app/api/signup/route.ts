import { connectDb } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "@/models/admin";

export const POST = async (request: NextRequest) => {
  try {
    await connectDb();

    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 }
      );
    }

   

    const existingAdmin = await Admin.findOne({ name });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this name already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name: name.trim(),
      password: hashedPassword,
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT secret not set" }, { status: 500 });
    }

    const token = jwt.sign({ id: newAdmin._id }, secret, { expiresIn: "5d" });

    return NextResponse.json(
      {
        message: "Admin registered successfully",
        admin: {
          id: newAdmin._id,
          name: newAdmin.name,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
