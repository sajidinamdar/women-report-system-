import React, { useState, useEffect } from "react";
import { 
  BarChart3, AlertCircle, TrendingUp, ShieldAlert, 
  BarChart, PieChart, MapPin, AlertTriangle, Info 
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import API from "../services/api";

// Chart.js imports & registrations
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { t } = useTranslation();
  const [chartsData, setChartsData] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [chartsRes, hotspotsRes] = await Promise.all([
          API.get("/analytics/charts"),
          API.get("/analytics/hotspot-clusters")
        ]);
        setChartsData(chartsRes.data);
        setHotspots(hotspotsRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch analytics data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !chartsData) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-400">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold">{error || "Data unavailable"}</span>
      </div>
    );
  }

  // 1. Categories Bar Chart Configuration
  const categoryLabels = chartsData.categories.map((c) => c.category);
  const categoryCounts = chartsData.categories.map((c) => c.count);
  const categoryConfig = {
    labels: categoryLabels.length > 0 ? categoryLabels : ["No Data"],
    datasets: [
      {
        label: "Incidents",
        data: categoryCounts.length > 0 ? categoryCounts : [0],
        backgroundColor: "rgba(139, 92, 246, 0.65)", // purple-500
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  // 2. Risk Levels Doughnut Configuration
  // Order consistently: Low, Medium, High
  const riskLevelsOrdered = ["Low", "Medium", "High"];
  const riskCountsOrdered = riskLevelsOrdered.map((level) => {
    const matched = chartsData.risk_levels.find((r) => r.risk_level === level);
    return matched ? matched.count : 0;
  });

  const riskConfig = {
    labels: riskLevelsOrdered,
    datasets: [
      {
        data: riskCountsOrdered,
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",  // emerald-500
          "rgba(245, 158, 11, 0.7)",  // amber-500
          "rgba(239, 68, 68, 0.7)"    // red-500
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)"
        ],
        borderWidth: 1.5
      }
    ]
  };

  // 3. Monthly Trends Area-Line Configuration
  const monthlyLabels = chartsData.monthly.map((m) => m.month);
  const monthlyCounts = chartsData.monthly.map((m) => m.count);
  const monthlyConfig = {
    labels: monthlyLabels.length > 0 ? monthlyLabels : ["No Data"],
    datasets: [
      {
        fill: true,
        label: "Reports Submitted",
        data: monthlyCounts.length > 0 ? monthlyCounts : [0],
        borderColor: "rgb(99, 102, 241)", // indigo-500
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        tension: 0.35,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointHoverRadius: 7
      }
    ]
  };

  // Common options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: document.documentElement.classList.contains("dark") ? "#cbd5e1" : "#475569",
          font: { family: "Outfit" }
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(156, 163, 175, 0.05)" },
        ticks: { color: "#94a3b8", font: { family: "Outfit" } }
      },
      y: {
        grid: { color: "rgba(156, 163, 175, 0.05)" },
        ticks: { color: "#94a3b8", font: { family: "Outfit" }, precision: 0 }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <BarChart3 className="text-purple-600" />
          {t("analytics")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aggregated visual reports to study category distributions, threat risks, and submission frequencies.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Category distribution bar chart */}
        <div className="glass rounded-2xl p-6 shadow-sm md:col-span-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3 dark:border-slate-700/50">
            <BarChart className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold">Incident Types Distribution</h3>
          </div>
          <div className="h-80 relative">
            <Bar data={categoryConfig} options={chartOptions} />
          </div>
        </div>

        {/* Risk level distribution pie chart */}
        <div className="glass rounded-2xl p-6 shadow-sm md:col-span-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3 dark:border-slate-700/50">
            <PieChart className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold">Risk Levels Chart</h3>
          </div>
          <div className="h-80 relative flex items-center justify-center">
            <Doughnut 
              data={riskConfig} 
              options={{
                ...chartOptions,
                scales: { x: { display: false }, y: { display: false } }
              }} 
            />
          </div>
        </div>

        {/* Submission trends chart */}
        <div className="glass rounded-2xl p-6 shadow-sm md:col-span-12 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3 dark:border-slate-700/50">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold">Monthly Submission Trends</h3>
          </div>
          <div className="h-80 relative">
            <Line data={monthlyConfig} options={chartOptions} />
          </div>
        </div>

        {/* Geographic Hotspots - New Advanced Feature */}
        <div className="glass rounded-2xl p-6 shadow-sm md:col-span-12 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-lg">AI-Detected Geographic Hotspots</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold bg-red-500/10 text-red-600 px-3 py-1 rounded-full">
              <AlertTriangle className="h-3 w-3" />
              <span>Real-time Risk Clustering</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hotspots.length > 0 ? (
              hotspots.map((spot, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{spot.location}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      spot.severity === "High" ? "bg-red-500 text-white" : 
                      spot.severity === "Medium" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                    }`}>
                      {spot.severity} Risk
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Incidents</p>
                      <p className="text-2xl font-black text-purple-600">{spot.incident_count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avg Score</p>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{spot.average_risk_score}/10</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        spot.severity === "High" ? "bg-red-500" : 
                        spot.severity === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                      }`} 
                      style={{ width: `${(spot.average_risk_score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>Insufficient data to generate hotspot clusters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
