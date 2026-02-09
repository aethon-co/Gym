"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users, RefreshCw, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ViewType = "day" | "week" | "month" | "range";

interface Member {
  _id: string;
  name: string;
  fingerprintId?: number;
  status?: "Active" | "Expired" | "Suspended";
  membershipType?: string;
  phoneNumber?: string;
}

interface AttendanceRecord {
  _id: string;
  memberId: Member;
  date: string;
}

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewType>("day");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        view,
        date,
      });

      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      if (view === "range") {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }

      const res = await fetch(`/api/attendance?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch attendance");
      setAttendanceData(data.records || []);
    } catch (error) {
      console.error(error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const exportToExcel = () => {
    if (!attendanceData.length) return;

    const rows = attendanceData
      .map((record) => {
        const checkIn = new Date(record.date);
        return `<tr>
          <td>${record.memberId._id}</td>
          <td>${record.memberId.name || "Unknown"}</td>
          <td>${record.memberId.fingerprintId ?? ""}</td>
          <td>${record.memberId.phoneNumber ?? ""}</td>
          <td>${record.memberId.membershipType ?? ""}</td>
          <td>${record.memberId.status ?? ""}</td>
          <td>${checkIn.toLocaleDateString()}</td>
          <td>${checkIn.toLocaleTimeString()}</td>
        </tr>`;
      })
      .join("");

    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Member ID</th>
            <th>Name</th>
            <th>Fingerprint ID</th>
            <th>Phone</th>
            <th>Membership</th>
            <th>Status</th>
            <th>Date</th>
            <th>Check-in Time</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_${view}_${date}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const heading = useMemo(() => {
    if (view === "day") return `Attendance for ${new Date(date).toLocaleDateString()}`;
    if (view === "week") return `Weekly attendance around ${new Date(date).toLocaleDateString()}`;
    if (view === "month") return `Monthly attendance for ${new Date(date).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
    return `Attendance from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
  }, [view, date, startDate, endDate]);

  useEffect(() => {
    fetchAttendance();
  }, [view, date, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen overflow-y-auto bg-gray-50">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center w-14 h-14 bg-black rounded-2xl shadow-lg mb-3">
          <Users className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 text-center">Attendance History</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Input
              className="pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors w-full"
              type="text"
              value={searchTerm}
              placeholder="Search by name, phone, or fingerprint..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">View:</span>
            </div>
            <select
              value={view}
              onChange={(e) => setView(e.target.value as ViewType)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="range">Custom Range</option>
            </select>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10" />
            </div>

            {view === "range" && (
              <>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </>
            )}

            <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>

            <Button onClick={exportToExcel} disabled={attendanceData.length === 0} className="flex items-center gap-2 bg-green-600 hover:bg-green-700" size="sm">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>{heading}</span>
          <span className="font-medium">Total: {attendanceData.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading attendance...</span>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No attendance records</h3>
          <p className="text-gray-500">No check-ins found for the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fingerprint</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record, index) => (
                  <tr key={record._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.memberId?.name || "Unknown Member"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.memberId?.fingerprintId ?? "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.memberId?.membershipType || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.memberId?.status || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
