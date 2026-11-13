import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Trees,
  Sparkles,
  Compass,
  Stethoscope,
  Droplets,
  FlaskConical,
  BookOpen,
  History,
  CalendarCheck2,
  UserCheck,
  Settings,
  Sprout,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { cn } from "../../lib/utils.js";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();

  const navigation = [
    { name: t("dashboard"), href: "/app", icon: LayoutDashboard },
    { name: t("farms"), href: "/app/farms", icon: Trees },
    { name: t("recommendations"), href: "/app/crop-recommendations", icon: Sparkles },
    { name: t("advisory"), href: "/app/advisory", icon: Compass },
    { name: t("diseaseDetection"), href: "/app/disease-detection", icon: Stethoscope },
    { name: t("irrigation"), href: "/app/irrigation", icon: Droplets },
    { name: t("nutrients"), href: "/app/nutrients", icon: FlaskConical },
    { name: t("crops"), href: "/app/crops", icon: BookOpen },
    { name: t("history"), href: "/app/history", icon: History },
    { name: t("activities"), href: "/app/activities", icon: CalendarCheck2 },
    { name: t("profile"), href: "/app/profile", icon: UserCheck },
    { name: t("settings"), href: "/app/settings", icon: Settings },
  ];

  const content = (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-full border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            AgriSage <span className="text-xs bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">AI</span>
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Smart Farming</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Advisory & Farm Hub
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/app"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Safety Notice */}
      <div className="p-3 border-t border-slate-800/80 m-3 rounded-lg bg-slate-800/50">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AI agricultural decision-support engine. Always verify critical recommendations with local agronomy officers.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">{content}</div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
