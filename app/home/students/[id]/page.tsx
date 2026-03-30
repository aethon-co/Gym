"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  User,
  Crown,
  Clock,
  AlertCircle,
  CheckCircle,
  MapPin,
  DollarSign,
  Receipt,
  CalendarDays,
  Trash2,
  Fingerprint,
  Link2,
  Unlink2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EditModal from "@/app/(components)/editModal";
import RenewalModal from "@/app/(components)/renewalModal";
import { StudentData } from "@/lib/types";

interface Payment {
  _id: string;
  amount: number;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  memberId: string;
  duration?: number;
}

interface ApiResponse {
  success: boolean;
  data?: {
    member: StudentData;
    payments: Payment[];
  };
  error?: string;
}

interface PartnerCandidate {
  _id: string;
  name: string;
  phoneNumber?: string;
  membershipType: string;
  status?: string;
}

export default function StudentIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [coupleLoading, setCoupleLoading] = useState(false);
  const [partnerQuery, setPartnerQuery] = useState("");
  const [partnerMemberId, setPartnerMemberId] = useState("");
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [partnerCandidates, setPartnerCandidates] = useState<PartnerCandidate[]>([]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/members/${id}`);
      const data: ApiResponse = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to fetch member data");
      if (data.data) {
        setStudent(data.data.member);
        setPayments(data.data.payments || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerCandidates = async (search = "") => {
    try {
      const params = new URLSearchParams({ memberId: id || "", mode: "candidates" });
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/members/couple?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const candidates = Array.isArray(data.candidates) ? data.candidates : [];
      setPartnerCandidates(candidates);
    } catch (err) {
      console.error("Failed to fetch couple candidates", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchStudentData();
  }, [id]);

  useEffect(() => {
    if (!student || student.membershipType !== "Couple" || student.coupleGroupId) return;
    const timer = setTimeout(() => {
      fetchPartnerCandidates(partnerQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [partnerQuery, student?.membershipType, student?.coupleGroupId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/members/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to delete member");
      router.push("/home/students");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete member");
    } finally {
      setIsDeleting(false);
    }
  };

  const linkAsCouple = async () => {
    if (!partnerMemberId) {
      alert("Select a partner member first");
      return;
    }
    try {
      setCoupleLoading(true);
      const response = await fetch("/api/members/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link",
          memberId: id,
          partnerMemberId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to link couple membership");
      setPartnerMemberId("");
      setPartnerQuery("");
      setShowCandidateDropdown(false);
      await fetchStudentData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to link couple membership");
    } finally {
      setCoupleLoading(false);
    }
  };

  const convertToIndividual = async () => {
    try {
      setCoupleLoading(true);
      const response = await fetch("/api/members/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unlink",
          memberId: id,
          individualType: "Basic",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to convert to individual");
      await fetchStudentData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to convert to individual");
    } finally {
      setCoupleLoading(false);
    }
  };

  const formatDate = (date: string | number) => {
    const d = new Date(date);
    return Number.isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return Number.isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const daysRemaining = useMemo(() => {
    if (!student) return 0;
    const end = new Date(student.subscriptionEndDate).getTime();
    return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
  }, [student]);

  const getMembershipIcon = (type: string) => {
    if (type === "Premium") return <Crown className="h-5 w-5 text-amber-500" />;
    if (type === "Student") return <User className="h-5 w-5 text-emerald-500" />;
    return <User className="h-5 w-5 text-blue-500" />;
  };

  const getStatusConfig = (status: string) => {
    if (status === "Active") return { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle };
    if (status === "Expired") return { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: AlertCircle };
    return { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertCircle };
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error || !student) return <div className="text-center text-red-500">Error: {error || "Member not found"}</div>;

  const statusConfig = getStatusConfig(student.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 sm:px-10 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-8 flex-1 flex flex-col">
        <div className="flex justify-between items-center bg-white shadow-sm border border-slate-200/60 p-4 px-6 rounded-2xl">
          <Button onClick={() => router.push("/home/students")} variant="ghost" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" /> Back
          </Button>
          <div className="flex gap-3">
            <EditModal student={student} onSave={setStudent} />
            <RenewalModal student={student} onRenewalSuccess={() => fetchStudentData()} />
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 shadow-sm">
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {student.membershipType === "Couple" && (
          <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Couple Membership</h2>
            {student.coupleGroupId ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Linked Group: <span className="font-medium">{student.coupleGroupId}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Partner: <span className="font-medium">{student.couplePartner?.name || "Linked"}</span>
                </p>
                <Button onClick={convertToIndividual} variant="outline" disabled={coupleLoading} className="flex items-center gap-2">
                  <Unlink2 className="h-4 w-4" />
                  {coupleLoading ? "Converting..." : "Convert to Individual"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Search and select an unlinked Couple member.</p>
                <div className="relative max-w-md">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    value={partnerQuery}
                    onFocus={() => setShowCandidateDropdown(true)}
                    onChange={(e) => {
                      setPartnerQuery(e.target.value);
                      setPartnerMemberId("");
                      setShowCandidateDropdown(true);
                    }}
                    placeholder="Search partner by name"
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm bg-white"
                  />
                  {showCandidateDropdown && partnerCandidates.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 rounded-lg border bg-white shadow-lg max-h-56 overflow-auto">
                      {partnerCandidates.map((candidate) => (
                        <button
                          key={candidate._id}
                          type="button"
                          onClick={() => {
                            setPartnerMemberId(candidate._id);
                            setPartnerQuery(`${candidate.name} (${candidate.phoneNumber || "No phone"})`);
                            setShowCandidateDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-slate-50"
                        >
                          <p className="text-sm font-medium text-slate-900">{candidate.name}</p>
                          <p className="text-xs text-slate-500">{candidate.phoneNumber || "No phone"} | {candidate.status || "Unknown"}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={linkAsCouple} disabled={coupleLoading || !partnerMemberId} className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  {coupleLoading ? "Linking..." : "Link as Couple"}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="bg-white shadow-sm shadow-slate-200/50 rounded-3xl border border-slate-200/60 overflow-hidden shrink-0">
          <div className="h-32 bg-gradient-to-r from-orange-500 to-red-600 relative">
            <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold shadow-sm">
              <StatusIcon className="h-4 w-4" />
              {student.status}
            </div>
          </div>
          
          <div className="px-8 sm:px-10 pb-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 -mt-12 relative z-10 gap-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end text-center sm:text-left">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-lg p-2 ring-1 ring-slate-100 flex-shrink-0">
                  <div className="w-full h-full bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center pointer-events-none">
                    {getMembershipIcon(student.membershipType)}
                  </div>
                </div>
                <div className="pb-1">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{student.name}</h1>
                  <p className="text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-sm">
                    <Crown className="w-4 h-4 text-emerald-500" />
                    {student.membershipType} Member
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <div className="px-5 py-3 rounded-xl border bg-slate-50 border-slate-200 w-full flex justify-between sm:justify-center items-center gap-4">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fingerprint ID</span>
                  <span className="text-lg font-black text-slate-800 bg-white px-3 py-1 rounded shadow-sm border border-slate-200 text-center min-w-[40px]">{student.fingerprintId ?? "None"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:bg-slate-50 transition-colors">
                 <div className="p-3 bg-white shadow-sm rounded-xl text-blue-500 shrink-0"><Phone className="w-5 h-5"/></div>
                 <div className="min-w-0 flex-1">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                   <p className="text-base font-semibold text-slate-700 truncate">{student.phoneNumber || "N/A"}</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:bg-slate-50 transition-colors">
                 <div className="p-3 bg-white shadow-sm rounded-xl text-indigo-500 shrink-0"><Mail className="w-5 h-5"/></div>
                 <div className="min-w-0 flex-1">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
                   <p className="text-base font-semibold text-slate-700 truncate">{student.email || "N/A"}</p>
                 </div>
               </div>

               <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:bg-slate-50 transition-colors">
                 <div className="p-3 bg-white shadow-sm rounded-xl text-rose-500 shrink-0"><MapPin className="w-5 h-5"/></div>
                 <div className="min-w-0 flex-1">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Address</p>
                   <p className="text-base font-semibold text-slate-700">{student.address || "N/A"}</p>
                 </div>
               </div>

               <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:bg-slate-50 transition-colors">
                 <div className="p-3 bg-white shadow-sm rounded-xl text-emerald-500 shrink-0"><DollarSign className="w-5 h-5"/></div>
                 <div className="min-w-0 flex-1">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Payment</p>
                   <p className="text-base font-semibold text-slate-700">₹{student.paymentAmount || "0"}</p>
                 </div>
               </div>

               <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:bg-slate-50 transition-colors">
                 <div className="p-3 bg-white shadow-sm rounded-xl text-amber-500 shrink-0"><Calendar className="w-5 h-5"/></div>
                 <div className="min-w-0 flex-1">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Timeline</p>
                   <p className="text-base font-semibold text-slate-700 truncate">{formatDate(student.subscriptionStartDate || "")} - {formatDate(student.subscriptionEndDate)}</p>
                 </div>
               </div>

               <div className={`flex items-start gap-4 p-5 rounded-2xl border transition-colors ${daysRemaining > 0 ? "bg-slate-50/50 border-slate-200/60" : "bg-red-50/70 border-red-200"}`}>
                 <div className={`p-3 shadow-sm rounded-xl shrink-0 ${daysRemaining > 0 ? "bg-white text-teal-500" : "bg-red-100 text-red-600"}`}>
                   <CalendarDays className="w-5 h-5"/>
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${daysRemaining > 0 ? "text-slate-400" : "text-red-400"}`}>Time Remaining</p>
                   <p className={`text-base font-bold ${daysRemaining > 0 ? "text-slate-800" : "text-red-700"}`}>{daysRemaining > 0 ? `${daysRemaining} days left` : "Expired"}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm shadow-slate-200/50 rounded-3xl border border-slate-200/60 p-6 sm:p-10 flex-1 flex flex-col mb-10 overflow-hidden">
          <div className="flex items-center gap-4 mb-6 shrink-0">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Receipt className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Payment History</h2>
          </div>
          {payments.length > 0 ? (
            <div className="overflow-x-auto w-full min-h-0 relative rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider text-xs sticky top-0 z-20 backdrop-blur-md shadow-sm">
                  <tr>
                     <th className="px-6 py-4">Date & Time</th>
                     <th className="px-6 py-4">Amount</th>
                     <th className="px-6 py-4">Duration</th>
                     <th className="px-6 py-4">Method</th>
                     <th className="px-6 py-4 w-full">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">{formatDateTime(payment.createdAt)}</td>
                      <td className="px-6 py-4 text-slate-900 font-bold whitespace-nowrap">₹{payment.amount}</td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{payment.duration || 1} month(s)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-sm truncate" title={payment.notes || "—"}>
                        {payment.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex-1">
               <Receipt className="h-12 w-12 text-slate-300 mb-4" />
               <p className="text-slate-600 font-bold text-lg">No payments yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
