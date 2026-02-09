"use client";

import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type MonthlyData = { month: string; revenue: number; members: number };
type YearlyData = { year: string; revenue: number; members: number };
type PlanDistribution = { name: string; value: number; count: number };

type AnalyticsPayload = {
  summary: {
    totalRevenue: number;
    totalMembers: number;
    activeMembers: number;
    avgRevenuePerPeriod: number;
    growthRate: number;
  };
  monthly: MonthlyData[];
  yearly: YearlyData[];
  planDistribution: PlanDistribution[];
};

const chartColors = ["#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB"];

const Analytics = () => {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics", { cache: "no-store" });
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
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    );
  }

  const summary = data?.summary ?? {
    totalRevenue: 0,
    totalMembers: 0,
    activeMembers: 0,
    avgRevenuePerPeriod: 0,
    growthRate: 0,
  };

  return (
    <div className="text-black p-6 pt-0">
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-white border-2 border-gray-200 shadow-2xl">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3 text-black">
                  <BarChart3 className="w-8 h-8" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-gray-600 text-base mt-2">
                  Live revenue, member growth, and plan distribution
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={viewMode} onValueChange={(value: "monthly" | "yearly") => setViewMode(value)}>
                  <SelectTrigger className="w-40 h-12 border-2 border-gray-300 focus:border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200">
                    <SelectItem value="monthly">Monthly View</SelectItem>
                    <SelectItem value="yearly">Yearly View</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchAnalytics} variant="outline" className="h-12 px-6">
                  Refresh
                </Button>
                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting || !currentData.length}
                  className="h-12 px-6 bg-black text-white hover:bg-gray-800 border-2 border-black font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export CSV"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-black">₹{summary.totalRevenue.toLocaleString()}</p>
                  <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {summary.growthRate.toFixed(2)}%
                  </Badge>
                </div>
                <DollarSign className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Total Members</p>
                  <p className="text-3xl font-bold text-black">{summary.totalMembers.toLocaleString()}</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                    <Users className="w-3 h-3 mr-1" />
                    {summary.activeMembers} active
                  </Badge>
                </div>
                <Users className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Avg Revenue</p>
                  <p className="text-3xl font-bold text-black">₹{summary.avgRevenuePerPeriod.toLocaleString()}</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">
                    <Target className="w-3 h-3 mr-1" />
                    Per Period
                  </Badge>
                </div>
                <Activity className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Growth Rate</p>
                  <p className="text-3xl font-bold text-black">{summary.growthRate.toFixed(2)}%</p>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    MoM
                  </Badge>
                </div>
                <BarChart3 className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-black">
                <BarChart3 className="w-5 h-5" />
                {viewMode === "monthly" ? "Monthly" : "Yearly"} Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={viewMode === "monthly" ? "month" : "year"} tick={{ fill: "#374151", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#374151", fontSize: 12 }} tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-black">
                <Users className="w-5 h-5" />
                Member Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={viewMode === "monthly" ? "month" : "year"} tick={{ fill: "#374151", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [Number(value), "Members"]} />
                  <Line type="monotone" dataKey="members" stroke="#000000" strokeWidth={3} dot={{ fill: "#000000", strokeWidth: 2, r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-black">
                <PieChartIcon className="w-5 h-5" />
                Membership Plan Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data?.planDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                    {(data?.planDistribution || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {(data?.planDistribution || []).map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                    <span className="text-sm font-medium text-black">{entry.name}</span>
                    <span className="text-sm text-gray-600">{entry.value}% ({entry.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-black">
                <Calendar className="w-5 h-5" />
                {viewMode === "monthly" ? "Monthly" : "Yearly"} Performance Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-y-auto max-h-80">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-2 font-semibold text-black">Period</th>
                      <th className="text-left py-3 px-2 font-semibold text-black">Revenue</th>
                      <th className="text-left py-3 px-2 font-semibold text-black">Members</th>
                      <th className="text-left py-3 px-2 font-semibold text-black">Avg/Member</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium text-black">{"month" in item ? item.month : item.year}</td>
                        <td className="py-3 px-2 text-black">₹{item.revenue.toLocaleString()}</td>
                        <td className="py-3 px-2 text-black">{item.members}</td>
                        <td className="py-3 px-2 text-black">₹{item.members ? Math.round(item.revenue / item.members).toLocaleString() : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
