import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { toast } from "sonner";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(120),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    const result = await signUp(data.email, data.password, data.fullName);
    setLoading(false);

    if (result.success) {
      toast.success("Account created successfully! Welcome to AgriSage AI.");
      navigate("/app", { replace: true });
    } else {
      toast.error(result.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AgriSage <span className="text-emerald-600">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your farmer account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Join thousands of agricultural producers making smarter crop decisions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200/80">
          <CardHeader className="pb-4">
            <CardTitle>Farmer Registration</CardTitle>
            <CardDescription>Enter your details to create your agricultural profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Ramesh Gowda"
                error={errors.fullName?.message}
                {...register("fullName")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="farmer@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-type your password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                Register Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Sign in <ArrowRight className="inline w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Your farm records are isolated and protected with RLS</span>
        </div>
      </div>
    </div>
  );
}
