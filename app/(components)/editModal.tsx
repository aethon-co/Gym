"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EditModalProps {
  student: {
    _id: string;
    name: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    membershipType: "Basic" | "Premium" | "Couple" | "Student" | "Custom";
    status: "Active" | "Expired" | "Suspended";
    subscriptionStartDate?: string | number;
    subscriptionEndDate: string | number;
    paymentAmount?: number;
  };
  onSave: (student: any) => void;
}

const membershipPrices = {
  Basic: 1000,
  Premium: 2000,
  Couple: 3000,
  Student: 500,
  Custom: 0,
};

const EditModal = ({ student, onSave }: EditModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ ...student });
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (open) {
      setFormData({ ...student });
    }
  }, [open, student]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const mutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      const res = await fetch(`/api/members/${student._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to update student");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["student", student._id] });
      onSave(data);
      showToast("Student updated successfully!", "success");
      setOpen(false);
    },
    onError: () => {
      showToast("Failed to update student", "error");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleMembershipTypeChange = (
    value: typeof formData.membershipType
  ) => {
    const newPaymentAmount =
      value === "Custom"
        ? formData.paymentAmount || 0
        : membershipPrices[value];

    setFormData((prev) => ({
      ...prev,
      membershipType: value,
      paymentAmount: newPaymentAmount,
    }));
  };

  const handlePaymentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value === "" ? 0 : Number(e.target.value);
    setFormData((prev) => ({
      ...prev,
      paymentAmount: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const isCustomMembership = formData.membershipType === "Custom";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4" />
            Edit Details
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update the student details and click save.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentAmount">
                  Payment Amount{" "}
                  {!isCustomMembership && `(${formData.membershipType})`}
                </Label>
                <Input
                  id="paymentAmount"
                  name="paymentAmount"
                  type="number"
                  value={formData.paymentAmount || ""}
                  onChange={handlePaymentAmountChange}
                  disabled={!isCustomMembership}
                  className={
                    !isCustomMembership ? "bg-gray-100 text-gray-600" : ""
                  }
                />
                {!isCustomMembership && (
                  <p className="text-xs text-gray-500">
                    Fixed amount for {formData.membershipType} membership
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1 grid gap-2">
                  <Label htmlFor="membershipType">Membership Type</Label>
                  <Select
                    value={formData.membershipType}
                    onValueChange={handleMembershipTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">
                        Basic - ₹{membershipPrices.Basic}
                      </SelectItem>
                      <SelectItem value="Premium">
                        Premium - ₹{membershipPrices.Premium}
                      </SelectItem>
                      <SelectItem value="Couple">
                        Couple - ₹{membershipPrices.Couple}
                      </SelectItem>
                      <SelectItem value="Student">
                        Student - ₹{membershipPrices.Student}
                      </SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: value as typeof formData.status,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subscriptionStartDate">Start Date</Label>
                <Input
                  id="subscriptionStartDate"
                  name="subscriptionStartDate"
                  type="date"
                  value={
                    formData.subscriptionStartDate
                      ? new Date(formData.subscriptionStartDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subscriptionEndDate">End Date</Label>
                <Input
                  id="subscriptionEndDate"
                  name="subscriptionEndDate"
                  type="date"
                  value={
                    formData.subscriptionEndDate
                      ? new Date(formData.subscriptionEndDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                toast.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
};

export default EditModal;
