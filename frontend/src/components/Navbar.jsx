import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Sun, Moon, LogOut, Globe } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "../context/LanguageContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLoggedIn = !!localStorage.getItem("adminToken");
  const isAdminPath = location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full glass shadow-sm transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
            <Shield className="h-5.5 w-5.5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              {t("appName")}
            </span>
            <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              {t("appSubName")}
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/50">
            <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
            >
              <option value="en" className="dark:bg-slate-900">EN</option>
              <option value="mr" className="dark:bg-slate-900">मराठी</option>
              <option value="hi" className="dark:bg-slate-900">हिंदी</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-amber-500" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-purple-600" />
            )}
          </button>

          {/* Admin Logout */}
          {isAdminLoggedIn && isAdminPath && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/35"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
