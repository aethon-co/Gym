"use client"

import StatusDot from '@/app/(components)/statusDot';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, CreditCard, Phone, Mail, Calendar, User, Crown, Clock, AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react';

interface StudentData {
  _id: string;
  name: string;
  age?: number;
  phone?: string;
  email?: string;
  membershipType: 'Basic' | 'Premium' | 'Student' | 'Couple';
  status: 'Active' | 'Expired' | 'Suspended';
  subscriptionEndDate: string | number;
  subscriptionStartDate?: string | number;
  paymentAmount?: number;
  daysRemaining?: number;
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
                const response = await fetch(`/api/Register/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch student data');
                }
                const data = await response.json();
                setStudent(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStudentData();
        }
    }, [id]);

    const formatDate = (date: string | number) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
            return dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    const getDaysRemaining = (endDate: string | number) => {
        try {
            const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate);
            const today = new Date();
            const diffTime = end.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch {
            return 0;
        }
    };

    const getMembershipIcon = (type: string) => {
        switch (type) {
            case 'Premium': return <Crown className="h-6 w-6 text-yellow-500" />;
            case 'Student': return <User className="h-6 w-6 text-green-500" />;
            case 'Couple': return <User className="h-6 w-6 text-pink-500" />;
            default: return <User className="h-6 w-6 text-blue-500" />;
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Active':
                return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
            case 'Expired':
                return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle };
            case 'Suspended':
                return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: AlertCircle };
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this member?')) {
            try {
                const response = await fetch(`/api/Register/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    router.push('/students');
                } else {
                    alert('Failed to delete member');
                }
            } catch (error) {
                alert('Error deleting member');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading member details...</p>
                </div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Member Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || 'The requested member could not be found.'}</p>
                        <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(student.status);
    const StatusIcon = statusConfig.icon;
    const daysRemaining = student.daysRemaining || getDaysRemaining(student.subscriptionEndDate);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="mb-6 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Members
                    </Button>
                    
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-blue-50 rounded-full border border-blue-200">
                                            <User className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
                                            {student.age && (
                                                <p className="text-gray-500 mt-1">Age: {student.age} years</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-6 text-gray-600">
                                        {student.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{student.phone}</span>
                                            </div>
                                        )}
                                        {student.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span>{student.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                                        Member ID: {student._id}
                                    </div>
                                </div>

                                <div className={`flex items-center gap-3 px-6 py-3 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}>
                                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                                    <span className={`font-semibold text-lg ${statusConfig.color}`}>{student.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <div className="flex justify-center mb-4">
                            {getMembershipIcon(student.membershipType)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Membership Type</h3>
                        <p className="text-3xl font-bold text-gray-900">{student.membershipType}</p>
                        {student.paymentAmount && (
                            <p className="text-sm text-gray-500 mt-2">₹{student.paymentAmount}</p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <Calendar className="h-6 w-6 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Date</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {student.subscriptionStartDate ? formatDate(student.subscriptionStartDate) : 'N/A'}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <Clock className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">End Date</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {formatDate(student.subscriptionEndDate)}
                        </p>
                        {daysRemaining > 0 && (
                            <div className="mt-3 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                {daysRemaining} days remaining
                            </div>
                        )}
                        {daysRemaining <= 0 && student.status === 'Active' && (
                            <div className="mt-3 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                                Expired {Math.abs(daysRemaining)} days ago
                            </div>
                        )}
                    </div>
                </div>

                {(student.status === 'Expired' || (daysRemaining <= 7 && daysRemaining > 0)) && student.status !== 'Suspended' && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-yellow-100 rounded-full">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-semibold text-yellow-800 mb-2">
                                    {student.status === 'Expired' ? 'Membership Expired' : 'Membership Expiring Soon'}
                                </h4>
                                <p className="text-yellow-700">
                                    {student.status === 'Expired' 
                                        ? 'This member\'s subscription has expired. Consider renewing their membership to restore access.'
                                        : `This member's subscription expires in ${daysRemaining} days. Consider reaching out for renewal.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <Edit className="h-5 w-5 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Member Actions</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button 
                            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 h-12"
                            onClick={() => {
                                console.log('Edit student:', student._id);
                            }}
                        >
                            <Edit className="h-4 w-4" />
                            Edit Details
                        </Button>

                        <Button 
                            className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 h-12"
                            onClick={() => {
                                console.log('Renew membership:', student._id);
                            }}
                        >
                            <CreditCard className="h-4 w-4" />
                            Renew Membership
                        </Button>

                        {student.status === 'Suspended' && (
                            <Button 
                                variant="outline"
                                className="flex items-center justify-center gap-3 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 h-12"
                                onClick={() => {
                                    console.log('Reactivate member:', student._id);
                                }}
                            >
                                <CheckCircle className="h-4 w-4" />
                                Reactivate
                            </Button>
                        )}

                        {student.status === 'Active' && (
                            <Button 
                                variant="outline"
                                className="flex items-center justify-center gap-3 border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 h-12"
                                onClick={() => {
                                    console.log('Suspend member:', student._id);
                                }}
                            >
                                <AlertCircle className="h-4 w-4" />
                                Suspend
                            </Button>
                        )}

                        <Button 
                            variant="outline"
                            className="flex items-center justify-center gap-3 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 h-12"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Member
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}