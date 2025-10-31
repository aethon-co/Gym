"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Calendar,
  DollarSign,
  Crown,
  User,
  Loader2,
  CheckCircle,
  Landmark,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { StudentData } from "@/lib/types";

interface RenewalModalProps {
  student: StudentData;
  onRenewalSuccess: (updatedStudent: StudentData) => void;
}

const membershipPrices: Record<string, number> = {
  Basic: 1500,
  Premium: 3000,
  Couple: 4500,
  Student: 1200,
  Custom: 1,
};

const paymentMethods = [
  { value: "Cash", label: "Cash", icon: DollarSign },
  { value: "UPI", label: "UPI", icon: Smartphone },
  { value: "Card", label: "Credit/Debit Card", icon: CreditCard },
];

export default function RenewalModal({
  student,
  onRenewalSuccess,
}: RenewalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    membershipType: student.membershipType,
    renewalMonths: 1,
    paymentAmount: membershipPrices[student.membershipType] || 1500,
    paymentMethod: "Cash",
  });

  const handleMembershipTypeChange = (type: keyof typeof membershipPrices) => {
    setFormData((prev) => ({
      ...prev,
      membershipType: type as
        | "Basic"
        | "Premium"
        | "Couple"
        | "Student"
        | "Custom",
      paymentAmount: (membershipPrices[type] ?? 0) * prev.renewalMonths,
    }));
  };

  const handleMonthsChange = (months: number) => {
    setFormData((prev) => ({
      ...prev,
      renewalMonths: months,
      paymentAmount: membershipPrices[prev.membershipType] * months,
    }));
  };

  const handleCustomAmountChange = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setFormData((prev) => ({
      ...prev,
      paymentAmount: numAmount,
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const calculateNewEndDate = () => {
    const currentEndDate = new Date(student.subscriptionEndDate);
    const today = new Date();

    let startDate;
    if (currentEndDate <= today || student.status === "Expired") {
      startDate = today;
    } else {
      startDate = currentEndDate;
    }

    const newEndDate = new Date(startDate);
    newEndDate.setMonth(newEndDate.getMonth() + formData.renewalMonths);

    return newEndDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case "Premium":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "Student":
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const paymentMethod = paymentMethods.find((pm) => pm.value === method);
    const IconComponent = paymentMethod?.icon || DollarSign;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleRenewal = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/members/${student._id}/renew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: formData.paymentAmount,
          membershipType: formData.membershipType,
          renewalMonths: formData.renewalMonths,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to renew membership");
      }

      toast.success("Membership Renewed!", {
        description: `${student.name}'s ${formData.membershipType} membership has been extended by ${formData.renewalMonths} month(s).`,
        duration: 5000,
      });

      onRenewalSuccess(data.member);
      setIsOpen(false);
    } catch (error) {
      console.error("Renewal failed:", error);
      toast.error("Renewal Failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <CreditCard className="h-4 w-4" />
          Renew Membership
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Renew Membership
          </DialogTitle>
          <DialogDescription>
            Renew membership for {student.name}. Current status:{" "}
            {student.status}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="membershipType">Membership Type</Label>
            <Select
              value={formData.membershipType}
              onValueChange={handleMembershipTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select membership type" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(membershipPrices).map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {getMembershipIcon(type)}
                      <span>
                        {type} - ₹
                        {
                          membershipPrices[
                            type as keyof typeof membershipPrices
                          ]
                        }
                        /month
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="duration">Renewal Duration</Label>
            <Select
              value={formData.renewalMonths.toString()}
              onValueChange={(value) => handleMonthsChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 6, 12].map((months) => (
                  <SelectItem key={months} value={months.toString()}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {months} Month{months > 1 ? "s" : ""}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="amount">Payment Amount (₹)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={formData.paymentAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-2"
                placeholder="Enter amount"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={handlePaymentMethodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method.value)}
                      <span>{method.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">New End Date</span>
            </div>
            <p className="text-blue-600 font-semibold mt-1">
              {calculateNewEndDate()}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRenewal}
            disabled={loading || formData.paymentAmount <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Confirm Renewal - ₹{formData.paymentAmount}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
