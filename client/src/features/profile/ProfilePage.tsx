import React, { useState } from "react";
import { UserCheck, ShieldCheck, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { toast } from "sonner";

export function ProfilePage() {
  const { profile, user, updateUserProfile } = useAuth();
  const { uiLanguage, setUiLanguage } = useLanguage();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [state, setState] = useState(profile?.state || "Karnataka");
  const [district, setDistrict] = useState(profile?.district || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        state: state.trim() || null,
        district: district.trim() || null,
        preferred_language: uiLanguage,
      });
      toast.success("Profile preferences saved successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-emerald-600" /> Farmer Account Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal farmer identity and regional location preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Email address is authenticated via Supabase Auth</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              value={user?.email || "farmer@agrisage.in"}
              disabled
              helperText="Account email cannot be modified directly"
            />

            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Gowda"
              required
            />

            <Input
              label="Contact Phone (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Home State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
              />

              <Input
                label="Home District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Mandya"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected with PostgreSQL Row Level Security</span>
              </div>
              <Button type="submit" variant="primary" isLoading={saving} className="gap-2">
                <Save className="w-4 h-4" /> Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
