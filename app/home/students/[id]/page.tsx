"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EditModal from "@/app/(components)/editModal";
import RenewalModal from "@/app/(components)/renewalModal";
import StatusDot from "@/app/(components)/statusDot";
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
  details?: string[];
}

export default function StudentIdPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/members/${id}`);
      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch student data");
      }

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

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this member? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete member");
      }

      router.push("/home/students");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete member");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string | number) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatDateTime = (date: string) => {
    try {
      const d = new Date(date);
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getDaysRemaining = (endDate: string | number) => {
    const end = new Date(endDate);
    const diff = end.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case "Premium":
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case "Student":
        return <User className="h-5 w-5 text-green-500" />;
      default:
        return <User className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Active":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          icon: CheckCircle,
        };
      case "Expired":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: AlertCircle,
        };
      case "Suspended":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: AlertCircle,
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: AlertCircle,
        };
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error || !student)
    return (
      <div className="text-center text-red-500">
        Error: {error || "Student not found"}
      </div>
    );

  const daysRemaining = getDaysRemaining(student.subscriptionEndDate);
  const statusConfig = getStatusConfig(student.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 sm:px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => router.push("/home/students")}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <EditModal student={student} onSave={setStudent} />
            <RenewalModal
              student={student}
              onRenewalSuccess={(updatedStudent: any) => {
                setStudent(updatedStudent);
                fetchStudentData();
              }}
            />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {getMembershipIcon(student.membershipType)}
              {student.name}
            </h1>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.border} ${statusConfig.bg}`}
            >
              <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
              <span className={`font-medium ${statusConfig.color}`}>
                {student.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              {student.phoneNumber || "N/A"}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              {student.email || "N/A"}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              {student.address || "N/A"}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />₹
              {student.paymentAmount || "0"}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              Start: {formatDate(student.subscriptionStartDate || "")}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              End: {formatDate(student.subscriptionEndDate)}
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              Days Remaining:{" "}
              {daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              Membership: {student.membershipType}
            </div>
            {student.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Duration: {student.duration} month(s)
              </div>
            )}
            {student.customAmount && student.membershipType === "Custom" && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Custom Amount: ₹{student.customAmount}
              </div>
            )}
            {student.age && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Age: {student.age}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-500" />
            Payment History
          </h2>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 text-left">Date & Time</th>
                    <th className="p-2 text-left">Amount</th>
                    <th className="p-2 text-left">Duration</th>
                    <th className="p-2 text-left">Method</th>
                    <th className="p-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-t hover:bg-gray-50">
                      <td className="p-2">
                        {formatDateTime(payment.createdAt)}
                      </td>
                      <td className="p-2">₹{payment.amount}</td>
                      <td className="p-2">{payment.duration || 1} month(s)</td>
                      <td className="p-2">{payment.paymentMethod}</td>
                      <td className="p-2">{payment.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              No payment history found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
