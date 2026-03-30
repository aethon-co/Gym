import { connectDb } from "@/db";
import { syncMemberStatuses } from "@/lib/memberStatus";
import Expense from "@/models/expense";
import Member from "@/models/member";
import Payment from "@/models/payments";
import { NextResponse } from "next/server";

const monthLabel = (date: Date) =>
  date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });

const getLastNMonths = (count: number) => {
  const now = new Date();
  const months: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  return months;
};

export async function GET() {
  try {
    await connectDb();
    await syncMemberStatuses();

    const [members, payments, expenses] = await Promise.all([
      Member.find().select("membershipType status createdAt").lean(),
      Payment.find().select("amount createdAt").lean(),
      Expense.find().select("amount expenseDate").lean(),
    ]);

    const monthlyBuckets = getLastNMonths(12).map((date) => ({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: monthLabel(date),
      revenue: 0,
      members: 0,
    }));
    const monthlyMap = new Map(monthlyBuckets.map((bucket) => [bucket.key, bucket]));

    for (const payment of payments as any[]) {
      const d = new Date(payment.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = monthlyMap.get(key);
      if (bucket) {
        bucket.revenue += Number(payment.amount || 0);
      }
    }

    for (const member of members as any[]) {
      const d = new Date(member.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = monthlyMap.get(key);
      if (bucket) {
        bucket.members += 1;
      }
    }

    const yearlyMap = new Map<string, { year: string; revenue: number; members: number }>();
    for (const payment of payments as any[]) {
      const year = String(new Date(payment.createdAt).getFullYear());
      if (!yearlyMap.has(year)) yearlyMap.set(year, { year, revenue: 0, members: 0 });
      yearlyMap.get(year)!.revenue += Number(payment.amount || 0);
    }
    for (const member of members as any[]) {
      const year = String(new Date(member.createdAt).getFullYear());
      if (!yearlyMap.has(year)) yearlyMap.set(year, { year, revenue: 0, members: 0 });
      yearlyMap.get(year)!.members += 1;
    }

    const membershipCounts = {
      Basic: 0,
      Premium: 0,
      Couple: 0,
      Student: 0,
      Custom: 0,
    };
    for (const member of members as any[]) {
      const type = member.membershipType as keyof typeof membershipCounts;
      if (type in membershipCounts) membershipCounts[type] += 1;
    }
    const totalMembers = members.length || 1;
    const planDistribution = Object.entries(membershipCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / totalMembers) * 100),
      count,
    }));

    const expenseMonthly = getLastNMonths(12).map((date) => ({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: monthLabel(date),
      expenses: 0,
      profit: 0,
    }));
    const expenseMonthlyMap = new Map(expenseMonthly.map((bucket) => [bucket.key, bucket]));

    for (const expense of expenses as any[]) {
      const d = new Date(expense.expenseDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = expenseMonthlyMap.get(key);
      if (bucket) {
        bucket.expenses += Number(expense.amount || 0);
      }
    }

    for (const bucket of expenseMonthly) {
      const revenueBucket = monthlyMap.get(bucket.key);
      bucket.profit = Number(revenueBucket?.revenue || 0) - bucket.expenses;
    }

    const monthly = monthlyBuckets;
    const yearly = Array.from(yearlyMap.values()).sort((a, b) => Number(a.year) - Number(b.year));
    const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const totalExpenses = (expenses as any[]).reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
    const activeMembers = members.filter((member: any) => member.status === "Active").length;

    const currentMonth = monthly[monthly.length - 1]?.revenue || 0;
    const previousMonth = monthly[monthly.length - 2]?.revenue || 0;
    const growthRate = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
    const currentMonthExpenses = expenseMonthly[expenseMonthly.length - 1]?.expenses || 0;
    const totalProfit = totalRevenue - totalExpenses;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalExpenses,
        totalProfit,
        currentMonthProfit: currentMonth - currentMonthExpenses,
        totalMembers: members.length,
        activeMembers,
        avgRevenuePerPeriod: monthly.length ? Math.round(totalRevenue / monthly.length) : 0,
        growthRate: Number(growthRate.toFixed(2)),
      },
      monthly,
      expenseMonthly: expenseMonthly.map(({ month, expenses, profit }) => ({ month, expenses, profit })),
      yearly,
      planDistribution,
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
