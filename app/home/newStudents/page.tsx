"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Phone, CalendarDays, User, CreditCard, Smartphone, Wallet, Mail, Clock, Fingerprint, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
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
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false)
  const [scannedFingerprintId, setScannedFingerprintId] = useState<number | null>(null)
  const [fingerprintScanToken, setFingerprintScanToken] = useState<string>("")
  const [fingerprintScanError, setFingerprintScanError] = useState<string>("")
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
    if (!scannedFingerprintId || !fingerprintScanToken) {
      toast.error('Please scan fingerprint before registration')
      return
    }

    if (formData.plan === 'Custom' && (!formData.customAmount || isNaN(parseFloat(formData.customAmount)) || parseFloat(formData.customAmount) <= 0)) {
      toast.error('Please enter a valid custom amount')
      return
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/
    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    const phoneRegex = /^[6-9]\d{9}$/
    const normalizedPhone = formData.phone.replace(/\D/g, "")
    if (!phoneRegex.test(normalizedPhone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number")
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading('Registering Member...')

    try {
      const registrationData = {
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email,
        phoneNumber: normalizedPhone,
        address: formData.address,
        membershipType: formData.plan,
        duration: parseInt(formData.duration),
        subscriptionStartDate: selectedDate?.toISOString(),
        paymentMethod: formData.paymentMethod,
        fingerprintId: scannedFingerprintId,
        fingerprintScanToken,
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
        setScannedFingerprintId(null)
        setFingerprintScanToken("")
        setFingerprintScanError("")
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
    setScannedFingerprintId(null)
    setFingerprintScanToken("")
    setFingerprintScanError("")
  }

  const handleFingerprintScan = async () => {
    setIsScanningFingerprint(true)
    setFingerprintScanError("")
    setScannedFingerprintId(null)
    setFingerprintScanToken("")
    const loadingToastId = toast.loading("Waiting for fingerprint scan...")
    try {
      const response = await fetch("/api/fingerprints/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Fingerprint scan failed")
      }

      setScannedFingerprintId(result.fingerprintId)
      setFingerprintScanToken(result.scanToken)
      toast.success(`Fingerprint scanned (ID: ${result.fingerprintId})`, { id: loadingToastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fingerprint scan failed"
      setFingerprintScanError(message)
      toast.error(message, { id: loadingToastId })
    } finally {
      setIsScanningFingerprint(false)
    }
  }

  const isCustomPlanSelected = formData.plan === 'Custom'
  const isFormValid = formData.name && formData.age && formData.phone && formData.address && formData.plan && formData.paymentMethod && selectedDate && scannedFingerprintId && fingerprintScanToken && (!isCustomPlanSelected || (formData.customAmount && !isNaN(parseFloat(formData.customAmount)) && parseFloat(formData.customAmount) > 0))

  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-7xl mx-auto bg-slate-50">
      <Toaster position="top-right" />
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-500 rounded-3xl shadow-lg shadow-orange-500/30 mb-5">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center">Member Registration</h1>
        <p className="text-slate-500 font-medium mt-2 text-center max-w-2xl">Complete the form below to register a new member. Fingerprint ID is assigned automatically by the scanner.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden mb-10">
        <div className="flex flex-col lg:flex-row">
          
          <div className="p-6 sm:p-10 flex-1 border-b lg:border-b-0 lg:border-r border-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider text-xs">Full Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter full name" className="px-4 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500/20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="age" className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider text-xs">Age</Label>
                  <Input id="age" type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} min="1" max="100" placeholder="Age" className="px-4 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500/20" />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider text-xs">Phone</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="10-digit mobile" maxLength={10} className="px-4 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500/20" />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider text-xs">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)} 
                    placeholder="email@example.com" 
                    className="pl-12 pr-4 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider text-xs">Address</Label>
                <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Full address" rows={3} className="px-4 py-4 rounded-2xl border-slate-200 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500/20 resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider text-xs">Subscription Plan</Label>
                  <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                    <SelectTrigger className="px-4 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-orange-500/20 focus:border-orange-500 text-base shadow-sm"><SelectValue placeholder="Select a plan" /></SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200">
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Couple">Couple</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider text-xs">Duration (Months)</Label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                      <SelectTrigger className="pl-12 pr-4 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-orange-500/20 focus:border-orange-500 text-base shadow-sm">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200">
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
                  <Label htmlFor="customAmount" className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider text-xs">Custom Amount (₹)</Label>
                  <Input id="customAmount" type="number" value={formData.customAmount || ''} onChange={(e) => handleInputChange('customAmount', e.target.value)} placeholder="Enter amount" min="0.01" step="0.01" className="px-4 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500/20" />
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block uppercase tracking-wider text-xs">Payment Method</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'UPI', icon: <Smartphone className="w-6 h-6" />, label: 'UPI' },
                    { id: 'Card', icon: <CreditCard className="w-6 h-6" />, label: 'Card' },
                    { id: 'Cash', icon: <Wallet className="w-6 h-6" />, label: 'Cash' },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={(e) => { e.preventDefault(); handleInputChange('paymentMethod', method.id); }}
                      className={`flex flex-col items-center justify-center border-2 rounded-2xl py-4 transition-all duration-200 ${
                        formData.paymentMethod === method.id
                          ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {method.icon}
                      <span className="text-sm mt-2 font-bold">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-1.5 block uppercase tracking-wider text-xs">Fingerprint Scan</Label>
                    {!scannedFingerprintId && !fingerprintScanError && (
                      <p className="text-sm text-slate-500">Click scan, then place finger on scanner.</p>
                    )}
                    {scannedFingerprintId && (
                      <p className="text-emerald-600 font-bold flex items-center gap-1.5 text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-flex">
                        <CheckCircle2 className="w-4 h-4" />
                        Linked Successfully • ID: {scannedFingerprintId}
                      </p>
                    )}
                    {fingerprintScanError && (
                      <p className="text-sm text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 inline-flex">
                        <AlertCircle className="w-4 h-4" />
                        {fingerprintScanError}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleFingerprintScan}
                    disabled={isScanningFingerprint}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20 border-0 h-11 w-full sm:w-auto px-6 text-sm font-bold tracking-wide"
                  >
                    {isScanningFingerprint ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-5 h-5 mr-2" />
                        {scannedFingerprintId ? "Rescan" : "Start Scan"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 w-full lg:w-[420px] bg-slate-50/50 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Enrollment Date</h2>
            </div>

            <div className="flex flex-col items-center flex-1 py-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 w-full flex justify-center pb-6"
                classNames={{
                  day_selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white rounded-xl shadow-md",
                  day_today: "bg-slate-50 text-slate-900 font-extrabold border-2 border-slate-200 rounded-xl",
                  day: "hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition-colors w-9 h-9 sm:w-10 sm:h-10 text-center"
                }}
              />

              {selectedDate && (
                <div className="w-full mt-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">Starting Date</p>
                  <p className="text-slate-900 font-black text-lg">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="h-12 px-8 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isLoading} className="h-12 px-8 rounded-xl font-bold border-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 w-full sm:w-auto transform transition-all active:scale-[0.98]">
            <UserPlus className="w-5 h-5 mr-2" />
            {isLoading ? 'Registering...' : 'Register Member'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RegisterMember
