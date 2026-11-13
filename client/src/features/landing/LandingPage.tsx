import React from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  ArrowRight,
  Sparkles,
  Compass,
  Stethoscope,
  Droplets,
  FlaskConical,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck2,
} from "lucide-react";
import { Button } from "../../components/ui/Button.js";
import { Card, CardContent } from "../../components/ui/Card.js";
import { useAuth } from "../../context/AuthContext.js";

export function LandingPage() {
  const { user, loginAsDevFarmer } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              AgriSage <span className="text-emerald-600">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/app">
                <Button variant="primary" size="sm" className="font-semibold gap-1.5">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-700 font-medium">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="font-semibold shadow-sm">
                    Create Free Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6 animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            AI-Powered Precision Agriculture Assistant
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Practical agricultural intelligence for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700">
              every Indian farmer
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Personalized crop recommendations, preliminary plant disease diagnostics, irrigation planning,
            and soil health guidance powered by Gemini AI and agronomic science.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full font-bold shadow-md shadow-emerald-600/20 gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto font-semibold border-emerald-300 text-emerald-900 bg-white hover:bg-emerald-50/80 gap-2"
              onClick={() => {
                loginAsDevFarmer();
                window.location.href = "/app";
              }}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Try Demo Farmer Account
            </Button>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-bold text-emerald-600">30+</div>
              <div className="text-xs text-slate-500 font-medium">Indian Crop Catalogs</div>
            </div>
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-bold text-emerald-600">Multimodal</div>
              <div className="text-xs text-slate-500 font-medium">Crop Leaf Diagnostics</div>
            </div>
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-bold text-emerald-600">Multilingual</div>
              <div className="text-xs text-slate-500 font-medium">English, ಕನ್ನಡ, हिन्दी</div>
            </div>
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-bold text-emerald-600">RLS Secured</div>
              <div className="text-xs text-slate-500 font-medium">Isolated Farm Records</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              Complete Digital Advisory Platform for Modern Farming
            </h2>
            <p className="mt-4 text-slate-600 text-base">
              Built with agricultural integrity: AgriSage strictly separates verified agronomic data from AI estimates,
              providing transparent reasoning for every insight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="hover:shadow-md transition-shadow border-slate-200/80">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI Crop Recommendations</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tailored crop suitability rankings based on your specific soil type, pH, NPK levels, water
                  availability, and farming objectives.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-md transition-shadow border-slate-200/80">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 border border-teal-100">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Agricultural Advisory Center</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Generate in-depth cultivation roadmaps covering land preparation, seed treatment, spacing,
                  nutrient timing, pest prevention, and post-harvest care.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-md transition-shadow border-slate-200/80">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Image Disease Assistance</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Upload photos of affected leaves or stems to receive preliminary diagnostic insights, safe cultural
                  actions, and IPM recommendations.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="hover:shadow-md transition-shadow border-slate-200/80">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 border border-sky-100">
                  <Droplets className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Irrigation Guidance</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Optimize watering schedules for drip, sprinkler, and canal irrigation to safeguard plants against
                  water stress and prevent root rot.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="hover:shadow-md transition-shadow border-slate-200/80">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Nutrient & Soil Health</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Steward fertilizer applications responsibly with deficiency symptom identification, organic manure
                  incorporation, and soil testing reminders.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="hover:shadow-md transition-shadow border-slate-200/80">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 border border-orange-100">
                  <CalendarCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Farming Activity Tracker</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Schedule sowing, fertilizer top-dressing, weeding, and harvests with calendar tracking and timely
                  reminders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Responsible AI Commitment Banner */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Our Responsible Agricultural AI Guarantee
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            AgriSage AI does not generate unsupported yield promises or reckless chemical prescriptions.
            Recommendations emphasize sustainable agriculture, soil testing, and verified ICAR / State Agricultural
            University protocols.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto text-xs text-slate-300">
            <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Transparent AI uncertainty acknowledgement</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Label-compliant pesticide & fertilizer safety</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Multi-farm isolation via PostgreSQL RLS</span>
            </div>
          </div>

          <div className="mt-10">
            <Link to="/register">
              <Button size="lg" variant="primary" className="font-bold shadow-lg shadow-emerald-500/20">
                Register Your Farm Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800">AgriSage AI</span>
            <span>&bull; Empowering agricultural communities</span>
          </div>
          <div className="flex gap-4">
            <Link to="/app/crops" className="hover:text-emerald-700">Crop Library</Link>
            <Link to="/login" className="hover:text-emerald-700">Farmer Login</Link>
            <Link to="/register" className="hover:text-emerald-700">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
