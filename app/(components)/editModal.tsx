"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface EditModalProps {
    student: {
        _id: string;
        name: string;
        phoneNumber?: string;
        email?: string;
        address?: string;
        membershipType: "Basic" | "Premium" | "Couple" | "Student";
        status: "Active" | "Expired" | "Suspended";
        subscriptionStartDate?: string | number;
        subscriptionEndDate: string | number;
    };
}

const EditModal = ({ student }: EditModalProps) => {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({ ...student })

    const mutation = useMutation({
        mutationFn: async (updatedData: typeof formData) => {
            const res = await fetch(`/api/members/${student._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            })
            if (!res.ok) throw new Error("Failed to update student")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["student", student._id] })
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate(formData)
    }

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
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" value={formData.address || ""} onChange={handleChange} />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 grid gap-2">
                                <Label htmlFor="membershipType">Membership Type</Label>
                                <Select
                                    value={formData.membershipType}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, membershipType: value as typeof formData.membershipType }))}
                                >
                                    <SelectTrigger className="border rounded p-2">
                                        <SelectValue placeholder="Select membership type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Basic">Basic</SelectItem>
                                        <SelectItem value="Premium">Premium</SelectItem>
                                        <SelectItem value="Couple">Couple</SelectItem>
                                        <SelectItem value="Student">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as typeof formData.status }))}
                                >
                                    <SelectTrigger className="border rounded p-2">
                                        <SelectValue placeholder="Select status" />
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
    )
}

export default EditModal
