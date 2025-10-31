"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Shield } from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordUpdate = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields", {
        style: {
          border: "1px solid #ef4444",
          padding: "12px 16px",
          color: "#ef4444",
          backgroundColor: "#fef2f2",
          fontWeight: "500",
          borderRadius: "8px",
        },
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match", {
        style: {
          border: "1px solid #ef4444",
          padding: "12px 16px",
          color: "#ef4444",
          backgroundColor: "#fef2f2",
          fontWeight: "500",
          borderRadius: "8px",
        },
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long", {
        style: {
          border: "1px solid #ef4444",
          padding: "12px 16px",
          color: "#ef4444",
          backgroundColor: "#fef2f2",
          fontWeight: "500",
          borderRadius: "8px",
        },
      });
      return;
    }

    setIsLoading(true);

    const loadingToastId = toast.loading("Updating password...", {
      style: {
        border: "1px solid #6b7280",
        padding: "12px 16px",
        color: "#374151",
        backgroundColor: "#f9fafb",
        fontWeight: "500",
        borderRadius: "8px",
      },
    });

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch("/api/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Password updated successfully!", {
          id: loadingToastId,
          style: {
            border: "1px solid #10b981",
            padding: "12px 16px",
            color: "#059669",
            backgroundColor: "#ecfdf5",
            fontWeight: "500",
            borderRadius: "8px",
          },
          duration: 4000,
        });

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error(result.error || "Failed to update password");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update password. Please try again.",
        {
          id: loadingToastId,
          style: {
            border: "1px solid #ef4444",
            padding: "12px 16px",
            color: "#ef4444",
            backgroundColor: "#fef2f2",
            fontWeight: "500",
            borderRadius: "8px",
          },
          duration: 5000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4">
      <Toaster position="top-right" />

      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-2xl mb-3 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Update Password
          </h1>
          <p className="text-slate-600">Change your account password</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-slate-900">
              <Lock className="w-5 h-5" />
              Password Settings
            </CardTitle>
            <CardDescription>
              Enter your current password and set a new one
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-6">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-sm font-semibold text-slate-700"
              >
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  handlePasswordChange("currentPassword", e.target.value)
                }
                className="h-10 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400 text-slate-900 placeholder:text-slate-400 bg-white rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-semibold text-slate-700"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
                className="h-10 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400 text-slate-900 placeholder:text-slate-400 bg-white rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-slate-700"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
                className="h-10 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400 text-slate-900 placeholder:text-slate-400 bg-white rounded-lg"
              />
            </div>

            <Button
              onClick={handlePasswordUpdate}
              disabled={
                isLoading ||
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
              className={`w-full h-10 font-semibold transition-all duration-300 rounded-xl ${
                passwordForm.currentPassword &&
                passwordForm.newPassword &&
                passwordForm.confirmPassword &&
                !isLoading
                  ? "bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl hover:scale-105"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Lock className="w-4 h-4 mr-2" />
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
