import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, AlertCircle, FileSpreadsheet, ShieldAlert, ArrowRight, Activity } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import API from "../services/api";

const Dashboard = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch summary counters
        const summaryRes = await API.get("/analytics/summary");
        setSummary(summaryRes.data);

        // Fetch recent reports (sorted newest first)
        const reportsRes = await API.get("/admin/reports");
        setRecentReports(reportsRes.data.slice(0, 5));

      } catch (err) {
        console.error(err);
        setError("Failed to fetch dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: t("totalReports"),
      value: summary.total,
      color: "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/5",
      icon: <FileSpreadsheet className="h-6 w-6" />
    },
    {
      title: t("highRisk"),
      value: summary.high,
      color: "border-red-500 text-red-600 dark:text-red-400 bg-red-500/5",
      icon: <ShieldAlert className="h-6 w-6" />
    },
    {
      title: t("mediumRisk"),
      value: summary.medium,
      color: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5",
      icon: <AlertCircle className="h-6 w-6" />
    },
    {
      title: t("lowRisk"),
      value: summary.low,
      color: "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
      icon: <Activity className="h-6 w-6" />
    }
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="text-purple-600" />
            {t("dashboard")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time status of security incidents and incident risk distributions.
          </p>
        </div>
      </div>

      {/* Error Info */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border-l-4 p-6 glass shadow-sm flex items-center justify-between ${card.color}`}
          >
            <div>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <h3 className="mt-2 text-3xl font-bold tracking-tight">
                {card.value}
              </h3>
            </div>
            <div className="rounded-xl bg-white/60 p-2 dark:bg-slate-900/60 shadow-sm">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Incidents Card Table */}
      <div className="glass rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-slate-700/50">
          <h2 className="text-xl font-bold">{t("recentReports")}</h2>
          <Link
            to="/admin/reports"
            className="flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {recentReports.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("noReports")}
            </p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500">
                  <th className="py-3 px-4">{t("refId")}</th>
                  <th className="py-3 px-4">{t("category")}</th>
                  <th className="py-3 px-4">{t("risk")}</th>
                  <th className="py-3 px-4">{t("priority")}</th>
                  <th className="py-3 px-4">{t("location")}</th>
                  <th className="py-3 px-4">{t("dateSubmitted")}</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-900 dark:hover:bg-slate-900/30"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {report.reference_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{report.incident_type}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          report.risk_level === "High"
                            ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                            : report.risk_level === "Medium"
                            ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                        }`}
                      >
                        {report.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          report.priority === "Urgent"
                            ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                            : report.priority === "Routine"
                            ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                            : "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400"
                        }`}
                      >
                        {report.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 truncate max-w-[150px]">{report.location}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
