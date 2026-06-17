import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, Search, Filter, ShieldAlert, AlertCircle, 
  ExternalLink, KeyRound, Download, RefreshCw, Upload, Check, AlertTriangle 
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import API from "../services/api";

const ReportsList = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters state
  const [incidentType, setIncidentType] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  
  // Expanded report state
  const [expandedReportId, setExpandedReportId] = useState(null);
  
  // Verification state for inline verification
  const [verifyingFile, setVerifyingFile] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await API.get("/admin/reports", {
        params: {
          incident_type: incidentType || undefined,
          risk_level: riskLevel || undefined,
          location: locationQuery || undefined
        }
      });
      setReports(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [incidentType, riskLevel, locationQuery]);

  const handleRowClick = (reportId) => {
    if (expandedReportId === reportId) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(reportId);
    }
    // Reset verification state when switching reports
    setVerifyingFile(null);
    setVerificationResult(null);
  };

  const handleVerifyFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVerifyingFile(file);
      setVerificationResult(null);
    }
  };

  const handleVerifySubmit = async (reportId) => {
    if (!verifyingFile) return;

    setVerificationLoading(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append("report_id", reportId);
      formData.append("file", verifyingFile);

      const response = await API.post("/admin/verify-evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setVerificationResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to verify evidence. Make sure file and report are valid.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const clearFilters = () => {
    setIncidentType("");
    setRiskLevel("");
    setLocationQuery("");
  };

  // Base URL of backend to construct evidence links
  const backendBaseUrl = import.meta.env.VITE_API_URL ? 
    import.meta.env.VITE_API_URL.replace("/api", "") : 
    "http://localhost:8000";

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="text-purple-600" />
          {t("reports")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Browse, filter, and inspect submitted reports. Click any report to view details and verify files.
        </p>
      </div>

      {/* Filter panel */}
      <div className="glass rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
          <Filter className="h-4 w-4" />
          <span>{t("filterTitle")}</span>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Incident Type Select */}
          <select
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <option value="">{t("allTypes")}</option>
            <option value="Harassment">{t("catHarassment")}</option>
            <option value="Domestic Violence">{t("catDomestic")}</option>
            <option value="Cyber Abuse">{t("catCyber")}</option>
            <option value="Stalking">{t("catStalking")}</option>
            <option value="Theft">{t("catTheft")}</option>
            <option value="Violence">{t("catViolence")}</option>
            <option value="Other">{t("catOther")}</option>
          </select>

          {/* Risk Level Select */}
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <option value="">{t("allRisks")}</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Search location */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder={t("searchLoc")}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(incidentType || riskLevel || locationQuery) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              {t("clearFilters")}
            </button>
          </div>
        )}
      </div>

      {/* Error Info */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Reports Table container */}
      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : reports.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("noReports")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500 bg-slate-100/30 dark:bg-slate-900/30">
                  <th className="py-3.5 px-4">{t("refId")}</th>
                  <th className="py-3.5 px-4">{t("category")}</th>
                  <th className="py-3.5 px-4">{t("risk")}</th>
                  <th className="py-3.5 px-4">{t("priority")}</th>
                  <th className="py-3.5 px-4">{t("location")}</th>
                  <th className="py-3.5 px-4">{t("dateSubmitted")}</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const isExpanded = expandedReportId === report.id;
                  return (
                    <React.Fragment key={report.id}>
                      {/* Main Row */}
                      <tr
                        onClick={() => handleRowClick(report.id)}
                        className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-900 dark:hover:bg-slate-900/30 transition-colors ${
                          isExpanded ? "bg-purple-500/5 hover:bg-purple-500/5" : ""
                        }`}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {report.reference_id}
                        </td>
                        <td className="py-4 px-4 font-semibold">{report.incident_type}</td>
                        <td className="py-4 px-4">
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
                        <td className="py-4 px-4">
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
                        <td className="py-4 px-4 truncate max-w-[150px]">{report.location}</td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                      
                      {/* Detail Expanded Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-100/40 p-6 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900">
                            <div className="grid gap-8 md:grid-cols-12">
                              {/* Left: description */}
                              <div className="md:col-span-7 space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  {t("reportDetails")}
                                </h4>
                                
                                {/* AI Summary and Sentiment */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-purple-500/5 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-500/10">
                                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">AI Summary</span>
                                    <p className="text-xs font-semibold mt-1 text-slate-700 dark:text-slate-300">
                                      {report.summary || "Generating summary..."}
                                    </p>
                                  </div>
                                  <div className={`p-4 rounded-xl border ${
                                    report.sentiment === "Negative" 
                                      ? "bg-red-500/5 border-red-500/10 text-red-600" 
                                      : report.sentiment === "Positive"
                                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600"
                                      : "bg-slate-500/5 border-slate-500/10 text-slate-600"
                                  }`}>
                                    <span className="text-[10px] font-bold uppercase">Sentiment</span>
                                    <p className="text-xs font-bold mt-1">
                                      {report.sentiment || "Neutral"}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-2">Original Description</span>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {report.description}
                                  </p>
                                </div>
                              </div>

                              {/* Right: evidence file and verification */}
                              <div className="md:col-span-5 space-y-5">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  {t("evidenceVerificationStatus")}
                                </h4>

                                {report.evidence_url ? (
                                  <div className="space-y-4">
                                    {/* File details card */}
                                    <div className="rounded-xl border border-slate-200/60 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                          {t("evidenceFile")}
                                        </span>
                                        <a
                                          href={`${backendBaseUrl}/${report.evidence_url}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline dark:text-purple-400"
                                        >
                                          <span>Open File</span>
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                      <p className="mt-2 truncate font-mono text-xs text-slate-600 dark:text-slate-300">
                                        {report.evidence_url.split("/").pop()}
                                      </p>
                                      <span className="mt-3 block text-xs font-bold text-slate-400 dark:text-slate-500">
                                        {t("storedHash")}
                                      </span>
                                      <p className="mt-1 break-all rounded bg-slate-50 p-2 font-mono text-[10px] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                        {report.evidence_hash}
                                      </p>
                                    </div>

                                    {/* Inline integrity verification */}
                                    <div className="rounded-xl border border-dashed border-slate-300 p-4 bg-white/20 dark:border-slate-700">
                                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                                        {t("verifyIntegrity")}
                                      </span>

                                      <div className="flex gap-2">
                                        <input
                                          type="file"
                                          id={`verify-file-${report.id}`}
                                          onChange={handleVerifyFileChange}
                                          className="hidden"
                                        />
                                        <label
                                          htmlFor={`verify-file-${report.id}`}
                                          className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                          <Upload className="h-3.5 w-3.5" />
                                          <span className="max-w-[150px] truncate">
                                            {verifyingFile ? verifyingFile.name : "Select file"}
                                          </span>
                                        </label>

                                        <button
                                          onClick={() => handleVerifySubmit(report.id)}
                                          disabled={!verifyingFile || verificationLoading}
                                          className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                                        >
                                          {verificationLoading ? "Checking..." : "Verify"}
                                        </button>
                                      </div>

                                      {/* Verification Output Results */}
                                      {verificationResult && (
                                        <div className="mt-3.5">
                                          {verificationResult.status === "valid" ? (
                                            <div className="flex items-start gap-2.5 rounded-lg bg-emerald-500/10 p-3 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                              <Check className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                                              <div>
                                                <h5 className="text-xs font-bold">{t("validMsg")}</h5>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{t("validSub")}</p>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 p-3 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                                              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                                              <div>
                                                <h5 className="text-xs font-bold">{t("modifiedMsg")}</h5>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{t("modifiedSub")}</p>
                                                <span className="block text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wide">Recalculated Hash:</span>
                                                <span className="block font-mono text-[9px] break-all bg-red-500/5 p-1 rounded mt-0.5">{verificationResult.calculated_hash}</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                                    {t("noEvidence")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsList;
