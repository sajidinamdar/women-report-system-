import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import API from "../services/api";

const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("adminToken")) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await API.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", response.data.access_token);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Invalid email or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-68px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-800 transition-all duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md space-y-8">
        
        {/* Title Panel */}
        <div className="text-center space-y-2">
          <h1 className="text-3.5xl font-extrabold tracking-tight">
            {t("loginTitle")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("loginSubtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-md">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-xs font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold tracking-wide">
                {t("emailLabel")}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold tracking-wide">
                {t("passwordLabel")}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3.5 text-base font-bold text-white shadow-md shadow-purple-600/10 hover:bg-purple-700 hover:shadow-purple-700/20 disabled:cursor-not-allowed disabled:opacity-75 dark:bg-purple-600 dark:hover:bg-purple-500"
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t("signingIn")}</span>
                </>
              ) : (
                <>
                  <span>{t("loginBtn")}</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Dev tip */}
        <div className="text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            For testing use email <span className="font-semibold text-purple-500">admin@report.com</span> and password <span className="font-semibold text-purple-500">admin123</span>
          </p>
        </div>

      </div>
    </main>
  );
};

export default AdminLogin;
