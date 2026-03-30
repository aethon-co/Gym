"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  User,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import StudentCard from "@/app/(components)/studentCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface StudentData {
  _id: string;
  name: string;
  age?: number;
  phoneNumber?: string;
  email?: string;
  fingerprintId?: number;
  membershipType: "Basic" | "Premium" | "Student" | "Couple" | "Custom";
  status: "Active" | "Expired" | "Suspended";
  subscriptionEndDate: string | number;
  subscriptionStartDate?: string | number;
  paymentAmount?: number;
  daysRemaining?: number;
}

const fetchMembers = async (): Promise<StudentData[]> => {
  const res = await fetch(`/api/members?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isFetching } = useQuery<StudentData[]>({
    queryKey: ["allstudents"],
    queryFn: fetchMembers,
    staleTime: 0,
    gcTime: 0,
  });

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/members?ts=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch members");
      const json = await res.json();
      queryClient.setQueryData(["allstudents"], json);
      await refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStudents =
    data?.filter((student: StudentData) => {
      const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.fingerprintId || "").includes(searchTerm);
      const matchesStatus = statusFilter === "All" || student.status === statusFilter;
      const matchesMembership =
        membershipFilter === "All" || student.membershipType === membershipFilter;
      return matchesSearch && matchesStatus && matchesMembership;
    }) || [];

  if (isLoading) {
    return (
      <div className="h-screen overflow-y-auto bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen overflow-y-auto bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Members Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : "The requested member could not be found."}
            </p>
            <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto bg-slate-50">
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-500 rounded-3xl shadow-lg shadow-orange-500/30 mb-5">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center">Members Management</h1>
        <p className="text-slate-500 font-medium mt-2">Track profiles, subscriptions, and member status in one place.</p>
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-slate-200/70 p-6 sm:p-7 mb-8">
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
          <div className="relative w-full xl:flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <Input
              className="h-14 w-full rounded-2xl border-slate-200 bg-slate-50/60 pl-12 pr-4 text-base shadow-sm transition-all focus:border-orange-500 focus:ring-orange-500/20"
              type="text"
              value={searchTerm}
              placeholder="Search by name, ID, or email..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap xl:flex-nowrap gap-3 xl:w-auto">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 pl-4 pr-3 py-3 border-r border-slate-200/60">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Filters</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-transparent text-sm font-semibold text-slate-700 outline-none focus:ring-0 border-none cursor-pointer min-w-[128px]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </select>

              <div className="w-px h-6 bg-slate-200/60 mx-1"></div>

              <select
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
                className="px-4 py-3 bg-transparent text-sm font-semibold text-slate-700 outline-none focus:ring-0 border-none cursor-pointer min-w-[120px]"
              >
                <option value="All">All Types</option>
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Student">Student</option>
                <option value="Couple">Couple</option>
              </select>
            </div>

            <Button
              onClick={handleRefresh}
              disabled={isFetching || refreshing}
              variant="outline"
              className="h-14 rounded-2xl flex items-center gap-2 border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-sm px-5 ml-auto xl:ml-0"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching || refreshing ? "animate-spin text-orange-500" : ""}`} />
              <span>{isFetching || refreshing ? "Refreshing" : "Refresh"}</span>
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <span className="text-base font-semibold text-slate-600">Filtered Members</span>
          <span className="w-fit px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">Showing {filteredStudents.length} of {data?.length || 0}</span>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 mb-10">
          <div className="flex justify-center mb-6">
             <div className="p-4 bg-slate-50 rounded-full">
               <User className="h-12 w-12 text-slate-300" />
             </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {data && data.length === 0 ? "No members found" : "No members match your criteria"}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {data && data.length === 0
              ? "Start by adding new members to your gym"
              : "Try adjusting your search or filter criteria"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredStudents.map((student: StudentData) => (
            <StudentCard
              key={student._id}
              id={student._id}
              name={student.name}
              membershipType={student.membershipType}
              status={student.status}
              subscriptionEndDate={String(student.subscriptionEndDate)}
              phoneNumber={student.phoneNumber}
              email={student.email}
              fingerprintId={student.fingerprintId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;
