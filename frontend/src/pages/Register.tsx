import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useForm } from "react-hook-form";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Alert from "../components/ui/Alert";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import type { AxiosError } from "axios";

type FormValues = { 
  email: string; 
  password: string; 
  first_name?: string; 
  last_name?: string; 
};

export default function Register() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ mode: "onBlur" });

  const onSubmit = async (data: FormValues) => {
    try {
      await doRegister(data.email, data.password, data.first_name, data.last_name);
      navigate("/dashboard");
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError("root", { message: ax.response?.data?.detail ?? "Registration failed" });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold text-blue-400">Create account</h1>
        </CardHeader>
        <CardContent>
          {errors.root?.message && <Alert className="mb-3">{errors.root.message}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  {...register("first_name")}
                />
                {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  {...register("last_name")}
                />
                {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create account"}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
