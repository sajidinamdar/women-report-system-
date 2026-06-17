import React, { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { BarChart3, LayoutDashboard, FileSpreadsheet, Map, KeyRound } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Route guarding: Ensure admin is authenticated, else redirect to login
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const navItems = [
    {
      path: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4.5 w-4.5" />,
      label: t("dashboard")
    },
    {
      path: "/admin/reports",
      icon: <FileSpreadsheet className="h-4.5 w-4.5" />,
      label: t("reports")
    },
    {
      path: "/admin/analytics",
      icon: <BarChart3 className="h-4.5 w-4.5" />,
      label: t("analytics")
    },
    {
      path: "/admin/map",
      icon: <Map className="h-4.5 w-4.5" />,
      label: t("hotspotMap")
    },
    {
      path: "/admin/verify",
      icon: <KeyRound className="h-4.5 w-4.5" />,
      label: t("verifyEvidence")
    }
  ];

  return (
    <div className="flex min-h-[calc(100vh-68px)] flex-col bg-slate-50 text-slate-800 transition-all duration-300 dark:bg-slate-950 dark:text-slate-100 md:flex-row">
      {/* Responsive Sidebar Nav */}
      <aside className="w-full shrink-0 border-b border-slate-200/50 bg-white/70 p-4 dark:border-slate-800/50 dark:bg-slate-900/70 md:w-60 md:border-r md:border-b-0 md:p-6">
        <nav className="flex flex-row flex-wrap gap-2 md:flex-col md:gap-2.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/10 dark:bg-purple-600"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Renders Nested Routes */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
