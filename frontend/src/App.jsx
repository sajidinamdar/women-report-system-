import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context providers
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

// Components
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

// Public pages
import Home from "./pages/Home";
import ReportIncident from "./pages/ReportIncident";
import ReportSuccess from "./pages/ReportSuccess";
import AdminLogin from "./pages/AdminLogin";

// Admin pages
import Dashboard from "./pages/Dashboard";
import ReportsList from "./pages/ReportsList";
import Analytics from "./pages/Analytics";
import HotspotMap from "./pages/HotspotMap";
import EvidenceVerification from "./pages/EvidenceVerification";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            {/* Header navbar loaded on all views */}
            <Navbar />
            
            {/* Main content router viewports */}
            <div className="flex-1 flex flex-col">
              <Routes>
                {/* Public Reporting Flow */}
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<ReportIncident />} />
                <Route path="/success/:refId" element={<ReportSuccess />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Secured Admin System */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="reports" element={<ReportsList />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="map" element={<HotspotMap />} />
                  <Route path="verify" element={<EvidenceVerification />} />
                </Route>
                
                {/* Fallback redirect */}
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
