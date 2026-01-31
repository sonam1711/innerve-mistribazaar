import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'bn' | 'gu' | 'pa'

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations for 10 Indian languages
const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.jobs': 'Jobs',
    'nav.createJob': 'Post Job',
    'nav.bids': 'My Bids',
    'nav.myJobs': 'My Jobs',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    
    // Job statuses
    'status.open': 'Open',
    'status.inProgress': 'In Progress',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    
    // Roles
    'role.consumer': 'Job Poster',
    'role.contractor': 'Contractor',
    'role.trader': 'Trader/Supplier',
    'role.mistri': 'Mistri/Skilled Worker',
    
    // Job listing
    'jobs.title': 'Available Jobs',
    'jobs.nearYou': 'Jobs Near You',
    'jobs.detectLocation': 'Detect My Location',
    'jobs.budget': 'Budget',
    'jobs.distance': 'Distance',
    'jobs.viewDetails': 'View Details',
    'jobs.noBids': 'No bids yet',
    'jobs.bids': 'bids',
    
    // Create job
    'createJob.title': 'Post a New Job',
    'createJob.subtitle': 'Fill in the details for your construction project',
    'createJob.jobTitle': 'Job Title',
    'createJob.description': 'Description',
    'createJob.category': 'Category',
    'createJob.jobType': 'Job Type',
    'createJob.minBudget': 'Minimum Budget',
    'createJob.maxBudget': 'Maximum Budget',
    'createJob.address': 'Address',
    'createJob.locationCoords': 'Location Coordinates',
    'createJob.detectGPS': 'Detect GPS',
    'createJob.create': 'Create Job',
    
    // Bids
    'bids.title': 'My Bids',
    'bids.submitBid': 'Submit Bid',
    'bids.bidAmount': 'Bid Amount',
    'bids.estimatedDays': 'Estimated Days',
    'bids.message': 'Message',
    'bids.pending': 'Pending',
    'bids.accepted': 'Accepted',
    'bids.rejected': 'Rejected',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.name': 'Name',
    'profile.phone': 'Phone',
    'profile.role': 'Role',
    'profile.language': 'Language',
    'profile.rating': 'Rating',
    'profile.location': 'Location',
    'profile.update': 'Update Profile',
  },
  
  hi: {
    // Navigation (Hindi)
    'nav.dashboard': 'डैशबोर्ड',
    'nav.jobs': 'नौकरियां',
    'nav.createJob': 'नौकरी पोस्ट करें',
    'nav.bids': 'मेरी बोलियां',
    'nav.myJobs': 'मेरी नौकरियां',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.logout': 'लॉग आउट',
    
    'common.loading': 'लोड हो रहा है...',
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.close': 'बंद करें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    
    'status.open': 'खुला',
    'status.inProgress': 'प्रगति में',
    'status.completed': 'पूर्ण',
    'status.cancelled': 'रद्द',
    
    'role.consumer': 'नौकरी पोस्टर',
    'role.contractor': 'ठेकेदार',
    'role.trader': 'व्यापारी/आपूर्तिकर्ता',
    'role.mistri': 'मिस्त्री/कुशल कामगार',
    
    'jobs.title': 'उपलब्ध नौकरियां',
    'jobs.nearYou': 'आपके पास की नौकरियां',
    'jobs.detectLocation': 'मेरा स्थान पता करें',
    'jobs.budget': 'बजट',
    'jobs.distance': 'दूरी',
    'jobs.viewDetails': 'विवरण देखें',
    'jobs.noBids': 'अभी तक कोई बोली नहीं',
    'jobs.bids': 'बोलियां',
    
    'createJob.title': 'नई नौकरी पोस्ट करें',
    'createJob.subtitle': 'अपनी निर्माण परियोजना का विवरण भरें',
    'createJob.jobTitle': 'नौकरी का शीर्षक',
    'createJob.description': 'विवरण',
    'createJob.category': 'श्रेणी',
    'createJob.jobType': 'नौकरी का प्रकार',
    'createJob.minBudget': 'न्यूनतम बजट',
    'createJob.maxBudget': 'अधिकतम बजट',
    'createJob.address': 'पता',
    'createJob.locationCoords': 'स्थान निर्देशांक',
    'createJob.detectGPS': 'GPS पता करें',
    'createJob.create': 'नौकरी बनाएं',
    
    'bids.title': 'मेरी बोलियां',
    'bids.submitBid': 'बोली जमा करें',
    'bids.bidAmount': 'बोली राशि',
    'bids.estimatedDays': 'अनुमानित दिन',
    'bids.message': 'संदेश',
    'bids.pending': 'लंबित',
    'bids.accepted': 'स्वीकृत',
    'bids.rejected': 'अस्वीकृत',
    
    'profile.title': 'मेरी प्रोफ़ाइल',
    'profile.name': 'नाम',
    'profile.phone': 'फोन',
    'profile.role': 'भूमिका',
    'profile.language': 'भाषा',
    'profile.rating': 'रेटिंग',
    'profile.location': 'स्थान',
    'profile.update': 'प्रोफ़ाइल अपडेट करें',
  },
  
  ta: {
    // Tamil
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.jobs': 'வேலைகள்',
    'nav.createJob': 'வேலை இடுக',
    'nav.bids': 'எனது ஏலங்கள்',
    'nav.myJobs': 'எனது வேலைகள்',
    'nav.profile': 'சுயவிவரம்',
    'nav.logout': 'வெளியேறு',
    
    'common.loading': 'ஏற்றுகிறது...',
    'common.submit': 'சமர்ப்பிக்கவும்',
    'common.cancel': 'ரத்து செய்',
    'common.save': 'சேமி',
    'common.edit': 'திருத்து',
    'common.delete': 'நீக்கு',
    'common.close': 'மூடு',
    'common.search': 'தேடு',
    'common.filter': 'வடிகட்டு',
    
    'status.open': 'திறந்த',
    'status.inProgress': 'முன்னேற்றத்தில்',
    'status.completed': 'நிறைவு',
    'status.cancelled': 'ரத்து',
    
    'role.consumer': 'வேலை இடுபவர்',
    'role.contractor': 'ஒப்பந்தக்காரர்',
    'role.trader': 'வர்த்தகர்/விநியோகஸ்தர்',
    'role.mistri': 'மிஸ்திரி/திறமையான தொழிலாளி',
    
    'jobs.title': 'கிடைக்கும் வேலைகள்',
    'jobs.nearYou': 'உங்களுக்கு அருகில் உள்ள வேலைகள்',
    'jobs.detectLocation': 'எனது இருப்பிடத்தைக் கண்டறியவும்',
    'jobs.budget': 'வரவு செலவு திட்டம்',
    'jobs.distance': 'தூரம்',
    'jobs.viewDetails': 'விவரங்களைக் காண்க',
    'jobs.noBids': 'இன்னும் ஏலங்கள் இல்லை',
    'jobs.bids': 'ஏலங்கள்',
    
    'createJob.title': 'புதிய வேலையை இடுங்கள்',
    'createJob.subtitle': 'உங்கள் கட்டுமான திட்டத்தின் விவரங்களை நிரப்பவும்',
    'createJob.jobTitle': 'வேலை தலைப்பு',
    'createJob.description': 'விளக்கம்',
    'createJob.category': 'வகை',
    'createJob.jobType': 'வேலை வகை',
    'createJob.minBudget': 'குறைந்தபட்ச பட்ஜெட்',
    'createJob.maxBudget': 'அதிகபட்ச பட்ஜெட்',
    'createJob.address': 'முகவரி',
    'createJob.locationCoords': 'இருப்பிட ஒருங்கிணைப்புகள்',
    'createJob.detectGPS': 'GPS கண்டறியவும்',
    'createJob.create': 'வேலையை உருவாக்கவும்',
    
    'bids.title': 'எனது ஏலங்கள்',
    'bids.submitBid': 'ஏலத்தை சமர்ப்பிக்கவும்',
    'bids.bidAmount': 'ஏல தொகை',
    'bids.estimatedDays': 'மதிப்பிடப்பட்ட நாட்கள்',
    'bids.message': 'செய்தி',
    'bids.pending': 'நிலுவையில்',
    'bids.accepted': 'ஏற்றுக்கொள்ளப்பட்டது',
    'bids.rejected': 'நிராகரிக்கப்பட்டது',
    
    'profile.title': 'எனது சுயவிவரம்',
    'profile.name': 'பெயர்',
    'profile.phone': 'தொலைபேசி',
    'profile.role': 'பங்கு',
    'profile.language': 'மொழி',
    'profile.rating': 'மதிப்பீடு',
    'profile.location': 'இருப்பிடம்',
    'profile.update': 'சுயவிவரத்தைப் புதுப்பிக்கவும்',
  },
  
  // Add other languages similarly (te, kn, ml, mr, bn, gu, pa)
  te: { 'nav.dashboard': 'డాష్‌బోర్డ్', 'nav.jobs': 'ఉద్యోగాలు', 'nav.createJob': 'ఉద్యోగం పోస్ట్ చేయండి', 'common.loading': 'లోడ్ అవుతోంది...', 'common.submit': 'సమర్పించండి', 'common.cancel': 'రద్దు చేయండి' },
  kn: { 'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'nav.jobs': 'ಉದ್ಯೋಗಗಳು', 'nav.createJob': 'ಉದ್ಯೋಗ ಪೋಸ್ಟ್ ಮಾಡಿ', 'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', 'common.submit': 'ಸಲ್ಲಿಸಿ', 'common.cancel': 'ರದ್ದುಮಾಡಿ' },
  ml: { 'nav.dashboard': 'ഡാഷ്ബോർഡ്', 'nav.jobs': 'ജോലികൾ', 'nav.createJob': 'ജോലി പോസ്റ്റ് ചെയ്യുക', 'common.loading': 'ലോഡ് ചെയ്യുന്നു...', 'common.submit': 'സമർപ്പിക്കുക', 'common.cancel': 'റദ്ദാക്കുക' },
  mr: { 'nav.dashboard': 'डॅशबोर्ड', 'nav.jobs': 'नोकऱ्या', 'nav.createJob': 'नोकरी पोस्ट करा', 'common.loading': 'लोड होत आहे...', 'common.submit': 'सबमिट करा', 'common.cancel': 'रद्द करा' },
  bn: { 'nav.dashboard': 'ড্যাশবোর্ড', 'nav.jobs': 'চাকরি', 'nav.createJob': 'চাকরি পোস্ট করুন', 'common.loading': 'লোড হচ্ছে...', 'common.submit': 'জমা দিন', 'common.cancel': 'বাতিল করুন' },
  gu: { 'nav.dashboard': 'ડેશબોર્ડ', 'nav.jobs': 'નોકરીઓ', 'nav.createJob': 'નોકરી પોસ્ટ કરો', 'common.loading': 'લોડ થઈ રહ્યું છે...', 'common.submit': 'સબમિટ કરો', 'common.cancel': 'રદ કરો' },
  pa: { 'nav.dashboard': 'ਡੈਸ਼ਬੋਰਡ', 'nav.jobs': 'ਨੌਕਰੀਆਂ', 'nav.createJob': 'ਨੌਕਰੀ ਪੋਸਟ ਕਰੋ', 'common.loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...', 'common.submit': 'ਜਮ੍ਹਾਂ ਕਰੋ', 'common.cancel': 'ਰੱਦ ਕਰੋ' },
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStore()
  const [language, setLanguageState] = useState<LanguageCode>('en')

  // Initialize language from user profile
  useEffect(() => {
    if (user?.language) {
      const langCode = user.language.toLowerCase().slice(0, 2) as LanguageCode
      if (translations[langCode]) {
        setLanguageState(langCode)
      }
    }
  }, [user])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    // Optionally update backend user language preference here
  }

  const t = (key: string): string => {
    const translation = translations[language]?.[key]
    if (translation) return translation
    
    // Fallback to English
    return translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
