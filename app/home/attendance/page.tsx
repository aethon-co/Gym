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
    <div className="min-h-screen p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto bg-slate-50">
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-500 rounded-3xl shadow-lg shadow-orange-500/30 mb-5">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center">Attendance History</h1>
        <p className="text-slate-500 font-medium mt-2">Track daily check-ins, member visits, and history in one place.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="relative w-full xl:flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <Input
              className="h-14 pl-12 pr-4 rounded-2xl border-slate-200 bg-slate-50/60 focus:border-orange-500 focus:ring-orange-500/20 transition-all w-full text-base shadow-sm"
              type="text"
              value={searchTerm}
              placeholder="Search by name, phone, or fingerprint..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap xl:flex-nowrap xl:items-center gap-3 xl:w-auto">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl shadow-sm min-w-[170px] xl:flex-shrink-0">
              <div className="flex items-center gap-2 pl-4 pr-3 py-3 border-r border-slate-200/60">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">View</span>
              </div>
              <select
                value={view}
                onChange={(e) => setView(e.target.value as ViewType)}
                className="px-4 py-3 bg-transparent text-sm font-semibold text-slate-700 outline-none focus:ring-0 border-none cursor-pointer min-w-[88px]"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="range">Range</option>
              </select>
            </div>

            <div className="relative group min-w-[180px] xl:flex-shrink-0">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 pl-11 rounded-2xl border-slate-200 shadow-sm cursor-pointer bg-white" />
            </div>

            {view === "range" && (
              <>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-14 min-w-[180px] rounded-2xl border-slate-200 shadow-sm cursor-pointer bg-white xl:flex-shrink-0" />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-14 min-w-[180px] rounded-2xl border-slate-200 shadow-sm cursor-pointer bg-white xl:flex-shrink-0" />
              </>
            )}

            <div className="flex gap-3 w-full sm:w-auto xl:flex-shrink-0">
              <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline" className="h-14 rounded-2xl flex-1 sm:flex-none items-center gap-2 border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-sm px-5">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-orange-500" : ""}`} />
                <span>{refreshing ? "Refreshing" : "Refresh"}</span>
              </Button>

              <Button onClick={exportToExcel} disabled={attendanceData.length === 0} className="h-14 rounded-2xl flex-1 sm:flex-none items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 text-white transition-all px-5">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <span className="text-base font-semibold text-slate-600">{heading}</span>
          <span className="w-fit px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">Total: {attendanceData.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mr-4"></div>
          <span className="text-slate-500 font-medium">Loading attendance records...</span>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 mb-10">
          <div className="flex justify-center mb-6">
             <div className="p-4 bg-slate-50 rounded-full">
               <Users className="h-12 w-12 text-slate-300" />
             </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No attendance records found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any check-ins matching your current filters. Try adjusting the date or search term.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Member Name</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Fingerprint</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Membership</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Status</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Date</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">Check-in Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {attendanceData.map((record, index) => {
                  const isExpired = record.memberId?.status === "Expired";
                  const rowClass = isExpired
                    ? "bg-red-50/30 hover:bg-red-50 transition-colors group"
                    : "hover:bg-slate-50/80 transition-colors group";

                  const textClassPrimary = isExpired ? "text-red-700 font-extrabold" : "text-slate-900 font-bold";
                  const textClassSecondary = isExpired ? "text-red-600 font-semibold" : "text-slate-600 font-medium";

                  return (
                    <tr key={record._id} className={rowClass}>
                      <td className={`px-8 py-5 whitespace-nowrap text-sm ${textClassPrimary}`}>
                        {record.memberId?.name || "Unknown Member"}
                      </td>
                      <td className={`px-8 py-5 whitespace-nowrap text-sm ${textClassSecondary}`}>
                        {record.memberId?.fingerprintId ?? "N/A"}
                      </td>
                      <td className={`px-8 py-5 whitespace-nowrap text-sm ${textClassSecondary}`}>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${isExpired ? 'bg-red-100/50' : 'bg-slate-100'}`}>
                          {record.memberId?.membershipType || "N/A"}
                        </span>
                      </td>
                      <td className={`px-8 py-5 whitespace-nowrap text-sm ${textClassSecondary}`}>
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-2 ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                          {record.memberId?.status || "N/A"}
                        </div>
                      </td>
                      <td className={`px-8 py-5 whitespace-nowrap text-sm ${textClassSecondary}`}>
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className={`px-8 py-5 whitespace-nowrap text-sm ${textClassSecondary}`}>
                        {new Date(record.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
