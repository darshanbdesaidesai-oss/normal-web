import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, LogIn, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signIn, loginAsDevFarmer, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to /app
  React.useEffect(() => {
    if (user) {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/app";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const result = await signIn(data.email, data.password);
    setLoading(false);

    if (result.success) {
      toast.success("Welcome back to AgriSage AI!");
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || "Failed to sign in. Please verify your credentials.");
    }
  };

  const handleDemoLogin = () => {
    loginAsDevFarmer();
    toast.success("Logged in with Demo Farmer Profile (Karnataka)");
    navigate("/app", { replace: true });
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
          Sign in to your farmer account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Access AI-driven crop advisory, disease diagnostics, and irrigation planning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200/80">
          <CardHeader className="pb-4">
            <CardTitle>Farmer Login</CardTitle>
            <CardDescription>Enter your email and password to access your farms</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              <div className="flex items-center justify-between text-xs">
                <Link to="/forgot-password" className="text-emerald-700 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold">Or One-Click Test</span>
              </div>
            </div>

            {/* Quick Demo Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70 gap-2"
              onClick={handleDemoLogin}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Sign in as Demo Farmer (Karnataka)
            </Button>

            <div className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Register now <ArrowRight className="inline w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Supabase Authentication & Row-Level Security</span>
        </div>
      </div>
    </div>
  );
}
