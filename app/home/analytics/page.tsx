"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Activity,
  Loader2,
  RefreshCw
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type MonthlyData = { month: string; revenue: number; members: number };
type YearlyData = { year: string; revenue: number; members: number };
type PlanDistribution = { name: string; value: number; count: number };

type AnalyticsPayload = {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    currentMonthProfit: number;
    totalMembers: number;
    activeMembers: number;
    avgRevenuePerPeriod: number;
    growthRate: number;
  };
  monthly: MonthlyData[];
  expenseMonthly: { month: string; expenses: number; profit: number }[];
  yearly: YearlyData[];
  planDistribution: PlanDistribution[];
};

const chartColors = ["#f97316", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981"];

const Analytics = () => {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics", { cache: "no-store" });

      // Ensure we handle non-JSON error responses gracefully
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response.");
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load analytics");
      }
      setData(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const currentData = useMemo<(MonthlyData | YearlyData)[]>(() => {
    if (!data) return [];
    return viewMode === "monthly" ? data.monthly : data.yearly;
  }, [data, viewMode]);

  const handleExportCSV = async () => {
    if (!currentData.length) return;
    setIsExporting(true);
    const loadingToastId = toast.loading("Preparing CSV export...");
    try {
      const csvData = currentData.map((item) => ({
        Period: "month" in item ? item.month : item.year,
        Revenue: item.revenue,
        Members: item.members,
        AvgRevenuePerMember: item.members ? Math.round(item.revenue / item.members) : 0,
      }));
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => headers.map((header) => (row as any)[header]).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${viewMode}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported successfully!", { id: loadingToastId });
    } catch {
      toast.error("Export failed. Please try again.", { id: loadingToastId });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="text-slate-500 font-medium">Loading Insights...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary ?? {
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    currentMonthProfit: 0,
    totalMembers: 0,
    activeMembers: 0,
    avgRevenuePerPeriod: 0,
    growthRate: 0,
  };

  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-7xl mx-auto bg-slate-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-500 rounded-3xl shadow-lg shadow-orange-500/30 mb-5">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center">Analytics Dashboard</h1>
        <p className="text-slate-500 font-medium mt-2 text-center max-w-2xl">Live revenue, member growth, and plan distribution.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex gap-4 items-center flex-wrap w-full">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 pl-4 pr-3 py-1.5 border-r border-slate-200/60">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">View</span>
              </div>
              <Select value={viewMode} onValueChange={(value: "monthly" | "yearly") => setViewMode(value)}>
                <SelectTrigger className="px-4 py-2 bg-transparent text-sm font-semibold text-slate-700 outline-none focus:ring-0 border-none cursor-pointer shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="monthly">Monthly View</SelectItem>
                  <SelectItem value="yearly">Yearly View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 ml-auto">
              <Button
                onClick={fetchAnalytics}
                disabled={isLoading}
                variant="outline"
                className="h-11 rounded-xl flex items-center gap-2 border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExportCSV}
                disabled={isExporting || !currentData.length}
                className="h-11 rounded-xl flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 text-white transition-all"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-slate-100/50 group-hover:text-orange-50 transition-colors pointer-events-none">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">Total Revenue</p>
            <p className="text-4xl font-extrabold text-slate-900">₹{summary.totalRevenue.toLocaleString()}</p>
            <div className="mt-4 flex items-center">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-bold px-2 py-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                {summary.growthRate.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-slate-100/50 group-hover:text-blue-50 transition-colors pointer-events-none">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">Total Expenses</p>
            <p className="text-4xl font-extrabold text-slate-900">₹{summary.totalExpenses.toLocaleString()}</p>
            <div className="mt-4 flex items-center">
              <Badge className="bg-rose-50 text-rose-700 border-rose-200/60 font-bold px-2 py-1">
                <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                Operating Costs
              </Badge>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-slate-100/50 group-hover:text-purple-50 transition-colors pointer-events-none">
            <Target className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">Net Profit</p>
            <p className="text-4xl font-extrabold text-slate-900">₹{summary.totalProfit.toLocaleString()}</p>
            <div className="mt-4 flex items-center">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-bold px-2 py-1">
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                After Expenses
              </Badge>
            </div>
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-slate-100/50 group-hover:text-amber-50 transition-colors pointer-events-none">
            <BarChart3 className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">Total Members</p>
            <p className="text-4xl font-extrabold text-slate-900">{summary.totalMembers.toLocaleString()}</p>
            <div className="mt-4 flex items-center">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200/60 font-bold px-2 py-1">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                {summary.activeMembers} Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              Expenses vs Profit
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.expenseMonthly || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              Profit Snapshot
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-800">Current Month Profit</p>
              <p className="text-3xl font-extrabold text-emerald-950 mt-1">₹{summary.currentMonthProfit.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Average Revenue Per Period</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">₹{summary.avgRevenuePerPeriod.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-800">Growth Rate</p>
              <p className="text-3xl font-extrabold text-amber-950 mt-1">{summary.growthRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              {viewMode === "monthly" ? "Monthly" : "Yearly"} Revenue Trends
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey={viewMode === "monthly" ? "month" : "year"} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              Member Growth Trend
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey={viewMode === "monthly" ? "month" : "year"} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip formatter={(value: any) => [Number(value), "Members"]} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={4} dot={{ fill: "#ffffff", stroke: "#3b82f6", strokeWidth: 3, r: 6 }} activeDot={{ r: 8, fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution & Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <PieChartIcon className="w-5 h-5" />
              </div>
              Membership Plan Distribution
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data?.planDistribution || []} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                  {(data?.planDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, "Share"]} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6">
              {(data?.planDistribution || []).map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="text-sm font-bold text-slate-800">{entry.name}</span>
                  <span className="text-sm font-medium text-slate-500">{entry.value}% ({entry.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              {viewMode === "monthly" ? "Monthly" : "Yearly"} Table Data
            </h2>
          </div>
          <div className="p-0">
            <div className="overflow-y-auto max-h-[350px]">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Period</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Revenue</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Members</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Avg/Member</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-900 font-bold">{"month" in item ? item.month : item.year}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">₹{item.revenue.toLocaleString()}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">{item.members}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">₹{item.members ? Math.round(item.revenue / item.members).toLocaleString() : 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
