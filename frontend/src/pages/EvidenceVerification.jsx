import React, { useState, useEffect } from "react";
import { 
  KeyRound, AlertCircle, FileText, CheckCircle2, AlertTriangle, 
  Upload, X, ShieldCheck, Database, Server, RefreshCw 
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import API from "../services/api";

const EvidenceVerification = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [file, setFile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Ledger state
  const [ledgerStatus, setLedgerStatus] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      // Only load reports that actually have an evidence hash to verify
      const res = await API.get("/admin/reports");
      const reportsWithEvidence = res.data.filter((r) => !!r.evidence_hash);
      setReports(reportsWithEvidence);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reports for verification list.");
    } finally {
      setReportsLoading(false);
    }
  };

  const verifyLedger = async () => {
    try {
      setLedgerLoading(true);
      const res = await API.get("/admin/verify-ledger");
      setLedgerStatus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    verifyLedger();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReportId || !file) {
      setError("Please select a report and upload a file to verify.");
      return;
    }

    setChecking(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("report_id", selectedReportId);
      formData.append("file", file);

      const res = await API.post("/admin/verify-evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Integrity check failed. Please verify files and credentials."
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <KeyRound className="text-purple-600" />
            {t("verifyEvidence")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("verifySubtitle")}
          </p>
        </div>

        {/* Blockchain Ledger Status Badge */}
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all ${
          ledgerLoading ? "bg-slate-100 border-slate-200 animate-pulse" : 
          ledgerStatus?.is_chain_valid ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600" :
          "bg-red-500/5 border-red-500/20 text-red-600"
        }`}>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
            <ShieldCheck className={`h-5 w-5 ${ledgerStatus?.is_chain_valid ? "text-emerald-500" : "text-red-500"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">Blockchain Ledger</span>
              <button onClick={verifyLedger} disabled={ledgerLoading} className="hover:rotate-180 transition-transform duration-500">
                <RefreshCw className={`h-3 w-3 ${ledgerLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <p className="text-sm font-extrabold">
              {ledgerLoading ? "Verifying..." : ledgerStatus?.is_chain_valid ? "Immutable Chain Valid" : "Chain Integrity Compromised!"}
            </p>
          </div>
        </div>
      </div>

      {/* Error Info */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Verification Form Card */}
        <div className="glass rounded-2xl p-6 shadow-sm lg:col-span-7 space-y-6">
          <h3 className="text-lg font-bold border-b border-slate-200/50 pb-3 dark:border-slate-700/50">
            {t("verifyTitle")}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Select Report Dropdown */}
            <div className="space-y-2">
              <label htmlFor="report" className="text-sm font-semibold">
                {t("selectReport")}
              </label>
              {reportsLoading ? (
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/50 dark:bg-slate-800/50" />
              ) : (
                <select
                  id="report"
                  value={selectedReportId}
                  onChange={(e) => {
                    setSelectedReportId(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50"
                  required
                >
                  <option value="">-- Select Report ID --</option>
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.reference_id} ({r.incident_type}) - {new Date(r.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Reupload File input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {t("reuploadFile")}
              </label>
              
              {!file ? (
                <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/30 px-6 py-8 text-center transition-all hover:border-purple-500 dark:border-slate-700 dark:bg-slate-900/30">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <span className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    Choose file to compare hashes
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    required
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-semibold truncate max-w-[200px]">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Check Button */}
            <button
              type="submit"
              disabled={checking || !file || !selectedReportId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-md shadow-purple-600/10 hover:bg-purple-700 disabled:opacity-50 dark:bg-purple-600 dark:hover:bg-purple-500"
            >
              {checking ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Calculating Hashing Integrities...</span>
                </>
              ) : (
                <span>{t("checkBtn")}</span>
              )}
            </button>
          </form>
        </div>

        {/* Verification Results Display */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="space-y-6">
              {result.status === "valid" ? (
                <div className="glass rounded-2xl p-6 border-l-4 border-emerald-500 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6 shrink-0" />
                    <h3 className="text-lg font-bold">{t("validMsg")}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("validSub")}
                  </p>
                </div>
              ) : (
                <div className="glass rounded-2xl p-6 border-l-4 border-red-500 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-6 w-6 shrink-0 animate-bounce" />
                    <h3 className="text-lg font-bold">{t("modifiedMsg")}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("modifiedSub")}
                  </p>
                </div>
              )}

              {/* Hash comparisons card */}
              <div className="glass rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {t("storedHash")}
                  </span>
                  <p className="mt-1.5 break-all font-mono text-[10px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/40 dark:border-slate-800/40 text-slate-600 dark:text-slate-350">
                    {result.stored_hash}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {t("calcHashLabel")}
                  </span>
                  <p className={`mt-1.5 break-all font-mono text-[10px] p-2.5 rounded-lg border p-2.5 ${
                    result.status === "valid" 
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                    {result.calculated_hash}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500">
              <KeyRound className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
              <p className="mt-4 text-sm">
                Awaiting file inputs. Select a report reference and upload the file to run the verification comparison.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceVerification;
