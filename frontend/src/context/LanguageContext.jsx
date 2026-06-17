import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    appName: "SecureShield",
    appSubName: "Anonymous Incident Reporting",
    homeTitle: "Secure & Anonymous Incident Reporting System",
    homeSubtitle: "Submit incident descriptions and digital evidence without revealing your identity. Protected by AI-driven analysis and SHA-256 evidence integrity mechanisms.",
    reportBtn: "Report Incident Anonymously",
    adminBtn: "Administrator Portal",
    languageSelect: "Language",
    
    // Form fields
    incidentType: "Incident Type",
    selectIncidentType: "Select Incident Type",
    description: "Describe the incident in detail",
    descriptionPlaceholder: "Provide a detailed description of what happened. You can write in your preferred language...",
    location: "Location",
    locationPlaceholder: "City, area, or coordinates (e.g. Pune, or 18.52, 73.85)",
    date: "Date of Incident",
    time: "Time of Incident",
    evidence: "Evidence Upload",
    evidenceHelp: "Upload images, videos, or PDF files. Maximum size: 10MB.",
    submitBtn: "Submit Secure Report",
    submitting: "Processing report and generating hashes...",
    
    // Categories
    catHarassment: "Harassment",
    catDomestic: "Domestic Violence",
    catCyber: "Cyber Abuse",
    catStalking: "Stalking",
    catTheft: "Theft / Burglary",
    catViolence: "Violence / Physical Assault",
    catOther: "Other Incident",

    // Success Page
    successTitle: "Incident Reported Successfully",
    successSubtitle: "Your privacy is fully protected. Your report has been analyzed and stored in our database.",
    refIdLabel: "YOUR SECURE REFERENCE ID",
    refIdWarning: "IMPORTANT: Save this Reference ID. It is required to verify the integrity of your evidence later. It cannot be recovered.",
    copyBtn: "Copy Reference ID",
    copied: "Copied!",
    newReportBtn: "Submit Another Report",
    
    // Login
    loginTitle: "Admin Portal Sign In",
    loginSubtitle: "Sign in with secure credentials to monitor and manage incident reports.",
    emailLabel: "Email Address",
    emailPlaceholder: "admin@report.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    signingIn: "Verifying credentials...",
    loginBtn: "Access Dashboard",
    
    // Common Dashboard Labels
    logout: "Log Out",
    dashboard: "Dashboard",
    reports: "Reports",
    analytics: "Analytics",
    hotspotMap: "Hotspot Map",
    verifyEvidence: "Evidence Integrity",
    
    // Dashboard Panel
    totalReports: "Total Reports",
    highRisk: "High Risk Reports",
    mediumRisk: "Medium Risk Reports",
    lowRisk: "Low Risk Reports",
    recentReports: "Recent Incident Submissions",
    viewAll: "View All",
    noReports: "No reports found in the system.",
    
    // Filter
    filterTitle: "Filter Submissions",
    allTypes: "All Categories",
    allRisks: "All Risk Levels",
    searchLoc: "Search location...",
    clearFilters: "Reset Filters",
    
    // Report table/cards
    refId: "Ref ID",
    category: "Category",
    risk: "Risk Level",
    priority: "Priority",
    dateSubmitted: "Submitted On",
    actions: "Actions",
    viewDetails: "View Details",
    
    // Details
    reportDetails: "Report Details",
    backToList: "Back to Reports",
    evidenceVerificationStatus: "Evidence Hashing Status",
    evidenceFile: "Evidence File",
    storedHash: "Stored SHA-256 Hash",
    noEvidence: "No evidence file uploaded for this incident.",
    verifyIntegrity: "Verify Evidence Integrity",
    
    // Verification tool
    verifyTitle: "Evidence Integrity Verification",
    verifySubtitle: "Re-upload the original evidence file to recalculate its SHA-256 hash and verify if it matches the stored blockchain-inspired record.",
    selectReport: "Select Report",
    reuploadFile: "Upload File to Verify",
    checkBtn: "Validate File Integrity",
    validMsg: "Evidence Valid",
    validSub: "The re-uploaded file matches the stored hash exactly. No tampering detected.",
    modifiedMsg: "Evidence Modified",
    modifiedSub: "The re-uploaded file does NOT match the stored hash! The file has been altered.",
    calcHashLabel: "Recalculated Hash"
  },
  mr: {
    appName: "सुरक्षितकवच",
    appSubName: "अनामिक घटना नोंदणी",
    homeTitle: "सुरक्षित आणि अनामिक घटना नोंदणी प्रणाली",
    homeSubtitle: "तुमची ओळख उघड न करता घटनेचे वर्णन आणि पुरावे सबमिट करा. AI-आधारित जोखीम विश्लेषण आणि SHA-256 हॅशिंग द्वारे सुरक्षित.",
    reportBtn: "अनामिकपणे घटना नोंदवा",
    adminBtn: "प्रशासक पोर्टल",
    languageSelect: "भाषा",
    
    // Form fields
    incidentType: "घटनेचा प्रकार",
    selectIncidentType: "घटनेचा प्रकार निवडा",
    description: "घटनेचे सविस्तर वर्णन",
    descriptionPlaceholder: "नेमके काय घडले याचे सविस्तर वर्णन द्या. तुम्ही तुमच्या आवडीच्या भाषेत लिहू शकता...",
    location: "ठिकाण",
    locationPlaceholder: "शहर, परिसर किंवा अक्षांश-रेखांश (उदा. पुणे, किंवा 18.52, 73.85)",
    date: "घटनेची तारीख",
    time: "घटनेची वेळ",
    evidence: "पुरावा अपलोड करा",
    evidenceHelp: "फोटो, व्हिडिओ किंवा PDF फाईल अपलोड करा. कमाल मर्यादा: १० एमबी.",
    submitBtn: "सुरक्षित अहवाल सबमिट करा",
    submitting: "अहवालावर प्रक्रिया आणि हॅश जनरेट होत आहे...",
    
    // Categories
    catHarassment: "छळ (Harassment)",
    catDomestic: "कौटुंबिक हिंसाचार (Domestic Violence)",
    catCyber: "सायबर गुन्हे (Cyber Abuse)",
    catStalking: "पाठलाग करणे (Stalking)",
    catTheft: "चोरी / घरफोडी",
    catViolence: "शारीरिक हल्ला / हिंसाचार",
    catOther: "इतर घटना",

    // Success Page
    successTitle: "घटना यशस्वीरित्या नोंदवली गेली",
    successSubtitle: "तुमची गोपनीयता पूर्णपणे सुरक्षित आहे. तुमचा अहवाल डेटाबेसमध्ये जतन करण्यात आला आहे.",
    refIdLabel: "तुमचा सुरक्षित संदर्भ आयडी",
    refIdWarning: "महत्त्वाचे: हा संदर्भ आयडी जतन करा. भविष्यात पुराव्याची पडताळणी करण्यासाठी याची गरज पडेल. हा पुन्हा मिळवता येणार नाही.",
    copyBtn: "संदर्भ आयडी कॉपी करा",
    copied: "कॉपी केले!",
    newReportBtn: "नवीन अहवाल सबमिट करा",
    
    // Login
    loginTitle: "अॅडमिन पोर्टल लॉगिन",
    loginSubtitle: "अहवाल व्यवस्थापित करण्यासाठी सुरक्षित क्रेडेन्शियलसह साइन इन करा.",
    emailLabel: "ईमेल पत्ता",
    emailPlaceholder: "admin@report.com",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "••••••••",
    signingIn: "पडताळणी चालू आहे...",
    loginBtn: "डॅशबोर्डवर जा",
    
    // Common Dashboard Labels
    logout: "लॉग आउट",
    dashboard: "डॅशबोर्ड",
    reports: "अहवाल",
    analytics: "विश्लेषण",
    hotspotMap: "हॉटस्पॉट नकाशा",
    verifyEvidence: "पुरावा अखंडता",
    
    // Dashboard Panel
    totalReports: "एकूण अहवाल",
    highRisk: "उच्च जोखीम अहवाल",
    mediumRisk: "मध्यम जोखीम अहवाल",
    lowRisk: "कमी जोखीम अहवाल",
    recentReports: "नुकतेच सादर केलेले अहवाल",
    viewAll: "सर्व पहा",
    noReports: "प्रणालीमध्ये कोणतेही अहवाल आढळले नाहीत.",
    
    // Filter
    filterTitle: "अहवाल फिल्टर करा",
    allTypes: "सर्व श्रेणी",
    allRisks: "सर्व जोखीम पातळी",
    searchLoc: "ठिकाण शोधा...",
    clearFilters: "फिल्टर रिसेट करा",
    
    // Report table/cards
    refId: "संदर्भ आयडी",
    category: "श्रेणी",
    risk: "जोखीम पातळी",
    priority: "प्राधान्य",
    dateSubmitted: "सादर तारीख",
    actions: "कृती",
    viewDetails: "तपशील पहा",
    
    // Details
    reportDetails: "अहवाल तपशील",
    backToList: "यादीवर परत जा",
    evidenceVerificationStatus: "पुरावा हॅशिंग स्थिती",
    evidenceFile: "पुरावा फाईल",
    storedHash: "साठवलेला SHA-256 हॅश",
    noEvidence: "या घटनेसाठी कोणताही पुरावा अपलोड केलेला नाही.",
    verifyIntegrity: "पुरावा अखंडता तपासा",
    
    // Verification tool
    verifyTitle: "पुरावा अखंडता पडताळणी",
    verifySubtitle: "मूळ पुरावा फाईल पुन्हा अपलोड करा जेणेकरून तिचा SHA-256 हॅश पुन्हा मोजला जाईल आणि साठवलेल्या हॅशशी जुळवून पाहिला जाईल.",
    selectReport: "अहवाल निवडा",
    reuploadFile: "पडताळण्यासाठी फाईल अपलोड करा",
    checkBtn: "फाईल पडताळणी करा",
    validMsg: "पुरावा वैध आहे (Evidence Valid)",
    validSub: "अपलोड केलेली फाईल मूळ हॅशशी जुळते. फाईलमध्ये कोणताही बदल झालेला नाही.",
    modifiedMsg: "पुराव्यामध्ये बदल झाला आहे (Evidence Modified)",
    modifiedSub: "अपलोड केलेली फाईल मूळ हॅशशी जुळत नाही! फाईलमध्ये बदल (tamper) करण्यात आला आहे.",
    calcHashLabel: "पुन्हा मोजलेला हॅश"
  },
  hi: {
    appName: "सुरक्षितकवच",
    appSubName: "अनाम घटना रिपोर्टिंग",
    homeTitle: "सुरक्षित और अनाम घटना रिपोर्टिंग प्रणाली",
    homeSubtitle: "अपनी पहचान बताए बिना घटना का विवरण और सबूत सबमिट करें। AI-आधारित विश्लेषण और SHA-256 हैशिंग द्वारा सुरक्षित।",
    reportBtn: "अनाम रूप से रिपोर्ट दर्ज करें",
    adminBtn: "एडमिन पोर्टल",
    languageSelect: "भाषा",
    
    // Form fields
    incidentType: "घटना का प्रकार",
    selectIncidentType: "घटना का प्रकार चुनें",
    description: "घटना का विस्तृत विवरण",
    descriptionPlaceholder: "क्या हुआ था इसका विस्तृत विवरण प्रदान करें। आप अपनी पसंदीदा भाषा में लिख सकते हैं...",
    location: "स्थान",
    locationPlaceholder: "शहर, क्षेत्र या निर्देशांक (जैसे पुणे, या 18.52, 73.85)",
    date: "घटना की तारीख",
    time: "घटना का समय",
    evidence: "सबूत अपलोड करें",
    evidenceHelp: "फोटो, वीडियो या पीडीएफ फाइल अपलोड करें। अधिकतम सीमा: 10 एमबी।",
    submitBtn: "सुरक्षित रिपोर्ट सबमिट करें",
    submitting: "रिपोर्ट पर कार्रवाई और हैश तैयार हो रहा है...",
    
    // Categories
    catHarassment: "उत्पीड़न (Harassment)",
    catDomestic: "घरेलू हिंसा (Domestic Violence)",
    catCyber: "साइबर अपराध (Cyber Abuse)",
    catStalking: "पीछा करना (Stalking)",
    catTheft: "चोरी / डकैती",
    catViolence: "शारीरिक हमला / हिंसा",
    catOther: "अन्य घटना",

    // Success Page
    successTitle: "घटना सफलतापूर्वक दर्ज की गई",
    successSubtitle: "आपकी गोपनीयता पूरी तरह सुरक्षित है। आपकी रिपोर्ट डेटाबेस में सहेज ली गई है.",
    refIdLabel: "आपका सुरक्षित संदर्भ आईडी",
    refIdWarning: "महत्वपूर्ण: इस संदर्भ आईडी को सहेजें। भविष्य में सबूतों की सत्यता जांचने के लिए इसकी आवश्यकता होगी। इसे दोबारा नहीं पाया जा सकता।",
    copyBtn: "संदर्भ आईडी कॉपी करें",
    copied: "कॉपी किया गया!",
    newReportBtn: "एक और रिपोर्ट सबमिट करें",
    
    // Login
    loginTitle: "एडमिन पोर्टल लॉगिन",
    loginSubtitle: "रिपोर्ट प्रबंधित करने के लिए क्रेडेंशियल्स के साथ साइन इन करें।",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "admin@report.com",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "••••••••",
    signingIn: "सत्यापन चल रहा है...",
    loginBtn: "डैशबोर्ड पर जाएं",
    
    // Common Dashboard Labels
    logout: "लॉग आउट",
    dashboard: "डैशबोर्ड",
    reports: "रिपोर्ट्स",
    analytics: "विश्लेषण",
    hotspotMap: "हॉटस्पॉट मानचित्र",
    verifyEvidence: "सबूत अखंडता",
    
    // Dashboard Panel
    totalReports: "कुल रिपोर्ट्स",
    highRisk: "उच्च जोखिम रिपोर्ट",
    mediumRisk: "मध्यम जोखिम रिपोर्ट",
    lowRisk: "कम जोखिम रिपोर्ट",
    recentReports: "हाल ही में सबमिट की गई रिपोर्ट्स",
    viewAll: "सभी देखें",
    noReports: "सिस्टम में कोई रिपोर्ट नहीं मिली।",
    
    // Filter
    filterTitle: "रिपोर्ट फ़िल्टर करें",
    allTypes: "सभी श्रेणियां",
    allRisks: "सभी जोखिम स्तर",
    searchLoc: "स्थान खोजें...",
    clearFilters: "फ़िल्टर रीसेट करें",
    
    // Report table/cards
    refId: "संदर्भ आईडी",
    category: "श्रेणी",
    risk: "जोखिम स्तर",
    priority: "प्राथमिकता",
    dateSubmitted: "जमा करने की तिथि",
    actions: "कार्रवाई",
    viewDetails: "विवरण देखें",
    
    // Details
    reportDetails: "रिपोर्ट विवरण",
    backToList: "सूची पर वापस जाएं",
    evidenceVerificationStatus: "सबूत हैशिंग स्थिति",
    evidenceFile: "सबूत फ़ाइल",
    storedHash: "संग्रहीत SHA-256 हैश",
    noEvidence: "इस घटना के लिए कोई सबूत अपलोड नहीं किया गया है।",
    verifyIntegrity: "सबूत की अखंडता जांचें",
    
    // Verification tool
    verifyTitle: "सबूत अखंडता सत्यापन",
    verifySubtitle: "मूल सबूत फ़ाइल को फिर से अपलोड करें ताकि उसके SHA-256 हैश की गणना की जा सके और संग्रहीत हैश से मिलान किया जा सके।",
    selectReport: "रिपोर्ट चुनें",
    reuploadFile: "सत्यापन के लिए फ़ाइल अपलोड करें",
    checkBtn: "फ़ाइल सत्यापित करें",
    validMsg: "सबूत वैध है (Evidence Valid)",
    validSub: "अपलोड की गई फ़ाइल मूल हैश से पूरी तरह मेल खाती है। कोई बदलाव नहीं पाया गया।",
    modifiedMsg: "सबूत में बदलाव किया गया है (Evidence Modified)",
    modifiedSub: "अपलोड की गई फ़ाइल मूल हैश से मेल नहीं खाती! फ़ाइल के साथ छेड़छाड़ की गई है।",
    calcHashLabel: "पुनः परिकलित हैश"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || "en";
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("appLanguage", lang);
  };

  const t = (key) => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
