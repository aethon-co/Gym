"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Activity
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const monthlyRevenueData = [
  { month: 'Jan', revenue: 12500, members: 45 },
  { month: 'Feb', revenue: 15200, members: 52 },
  { month: 'Mar', revenue: 18700, members: 63 },
  { month: 'Apr', revenue: 16800, members: 58 },
  { month: 'May', revenue: 22400, members: 71 },
  { month: 'Jun', revenue: 25600, members: 78 },
  { month: 'Jul', revenue: 28900, members: 84 },
  { month: 'Aug', revenue: 31200, members: 89 },
  { month: 'Sep', revenue: 29800, members: 86 },
  { month: 'Oct', revenue: 33400, members: 95 },
  { month: 'Nov', revenue: 36700, members: 102 },
  { month: 'Dec', revenue: 42300, members: 118 }
]

const yearlyData = [
  { year: '2021', revenue: 185000, members: 420 },
  { year: '2022', revenue: 234000, members: 580 },
  { year: '2023', revenue: 289000, members: 720 },
  { year: '2024', revenue: 341000, members: 890 }
]

const planDistribution = [
  { name: 'Basic', value: 35, color: '#374151' },
  { name: 'Premium', value: 28, color: '#6B7280' },
  { name: 'Couple', value: 22, color: '#9CA3AF' },
  { name: 'Student', value: 15, color: '#D1D5DB' }
]

const Analytics = () => {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [isExporting, setIsExporting] = useState(false)

  const currentData = viewMode === 'monthly' ? monthlyRevenueData : yearlyData
  const totalRevenue = currentData.reduce((sum, item) => sum + item.revenue, 0)
  const totalMembers = currentData.reduce((sum, item) => sum + item.members, 0)
  const avgRevenue = Math.round(totalRevenue / currentData.length)

  const handleExportCSV = async () => {
    setIsExporting(true)
    
    const loadingToastId = toast.loading('Preparing CSV export...', {
      style: { border: '2px solid #000', padding: '16px', color: '#000', backgroundColor: '#fff', fontWeight: '600' }
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const csvData = currentData.map(item => ({
        Period: viewMode === 'monthly' ? item.month : item.year,
        Revenue: `₹${item.revenue.toLocaleString()}`,
        Members: item.members,
        'Avg Revenue per Member': `₹${Math.round(item.revenue / item.members)}`
      }))

      const headers = Object.keys(csvData[0])
      const csvContent = [ headers.join(','), ...csvData.map(row => headers.map(header => row[header]).join(',')) ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${viewMode}-${selectedYear}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('CSV exported successfully!', {
        id: loadingToastId,
        style: { border: '2px solid #000', padding: '16px', color: '#fff', backgroundColor: '#000', fontWeight: '600' },
        iconTheme: { primary: '#fff', secondary: '#000' },
        duration: 3000
      })
    } catch (error) {
      toast.error('Export failed. Please try again.', {
        id: loadingToastId,
        style: { border: '2px solid #dc2626', padding: '16px', color: '#dc2626', backgroundColor: '#fff', fontWeight: '600' }
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="text-black p-6 pt-0">
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-6">

        <Card className="bg-white border-2 border-gray-200 shadow-2xl">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3 text-black">
                  <BarChart3 className="w-8 h-8" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-gray-600 text-base mt-2">
                  Comprehensive insights into revenue, membership trends, and business performance
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={viewMode} onValueChange={(value: 'monthly' | 'yearly') => setViewMode(value)}>
                  <SelectTrigger className="w-40 h-12 border-2 border-gray-300 focus:border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200">
                    <SelectItem value="monthly">Monthly View</SelectItem>
                    <SelectItem value="yearly">Yearly View</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="h-12 px-6 bg-black text-white hover:bg-gray-800 border-2 border-black font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-black">₹{totalRevenue.toLocaleString()}</p>
                  <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <DollarSign className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Total Members</p>
                  <p className="text-3xl font-bold text-black">{totalMembers.toLocaleString()}</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                    <Users className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <Users className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Avg Revenue</p>
                  <p className="text-3xl font-bold text-black">₹{avgRevenue.toLocaleString()}</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">
                    <Target className="w-3 h-3 mr-1" />
                    Per Period
                  </Badge>
                </div>
                <Activity className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Growth Rate</p>
                  <p className="text-3xl font-bold text-black">18.7%</p>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    YoY Growth
                  </Badge>
                </div>
                <BarChart3 className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-black">
                <BarChart3 className="w-5 h-5" />
                {viewMode === 'monthly' ? 'Monthly' : 'Yearly'} Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={viewMode === 'monthly' ? 'month' : 'year'} tick={{ fill: '#374151', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#374151', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} contentStyle={{ backgroundColor: 'white', border: '2px solid #000', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-black">
                <Users className="w-5 h-5" />
                Member Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={viewMode === 'monthly' ? 'month' : 'year'} tick={{ fill: '#374151', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
                  <Tooltip formatter={(value) => [value, 'Members']} contentStyle={{ backgroundColor: 'white', border: '2px solid #000', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="members" stroke="#000000" strokeWidth={3} dot={{ fill: '#000000', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#000000', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-black">
                <PieChartIcon className="w-5 h-5" />
                Membership Plan Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                    {planDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} contentStyle={{ backgroundColor: 'white', border: '2px solid #000', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {planDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-medium text-black">{entry.name}</span>
                    <span className="text-sm text-gray-600">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-black">
                <Calendar className="w-5 h-5" />
                {viewMode === 'monthly' ? 'Monthly' : 'Yearly'} Performance Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-y-auto max-h-80">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-2 font-semibold text-black">Period</th>
                      <th className="text-left py-3 px-2 font-semibold text-black">Revenue</th>
                      <th className="text-left py-3 px-2 font-semibold text-black">Members</th>
                      <th className="text-left py-3 px-2 font-semibold text-black">Avg/Member</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium text-black">{viewMode === 'monthly' ? item.month : item.year}</td>
                        <td className="py-3 px-2 text-black">₹{item.revenue.toLocaleString()}</td>
                        <td className="py-3 px-2 text-black">{item.members}</td>
                        <td className="py-3 px-2 text-black">₹{Math.round(item.revenue / item.members).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}

export default Analytics
