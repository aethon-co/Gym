'use client'
import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, RefreshCw, Download } from 'lucide-react';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const generateMockData = () => {
    const names = [
      'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown',
      'Alice Green', 'Bob White', 'Charlie Black', 'Diana Prince', 'Evan King'
    ];

    return names.map((name, index) => ({
      _id: (index + 1).toString(),
      memberId: { _id: `m${index + 1}`, name },
      date: new Date(new Date().getTime() - Math.random() * 3600 * 1000),
    }));
  };

  const fetchAttendance = async () => {
    setLoading(true);
    setTimeout(() => {
      setAttendanceData(generateMockData());
      setLoading(false);
    }, 800);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const saveAsCSV = () => {
    if (!attendanceData.length) return;

    const headers = ['Member ID', 'Name', 'Check-in Time'];
    const rows = attendanceData.map(record => [
      record.memberId._id,
      record.memberId.name,
      new Date(record.date).toLocaleTimeString()
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Today's Attendance</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={saveAsCSV}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Download className="w-4 h-4 mr-1" />
              Save as CSV
            </button>
          </div>
        </div>

        {attendanceData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members have checked in today</h3>
            <p className="text-gray-600">Attendance data will appear here once members check in.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.memberId?.name || 'Unknown Member'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
