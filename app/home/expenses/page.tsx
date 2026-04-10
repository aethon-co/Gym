"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Wallet, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type ExpenseItem = {
  _id: string;
  title: string;
  amount: number;
  category: string;
  expenseDate: string;
  notes?: string;
};

type ExpensePayload = {
  summary: {
    totalExpenses: number;
    thisMonthExpenses: number;
    recentCount: number;
  };
  expenses: ExpenseItem[];
  categorySummary: { category: string; amount: number }[];
  monthly: { month: string; expenses: number }[];
};

const categories = ["Rent", "Salary", "Utilities", "Equipment", "Maintenance", "Marketing", "Other"];
const chartColors = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#64748b"];

export default function ExpensesPage() {
  const [data, setData] = useState<ExpensePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Rent",
    expenseDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const apiUrl =
        typeof window === "undefined"
          ? "/api/expenses"
          : new URL("/api/expenses", window.location.origin).toString();
      const response = await fetch(apiUrl);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load expenses");
      setData(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const submitExpense = async () => {
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a title and a valid amount");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          amount,
          category: form.category,
          expenseDate: form.expenseDate,
          notes: form.notes,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save expense");
      toast.success("Expense added");
      setForm({
        title: "",
        amount: "",
        category: "Rent",
        expenseDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      await fetchExpenses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const topCategory = useMemo(() => data?.categorySummary?.[0], [data]);

  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-7xl mx-auto bg-slate-50">
      <Toaster position="top-right" />
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl shadow-lg shadow-emerald-500/20 mb-5">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Expense Tracking</h1>
          <p className="text-slate-500 mt-2">Log gym costs and keep the profit side of the business visible.</p>
        </div>
        <Button onClick={fetchExpenses} variant="outline" className="rounded-xl">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6 mb-8">
        <Card className="rounded-3xl border-slate-200/60">
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Rent, treadmill repair, electricity bill..." className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="0" className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger className="mt-2 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expenseDate">Date</Label>
              <Input id="expenseDate" type="date" value={form.expenseDate} onChange={(e) => setForm((prev) => ({ ...prev, expenseDate: e.target.value }))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="mt-2 rounded-xl min-h-24" />
            </div>
            <Button onClick={submitExpense} disabled={saving} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Expense
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-3xl border-slate-200/60"><CardContent className="p-5"><p className="text-sm text-slate-500">Total Expenses</p><p className="text-3xl font-extrabold text-slate-900 mt-2">₹{(data?.summary.totalExpenses || 0).toLocaleString()}</p></CardContent></Card>
          <Card className="rounded-3xl border-slate-200/60"><CardContent className="p-5"><p className="text-sm text-slate-500">This Month</p><p className="text-3xl font-extrabold text-slate-900 mt-2">₹{(data?.summary.thisMonthExpenses || 0).toLocaleString()}</p></CardContent></Card>
          <Card className="rounded-3xl border-slate-200/60"><CardContent className="p-5"><p className="text-sm text-slate-500">Top Category</p><p className="text-3xl font-extrabold text-slate-900 mt-2">{topCategory?.category || "N/A"}</p><p className="text-sm text-slate-500 mt-2">₹{(topCategory?.amount || 0).toLocaleString()}</p></CardContent></Card>

          <Card className="rounded-3xl border-slate-200/60 md:col-span-2">
            <CardHeader><CardTitle>Monthly Expense Trend</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="expenses" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200/60">
            <CardHeader><CardTitle>By Category</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.categorySummary || []} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={95}>
                    {(data?.categorySummary || []).map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-3xl border-slate-200/60">
        <CardHeader><CardTitle>Recent Expenses</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-slate-500">Loading expenses...</div>
          ) : (data?.expenses || []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No expenses logged yet.</div>
          ) : (
            (data?.expenses || []).map((expense) => (
              <div key={expense._id} className="rounded-2xl border border-slate-200 p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900">{expense.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{expense.category} • {format(new Date(expense.expenseDate), "dd MMM yyyy")}</p>
                  {expense.notes ? <p className="text-sm text-slate-500 mt-2">{expense.notes}</p> : null}
                </div>
                <div className="text-right font-extrabold text-slate-900">₹{expense.amount.toLocaleString()}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
