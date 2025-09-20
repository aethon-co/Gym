// EditModal.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface EditModalProps {
    student: {
        _id: string;
        name: string;
        phoneNumber?: string;
        email?: string;
        membershipType: "Basic" | "Premium" | "Couple" | "Student";
        status: "Active" | "Expired" | "Suspended";
        subscriptionStartDate?: string | number;
        subscriptionEndDate: string | number;
    };
}

const EditModal = ({ student }: EditModalProps) => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({ ...student });

    const mutation = useMutation({
        mutationFn: async (updatedData: typeof formData) => {
            console.log(updatedData)
            const res = await fetch(`/api/members/${student._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error("Failed to update student");
            console.log(res.json())
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["student", student._id] }); // refetch
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Edit className="h-4 w-4" />
                    Edit Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phoneNumber">Phone</Label>
                            <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" value={formData.email || ""} onChange={handleChange} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="membershipType">Membership Type</Label>
                            <select
                                id="membershipType"
                                name="membershipType"
                                value={formData.membershipType}
                                onChange={handleChange}
                                className="border rounded p-2"
                            >
                                <option value="Basic">Basic</option>
                                <option value="Premium">Premium</option>
                                <option value="Couple">Couple</option>
                                <option value="Student">Student</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="border rounded p-2"
                            >
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="subscriptionStartDate">Start Date</Label>
                            <Input
                                id="subscriptionStartDate"
                                name="subscriptionStartDate"
                                type="date"
                                value={
                                    formData.subscriptionStartDate
                                        ? new Date(formData.subscriptionStartDate).toISOString().split("T")[0]
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
                                        ? new Date(formData.subscriptionEndDate).toISOString().split("T")[0]
                                        : ""
                                }
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={mutation.status === "pending"}>
                            {mutation.status === "pending" ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditModal;
