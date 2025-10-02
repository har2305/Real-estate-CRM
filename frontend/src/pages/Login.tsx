import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useForm } from "react-hook-form";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Alert from "../components/ui/Alert";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import type { AxiosError } from "axios";

type FormValues = { email: string; password: string };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ mode: "onBlur" });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError("root", { message: ax.response?.data?.detail ?? "Login failed" });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold text-blue-400">Sign in</h1>
        </CardHeader>
        <CardContent>
          {errors.root?.message && <Alert className="mb-3">{errors.root.message}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
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
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Min 6 characters"
                  }
                })}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              No account?{" "}
              <Link to="/register" className="text-blue-400 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
