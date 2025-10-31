"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Phone, CalendarDays, Package, MapPin, User, Hash, DollarSign, CreditCard, Smartphone, Wallet, Mail, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import toast, { Toaster } from 'react-hot-toast'

interface FormData {
  name: string
  age: string
  email: string
  phone: string
  address: string
  plan: string
  duration: string
  customAmount?: string
  paymentMethod: string
}

const RegisterMember = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    email: '',
    phone: '',
    address: '',
    plan: '',
    duration: '1',
    paymentMethod: ''
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.plan === 'Custom' && (!formData.customAmount || isNaN(parseFloat(formData.customAmount)) || parseFloat(formData.customAmount) <= 0)) {
      toast.error('Please enter a valid custom amount')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading('Registering Member...')

    try {
      const registrationData = {
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address,
        membershipType: formData.plan,
        duration: parseInt(formData.duration),
        subscriptionStartDate: selectedDate?.toISOString(),
        paymentMethod: formData.paymentMethod,
        ...(formData.plan === 'Custom' && { customAmount: parseFloat(formData.customAmount || '0') })
      }

      const response = await fetch('/api/Register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Member registered successfully!', { id: loadingToastId })
        setFormData({ 
          name: '', 
          age: '', 
          email: '', 
          phone: '', 
          address: '', 
          plan: '', 
          duration: '1', 
          paymentMethod: '' 
        })
        setSelectedDate(new Date())
      } else {
        throw new Error(result.error || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register Member. Please try again.'
      toast.error(errorMessage, { id: loadingToastId })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ 
      name: '', 
      age: '', 
      email: '', 
      phone: '', 
      address: '', 
      plan: '', 
      duration: '1', 
      paymentMethod: '' 
    })
    setSelectedDate(new Date())
  }

  const isCustomPlanSelected = formData.plan === 'Custom'
  const isFormValid = formData.name && formData.age && formData.phone && formData.address && formData.plan && formData.paymentMethod && selectedDate && (!isCustomPlanSelected || (formData.customAmount && !isNaN(parseFloat(formData.customAmount)) && parseFloat(formData.customAmount) > 0))

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
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 mb-2 block">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter full name" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="age" className="text-sm font-semibold text-slate-700 mb-2 block">Age</Label>
                      <Input id="age" type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} min="1" max="100" placeholder="Age" />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 mb-2 block">Phone</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="Phone number" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 mb-2 block">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        placeholder="email@example.com" 
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-semibold text-slate-700 mb-2 block">Address</Label>
                    <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Full address" rows={3} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Subscription Plan</Label>
                      <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                        <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Couple">Couple</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Duration (Months)</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {isCustomPlanSelected && (
                    <div>
                      <Label htmlFor="customAmount" className="text-sm font-semibold text-slate-700 mb-2 block">Custom Amount</Label>
                      <Input id="customAmount" type="number" value={formData.customAmount || ''} onChange={(e) => handleInputChange('customAmount', e.target.value)} placeholder="Enter amount" min="0.01" step="0.01" />
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Payment Method</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'UPI', icon: <Smartphone className="w-5 h-5" />, label: 'UPI' },
                        { id: 'Card', icon: <CreditCard className="w-5 h-5" />, label: 'Card' },
                        { id: 'Cash', icon: <Wallet className="w-5 h-5" />, label: 'Cash' },
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => handleInputChange('paymentMethod', method.id)}
                          className={`flex flex-col items-center justify-center border-2 rounded-xl py-3 transition-all ${
                            formData.paymentMethod === method.id
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-300 hover:border-slate-500 text-slate-700'
                          }`}
                        >
                          {method.icon}
                          <span className="text-xs mt-1 font-semibold">{method.label}</span>
                        </button>
                      ))}
                    </div>
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

                <div className="flex-1 flex flex-col items-center justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-xl border-2 border-slate-200 bg-white shadow-lg"
                    classNames={{
                      day_selected: "bg-slate-900 text-white hover:bg-slate-800 rounded-lg",
                      day_today: "bg-slate-100 text-slate-900 font-bold border-2 border-slate-300 rounded-lg",
                      day: "hover:bg-slate-50 text-slate-700 rounded-lg transition-all duration-200 hover:scale-105"
                    }}
                  />

                  {selectedDate && (
                    <div className="w-full max-w-xs p-4 bg-white/80 rounded-xl border-2 border-slate-200 shadow-lg mt-4">
                      <p className="text-slate-900 font-bold text-center text-sm">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 p-4 lg:p-6 bg-white border-t border-slate-200">
              <div className="flex flex-row justify-center gap-4">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!isFormValid || isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Registering...' : 'Register Member'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterMember