import { connectDb } from "@/db";
import Expense from "@/models/expense";
import { NextRequest, NextResponse } from "next/server";

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const monthLabel = (date: Date) =>
  date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });

const getLastNMonths = (count: number) => {
  const now = new Date();
  const months: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return months;
};

export async function GET() {
  try {
    await connectDb();

    const expenses = await Expense.find()
      .sort({ expenseDate: -1, createdAt: -1 })
      .limit(50)
      .lean();

    const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0);
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const thisMonthExpenses = expenses
      .filter((expense: any) => new Date(expense.expenseDate) >= currentMonthStart)
      .reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0);

    const categorySummary = Object.entries(
      expenses.reduce<Record<string, number>>((acc, expense: any) => {
        const category = expense.category || "Other";
        acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
        return acc;
      }, {})
    )
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const monthlyBuckets = getLastNMonths(6).map((date) => ({
      key: monthKey(date),
      month: monthLabel(date),
      expenses: 0,
    }));
    const monthlyMap = new Map(monthlyBuckets.map((bucket) => [bucket.key, bucket]));

    for (const expense of expenses as any[]) {
      const expenseDate = new Date(expense.expenseDate);
      const bucket = monthlyMap.get(monthKey(expenseDate));
      if (bucket) {
        bucket.expenses += Number(expense.amount || 0);
      }
    }

    return NextResponse.json({
      summary: {
        totalExpenses,
        thisMonthExpenses,
        recentCount: expenses.length,
      },
      expenses: expenses.map((expense: any) => ({
        _id: String(expense._id),
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        expenseDate: expense.expenseDate,
        notes: expense.notes,
        createdAt: expense.createdAt,
      })),
      categorySummary,
      monthly: monthlyBuckets,
    });
  } catch (error) {
    console.error("Expenses GET error:", error);
    return NextResponse.json({ error: "Failed to load expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const amount = Number(body.amount);
    const category = typeof body.category === "string" ? body.category : "Other";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const expenseDate = body.expenseDate ? new Date(body.expenseDate) : new Date();

    if (!title) {
      return NextResponse.json({ error: "Expense title is required" }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Expense amount must be greater than zero" }, { status: 400 });
    }

    if (Number.isNaN(expenseDate.getTime())) {
      return NextResponse.json({ error: "Invalid expense date" }, { status: 400 });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      notes,
      expenseDate,
    });

    return NextResponse.json(
      {
        message: "Expense added successfully",
        expense: {
          _id: String(expense._id),
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          expenseDate: expense.expenseDate,
          notes: expense.notes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Expenses POST error:", error);
    return NextResponse.json({ error: "Failed to save expense" }, { status: 500 });
  }
}
