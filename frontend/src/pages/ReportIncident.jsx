import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, Upload, X, FileText, CheckCircle2, AlertCircle, 
  MapPin, Camera, RefreshCw, Mic, Square, Play, Trash2, 
  AlertTriangle, EyeOff, Eye, ChevronRight, ChevronLeft, Siren, Zap, StopCircle
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import API from "../services/api";

const ReportIncident = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    incident_type: "",
    custom_incident_type: "",
    description: "",
    location: "",
    incident_date: "",
    incident_time: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  
  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [stealthMode, setStealthMode] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [emergencyTimer, setEmergencyTimer] = useState(0);

  useEffect(() => {
    // Set current date and time on component mount
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(" ")[0].slice(0, 5); // HH:MM
    
    setForm(prev => ({
      ...prev,
      incident_date: dateStr,
      incident_time: timeStr
    }));
  }, []);

  const handleQuickExit = () => {
    window.location.replace("https://www.google.com");
  };

  const startEmergencyMode = async () => {
    setEmergencyMode(true);
    setForm(prev => ({ ...prev, incident_type: "Emergency SOS", description: "EMERGENCY SOS TRIGGERED. AUTO-RECORDING IN PROGRESS." }));
    
    // 1. Get Location
    getLiveLocation();

    // 2. Start Video/Audio Stream
    try {
      const sosStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(sosStream);
      if (videoRef.current) videoRef.current.srcObject = sosStream;
      setShowCamera(true);
      
      // Start Recording (Audio for now as per current state)
      mediaRecorderRef.current = new MediaRecorder(sosStream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioUrl(URL.createObjectURL(blob));
        setFile(new File([blob], `emergency_audio_${Date.now()}.wav`, { type: "audio/wav" }));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start a timer
      const interval = setInterval(() => setEmergencyTimer(prev => prev + 1), 1000);
      return () => clearInterval(interval);

    } catch (err) {
      console.error(err);
      setError("Emergency Mode: Camera/Mic access denied.");
    }
  };

  const stopEmergencyMode = async () => {
    stopRecording();
    stopCamera();
    
    // Auto-submit emergency report
    if (form.location && form.description) {
      setLoading(true);
      setError("");

      try {
        const formData = new FormData();
        
        formData.append("incident_type", "Emergency SOS");
        formData.append("description", form.description);
        formData.append("location", form.location);
        if (form.incident_date) formData.append("incident_date", form.incident_date);
        if (form.incident_time) formData.append("incident_time", form.incident_time);
        if (file) formData.append("evidence", file);

        const response = await API.post("/reports/submit", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // Redirect to success page
        navigate(`/success/${response.data.reference_id}`, {
          state: { report: response.data }
        });
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail || 
          "Something went wrong while submitting the emergency report. Please try again."
        );
        setEmergencyMode(false);
        setStep(3);
      } finally {
        setLoading(false);
      }
    } else {
      setEmergencyMode(false);
      setStep(3);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size cannot exceed 10MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        setGettingLocation(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location. Please enter it manually.");
        setGettingLocation(false);
      }
    );
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error(err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        setFile(capturedFile);
        stopCamera();
      }, "image/jpeg");
    }
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0].slice(0, 5);
    setForm(prev => ({
      ...prev,
      incident_date: dateStr,
      incident_time: timeStr
    }));
  };

  // Audio Recording Logic
  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(audioStream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Convert blob to file for submission
        const audioFile = new File([audioBlob], `voice_evidence_${Date.now()}.wav`, { type: "audio/wav" });
        setFile(audioFile); // For simplicity, replacing file, but could be multiple
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Unable to access microphone for recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const removeAudio = () => {
    setAudioUrl(null);
    if (file && file.type.startsWith("audio/")) {
      setFile(null);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.incident_type || !form.description || !form.location) {
      setError("Please fill in all required fields (Incident Type, Description, Location)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      const finalIncidentType = form.incident_type === "Other" ? form.custom_incident_type : form.incident_type;
      
      formData.append("incident_type", finalIncidentType || "Other");
      formData.append("description", form.description);
      formData.append("location", form.location);
      if (form.incident_date) formData.append("incident_date", form.incident_date);
      if (form.incident_time) formData.append("incident_time", form.incident_time);
      if (file) formData.append("evidence", file);

      const response = await API.post("/reports/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Redirect to success page with reference ID
      navigate(`/success/${response.data.reference_id}`, {
        state: { report: response.data }
      });

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Something went wrong while submitting the report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-[calc(100vh-68px)] py-8 sm:py-12 text-slate-800 transition-all duration-300 dark:text-slate-100 ${emergencyMode ? "bg-red-950" : "bg-slate-50 dark:bg-slate-950"}`}>
      {/* Emergency Mode UI Overlay */}
      {emergencyMode && (
        <div className="fixed inset-0 z-[100] bg-red-600/20 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-pulse-slow">
          <div className="mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
            <div className="relative bg-red-600 p-6 sm:p-8 rounded-full shadow-2xl">
              <Siren className="h-12 sm:h-16 w-12 sm:w-16 text-white animate-bounce" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tighter">EMERGENCY SOS ACTIVE</h2>
          <p className="text-red-100 font-bold mb-6 sm:mb-8 uppercase tracking-widest text-xs sm:text-sm">Auto-capturing location & recording audio evidence</p>
          
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 w-full max-w-xs sm:max-w-sm border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-red-400 text-xs font-black uppercase">Recording Time</span>
              <span className="text-white font-mono text-xl sm:text-2xl">
                {Math.floor(emergencyTimer / 60)}:{(emergencyTimer % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex gap-2 items-center text-left text-white/80 text-xs sm:text-sm mb-2">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
              <span className="text-xs sm:text-sm">{form.location || "Detecting Location..."}</span>
            </div>
            <div className="flex gap-2 items-center text-left text-white/80 text-xs sm:text-sm">
              <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400 animate-pulse" />
              <span className="text-xs sm:text-sm">Capturing Audio Evidence</span>
            </div>
          </div>

          <button 
            onClick={stopEmergencyMode}
            className="group flex items-center gap-2 sm:gap-3 bg-white text-red-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg shadow-2xl hover:bg-red-50 active:scale-95 transition-all"
          >
            <StopCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            STOP & REVIEW REPORT
          </button>
        </div>
      )}

      {/* Quick Exit Button */}
      <div className="fixed top-16 sm:top-20 right-3 sm:right-4 z-50">
        <button
          onClick={handleQuickExit}
          className="group flex items-center gap-1.5 sm:gap-2 rounded-full bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-white shadow-lg hover:bg-red-700 transition-all active:scale-95"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap hidden sm:inline">
            QUICK EXIT (ESC)
          </span>
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Stealth Mode Toggle */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button 
            onClick={startEmergencyMode}
            className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black text-white shadow-lg hover:bg-red-700 animate-pulse"
          >
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
            EMERGENCY SOS
          </button>

          <button 
            onClick={() => setStealthMode(!stealthMode)}
            className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
          >
            {stealthMode ? <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline">{stealthMode ? "Show Form" : "Stealth Mode"}</span>
          </button>
        </div>

        {/* Title */}
        <div className={`text-center space-y-2 sm:space-y-3 transition-opacity duration-300 ${stealthMode ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {stealthMode ? "Daily Weather Survey" : t("reportBtn")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {stealthMode ? "Please help us improve our meteorological data by answering a few questions." : "Submit information securely. Your connection and files are private."}
          </p>
        </div>

        {/* Stepper Progress */}
        {!stealthMode && (
          <div className="mt-8 sm:mt-10 flex items-center justify-between max-w-[280px] sm:max-w-md mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 font-bold text-xs sm:text-sm transition-all duration-500 ${
                  step >= s ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-slate-200 text-slate-400 dark:bg-slate-950 dark:border-slate-800"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-6 sm:mt-8 flex items-center gap-2 sm:gap-3 rounded-xl bg-red-500/10 p-3.5 sm:p-4 text-red-600 dark:bg-red-500/20 dark:text-red-400">
            <AlertCircle className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className={`mt-6 sm:mt-8 glass rounded-2xl p-5 sm:p-6 lg:p-10 shadow-md transition-all duration-500 ${stealthMode ? "blur-md opacity-20 pointer-events-none scale-95" : "blur-0 opacity-100 scale-100"}`}>
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            
            {/* STEP 1: Incident Details */}
            {step === 1 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 text-purple-600 font-bold mb-1.5 sm:mb-2">
                  <ShieldAlert className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Incident Basics</span>
                </div>
                
                {/* Incident Type Dropdown */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="incident_type" className="text-xs sm:text-sm font-semibold tracking-wide">
                    {t("incidentType")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="incident_type"
                    name="incident_type"
                    value={form.incident_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-3.5 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50 text-sm"
                    required
                  >
                    <option value="" disabled>{t("selectIncidentType")}</option>
                    <option value="Harassment">{t("catHarassment")}</option>
                    <option value="Domestic Violence">{t("catDomestic")}</option>
                    <option value="Cyber Abuse">{t("catCyber")}</option>
                    <option value="Stalking">{t("catStalking")}</option>
                    <option value="Theft">{t("catTheft")}</option>
                    <option value="Violence">{t("catViolence")}</option>
                    <option value="Other">{t("catOther")}</option>
                  </select>
                </div>

                {form.incident_type === "Other" && (
                  <div className="space-y-1.5 sm:space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="custom_incident_type" className="text-xs sm:text-sm font-semibold tracking-wide">
                      Please specify incident type <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="custom_incident_type"
                      type="text"
                      name="custom_incident_type"
                      value={form.custom_incident_type}
                      onChange={handleChange}
                      placeholder="e.g. Workplace Discrimination..."
                      className="w-full rounded-xl border border-slate-200 bg-white/50 px-3.5 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50 text-sm"
                    />
                  </div>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="description" className="text-xs sm:text-sm font-semibold tracking-wide">
                    {t("description")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder={t("descriptionPlaceholder")}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-3.5 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50 text-sm"
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Time and Location */}
            {step === 2 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 text-purple-600 font-bold mb-1.5 sm:mb-2">
                  <MapPin className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Where & When</span>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="location" className="text-xs sm:text-sm font-semibold tracking-wide flex justify-between">
                    <span>{t("location")} <span className="text-red-500">*</span></span>
                    <button type="button" onClick={getLiveLocation} disabled={gettingLocation} className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400">
                      {gettingLocation ? <RefreshCw className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                      {gettingLocation ? "Detecting..." : "Live Location"}
                    </button>
                  </label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder={t("locationPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-3.5 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50 text-sm"
                    required
                  />
                </div>

                <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="incident_date" className="text-xs sm:text-sm font-semibold tracking-wide flex justify-between">
                      <span>{t("date")}</span>
                      <button type="button" onClick={setCurrentDateTime} className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400">
                        <RefreshCw className="h-3 w-3" /> Now
                      </button>
                    </label>
                    <input id="incident_date" type="date" name="incident_date" value={form.incident_date} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/50 px-3.5 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50 text-sm" />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="incident_time" className="text-xs sm:text-sm font-semibold tracking-wide">{t("time")}</label>
                    <input id="incident_time" type="time" name="incident_time" value={form.incident_time} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/50 px-3.5 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900/50 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Evidence (Audio/Photo/Files) */}
            {step === 3 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 text-purple-600 font-bold mb-1.5 sm:mb-2">
                  <Camera className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Evidence Collection</span>
                </div>

                {/* Evidence Options Tabs */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <button type="button" onClick={startCamera} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-3 sm:p-4 hover:bg-purple-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors">
                    <Camera className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-purple-600" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">Photo</span>
                  </button>
                  <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`flex items-center justify-center gap-2 rounded-xl border p-3 sm:p-4 transition-all ${isRecording ? "bg-red-500 text-white border-red-500 animate-pulse" : "border-slate-200 hover:bg-red-50 dark:border-slate-800 dark:hover:bg-slate-900"}`}>
                    {isRecording ? <Square className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current" /> : <Mic className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-red-500" />}
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">{isRecording ? "Stop Recording" : "Audio"}</span>
                  </button>
                </div>

                {/* Camera View */}
                {showCamera && (
                  <div className="relative overflow-hidden rounded-xl border-2 border-purple-500 bg-black aspect-video">
                    <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                    <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-3 sm:gap-4">
                      <button type="button" onClick={capturePhoto} className="rounded-full bg-white p-2.5 sm:p-3 text-purple-600 shadow-lg hover:bg-slate-100"><Camera className="h-5 w-5 sm:h-6 sm:w-6" /></button>
                      <button type="button" onClick={stopCamera} className="rounded-full bg-red-500 p-2.5 sm:p-3 text-white shadow-lg hover:bg-red-600"><X className="h-5 w-5 sm:h-6 sm:w-6" /></button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}

                {/* Audio Preview */}
                {audioUrl && (
                  <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3.5 sm:p-4 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-purple-600 text-white"><Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-purple-600">Audio Evidence Captured</p>
                        <audio src={audioUrl} controls className="h-7 mt-1 scale-75 origin-left" />
                      </div>
                    </div>
                    <button type="button" onClick={removeAudio} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" /></button>
                  </div>
                )}

                {/* File Upload Box (Default) */}
                {!showCamera && !audioUrl && (
                  <div className="space-y-1.5 sm:space-y-2">
                    {!file ? (
                      <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/30 px-5 sm:px-6 py-6 sm:py-8 text-center transition-all hover:border-purple-500 dark:border-slate-700 dark:bg-slate-900/30">
                        <Upload className="h-9 w-9 sm:h-10 sm:w-10 text-slate-400 dark:text-slate-500" />
                        <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">File evidence (PDF, Image, Video)</span>
                        <input type="file" onChange={handleFileChange} accept="image/*,video/*,application/pdf" className="absolute inset-0 cursor-pointer opacity-0" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/50 p-3.5 sm:p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300"><FileText className="h-5 w-5 sm:h-5.5 sm:w-5.5" /></div>
                          <div>
                            <h4 className="max-w-[140px] sm:max-w-[180px] truncate text-xs sm:text-sm font-semibold">{file.name}</h4>
                            <p className="text-[10px] sm:text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={removeFile} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4 sm:h-4.5 sm:w-4.5" /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Form Navigation Buttons */}
            <div className="flex gap-3 sm:gap-4 pt-3.5 sm:pt-4">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 py-3 sm:py-3.5 text-xs sm:text-sm font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back
                </button>
              )}
              
              {step < 3 ? (
                <button type="button" onClick={nextStep} disabled={step === 1 && (!form.incident_type || !form.description)} className="flex-[2] flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-purple-600 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50">
                  Next <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="flex-[2] flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-purple-600 py-3 sm:py-3.5 text-sm font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-50">
                  {loading ? <RefreshCw className="h-4.5 w-4.5 sm:h-5 sm:w-5 animate-spin" /> : <CheckCircle2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />}
                  <span>{loading ? "Submitting..." : "Submit Report"}</span>
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </main>
  );
};

export default ReportIncident;
