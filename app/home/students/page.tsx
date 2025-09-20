"use client"

import StatusDot from '@/app/(components)/statusDot';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, CreditCard, Phone, Mail, Calendar, User, Crown, Clock, AlertCircle, CheckCircle, Loader2, Trash2, Search, RefreshCw, Download, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StudentCard from '@/app/(components)/studentCard';
import { useQuery } from '@tanstack/react-query';
import router from 'next/router';

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

const Students = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState('All')
    const [membershipFilter, setMembershipFilter] = useState('All')
    const [refreshing, setRefreshing] = useState(false)

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['allstudents'],
        queryFn: async () => {
            const res = await fetch('/api/members');
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        }
    })

    const handleRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }

    const filteredStudents = data?.filter((student: StudentData) => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'All' || student.status === statusFilter
        const matchesMembership = membershipFilter === 'All' || student.membershipType === membershipFilter

        return matchesSearch && matchesStatus && matchesMembership
    }) || []



    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading Members...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Members Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            {error instanceof Error
                                ? error.message
                                : 'The requested member could not be found.'}
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
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <User className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Members Management</h1>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors w-full"
                            type="text"
                            value={searchTerm}
                            placeholder="Search by name, ID, or email..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 items-center flex-wrap">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filters:</span>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Suspended">Suspended</option>
                        </select>

                        <select
                            value={membershipFilter}
                            onChange={(e) => setMembershipFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Types</option>
                            <option value="Basic">Basic</option>
                            <option value="Premium">Premium</option>
                            <option value="Student">Student</option>
                            <option value="Couple">Couple</option>
                        </select>

                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing || isLoading}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>


                    </div>
                </div>

                <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                    <span>Showing {filteredStudents.length} of {data?.length || 0} members</span>
                    <div className="flex items-center gap-4">
                        {statusFilter !== 'All' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                Status: {statusFilter}
                            </span>
                        )}
                        {membershipFilter !== 'All' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                Type: {membershipFilter}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                    <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {data?.length === 0 ? 'No members found' : 'No members match your criteria'}
                    </h3>
                    <p className="text-gray-500">
                        {data?.length === 0
                            ? 'Start by adding new members to your gym'
                            : 'Try adjusting your search or filter criteria'
                        }
                    </p>
                </div>
            ) : (
                <div className='flex max-w-[85vw] flex-wrap gap-6'>
                    {filteredStudents.map(({ _id, name, membershipType, status, subscriptionEndDate }: StudentData) =>
                        <StudentCard
                            key={_id}
                            id={_id}
                            name={name}
                            membershipType={membershipType}
                            status={status}
                            subscriptionEndDate={String(subscriptionEndDate)}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default Students