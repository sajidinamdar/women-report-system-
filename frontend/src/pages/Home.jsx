import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldAlert, Users, BrainCircuit, Fingerprint, Lock, ShieldCheck, 
  Siren, Zap, Map, Database, CheckCircle, ChevronRight, Eye, Shield
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Lock className="h-6 w-6 text-purple-500" />,
      title: "100% Anonymous",
      desc: "No registrations, emails, IP tracking or cookies required. Your identity remains completely private."
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-indigo-500" />,
      title: "AI Risk Analysis",
      desc: "Advanced Llama-3 AI immediately analyzes incident descriptions to evaluate risk scores, sentiment, and priority."
    },
    {
      icon: <Fingerprint className="h-6 w-6 text-emerald-500" />,
      title: "Evidence Integrity",
      desc: "Uploaded evidence is instantly hashed with SHA-256 and chained into an immutable blockchain-inspired ledger."
    },
    {
      icon: <Siren className="h-6 w-6 text-red-500" />,
      title: "Emergency SOS",
      desc: "One-click mode to instantly capture location, start audio recording, and video streaming in critical situations."
    },
    {
      icon: <Eye className="h-6 w-6 text-slate-500" />,
      title: "Stealth Mode",
      desc: "Quickly hide the platform behind a fake weather survey interface to protect your privacy from onlookers."
    },
    {
      icon: <Map className="h-6 w-6 text-blue-500" />,
      title: "Hotspot Mapping",
      desc: "AI-driven geographic clustering helps authorities identify high-risk zones for data-driven prevention."
    }
  ];

  return (
    <main className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-slate-50 text-slate-800 transition-all duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Decorative gradient glowing circles */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[120px] dark:bg-purple-900/10"></div>
      <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] dark:bg-indigo-900/15"></div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* HERO SECTION */}
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* Text Content Hero */}
          <div className="space-y-8 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Next-Gen Anonymous Reporting</span>
            </div>
            
            <h1 className="text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl leading-[0.9]">
              <span className="block">{t("homeTitle")}</span>
              <span className="mt-4 block bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x dark:from-purple-400 dark:via-indigo-300 dark:to-purple-400">
                Safe. Secure. Anonymous.
              </span>
            </h1>

            <p className="max-w-2xl text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Empowering victims with Blockchain-backed evidence integrity and AI-driven risk assessment. Report incidents without fear, knowing your identity is 100% protected.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row pt-4">
              <Link
                to="/report"
                className="group flex items-center justify-center gap-3 rounded-2xl bg-purple-600 px-8 py-5 text-lg font-black text-white shadow-2xl shadow-purple-600/30 transition-all hover:bg-purple-700 hover:translate-y-[-2px] active:scale-95 dark:bg-purple-600 dark:hover:bg-purple-500"
              >
                <ShieldAlert className="h-6 w-6" />
                REPORT INCIDENT
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/admin/login"
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-8 py-5 text-lg font-black text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Users className="h-6 w-6" />
                ADMIN PORTAL
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500">
                Trusted by thousands of anonymous reporters worldwide.
              </p>
            </div>
          </div>

          {/* HERO CARD - Advanced Tech Stack */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full"></div>
            <div className="relative glass rounded-[2.5rem] p-10 border border-white/20 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Security Layer Active</span>
                </div>
                <Shield className="h-6 w-6 text-purple-600" />
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-white/20">
                  <div className="flex items-center gap-4 mb-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-bold">Blockchain Ledger</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 w-[95%]"></div>
                  </div>
                  <p className="text-[10px] mt-2 text-slate-400 font-bold uppercase tracking-wider">Immutable Evidence Chain: VERIFIED</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-white/20">
                  <div className="flex items-center gap-4 mb-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-bold">AI Threat Analysis</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[88%]"></div>
                  </div>
                  <p className="text-[10px] mt-2 text-slate-400 font-bold uppercase tracking-wider">Real-time Risk Assessment: ACTIVE</p>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-4 mb-2">
                    <Siren className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-bold text-red-600">Emergency SOS Response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Auto-Capture Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE GRID */}
        <div className="mt-32 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Advanced Protective Technology</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Our multi-layered approach ensures your safety from the moment you visit our site to the final report analysis.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, idx) => (
              <div key={idx} className="group glass rounded-[2rem] p-8 hover:bg-white dark:hover:bg-slate-900 transition-all duration-500 border border-transparent hover:border-purple-500/20 hover:shadow-2xl hover:translate-y-[-8px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                  {f.icon}
                </div>
                <h3 className="mt-6 text-2xl font-black tracking-tight">{f.title}</h3>
                <p className="mt-4 text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SAFETY FOOTER */}
        <div className="mt-32 rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.5),transparent)]"></div>
          <div className="relative space-y-8">
            <ShieldAlert className="h-16 w-16 mx-auto text-red-500 animate-pulse" />
            <h2 className="text-4xl font-black sm:text-5xl">Your Safety is Our Mission.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
              We leverage cutting-edge decentralized technology and artificial intelligence to create a world where truth can be told without fear.
            </p>
            <div className="pt-4">
              <Link
                to="/report"
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-xl font-black text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
              >
                START SECURE REPORT
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
