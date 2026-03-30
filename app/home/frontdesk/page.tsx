"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";

type MemberCard = {
  _id: string;
  name: string;
  phoneNumber?: string;
  membershipType: string;
  status: string;
  subscriptionEndDate: string;
  createdAt?: string;
  pendingAmount?: number;
  overdueDays?: number;
};

type CheckInRecord = {
  _id: string;
  date: string;
  member: {
    _id: string;
    name: string;
    membershipType: string;
    phoneNumber?: string;
    status?: string;
    fingerprintId?: number;
  } | null;
};

type FrontDeskPayload = {
  summary: {
    expiringToday: number;
    renewalsDue: number;
    todayCheckIns: number;
    newJoinersThisWeek: number;
    pendingDuesTotal: number;
    pendingDuesMembers: number;
  };
  expiringToday: MemberCard[];
  renewalsDue: MemberCard[];
  newJoiners: MemberCard[];
  todayCheckIns: CheckInRecord[];
  pendingDues: MemberCard[];
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : format(date, "dd MMM");
};

export default function FrontDeskPage() {
  const [data, setData] = useState<FrontDeskPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl =
        typeof window === "undefined"
          ? "/api/frontdesk"
          : new URL("/api/frontdesk", window.location.origin).toString();
      const response = await fetch(apiUrl);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load front desk dashboard");
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          Loading front-desk dashboard...
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-3xl">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-lg font-semibold text-slate-900">{error}</p>
            <Button onClick={fetchDashboard}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = data?.summary || {
    expiringToday: 0,
    renewalsDue: 0,
    todayCheckIns: 0,
    newJoinersThisWeek: 0,
    pendingDuesTotal: 0,
    pendingDuesMembers: 0,
  };

  const sections = [
    { title: "Expiring Today", items: data?.expiringToday || [], accent: "text-rose-700", empty: "No memberships expiring today." },
    { title: "Renewals Due", items: data?.renewalsDue || [], accent: "text-amber-700", empty: "No renewals due in the next 7 days." },
    { title: "New Joiners This Week", items: data?.newJoiners || [], accent: "text-emerald-700", empty: "No new joiners this week yet." },
    { title: "Pending Dues", items: data?.pendingDues || [], accent: "text-orange-700", empty: "No pending dues right now." },
  ];

  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-7xl mx-auto bg-slate-50">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Operations</p>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2">Front Desk Dashboard</h1>
          <p className="text-slate-500 mt-2">Today’s priorities for renewals, check-ins, and collections.</p>
        </div>
        <Button onClick={fetchDashboard} variant="outline" className="rounded-xl">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <Card className="rounded-3xl border-slate-200/60"><CardContent className="p-5"><p className="text-sm text-slate-500">Expiring Today</p><p className="text-3xl font-extrabold text-slate-900 mt-2">{summary.expiringToday}</p></CardContent></Card>
        <Card className="rounded-3xl border-slate-200/60"><CardContent className="p-5"><p className="text-sm text-slate-500">Renewals Due</p><p className="text-3xl font-extrabold text-slate-900 mt-2">{summary.renewalsDue}</p></CardContent></Card>
        <Card className="rounded-3xl border-slate-200/60"><CardContent className="p-5"><p className="text-sm text-slate-500">Today&apos;s Check-ins</p><p className="text-3xl font-extrabold text-slate-900 mt-2">{summary.todayCheckIns}</p></CardContent></Card>
        <Card className="rounded-3xl border-slate-200/60"><CardContent className="p-5"><p className="text-sm text-slate-500">New Joiners</p><p className="text-3xl font-extrabold text-slate-900 mt-2">{summary.newJoinersThisWeek}</p></CardContent></Card>
        <Card className="rounded-3xl border-slate-200/60 bg-orange-50 border-orange-100"><CardContent className="p-5"><p className="text-sm text-orange-700">Pending Dues</p><p className="text-3xl font-extrabold text-orange-950 mt-2">₹{summary.pendingDuesTotal.toLocaleString()}</p><p className="text-xs text-orange-700 mt-2">{summary.pendingDuesMembers} members</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {sections.map((section) => (
          <Card
            key={section.title}
            className={`rounded-3xl border-slate-200/60 ${
              section.title === "Pending Dues" ? "h-[420px]" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent
              className={
                section.title === "Pending Dues"
                  ? "h-[calc(100%-76px)] overflow-y-auto space-y-3"
                  : "space-y-3"
              }
            >
              {section.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">{section.empty}</div>
              ) : (
                section.items.map((member) => (
                  <Link key={member._id} href={`/home/students/${member._id}`} className="block rounded-2xl border border-slate-200 p-4 hover:border-orange-200 hover:bg-orange-50/40 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{member.phoneNumber || "No phone"} • {member.membershipType}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {section.title === "New Joiners This Week" ? `Joined ${formatDate(member.createdAt)}` : `Ends ${formatDate(member.subscriptionEndDate)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200">{member.status}</Badge>
                        {member.pendingAmount ? <p className={`text-sm font-semibold mt-2 ${section.accent}`}>₹{member.pendingAmount.toLocaleString()}</p> : null}
                        {member.overdueDays ? <p className="text-xs text-rose-600 mt-1">{member.overdueDays} days overdue</p> : null}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-3xl border-slate-200/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Today&apos;s Check-ins</CardTitle>
          <Link href="/home/attendance"><Button variant="ghost" className="rounded-xl">Open attendance <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.todayCheckIns || []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No check-ins recorded today.</div>
          ) : (
            (data?.todayCheckIns || []).map((record) => (
              <div key={record._id} className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900">{record.member?.name || "Unknown Member"}</p>
                  <p className="text-sm text-slate-500 mt-1">{record.member?.membershipType || "N/A"} • Fingerprint {record.member?.fingerprintId ?? "N/A"}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  {format(new Date(record.date), "hh:mm a")}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
