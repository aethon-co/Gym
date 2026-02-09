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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 py-10 px-6 sm:px-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button onClick={() => router.push("/home/students")} variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <EditModal student={student} onSave={setStudent} />
            <RenewalModal student={student} onRenewalSuccess={() => fetchStudentData()} />
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2">
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

        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {getMembershipIcon(student.membershipType)}
              {student.name}
            </h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.border} ${statusConfig.bg}`}>
              <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
              <span className={`font-medium ${statusConfig.color}`}>{student.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" />{student.phoneNumber || "N/A"}</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" />{student.email || "N/A"}</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-500" />{student.address || "N/A"}</div>
            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-slate-500" />₹{student.paymentAmount || "0"}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-500" />Start: {formatDate(student.subscriptionStartDate || "")}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-500" />End: {formatDate(student.subscriptionEndDate)}</div>
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-500" />Days Remaining: {daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}</div>
            <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-slate-500" />Membership: {student.membershipType}</div>
            <div className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-slate-500" />Fingerprint ID: {student.fingerprintId ?? "Not assigned"}</div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-500" />
            Payment History
          </h2>
          {payments.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="p-3 text-left">Date & Time</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Duration</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-t hover:bg-slate-50">
                      <td className="p-3">{formatDateTime(payment.createdAt)}</td>
                      <td className="p-3">₹{payment.amount}</td>
                      <td className="p-3">{payment.duration || 1} month(s)</td>
                      <td className="p-3">{payment.paymentMethod}</td>
                      <td className="p-3">{payment.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-slate-500 text-center py-4">No payment history found</div>
          )}
        </div>
      </div>
    </div>
  );
}
