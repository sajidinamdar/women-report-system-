import React, { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Check, Copy, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

const ReportSuccess = () => {
  const { refId } = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const reportData = location.state?.report;

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-[calc(100vh-68px)] bg-slate-50 py-16 text-slate-800 transition-all duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
            <ShieldCheck className="h-10 w-10 animate-bounce" />
          </div>
          
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("successTitle")}
          </h1>
          <p className="mt-3 max-w-md text-slate-500 dark:text-slate-400">
            {t("successSubtitle")}
          </p>
        </div>

        {/* Reference ID Card */}
        <div className="mt-10 rounded-3xl bg-white p-6 shadow-md dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t("refIdLabel")}
            </span>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-wider text-purple-600 dark:text-purple-400 sm:text-3xl">
                {refId}
              </span>
              <button
                onClick={copyToClipboard}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300"
                title={t("copyBtn")}
              >
                {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-4.5 w-4.5" />}
              </button>
            </div>
            {copied && (
              <span className="mt-2 block text-xs font-semibold text-emerald-500">
                {t("copied")}
              </span>
            )}
          </div>

          {/* Cryptographic Hash Details if uploaded */}
          {reportData?.evidence_hash && (
            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Evidence SHA-256 Hash
              </span>
              <p className="mt-2 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                {reportData.evidence_hash}
              </p>
            </div>
          )}

          {/* Warning Message */}
          <div className="mt-6 flex gap-3.5 rounded-xl bg-amber-500/10 p-4 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              {t("refIdWarning")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Go Back Home
          </Link>
          <Link
            to="/report"
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
          >
            {t("newReportBtn")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </main>
  );
};

export default ReportSuccess;
