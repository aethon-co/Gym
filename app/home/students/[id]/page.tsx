"use client";

import StatusDot from '@/app/(components)/statusDot';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  MapPin
} from 'lucide-react';
import EditModal from '@/app/(components)/editModal';
import RenewalModal from '@/app/(components)/renewalModal';

interface StudentData {
  _id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  membershipType: 'Basic' | 'Premium' | 'Couple' | 'Student';
  status: 'Active' | 'Expired' | 'Suspended';
  subscriptionEndDate: string | number;
  subscriptionStartDate?: string | number;
}

export default function StudentIdPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/members/${id}/delete`);
        if (!response.ok) throw new Error('Failed to fetch student data');
        const data = await response.json();
        setStudent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudentData();
  }, [id]);

  const formatDate = (date: string | number) => {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const reactivateMember = async (memberId: string) => {
    try {
      const response = await fetch('/api/members/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });
      if (!response.ok) throw new Error('Failed to reactivate member');
      setStudent(prev => prev ? { ...prev, status: 'Active' } : prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error reactivating member');
    }
  };

  const suspendMember = async (memberId: string) => {
    try {
      const response = await fetch('/api/members/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });
      if (!response.ok) throw new Error('Failed to suspend member');
      setStudent(prev => prev ? { ...prev, status: 'Suspended' } : prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error suspending member');
    }
  };

  const getDaysRemaining = (endDate: string | number) => {
    try {
      const end = new Date(endDate);
      const diffTime = end.getTime() - new Date().getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case 'Premium': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'Student': return <User className="h-5 w-5 text-green-500" />;
      default: return <User className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Active': return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
      case 'Expired': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle };
      case 'Suspended': return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle };
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: AlertCircle };
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading student details...</p>
      </div>
    </div>
  );

  if (error || !student) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Student</h2>
        <p className="text-gray-600 mb-4">{error || 'Student not found'}</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    </div>
  );

  const statusConfig = getStatusConfig(student.status);
  const StatusIcon = statusConfig.icon;
  const daysRemaining = getDaysRemaining(student.subscriptionEndDate);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </Button>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-10 w-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            </div>

            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
              {student.phoneNumber && <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{student.phoneNumber}</div>}
              {student.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{student.email}</div>}
            </div>

            {student.address && <div className="flex items-center gap-2 text-gray-600 mb-4"><MapPin className="h-4 w-4" />{student.address}</div>}

            <div className="text-sm text-gray-500">Member ID: {student._id}</div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
            <span className={`font-medium ${statusConfig.color}`}>{student.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-3">{getMembershipIcon(student.membershipType)}<h3 className="text-lg font-semibold text-gray-800">Membership Type</h3></div>
            <p className="text-2xl font-bold text-gray-900">{student.membershipType}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-3"><Calendar className="h-5 w-5 text-green-500" /><h3 className="text-lg font-semibold text-gray-800">Start Date</h3></div>
            <p className="text-2xl font-bold text-gray-900">{student.subscriptionStartDate ? formatDate(student.subscriptionStartDate) : 'N/A'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-3"><Clock className="h-5 w-5 text-red-500" /><h3 className="text-lg font-semibold text-gray-800">End Date</h3></div>
            <p className="text-2xl font-bold text-gray-900">{formatDate(student.subscriptionEndDate)}</p>
            {daysRemaining > 0 && <p className="text-sm text-gray-500 mt-1">{daysRemaining} days remaining</p>}
            {daysRemaining <= 0 && student.status === 'Active' && <p className="text-sm text-red-500 mt-1">Expired {Math.abs(daysRemaining)} days ago</p>}
          </div>
        </div>

        {(student.status === 'Expired' || daysRemaining <= 7) && student.status !== 'Suspended' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">{student.status === 'Expired' ? 'Membership Expired' : 'Membership Expiring Soon'}</h4>
              <p className="text-yellow-700 text-sm">{student.status === 'Expired' ? 'This member\'s subscription has expired. Consider renewing.' : `Expires in ${daysRemaining} days.`}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-4">
            <EditModal student={student} />
            <RenewalModal student={student} onRenewalSuccess={(updatedStudent) => setStudent(updatedStudent)} />
            {student.status === 'Suspended' && (
              <Button variant="outline" className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50 transition" onClick={() => reactivateMember(student._id)}>
                <CheckCircle className="h-4 w-4" /> Reactivate
              </Button>
            )}
            {student.status === 'Active' && (
              <Button variant="outline" className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 transition" onClick={() => suspendMember(student._id)}>
                <AlertCircle className="h-4 w-4" /> Suspend
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
