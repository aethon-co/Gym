"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Phone, CalendarDays, Package, MapPin, User, Hash } from "lucide-react"
import { useState } from "react"
import toast, { Toaster } from 'react-hot-toast'

interface FormData {
  name: string
  age: string
  phone: string
  address: string
  plan: string
}

const RegisterMember = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    phone: '',
    address: '',
    plan: ''
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields', {
        style: {
          border: '1px solid #ef4444',
          padding: '12px 16px',
          color: '#ef4444',
          backgroundColor: '#fef2f2',
          fontWeight: '500',
          borderRadius: '8px'
        }
      })
      return
    }

    setIsLoading(true)

    const loadingToastId = toast.loading('Registering Member...', {
      style: {
        border: '1px solid #6b7280',
        padding: '12px 16px',
        color: '#374151',
        backgroundColor: '#f9fafb',
        fontWeight: '500',
        borderRadius: '8px'
      }
    })

    try {
      const registrationData = {
        name: formData.name,
        age: parseInt(formData.age),
        phoneNumber: formData.phone,
        address: formData.address,
        membershipType: formData.plan,
        subscriptionStartDate: selectedDate?.toISOString()
      }

      const response = await fetch('/api/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Member registered successfully!', {
          id: loadingToastId,
          style: {
            border: '1px solid #10b981',
            padding: '12px 16px',
            color: '#059669',
            backgroundColor: '#ecfdf5',
            fontWeight: '500',
            borderRadius: '8px'
          },
          duration: 4000
        })

        setFormData({ name: '', age: '', phone: '', address: '', plan: '' })
        setSelectedDate(undefined)
      } else {
        throw new Error(result.error || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register Member. Please try again.'
      toast.error(errorMessage, {
        id: loadingToastId,
        style: {
          border: '1px solid #ef4444',
          padding: '12px 16px',
          color: '#ef4444',
          backgroundColor: '#fef2f2',
          fontWeight: '500',
          borderRadius: '8px'
        },
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', age: '', phone: '', address: '', plan: '' })
    setSelectedDate(undefined)
  }

  const isFormValid = formData.name && formData.age && formData.phone && formData.address && formData.plan && selectedDate

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <Toaster position="top-right" />
      
      <div className="flex-shrink-0 text-center pt-4 pb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-2xl mb-2 shadow-lg">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Member Registration</h1>
        <p className="text-slate-600 text-sm">Complete the form below to register a new member</p>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
              
              <div className="p-4 lg:p-6 bg-white/50 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter member's full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="h-10 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400 text-slate-900 placeholder:text-slate-400 bg-white rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="age" className="text-sm font-semibold text-slate-700 mb-2 block">
                        <Hash className="w-3 h-3 inline mr-1" />
                        Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Age"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className="h-10 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400 text-slate-900 placeholder:text-slate-400 bg-white rounded-lg"
                        min="1"
                        max="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 mb-2 block">
                        <Phone className="w-3 h-3 inline mr-1" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="h-10 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400 text-slate-900 placeholder:text-slate-400 bg-white rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-semibold text-slate-700 mb-2 block">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="min-h-[80px] border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400 text-slate-900 placeholder:text-slate-400 resize-none bg-white rounded-lg"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Package className="w-3 h-3" />
                      Subscription Plan
                    </Label>
                    <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                      <SelectTrigger className="h-10 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400 text-slate-900 bg-white rounded-lg">
                        <SelectValue placeholder="Select a subscription plan" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 rounded-xl">
                        <SelectItem value="Basic" className="cursor-pointer hover:bg-slate-50 rounded-lg my-1">
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-slate-900">Basic Plan</span>
                            <span className="text-xs text-slate-500">Essential features</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Premium" className="cursor-pointer hover:bg-slate-50 rounded-lg my-1">
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-slate-900">Premium Plan</span>
                            <span className="text-xs text-slate-500">All features included</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Couple" className="cursor-pointer hover:bg-slate-50 rounded-lg my-1">
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-slate-900">Couple Plan</span>
                            <span className="text-xs text-slate-500">For two members</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Student" className="cursor-pointer hover:bg-slate-50 rounded-lg my-1">
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-slate-900">Student Plan</span>
                            <span className="text-xs text-slate-500">Discounted rate</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

               <div className="p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Enrollment Date</h2>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                  <div className="mb-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => setSelectedDate(date)}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); 
                        const d = new Date(date);
                        d.setHours(0, 0, 0, 0);
                        return d < today;
                      }}
                      className="rounded-xl border-2 border-slate-200 bg-white shadow-lg scale-110 transform"
                      classNames={{
                        day_selected: "bg-slate-900 text-white hover:bg-slate-800 rounded-lg",
                        day_today: "bg-slate-100 text-slate-900 font-bold border-2 border-slate-300 rounded-lg",
                        day: "hover:bg-slate-50 text-slate-700 rounded-lg transition-all duration-200 hover:scale-105",
                        nav_button: "text-slate-600 hover:bg-slate-100 rounded-lg",
                        caption: "text-slate-900 font-bold text-lg",
                        head_cell: "text-slate-500 font-semibold text-sm"
                      }}
                    />
                  </div>

                  {selectedDate && (
                    <div className="w-full max-w-xs p-4 bg-white/80 rounded-xl border-2 border-slate-200 shadow-lg backdrop-blur-sm">
                      <p className="text-slate-900 font-bold text-center text-sm">
                        <CalendarDays className="w-4 h-4 inline mr-2 text-slate-600" />
                        {selectedDate?.toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 p-4 lg:p-6 bg-white border-t border-slate-200">
              <div className="flex flex-row justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 h-10 text-slate-600 border-2 border-slate-300 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isLoading}
                  className={`px-6 h-10 font-semibold transition-all duration-300 rounded-xl ${
                    isFormValid && !isLoading
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl hover:scale-105'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Registering...' : 'Register Member'}
                </Button>
              </div>

              {!isFormValid && (
                <div className="mt-3 text-center">
                  <p className="text-slate-500 text-sm">
                    Please complete all fields to register the member
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterMember