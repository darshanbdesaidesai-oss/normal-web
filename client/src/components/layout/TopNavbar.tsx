import React from "react";
import { Menu, LogOut, Globe, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../../lib/i18n.js";
import { Button } from "../ui/Button.js";
import { Link } from "react-router-dom";

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export function TopNavbar({ onToggleSidebar }: TopNavbarProps) {
  const { profile, user, signOut } = useAuth();
  const { uiLanguage, setUiLanguage, t } = useLanguage();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      {/* Left: Mobile hamburger & breadcrumb or title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-slate-800">
            {t("welcomeFarmer")}, {profile?.full_name || user?.email?.split("@")[0] || "Farmer"}
          </h2>
          {profile?.district && profile?.state && (
            <p className="text-xs text-slate-500">
              {profile.district}, {profile.state}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language selector */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value as SupportedLanguage)}
            className="text-xs bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Add Farm */}
        <Link to="/app/farms/new" className="hidden sm:block">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            + {t("addFarm")}
          </Button>
        </Link>

        {/* Profile Avatar / Link */}
        <Link
          to="/app/profile"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
            {profile?.full_name ? profile.full_name[0]?.toUpperCase() : <User className="w-4 h-4" />}
          </div>
        </Link>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-slate-500 hover:text-rose-600 gap-1.5"
          title={t("logout")}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline text-xs">{t("logout")}</span>
        </Button>
      </div>
    </header>
  );
}
