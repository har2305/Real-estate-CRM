import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useForm } from "react-hook-form";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Alert from "../components/ui/Alert";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import api from "../lib/api";
import type { AxiosError } from "axios";

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ mode: "onBlur" });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch("/auth/me/", data);
      
      // Update the user context with new data
      if (response.data) {
        setSuccess("Profile updated successfully!");
        
        // Update the auth context with fresh user data
        await updateUser();
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      setError(axiosError.response?.data?.detail ?? "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <CardContent className="text-center text-slate-600">
            Please log in to view your profile.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
          <p className="text-sm text-slate-600">Update your personal details and contact information.</p>
        </CardHeader>
        <CardContent>
          {error && <Alert className="mb-4 text-rose-700 bg-rose-50 border-rose-200">{error}</Alert>}
          {success && <Alert className="mb-4 text-emerald-700 bg-emerald-50 border-emerald-200">{success}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  {...register("first_name", { required: "First name is required" })}
                />
                {errors.first_name && (
                  <p className="text-xs text-rose-600 mt-1">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  {...register("last_name", { required: "Last name is required" })}
                />
                {errors.last_name && (
                  <p className="text-xs text-rose-600 mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting || loading} className="flex-1">
                {isSubmitting || loading ? "Updating..." : "Update Profile"}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate(-1)}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">User ID:</span>
              <span className="text-slate-900 font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Current Display Name:</span>
              <span className="text-slate-900 font-medium">
                {user.full_name || user.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Account Created:</span>
              <span className="text-slate-900">
                {user.first_name && user.last_name ? "Complete" : "Incomplete"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
