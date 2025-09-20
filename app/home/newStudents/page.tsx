"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserPlus, Phone, CalendarDays, Package } from "lucide-react"
import { useState } from "react"
import toast, { Toaster } from 'react-hot-toast'
import { DateRange } from "react-day-picker"

interface FormData {
  name: string
  age: string
  phone: string
  plan: string
}

const RegisterMember = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    phone: '',
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
          border: '2px solid #000',
          padding: '16px',
          color: '#000',
          backgroundColor: '#fff',
          fontWeight: '600'
        },
        iconTheme: {
          primary: '#000',
          secondary: '#fff',
        }
      })
      return
    }

    setIsLoading(true)

    const loadingToastId = toast.loading('Registering Member...', {
      style: {
        border: '2px solid #000',
        padding: '16px',
        color: '#000',
        backgroundColor: '#fff',
        fontWeight: '600'
      }
    })

    try {
      const registrationData = {
        name: formData.name,
        age: parseInt(formData.age),
        phoneNumber: formData.phone,
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
            border: '2px solid #000',
            padding: '16px',
            color: '#fff',
            backgroundColor: '#000',
            fontWeight: '600'
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#000',
          },
          duration: 4000
        })

        setFormData({ name: '', age: '', phone: '', plan: '' })
        setSelectedDate(undefined)
      } else {
        throw new Error(result.error || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register Member. Please try again.'
      toast.error(errorMessage, {
        id: loadingToastId,
        style: {
          border: '2px solid #dc2626',
          padding: '16px',
          color: '#dc2626',
          backgroundColor: '#fff',
          fontWeight: '600'
        },
        iconTheme: {
          primary: '#dc2626',
          secondary: '#fff',
        },
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', age: '', phone: '', plan: '' })
    setSelectedDate(undefined)
  }

  const isFormValid = formData.name && formData.age && formData.phone && formData.plan && selectedDate

  return (
    <div className="text-black p-6 pt-0">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white border-2 border-gray-200 shadow-2xl">
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="text-2xl flex items-center gap-3 text-black">
              <UserPlus className="w-6 h-6" />
              Member Registration
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Complete all fields below to register a new Member
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-black">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter Member's full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-12 border-2 border-gray-300 focus:border-black focus:ring-black text-black placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-semibold text-black">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="h-12 border-2 border-gray-300 focus:border-black focus:ring-black text-black placeholder:text-gray-400"
                    min="1"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-black flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-12 border-2 border-gray-300 focus:border-black focus:ring-black text-black placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-black flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Subscription Plan
                  </Label>
                  <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-black focus:ring-black text-black">
                      <SelectValue placeholder="Select a subscription plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200">
                      <SelectItem value="Basic" className="cursor-pointer hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-semibold text-black">Basic Plan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Premium" className="cursor-pointer hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-semibold text-black">Premium Plan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Couple" className="cursor-pointer hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-semibold text-black">Couple Plan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Student" className="cursor-pointer hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-semibold text-black">Student Plan</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-black" />
                  <h3 className="text-lg font-semibold text-black">Enrollment Date</h3>
                </div>

                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                    disabled={(date) => date < new Date()}
                    className="rounded-lg border-2 border-gray-300 bg-white"
                    classNames={{
                      day_selected: "bg-black text-white hover:bg-gray-800",
                      day_today: "bg-gray-200 text-black font-bold border border-gray-400",
                      day: "hover:bg-gray-100 text-black",
                      nav_button: "text-black hover:bg-gray-100",
                      caption: "text-black font-semibold",
                      head_cell: "text-gray-600 font-medium"
                    }}
                  />
                </div>

                {selectedDate && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <p className="text-black font-medium">
                      <strong>Selected Date:</strong> {selectedDate?.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 flex justify-center gap-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-10 h-14 text-black border-2 border-gray-300 hover:bg-gray-100 font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`px-10 h-14 font-semibold transition-all duration-200 ${isFormValid && !isLoading
                  ? 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl border-2 border-black'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed border-2 border-gray-400'
                  }`}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {isLoading ? 'Registering...' : 'Register Member'}
              </Button>
            </div>

            {!isFormValid && (
              <div className="mt-6 text-center">
                <p className="text-gray-600 font-medium">
                  Please fill in all fields to register the Member
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterMember