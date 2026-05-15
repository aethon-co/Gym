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
    fingerprintId?: number;
    duration?: number;
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
      queryClient.invalidateQueries({ queryKey: ["allstudents"] });
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

  const handleStatusChange = (value: typeof student.status) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleDurationChange = (value: string) => {
    const duration = Number(value);
    // When changing duration, we usually want to start the new period from today if renewing
    const newStartDate = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      duration,
      subscriptionStartDate: newStartDate,
      status: "Active",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawFingerprintId = formData.fingerprintId as unknown;
    const fingerprintIdValue =
      rawFingerprintId === undefined ||
      rawFingerprintId === null ||
      rawFingerprintId === ""
        ? undefined
        : Number(rawFingerprintId);

    if (
      fingerprintIdValue !== undefined &&
      (!Number.isInteger(fingerprintIdValue) ||
        fingerprintIdValue < 1 ||
        fingerprintIdValue > 255)
    ) {
      showToast("Fingerprint ID must be between 1 and 255", "error");
      return;
    }

    mutation.mutate({
      ...formData,
      fingerprintId: fingerprintIdValue,
    });
  };

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
                <Label htmlFor="fingerprintId">Fingerprint ID</Label>
                <Input
                  id="fingerprintId"
                  name="fingerprintId"
                  type="number"
                  min={1}
                  max={255}
                  value={formData.fingerprintId || ""}
                  onChange={handleChange}
                  placeholder="Sensor slot ID (1-255)"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Renewal Duration (Months)</Label>
                <Select
                  value={String(formData.duration || "1")}
                  onValueChange={handleDurationChange}
                >
                  <SelectTrigger>
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

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
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
