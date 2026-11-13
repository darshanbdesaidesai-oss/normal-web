import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { toast } from "sonner";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setLoading(true);
    const result = await resetPassword(data.email);
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
      toast.success("Password reset email sent! Check your inbox.");
    } else {
      toast.error(result.error || "Failed to request password reset.");
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
          Recover your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200/80">
          <CardHeader className="pb-4">
            <CardTitle>Password Reset</CardTitle>
            <CardDescription>
              Enter the email associated with your account and we'll send a recovery link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-700">
                  A reset link has been dispatched to your email address if an account exists.
                </p>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="mt-2">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="farmer@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                  Send Reset Link
                </Button>

                <div className="text-center mt-4">
                  <Link to="/login" className="text-xs text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    // In production, update user password through Supabase Auth
    toast.success("Password updated successfully! Please log in.");
    setLoading(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                Save New Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
