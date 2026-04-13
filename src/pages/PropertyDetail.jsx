import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyDetail } from '../data/properties';
import { useAuth } from '../context/AuthContext';
import ScheduleVisitModal from '../components/ScheduleVisitModal';
import './PropertyDetail.css';

// Auto-detect time of day
function detectTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 19) return 'evening';
  return 'night';
}

const TIME_CONFIG = {
  morning: {
    label: 'Morning',
    emoji: '☀️',
    filter: 'brightness(1.12) saturate(1.2) sepia(0.07)',
    overlay: 'rgba(255, 210, 80, 0.13)',
    glow: '#f59e0b',
    sky: 'linear-gradient(180deg, rgba(255,200,60,0.18) 0%, transparent 60%)',
    badge: 'Golden Hour',
    badgeColor: '#f59e0b',
  },
  evening: {
    label: 'Evening',
    emoji: '🌆',
    filter: 'brightness(0.82) saturate(1.4) sepia(0.22)',
    overlay: 'rgba(255, 100, 20, 0.22)',
    glow: '#ef4444',
    sky: 'linear-gradient(180deg, rgba(255,80,20,0.28) 0%, rgba(180,40,80,0.1) 60%, transparent 100%)',
    badge: 'Sunset View',
    badgeColor: '#ef4444',
  },
  night: {
    label: 'Night',
    emoji: '🌙',
    filter: 'brightness(0.44) saturate(0.62) hue-rotate(195deg)',
    overlay: 'rgba(15, 25, 80, 0.38)',
    glow: '#6366f1',
    sky: 'linear-gradient(180deg, rgba(30,20,100,0.45) 0%, rgba(10,10,60,0.2) 60%, transparent 100%)',
    badge: 'Night View',
    badgeColor: '#818cf8',
  },
};

// ── Voice Guided Tour ──────────────────────────
function buildTourScript(p, lang = 'en') {
  const dev         = p.developer || 'a reputed developer';
  const amenityList = (p.amenities || []).slice(0, 3).join(lang === 'hi' ? ', ' : ', ');
  const nearbyEn    = (p.nearby || []).slice(0, 2).map(n => n.name).join(' and ');
  const nearbyHi    = (p.nearby || []).slice(0, 2).map(n => n.name).join(' और ');
  const bhk         = p.bedrooms > 0 ? `${p.bedrooms} BHK` : '';

  if (lang === 'hi') {
    return [
      {
        step: 1, icon: '👋', title: 'स्वागत', section: null,
        text: `${p.name} में आपका हार्दिक स्वागत है। यह एक शानदार ${p.type} है, जो ${p.location}, गुरुग्राम में स्थित है। इस प्रॉपर्टी को ${dev} ने तैयार किया है।`,
      },
      {
        step: 2, icon: '🏠', title: 'रहने की जगह', section: 'overview',
        text: `${p.area} में फैला यह ${bhk} ${p.type}, ${p.facing || 'पूर्व'} दिशा की ओर है। यह ${p.floors || 'कई'} मंज़िलों पर बना है और इसमें ${p.parking || '2'} कवर्ड पार्किंग की सुविधा है।`,
      },
      {
        step: 3, icon: '🏊', title: 'सुविधाएं', section: 'amenities',
        text: `इस प्रॉपर्टी में विश्वस्तरीय सुविधाएं हैं, जिनमें ${amenityList || 'स्विमिंग पूल, जिम और लैंडस्केप्ड गार्डन'} शामिल हैं। यहां का जीवन किसी शानदार रिसोर्ट से कम नहीं होगा।`,
      },
      {
        step: 4, icon: '📍', title: 'स्थान', section: 'location',
        text: `${p.sector}, ${p.city} में स्थित यह प्रॉपर्टी सभी प्रमुख स्थानों से अच्छी तरह जुड़ी हुई है। ${nearbyHi || 'आईटी हब, स्कूल और अस्पताल'} यहां से बिल्कुल करीब हैं।`,
      },
      {
        step: 5, icon: '💰', title: 'निवेश', section: 'nearby',
        text: `इस प्रॉपर्टी की कीमत ${p.priceDisplay} है। इसका इन्वेस्टमेंट स्कोर 100 में से ${p.investmentScore} है, और हर साल करीब ${p.appreciationRate} प्रतिशत की बढ़ोतरी का अनुमान है। यह सच में एक समझदारी भरा निवेश है।`,
      },
      {
        step: 6, icon: '🙏', title: 'विजिट बुक करें', section: 'emi',
        text: `${p.name} का यह वर्चुअल टूर देखने के लिए आपका बहुत-बहुत धन्यवाद। साइट विजिट बुक करने या कीमत और लोन की जानकारी के लिए आज ही हमसे संपर्क करें। हम आपका इंतज़ार कर रहे हैं।`,
      },
    ];
  }

  // English (default)
  return [
    {
      step: 1, icon: '👋', title: 'Welcome', section: null,
      text: `Welcome to ${p.name}. A stunning ${p.type} located in ${p.location}, Gurgaon. This property is brought to you by ${dev}.`,
    },
    {
      step: 2, icon: '🏠', title: 'Living Space', section: 'overview',
      text: `Spread across ${p.area}, this ${bhk} ${p.type} offers ${p.facing || 'east'}-facing orientation across ${p.floors || 'multiple'} floors, with ${p.parking || '2'} covered parking spots.`,
    },
    {
      step: 3, icon: '🏊', title: 'World-Class Amenities', section: 'amenities',
      text: `The property comes loaded with premium amenities, including ${amenityList || 'swimming pool, gym, and landscaped gardens'}, ensuring a resort-style lifestyle every single day.`,
    },
    {
      step: 4, icon: '📍', title: 'Prime Location', section: 'location',
      text: `Situated in ${p.sector}, ${p.city}, you have seamless connectivity to key landmarks. Within close proximity are ${nearbyEn || 'major IT hubs, schools, and hospitals'}.`,
    },
    {
      step: 5, icon: '💰', title: 'Investment Potential', section: 'nearby',
      text: `Priced at ${p.priceDisplay}, this property holds an investment score of ${p.investmentScore} out of 100, with an estimated appreciation of ${p.appreciationRate} percent per annum. A truly smart investment.`,
    },
    {
      step: 6, icon: '🙏', title: 'Book Your Visit', section: 'emi',
      text: `Thank you for experiencing this virtual tour of ${p.name}. To schedule a personal site visit, or for pricing and loan details, please contact our team today. We look forward to welcoming you.`,
    },
  ];
}

// ── Live Area Feel Data Engine ─────────────────
const AREA_PROFILES = {
  // High-density commercial/luxury zones
  'Cyber City':        { traffic: 88, noise: 82, crowd: 85, green: 30, safety: 80 },
  'MG Road':           { traffic: 85, noise: 80, crowd: 82, green: 25, safety: 75 },
  'Udyog Vihar':       { traffic: 80, noise: 75, crowd: 75, green: 28, safety: 78 },
  'Golf Course Road':  { traffic: 72, noise: 52, crowd: 65, green: 60, safety: 88 },
  // Premium residential
  'Sector 42':         { traffic: 68, noise: 45, crowd: 55, green: 65, safety: 90 },
  'Sector 43':         { traffic: 65, noise: 42, crowd: 52, green: 68, safety: 90 },
  'Sector 57':         { traffic: 62, noise: 48, crowd: 58, green: 62, safety: 85 },
  'Sector 65':         { traffic: 66, noise: 50, crowd: 60, green: 58, safety: 85 },
  'Sector 66':         { traffic: 60, noise: 46, crowd: 55, green: 60, safety: 84 },
  'Sector 67':         { traffic: 58, noise: 44, crowd: 52, green: 62, safety: 85 },
  // Sohna Road belt
  'Sector 49':         { traffic: 58, noise: 50, crowd: 55, green: 55, safety: 82 },
  // New Gurgaon (quieter, developing)
  'Sector 82':         { traffic: 38, noise: 32, crowd: 35, green: 72, safety: 80 },
  'Sector 83':         { traffic: 35, noise: 30, crowd: 33, green: 74, safety: 80 },
  'Sector 84':         { traffic: 32, noise: 28, crowd: 30, green: 76, safety: 82 },
  'Sector 85':         { traffic: 30, noise: 26, crowd: 28, green: 78, safety: 82 },
  'Sector 86':         { traffic: 28, noise: 24, crowd: 26, green: 80, safety: 83 },
  'Sector 102':        { traffic: 25, noise: 22, crowd: 24, green: 82, safety: 84 },
  'Sector 103':        { traffic: 22, noise: 20, crowd: 22, green: 84, safety: 85 },
  'Sohna Road':        { traffic: 55, noise: 48, crowd: 52, green: 58, safety: 82 },
};

const TOD_MULTIPLIERS = {
  morning: { traffic: 1.30, noise: 0.85, crowd: 1.10 },
  evening: { traffic: 1.50, noise: 1.25, crowd: 1.35 },
  night:   { traffic: 0.28, noise: 0.40, crowd: 0.30 },
};

function getAreaFeel(sector, timeOfDay) {
  const base = AREA_PROFILES[sector] || { traffic: 50, noise: 45, crowd: 48, green: 55, safety: 80 };
  const m = TOD_MULTIPLIERS[timeOfDay] || TOD_MULTIPLIERS.evening;
  const clamp = (v) => Math.min(98, Math.max(4, Math.round(v)));
  return {
    traffic: clamp(base.traffic * m.traffic),
    noise:   clamp(base.noise   * m.noise),
    crowd:   clamp(base.crowd   * m.crowd),
    green:   base.green,
    safety:  base.safety,
  };
}

function areaLabel(val, low, mid, high) {
  if (val <= low)  return { text: 'Low',      color: '#22c55e' };
  if (val <= mid)  return { text: 'Moderate', color: '#f59e0b' };
  if (val <= high) return { text: 'High',     color: '#ef4444' };
  return                    { text: 'Very High', color: '#dc2626' };
}
function invertLabel(val) {
  if (val >= 78) return { text: 'Excellent', color: '#22c55e' };
  if (val >= 60) return { text: 'Good',      color: '#4ade80' };
  if (val >= 42) return { text: 'Moderate',  color: '#f59e0b' };
  return                 { text: 'Low',       color: '#ef4444' };
}

// ── EMI calculation
function calcEMI(principal, annualRate, tenureYears) {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function formatINR(val) {
  if (val >= 1e7) return '₹' + (val / 1e7).toFixed(2) + ' Cr';
  if (val >= 1e5) return '₹' + (val / 1e5).toFixed(1) + ' L';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

const SECTIONS = ['overview', 'amenities', 'location', 'nearby', 'emi'];

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Try static DB first; if not found try server (builder-listed properties)
  const staticProperty = getPropertyDetail(id);
  const [serverProperty, setServerProperty] = useState(null);
  const [serverLoading, setServerLoading] = useState(!staticProperty);

  useEffect(() => {
    if (!staticProperty) {
      setServerLoading(true);
      Promise.all([
        fetch('/api/admin/properties').then(r => r.json()).catch(() => []),
        fetch('/api/admin/pending-properties').then(r => r.json()).catch(() => []),
      ]).then(([live, pending]) => {
        const all = [...(Array.isArray(live) ? live : []), ...(Array.isArray(pending) ? pending : [])];
        const found = all.find(p => String(p.id) === String(id));
        if (found) {
          // Build a compatible property object from server data
          setServerProperty({
            ...found,
            priceDisplay: found.priceDisplay || `₹${found.price} Cr`,
            images: Array.isArray(found.photos) && found.photos.length > 0
              ? found.photos
              : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&h=800&fit=crop&q=80'],
            amenities: Array.isArray(found.amenities) && found.amenities.length > 0
              ? found.amenities
              : ['Club House', 'Swimming Pool', 'Gymnasium', 'Parking', '24x7 Security'],
            nearby: found.nearby || [
              { icon: '🚇', label: 'Metro', name: 'Nearest Metro', dist: '~2 km' },
              { icon: '🏥', label: 'Hospital', name: 'Nearest Hospital', dist: '~3 km' },
            ],
            overview: found.description || `Premium ${found.type} in ${found.location}. Listed by ${found.developer || 'verified developer'}.`,
            floors: found.floors || 'G+20',
            parking: found.parking || '2 Covered',
            facing: found.facing || 'East',
            possession: found.possession || found.status,
            rera: found.rera || 'Applied',
            appreciationRate: found.price >= 5 ? 12 : 10,
            investmentScore: Math.min(95, Math.round(60 + found.price * 2)),
            emi: null,
          });
        }
        setServerLoading(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const property = staticProperty || serverProperty;

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [slide, setSlide]         = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [timeOfDay, setTimeOfDay]   = useState(detectTimeOfDay);
  const [barAnimated, setBarAnimated] = useState(false);
  const [tourActive, setTourActive]   = useState(false);
  const [tourStep,   setTourStep]     = useState(0);
  const [tourSpeaking, setTourSpeaking] = useState(false);
  const [tourPaused,   setTourPaused]   = useState(false);
  const [tourLang,     setTourLang]     = useState('en');
  const speechRef = useRef(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [stickyBar, setStickyBar] = useState(false);
  const [loanPct, setLoanPct]     = useState(80);
  const [rate, setRate]           = useState(8.5);
  const [tenure, setTenure]       = useState(20);
  const [predYear, setPredYear]   = useState(3);
  const [shareToast, setShareToast] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const sectionRefs = {
    overview:  useRef(null),
    amenities: useRef(null),
    location:  useRef(null),
    nearby:    useRef(null),
    emi:       useRef(null),
  };
  const heroRef = useRef(null);

  // Sticky bar on scroll
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        setStickyBar(window.scrollY > heroRef.current.offsetHeight - 80);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Section highlight on scroll
  useEffect(() => {
    const onScroll = () => {
      let current = 'overview';
      for (const key of SECTIONS) {
        const el = sectionRefs[key].current;
        if (el && window.scrollY >= el.offsetTop - 120) current = key;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard slider
  useEffect(() => {
    const onKey = (e) => {
      if (!fullscreen) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft')  prevSlide();
      if (e.key === 'Escape')     setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, slide]);

  // Animate area feel bars on mount + when TOD changes
  useEffect(() => {
    setBarAnimated(false);
    const t = setTimeout(() => setBarAnimated(true), 120);
    return () => clearTimeout(t);
  }, [timeOfDay]);

  // ── Tour engine ──
  const tourScript = property ? buildTourScript(property, tourLang) : [];

  const stopTour = useCallback(() => {
    window.speechSynthesis?.cancel();
    setTourActive(false);
    setTourStep(0);
    setTourSpeaking(false);
    setTourPaused(false);
  }, []);

  const speakStep = useCallback((stepIdx, lang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const script = buildTourScript(property, lang);
    const step   = script[stepIdx];
    if (!step) { stopTour(); return; }

    // Scroll to section
    if (step.section && sectionRefs[step.section]?.current) {
      setTimeout(() => {
        sectionRefs[step.section].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }

    const utter  = new SpeechSynthesisUtterance(step.text);
    utter.rate   = lang === 'hi' ? 0.88 : 0.92;
    utter.pitch  = 1.05;
    utter.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'hi') {
      const hiVoice = voices.find(v => v.lang.startsWith('hi')) ||
                      voices.find(v => v.lang.includes('hi'));
      if (hiVoice) utter.voice = hiVoice;
      utter.lang = 'hi-IN';
    } else {
      const enVoice = voices.find(v =>
        v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
      ) || voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utter.voice = enVoice;
      utter.lang = 'en-IN';
    }

    utter.onstart = () => setTourSpeaking(true);
    utter.onend   = () => {
      setTourSpeaking(false);
      const next = stepIdx + 1;
      if (next < script.length) {
        setTourStep(next);
        setTimeout(() => speakStep(next, lang), 600);
      } else {
        stopTour();
      }
    };
    utter.onerror = () => setTourSpeaking(false);

    speechRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [property, stopTour]);

  const startTour = useCallback(() => {
    setTourActive(true);
    setTourStep(0);
    setTourPaused(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => speakStep(0, tourLang), 500);
  }, [speakStep, tourLang]);

  const pauseResumeTour = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (tourPaused) {
      window.speechSynthesis.resume();
      setTourPaused(false);
      setTourSpeaking(true);
    } else {
      window.speechSynthesis.pause();
      setTourPaused(true);
      setTourSpeaking(false);
    }
  }, [tourPaused]);

  const goTourStep = useCallback((idx, lang) => {
    window.speechSynthesis?.cancel();
    setTourStep(idx);
    setTourPaused(false);
    setTimeout(() => speakStep(idx, lang ?? tourLang), 200);
  }, [speakStep, tourLang]);

  const switchLang = useCallback((newLang) => {
    setTourLang(newLang);
    if (tourActive) {
      window.speechSynthesis?.cancel();
      setTourPaused(false);
      setTimeout(() => speakStep(tourStep, newLang), 200);
    }
  }, [tourActive, tourStep, speakStep]);

  // Cleanup on unmount
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const nextSlide = useCallback(() => setSlide(s => (s + 1) % (property?.images?.length || 1)), [property]);
  const prevSlide = useCallback(() => setSlide(s => (s - 1 + (property?.images?.length || 1)) % (property?.images?.length || 1)), [property]);

  const scrollTo = (key) => {
    sectionRefs[key].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleBookNow = async () => {
    setPayLoading(true);
    try {
      const TOKEN_AMOUNT = Math.min(Math.round(property.price * 1e7 * 0.02), 25000);
      const tokenDisplay = TOKEN_AMOUNT >= 1e5
        ? '₹' + (TOKEN_AMOUNT / 1e5).toFixed(1) + ' L'
        : '₹' + TOKEN_AMOUNT.toLocaleString('en-IN');

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: TOKEN_AMOUNT,
          currency: 'INR',
          propertyId: property.id,
          propertyName: property.name,
          userName: user?.name || '',
          userEmail: user?.email || '',
          userPhone: user?.phone || '',
        }),
      });
      const data = await res.json();
      // If Razorpay order fails (keys not configured), fall back to direct booking
      if (!data.success || !data.order?.id) {
        const fbRes = await fetch('/api/payment/dev-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: property.id, propertyName: property.name,
            propertyPrice: property.price, tokenAmount: TOKEN_AMOUNT,
            userName: user?.name || '', userEmail: user?.email || '', userPhone: user?.phone || '',
          }),
        });
        const fbData = await fbRes.json();
        if (fbData.success) { setPaySuccess(true); setTimeout(() => setPaySuccess(false), 6000); }
        else throw new Error(fbData.error || 'Booking failed');
        setPayLoading(false); return;
      }

      const options = {
        key: 'rzp_test_SYUruOfFcgX4xH',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Vertex Living',
        description: `Token Booking – ${property.name}`,
        image: '/vite.svg',
        order_id: data.order.id,
        handler: async (response) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              propertyId: property.id,
              propertyName: property.name,
              propertyPrice: property.price,
              tokenAmount: TOKEN_AMOUNT,
              userName: user?.name || '',
              userEmail: user?.email || '',
              userPhone: user?.phone || '',
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPaySuccess(true);
            setTimeout(() => setPaySuccess(false), 6000);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: { method: 'card' },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => setPayLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        const reason = resp?.error?.description || 'Payment failed. Please try again.';
        alert(reason);
        setPayLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('[Payment]', err);
      alert('Error: ' + (err.message || 'Something went wrong. Please try again.'));
    } finally {
      setPayLoading(false);
    }
  };

  // Token amount display helper (capped at ₹10K for test mode)
  const tokenAmount = property ? Math.min(Math.round(property.price * 1e7 * 0.02), 25000) : 0;
  const tokenDisplay = tokenAmount >= 1e5
    ? '₹' + (tokenAmount / 1e5).toFixed(1) + ' L'
    : '₹' + tokenAmount.toLocaleString('en-IN');

  if (!property && serverLoading) {
    return (
      <div className="pd-not-found">
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
        <h2>Loading property…</h2>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pd-not-found">
        <h2>Property not found</h2>
        <button onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    );
  }

  // EMI calc
  const loanAmt   = property.price * 1e7 * (loanPct / 100);
  const emi       = calcEMI(loanAmt, rate, tenure);
  const totalPay  = emi * tenure * 12;
  const interest  = totalPay - loanAmt;

  // Price prediction
  const predPrice = property.price * Math.pow(1 + property.appreciationRate / 100, predYear);
  const gain      = predPrice - property.price;

  // Investment score color
  const scoreColor = property.investmentScore >= 80 ? '#22c55e' : property.investmentScore >= 65 ? '#f59e0b' : '#6366f1';

  return (
    <div className="pd-root">

      {/* ── Top Bar ── */}
      <div className="pd-topbar">
        <button className="pd-back" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 7 7m-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div className="pd-topbar-actions">
          <button className="pd-icon-btn" onClick={handleShare} title="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        {shareToast && <div className="pd-share-toast">Link copied!</div>}
      </div>

      {/* ── Image Slider ── */}
      <div className="pd-slider" ref={heroRef}>
        <div
          className={`pd-slider-main pd-tod-${timeOfDay}`}
          onClick={() => setFullscreen(true)}
          style={{ '--tod-filter': TIME_CONFIG[timeOfDay].filter }}
        >
          {property.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${property.name} ${i + 1}`}
              className={`pd-slide-img${i === slide ? ' active' : ''}`}
            />
          ))}

          {/* Sky tint layer */}
          <div className="pd-tod-sky" style={{ background: TIME_CONFIG[timeOfDay].sky }} />

          {/* Color overlay */}
          <div className="pd-tod-overlay" style={{ background: TIME_CONFIG[timeOfDay].overlay }} />

          <div className="pd-slide-overlay" />

          {/* ── Time of Day Toggle ── */}
          <div className="pd-tod-toggle" onClick={e => e.stopPropagation()}>
            <div className="pd-tod-badge" style={{ color: TIME_CONFIG[timeOfDay].badgeColor, borderColor: TIME_CONFIG[timeOfDay].badgeColor }}>
              <span className="pd-tod-badge-dot" style={{ background: TIME_CONFIG[timeOfDay].badgeColor }} />
              {TIME_CONFIG[timeOfDay].badge}
            </div>
            <div className="pd-tod-pills">
              {Object.entries(TIME_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  className={`pd-tod-pill${timeOfDay === key ? ' active' : ''}`}
                  style={timeOfDay === key ? { background: cfg.glow, boxShadow: `0 0 16px ${cfg.glow}55` } : {}}
                  onClick={() => setTimeOfDay(key)}
                  title={cfg.label}
                >
                  <span className="pd-tod-emoji">{cfg.emoji}</span>
                  <span className="pd-tod-pill-label">{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button className="pd-arrow pd-arrow-l" onClick={e => { e.stopPropagation(); prevSlide(); }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="pd-arrow pd-arrow-r" onClick={e => { e.stopPropagation(); nextSlide(); }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Counter */}
          <div className="pd-slide-counter">{slide + 1} / {property.images.length}</div>

          {/* Expand hint */}
          <div className="pd-expand-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            Click to expand
          </div>

          {/* 🎧 Voice Tour Button */}
          {!tourActive && (
            <button
              className="pd-tour-start-btn"
              onClick={e => { e.stopPropagation(); startTour(); }}
            >
              <span className="pd-tour-start-icon">🎧</span>
              <span>Start Voice Tour</span>
              <span className="pd-tour-start-badge">AI</span>
            </button>
          )}
          {tourActive && (
            <button
              className="pd-tour-start-btn pd-tour-live"
              onClick={e => { e.stopPropagation(); stopTour(); }}
            >
              <span className="pd-tour-wave">
                <span /><span /><span /><span /><span />
              </span>
              <span>Tour Live — Stop</span>
            </button>
          )}
        </div>

        {/* Thumbnails */}
        <div className="pd-thumbs">
          {property.images.map((img, i) => (
            <button
              key={i}
              className={`pd-thumb${i === slide ? ' active' : ''}`}
              onClick={() => setSlide(i)}
            >
              <img src={img} alt={`thumb ${i}`} style={{ filter: TIME_CONFIG[timeOfDay].filter, transition: 'filter 0.6s ease' }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Fullscreen Lightbox ── */}
      {fullscreen && (
        <div className="pd-lightbox" onClick={() => setFullscreen(false)}>
          <button className="pd-lb-close" onClick={() => setFullscreen(false)}>✕</button>
          <button className="pd-lb-arrow pd-lb-l" onClick={e => { e.stopPropagation(); prevSlide(); }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <img
            src={property.images[slide]}
            alt="fullscreen"
            className="pd-lb-img"
            style={{ filter: TIME_CONFIG[timeOfDay].filter }}
            onClick={e => e.stopPropagation()}
          />
          <button className="pd-lb-arrow pd-lb-r" onClick={e => { e.stopPropagation(); nextSlide(); }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="pd-lb-counter">{slide + 1} / {property.images.length}</div>
        </div>
      )}

      {/* ── Sticky Price Bar ── */}
      <div className={`pd-sticky-bar${stickyBar ? ' visible' : ''}`}>
        <div className="pd-sticky-inner">
          <div className="pd-sticky-info">
            <span className="pd-sticky-name">{property.name}</span>
            <span className="pd-sticky-price">{property.priceDisplay}</span>
          </div>
          <div className="pd-sticky-emi">
            EMI from <strong>{formatINR(emi)}/mo</strong>
          </div>
          <div className="pd-sticky-actions">
            <button className="pd-sticky-btn-outline" onClick={() => scrollTo('emi')}>EMI Calculator</button>
            <button className="pd-sticky-btn" onClick={() => navigate('/#contact')}>Enquire Now</button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="pd-layout">

        {/* Left Content */}
        <div className="pd-content">

          {/* Title Block */}
          <div className="pd-title-block">
            <div className="pd-tags-row">
              <span className="pd-tag-type">{property.type}</span>
              <span className={`pd-tag-status ${property.status === 'Ready to Move' ? 'ready' : 'uc'}`}>{property.status}</span>
              {property.rera && <span className="pd-tag-rera">RERA</span>}
            </div>
            <h1 className="pd-title">{property.name}</h1>
            <p className="pd-location-line">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>
              {property.location}
            </p>
            <div className="pd-quick-facts">
              {property.bedrooms > 0 && <div className="pd-fact"><span className="pd-fact-val">{property.bedrooms}</span><span className="pd-fact-lbl">BHK</span></div>}
              <div className="pd-fact"><span className="pd-fact-val">{property.area.replace(' sqft','')}</span><span className="pd-fact-lbl">sq.ft</span></div>
              <div className="pd-fact"><span className="pd-fact-val">{property.floors || 'G+20'}</span><span className="pd-fact-lbl">Floors</span></div>
              <div className="pd-fact"><span className="pd-fact-val">{property.parking || '2'}</span><span className="pd-fact-lbl">Parking</span></div>
              <div className="pd-fact"><span className="pd-fact-val">{property.facing || 'East'}</span><span className="pd-fact-lbl">Facing</span></div>
            </div>
          </div>

          {/* Section Nav */}
          <div className="pd-section-nav">
            {SECTIONS.map(s => (
              <button
                key={s}
                className={`pd-snav-btn${activeSection === s ? ' active' : ''}`}
                onClick={() => scrollTo(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          <section ref={sectionRefs.overview} className="pd-section" id="pd-overview">
            <h2 className="pd-section-title">
              <span className="pd-section-icon">🏠</span> Overview
            </h2>
            <p className="pd-overview-text">{property.overview}</p>
            <div className="pd-details-grid">
              {[
                { label: 'Developer',   val: property.developer || 'DLF India' },
                { label: 'Sector',      val: property.sector },
                { label: 'City',        val: property.city },
                { label: 'Area',        val: property.area },
                { label: 'Floors',      val: property.floors || 'G+20' },
                { label: 'Parking',     val: property.parking || '2 Covered' },
                { label: 'Facing',      val: property.facing || 'East' },
                { label: 'Possession',  val: property.possession || property.status },
                { label: 'RERA No.',    val: property.rera || 'Applied' },
              ].map((d, i) => (
                <div key={i} className="pd-detail-item">
                  <span className="pd-detail-lbl">{d.label}</span>
                  <span className="pd-detail-val">{d.val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── AMENITIES ── */}
          <section ref={sectionRefs.amenities} className="pd-section" id="pd-amenities">
            <h2 className="pd-section-title">
              <span className="pd-section-icon">🏊</span> Amenities
            </h2>
            <div className="pd-amenities-grid">
              {(property.amenities || []).map((a, i) => (
                <div key={i} className="pd-amenity-chip">
                  <span className="pd-amenity-dot" />
                  {a}
                </div>
              ))}
            </div>
          </section>

          {/* ── LOCATION MAP ── */}
          <section ref={sectionRefs.location} className="pd-section" id="pd-location">
            <h2 className="pd-section-title">
              <span className="pd-section-icon">📍</span> Location Map
            </h2>
            <div className="pd-map-container">
              <iframe
                title="Property Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed&z=14`}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '16px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          {/* ── NEARBY PLACES ── */}
          <section ref={sectionRefs.nearby} className="pd-section" id="pd-nearby">
            <h2 className="pd-section-title">
              <span className="pd-section-icon">🗺️</span> Nearby Places
            </h2>
            <div className="pd-nearby-grid">
              {(property.nearby || []).map((n, i) => (
                <div key={i} className="pd-nearby-card">
                  <div className="pd-nearby-icon">{n.icon}</div>
                  <div className="pd-nearby-info">
                    <div className="pd-nearby-label">{n.label}</div>
                    <div className="pd-nearby-name">{n.name}</div>
                  </div>
                  <div className="pd-nearby-dist">{n.dist}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── EMI CALCULATOR ── */}
          <section ref={sectionRefs.emi} className="pd-section" id="pd-emi">
            <h2 className="pd-section-title">
              <span className="pd-section-icon">🧮</span> EMI Calculator
            </h2>
            <div className="pd-emi-box">
              <div className="pd-emi-result-big">
                <span className="pd-emi-amount">{formatINR(emi)}</span>
                <span className="pd-emi-label">/ month</span>
              </div>
              <div className="pd-emi-meta-row">
                <div className="pd-emi-meta"><span>Loan Amount</span><strong>{formatINR(loanAmt)}</strong></div>
                <div className="pd-emi-meta"><span>Total Interest</span><strong>{formatINR(interest)}</strong></div>
                <div className="pd-emi-meta"><span>Total Payment</span><strong>{formatINR(totalPay)}</strong></div>
              </div>
              <div className="pd-emi-sliders">
                <div className="pd-emi-slider-row">
                  <label>Loan Percentage <span>{loanPct}%</span></label>
                  <input type="range" min="50" max="90" value={loanPct} onChange={e => setLoanPct(+e.target.value)} className="pd-range" />
                </div>
                <div className="pd-emi-slider-row">
                  <label>Interest Rate <span>{rate}%</span></label>
                  <input type="range" min="6" max="14" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} className="pd-range" />
                </div>
                <div className="pd-emi-slider-row">
                  <label>Tenure <span>{tenure} yrs</span></label>
                  <input type="range" min="5" max="30" value={tenure} onChange={e => setTenure(+e.target.value)} className="pd-range" />
                </div>
              </div>
              {/* Donut chart visual */}
              <div className="pd-emi-donut-wrap">
                <svg viewBox="0 0 120 120" className="pd-emi-donut">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14"/>
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="#6366f1" strokeWidth="14"
                    strokeDasharray={`${(loanAmt / totalPay) * 314} 314`}
                    strokeDashoffset="78.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="#ec4899" strokeWidth="14"
                    strokeDasharray={`${(interest / totalPay) * 314} 314`}
                    strokeDashoffset={`${78.5 - (loanAmt / totalPay) * 314}`}
                    strokeLinecap="round"
                  />
                  <text x="60" y="56" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
                    {Math.round((loanAmt / totalPay) * 100)}%
                  </text>
                  <text x="60" y="68" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
                    Principal
                  </text>
                </svg>
                <div className="pd-emi-legend">
                  <div className="pd-emi-legend-item"><span style={{background:'#6366f1'}} /><p>Principal {Math.round((loanAmt / totalPay) * 100)}%</p></div>
                  <div className="pd-emi-legend-item"><span style={{background:'#ec4899'}} /><p>Interest {Math.round((interest / totalPay) * 100)}%</p></div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ── Right Sidebar ── */}
        <aside className="pd-sidebar">

          {/* Price Card */}
          <div className="pd-price-card">
            <div className="pd-price-main">{property.priceDisplay}</div>
            <div className="pd-price-psf">
              ₹{Math.round((property.price * 1e7) / parseInt(property.area)).toLocaleString('en-IN')} / sq.ft
            </div>
            <div className="pd-emi-preview">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg>
              EMI from <strong>{formatINR(calcEMI(property.price * 1e7 * 0.8, 8.5, 20))}/mo</strong>
            </div>
            <button
              className="pd-book-btn"
              onClick={handleBookNow}
              disabled={payLoading}
            >
              {payLoading ? '⏳ Processing…' : `🔐 Book Now · ${tokenDisplay} Token`}
            </button>
            <button className="pd-enquire-btn" onClick={() => navigate('/#contact')}>
              📞 Enquire Now
            </button>
            <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pd-wa-btn">
              💬 WhatsApp
            </a>
            {paySuccess && (
              <div className="pd-pay-success">
                ✅ Payment successful! Our team will contact you shortly.
              </div>
            )}
          </div>

          {/* 🧠 AI Price Predictor */}
          <div className="pd-ai-predictor">
            <div className="pd-ai-header">
              <span className="pd-ai-badge">🧠 AI</span>
              <h3>Price Predictor</h3>
            </div>

            {/* Investment Score */}
            <div className="pd-invest-score">
              <div className="pd-invest-ring">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8"/>
                  <circle
                    cx="40" cy="40" r="32" fill="none"
                    stroke={scoreColor} strokeWidth="8"
                    strokeDasharray={`${(property.investmentScore / 100) * 201} 201`}
                    strokeDashoffset="50"
                    strokeLinecap="round"
                    style={{transition:'stroke-dasharray 1s ease'}}
                  />
                </svg>
                <div className="pd-invest-num" style={{color: scoreColor}}>{property.investmentScore}</div>
              </div>
              <div className="pd-invest-info">
                <div className="pd-invest-label">Investment Score</div>
                <div className="pd-invest-grade" style={{color: scoreColor}}>
                  {property.investmentScore >= 80 ? '🟢 Excellent' : property.investmentScore >= 65 ? '🟡 Good' : '🔵 Fair'}
                </div>
                <div className="pd-invest-rate">~{property.appreciationRate}% p.a. growth</div>
              </div>
            </div>

            {/* Year selector */}
            <div className="pd-pred-tabs">
              {[1, 3, 5, 10].map(y => (
                <button key={y} className={`pd-pred-tab${predYear === y ? ' active' : ''}`} onClick={() => setPredYear(y)}>
                  {y}yr
                </button>
              ))}
            </div>

            {/* Projected value */}
            <div className="pd-pred-result">
              <div className="pd-pred-row">
                <span>Today</span>
                <strong>{property.priceDisplay}</strong>
              </div>
              <div className="pd-pred-arrow">↓ +{property.appreciationRate}% / yr</div>
              <div className="pd-pred-row projected">
                <span>In {predYear} yr{predYear > 1 ? 's' : ''}</span>
                <strong>{formatINR(predPrice * 1e7)}</strong>
              </div>
              <div className="pd-pred-gain">
                +{formatINR(gain * 1e7)} estimated gain
              </div>
            </div>

            {/* Mini bar chart */}
            <div className="pd-pred-chart">
              {[0, 1, 2, 3, 4, 5].map(y => {
                const val = property.price * Math.pow(1 + property.appreciationRate / 100, y);
                const h = Math.round(((val - property.price) / (property.price * Math.pow(1 + property.appreciationRate / 100, 5) - property.price + 0.001)) * 60 + 20);
                return (
                  <div key={y} className="pd-chart-bar-wrap">
                    <div className="pd-chart-bar" style={{height: `${h}px`, opacity: y <= predYear ? 1 : 0.25}} />
                    <span className="pd-chart-yr">{y === 0 ? 'Now' : `+${y}y`}</span>
                  </div>
                );
              })}
            </div>

            <p className="pd-ai-disclaimer">* AI estimate based on historical data. Not financial advice.</p>
          </div>

          {/* Key Highlights */}
          <div className="pd-highlights-card">
            <h3 className="pd-highlights-title">✅ Key Highlights</h3>
            {[
              property.status === 'Ready to Move' ? 'Ready for Immediate Possession' : 'New Project – Book Early',
              `${property.area} of Living Space`,
              property.bedrooms > 0 ? `${property.bedrooms} BHK Configuration` : 'Commercial Property',
              `Prime Location – ${property.sector}`,
              'RERA Registered Project',
              `By ${property.developer || 'Reputed Developer'}`,
            ].map((h, i) => (
              <div key={i} className="pd-highlight-row">
                <span className="pd-highlight-check">✓</span>
                <span>{h}</span>
              </div>
            ))}
          </div>

          {/* ── Live Area Feel ── */}
          {(() => {
            const feel = getAreaFeel(property.sector, timeOfDay);
            const tod  = TIME_CONFIG[timeOfDay];
            const METRICS = [
              {
                key: 'traffic',
                icon: '🚗',
                label: 'Traffic',
                val: feel.traffic,
                ...areaLabel(feel.traffic, 35, 60, 80),
                barColor: feel.traffic <= 35 ? '#22c55e' : feel.traffic <= 60 ? '#f59e0b' : '#ef4444',
              },
              {
                key: 'noise',
                icon: '🔊',
                label: 'Noise Level',
                val: feel.noise,
                ...areaLabel(feel.noise, 30, 55, 75),
                barColor: feel.noise <= 30 ? '#22c55e' : feel.noise <= 55 ? '#f59e0b' : '#ef4444',
              },
              {
                key: 'crowd',
                icon: '👥',
                label: 'Crowd',
                val: feel.crowd,
                ...areaLabel(feel.crowd, 30, 58, 78),
                barColor: feel.crowd <= 30 ? '#22c55e' : feel.crowd <= 58 ? '#f59e0b' : '#ef4444',
              },
              {
                key: 'green',
                icon: '🌿',
                label: 'Green Cover',
                val: feel.green,
                text: invertLabel(feel.green).text,
                color: invertLabel(feel.green).color,
                barColor: invertLabel(feel.green).color,
              },
              {
                key: 'safety',
                icon: '🔒',
                label: 'Safety',
                val: feel.safety,
                text: invertLabel(feel.safety).text,
                color: invertLabel(feel.safety).color,
                barColor: invertLabel(feel.safety).color,
              },
            ];
            return (
              <div className="pd-area-feel">
                <div className="pd-af-header">
                  <div className="pd-af-title-row">
                    <span className="pd-af-icon">📍</span>
                    <h3 className="pd-af-title">Live Area Feel</h3>
                    <span className="pd-af-live">
                      <span className="pd-af-dot" style={{ background: tod.badgeColor }} />
                      {tod.emoji} {tod.label}
                    </span>
                  </div>
                  <p className="pd-af-sub">{property.sector} · Simulated real-time data</p>
                </div>

                <div className="pd-af-metrics">
                  {METRICS.map(m => (
                    <div key={m.key} className="pd-af-row">
                      <div className="pd-af-row-top">
                        <span className="pd-af-metric-icon">{m.icon}</span>
                        <span className="pd-af-metric-label">{m.label}</span>
                        <span className="pd-af-metric-val" style={{ color: m.color }}>{m.text}</span>
                      </div>
                      <div className="pd-af-bar-track">
                        <div
                          className="pd-af-bar-fill"
                          style={{
                            width: barAnimated ? `${m.val}%` : '0%',
                            background: m.barColor,
                            boxShadow: barAnimated ? `0 0 8px ${m.barColor}88` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pd-af-footer">
                  <span className="pd-af-footer-note">
                    ⚡ Updates with time-of-day toggle above
                  </span>
                </div>
              </div>
            );
          })()}

        </aside>
      </div>

      {/* ── Footer CTA ── */}
      <div className="pd-footer-cta">
        <div className="pd-footer-cta-inner">
          <div>
            <h3>Interested in {property.name}?</h3>
            <p>Get a free site visit, price negotiation & loan assistance</p>
          </div>
          <div className="pd-footer-cta-btns">
            <button
              className="pd-book-btn"
              onClick={handleBookNow}
              disabled={payLoading}
            >
              {payLoading ? '⏳ Processing…' : `🔐 Book Now · ${tokenDisplay} Token`}
            </button>
            <button className="pd-sticky-btn" onClick={() => setShowVisitModal(true)}>📅 Schedule Site Visit</button>
            <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pd-wa-btn-sm">💬 Chat Now</a>
          </div>
        </div>
      </div>

      {/* ── Floating Voice Tour Player ── */}
      {tourActive && (() => {
        const step = tourScript[tourStep];
        const progress = ((tourStep + (tourSpeaking ? 0.5 : 0)) / tourScript.length) * 100;
        return (
          <div className="pd-tour-player">
            {/* Progress bar */}
            <div className="pd-tour-progress-track">
              <div className="pd-tour-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="pd-tour-body">
              {/* Left: step info */}
              <div className="pd-tour-left">
                <div className="pd-tour-step-icon">{step?.icon}</div>
                <div className="pd-tour-step-info">
                  <div className="pd-tour-step-label">
                    Step {tourStep + 1} of {tourScript.length} · {step?.title}
                  </div>
                  <p className="pd-tour-step-text">{step?.text}</p>
                </div>
              </div>

              {/* Center: audio wave */}
              <div className="pd-tour-center">
                <div className={`pd-tour-wave-big${tourSpeaking ? ' speaking' : ''}`}>
                  <span /><span /><span /><span /><span /><span /><span />
                </div>
                <div className="pd-tour-status">
                  {tourPaused ? '⏸ Paused' : tourSpeaking ? '🔊 Speaking…' : '⏳ Next up…'}
                </div>
              </div>

              {/* Right: controls + dot nav */}
              <div className="pd-tour-right">
                <div className="pd-tour-controls">
                  <button
                    className="pd-tour-ctrl"
                    onClick={() => tourStep > 0 && goTourStep(tourStep - 1)}
                    disabled={tourStep === 0}
                    title="Previous"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 20L9 12l10-8v16zM5 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                  <button
                    className="pd-tour-ctrl pd-tour-ctrl-main"
                    onClick={pauseResumeTour}
                    title={tourPaused ? 'Resume' : 'Pause'}
                  >
                    {tourPaused
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    }
                  </button>
                  <button
                    className="pd-tour-ctrl"
                    onClick={() => tourStep < tourScript.length - 1 && goTourStep(tourStep + 1)}
                    disabled={tourStep === tourScript.length - 1}
                    title="Next"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 4l10 8-10 8V4zm14 0v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                  <button className="pd-tour-ctrl pd-tour-ctrl-stop" onClick={stopTour} title="End Tour">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                  </button>
                </div>

                {/* Language Toggle */}
                <div className="pd-tour-lang-row">
                  <button
                    className={`pd-tour-lang-btn${tourLang === 'en' ? ' active' : ''}`}
                    onClick={() => switchLang('en')}
                    title="English"
                  >
                    🇬🇧 EN
                  </button>
                  <button
                    className={`pd-tour-lang-btn${tourLang === 'hi' ? ' active' : ''}`}
                    onClick={() => switchLang('hi')}
                    title="Hindi"
                  >
                    🇮🇳 HI
                  </button>
                </div>

                {/* Dot navigation */}
                <div className="pd-tour-dots">
                  {tourScript.map((s, i) => (
                    <button
                      key={i}
                      className={`pd-tour-dot${i === tourStep ? ' active' : ''}${i < tourStep ? ' done' : ''}`}
                      onClick={() => goTourStep(i)}
                      title={s.title}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Schedule Visit Modal ── */}
      {showVisitModal && (
        <ScheduleVisitModal
          property={property}
          onClose={() => setShowVisitModal(false)}
        />
      )}

    </div>
  );
}
