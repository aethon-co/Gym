'use client'
import React, { useState, useEffect } from 'react'
import { Users, CheckCircle, RefreshCw, Download, Calendar, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Type definitions
interface Member {
  _id: string
  name: string
}

interface AttendanceRecord {
  _id: string
  memberId: Member
  date: Date
}

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [searchTerm, setSearchTerm] = useState('')

  const generateMockData = (date: string): AttendanceRecord[] => {
    const names = [
      'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown',
      'Alice Green', 'Bob White', 'Charlie Black', 'Diana Prince', 'Evan King',
      'Lisa Wang', 'David Miller', 'Emma Davis', 'Ryan Clark', 'Olivia Taylor'
    ]

    const selectedDateTime = new Date(date)
    const isToday = date === new Date().toISOString().slice(0, 10)
    const attendanceCount = isToday ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 12) + 3

    return names.slice(0, attendanceCount).map((name, index) => {
      const randomHour = Math.floor(Math.random() * 12) + 6
      const randomMinute = Math.floor(Math.random() * 60)
      const checkInTime = new Date(selectedDateTime)
      checkInTime.setHours(randomHour, randomMinute, 0, 0)

      return {
        _id: (index + 1).toString(),
        memberId: { _id: `m${index + 1}`, name },
        date: checkInTime,
      }
    })
  }

  const fetchAttendance = async (date: string = selectedDate) => {
    setLoading(true)
    setTimeout(() => {
      setAttendanceData(generateMockData(date))
      setLoading(false)
    }, 800)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAttendance(selectedDate)
    setRefreshing(false)
  }

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    fetchAttendance(newDate)
  }

  const filteredAttendance = attendanceData.filter(record =>
    record.memberId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const saveAsCSV = () => {
    if (!filteredAttendance.length) return

    const headers = ['Member ID', 'Name', 'Check-in Time', 'Date']
    const rows = filteredAttendance.map(record => [
      record.memberId._id,
      record.memberId.name,
      new Date(record.date).toLocaleTimeString(),
      new Date(record.date).toLocaleDateString()
    ])

    let csvContent = "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `attendance_${selectedDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors w-full"
              type="text"
              value={searchTerm}
              placeholder="Search by member name..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Date:</span>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>

            <Button
              onClick={saveAsCSV}
              disabled={filteredAttendance.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredAttendance.length} of {attendanceData.length} members</span>
          <span className="font-medium">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading attendance...</span>
        </div>
      ) : (
        <>
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {attendanceData.length === 0 ? 'No attendance records' : 'No members found'}
              </h3>
              <p className="text-gray-500">
                {attendanceData.length === 0
                  ? `No members checked in on ${new Date(selectedDate).toLocaleDateString()}`
                  : 'Try adjusting your search criteria'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendance.map((record, index) => (
                      <tr key={record._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {record.memberId?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {record.memberId?.name || 'Unknown Member'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.memberId?._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Present
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Attendance