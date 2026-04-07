import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion, useScroll, useTransform, useSpring, useInView,
} from 'framer-motion';
import './StoryPage.css';

/* ════════════════════════════════════════════
   BILINGUAL NARRATIONS  (EN + HI)
   Each section has a complete explanation
════════════════════════════════════════════ */
const NARRATIONS = {
  hero: {
    title: 'Welcome',
    en: `Welcome to Vertex Living's exclusive property story. Gurgaon — India's Millennium City. A city that never stops growing, never stops dreaming. Here, glass towers touch the sky. Here, luxury is not a privilege — it is a lifestyle. Scroll down to discover properties that define a generation.`,
    hi: `Vertex Living की एक्सक्लूसिव प्रॉपर्टी स्टोरी में आपका हार्दिक स्वागत है। गुरुग्राम — भारत का मिलेनियम सिटी। एक ऐसा शहर जो कभी नहीं रुकता, कभी सपने देखना नहीं छोड़ता। यहाँ काँच की ऊंची इमारतें आसमान छूती हैं। यहाँ लग्ज़री कोई विशेषाधिकार नहीं — यह एक जीवनशैली है। नीचे स्क्रॉल करें और उन प्रॉपर्टीज़ को देखें जो एक पूरी पीढ़ी को परिभाषित करती हैं।`,
  },
  statement: {
    title: 'Our Promise',
    en: `At Vertex Living, we don't just sell properties. We help you craft your legacy. Every home in our portfolio has been handpicked from Gurgaon's most prestigious addresses. Each one is RERA verified, developer-backed, and ready to become the backdrop of your greatest chapter. This is not real estate. This is your story.`,
    hi: `Vertex Living में हम सिर्फ प्रॉपर्टी नहीं बेचते। हम आपकी विरासत बनाने में मदद करते हैं। हमारे पोर्टफोलियो का हर घर गुरुग्राम के सबसे प्रतिष्ठित पतों से चुना गया है। हर एक RERA वेरिफाइड है, बड़े डेवलपर्स द्वारा समर्थित है, और आपकी सबसे बड़ी कहानी की पृष्ठभूमि बनने के लिए तैयार है। यह रियल एस्टेट नहीं है। यह आपकी कहानी है।`,
  },
  stats: {
    title: 'By the Numbers',
    en: `The numbers speak for themselves. Thirty-six premium properties spread across Gurgaon's finest sectors — from Golf Course Road to New Gurgaon. Every single property is 100% RERA registered, because your trust is our foundation. Our portfolio has delivered consistent 12% annual appreciation, year after year. And we manage over five thousand crore rupees in premium real estate — making us one of Gurgaon's most trusted names.`,
    hi: `ये आँकड़े खुद बोलते हैं। गुरुग्राम के बेहतरीन सेक्टरों में फैली 36 प्रीमियम प्रॉपर्टीज़ — Golf Course Road से लेकर न्यू गुरुग्राम तक। हर एक प्रॉपर्टी 100 प्रतिशत RERA रजिस्टर्ड है, क्योंकि आपका भरोसा हमारी बुनियाद है। हमारे पोर्टफोलियो ने हर साल लगातार 12 प्रतिशत की बढ़ोतरी दी है। और हम पाँच हज़ार करोड़ रुपये से ज़्यादा की प्रीमियम प्रॉपर्टी मैनेज करते हैं — जो हमें गुरुग्राम के सबसे भरोसेमंद नामों में से एक बनाता है।`,
  },
  prop_0: {
    title: 'DLF The Camellias',
    en: `Presenting DLF The Camellias — India's most iconic ultra-luxury residence. Standing tall on Golf Course Road, Sector 42, this architectural masterpiece redefines opulence. A stunning 4 BHK apartment spanning 9,500 square feet. Starting price: 8.5 crore rupees. This is India's first and only LEED Platinum certified residential tower. Features include direct golf course access, three world-class swimming pools, an Olympic gymnasium, private theatre, spa and sauna, and 24 by 7 concierge service. With 9 towers rising up to 38 floors, housing 428 premium residences — DLF The Camellias is not just a home. It is a declaration.`,
    hi: `पेश है DLF द कैमेलियाज़ — भारत का सबसे आइकॉनिक अल्ट्रा-लग्ज़री रेज़िडेंस। Golf Course Road, सेक्टर 42 पर शान से खड़ा यह वास्तुकला का नायाब नमूना वैभव की परिभाषा ही बदल देता है। 9 हज़ार 500 स्क्वेयर फीट में फैला 4 BHK का शानदार अपार्टमेंट। शुरुआती कीमत: 8.5 करोड़ रुपये। यह भारत का पहला और एकमात्र LEED प्लेटिनम सर्टिफाइड रेज़िडेंशियल टावर है। सीधे गोल्फ कोर्स तक पहुँच, तीन वर्ल्ड-क्लास स्विमिंग पूल, ओलंपिक जिम, प्राइवेट थिएटर, स्पा और सॉना, और 24 घंटे 7 दिन कंसीयर्ज सेवा। 38 मंज़िलों तक ऊँचे 9 टावर्स में 428 प्रीमियम रेज़िडेंसेज़ — DLF द कैमेलियाज़ सिर्फ एक घर नहीं है। यह एक ऐलान है।`,
  },
  prop_1: {
    title: 'M3M Golf Estate',
    en: `Second — M3M Golf Estate. 75 acres of pure, uninterrupted golf living in Sector 65, Golf Course Extension Road. A 3 BHK masterpiece spanning 3,200 square feet, starting at just 4.2 crore. Every single window frames a breathtaking panoramic golf course view. This is a fully ready-to-move premium township — no waiting, no delays. A world-class clubhouse with resort-style amenities. Jogging tracks, landscaped gardens, multiple swimming pools, and a premium gymnasium. Over 1,000 units across multiple high-rise towers. M3M Golf Estate is where life meets luxury, and luxury meets nature.`,
    hi: `दूसरी प्रॉपर्टी — M3M गोल्फ एस्टेट। सेक्टर 65, Golf Course Extension Road में 75 एकड़ में फैली शुद्ध गोल्फ लिविंग। 3 हज़ार 200 स्क्वेयर फीट का 3 BHK मास्टरपीस, सिर्फ 4.2 करोड़ से शुरू। हर एक खिड़की से एक मनमोहक पैनोरमिक गोल्फ कोर्स व्यू दिखता है। यह पूरी तरह रेडी-टू-मूव प्रीमियम टाउनशिप है — कोई इंतज़ार नहीं, कोई देरी नहीं। वर्ल्ड-क्लास क्लबहाउस, रिसोर्ट-स्टाइल सुविधाएं, जॉगिंग ट्रैक, लैंडस्केप्ड गार्डन, और प्रीमियम जिम। 1 हज़ार से ज़्यादा यूनिट्स। M3M गोल्फ एस्टेट — जहाँ जीवन और लग्ज़री मिलते हैं, और लग्ज़री और प्रकृति एक हो जाते हैं।`,
  },
  prop_2: {
    title: 'Emerald Hills',
    en: `Third — Emerald Hills by IREO. Where every window is a masterpiece. These 4 BHK luxury apartments in Sector 65 offer sweeping, panoramic views across Gurgaon's stunning skyline — you have to see it to believe it. 4,800 square feet of the most refined living space you will ever experience. Starting at 6.8 crore. An infinity swimming pool that seems to merge with the horizon. Penthouse availability for those who desire the absolute pinnacle. Concierge services available around the clock. Spa, steam room, and wellness centre. Emerald Hills — a home that doesn't just redefine luxury. It redefines what it means to truly live.`,
    hi: `तीसरी प्रॉपर्टी — IREO का एमरल्ड हिल्स। जहाँ हर खिड़की एक मास्टरपीस है। सेक्टर 65 के ये 4 BHK लग्ज़री अपार्टमेंट्स गुरुग्राम के शानदार स्काईलाइन का अद्भुत पैनोरमिक नज़ारा पेश करते हैं — आपको खुद देखना होगा तब जाकर यकीन होगा। 4 हज़ार 800 स्क्वेयर फीट का सबसे परिष्कृत लिविंग स्पेस जो आप कभी अनुभव करेंगे। 6.8 करोड़ से शुरू। एक इन्फिनिटी स्विमिंग पूल जो क्षितिज में मिलता हुआ लगता है। उन लोगों के लिए पेंटहाउस उपलब्धता जो सबसे ऊपर की ज़िंदगी चाहते हैं। चौबीसों घंटे कंसीयर्ज सेवाएं। स्पा, स्टीम रूम और वेलनेस सेंटर। एमरल्ड हिल्स — एक ऐसा घर जो सिर्फ लग्ज़री को नहीं — सही मायनों में जीने की परिभाषा को फिर से लिखता है।`,
  },
  quote: {
    title: 'The Investment Story',
    en: `Here is the truth about Gurgaon. This city's real estate market has delivered 12% annual appreciation — every single year — for over a decade. No matter your budget. Whether you are investing 85 lakh rupees in New Gurgaon's emerging sectors, or 15 crore on the prestigious Golf Course Road — your money works harder here than anywhere else in North India. The infrastructure is expanding. The metro is growing. The IT sector is booming. And the population is only increasing. The Gurgaon story is far from over. In fact — it is just beginning. And you deserve to be a part of it.`,
    hi: `गुरुग्राम के बारे में यही सच्चाई है। इस शहर के रियल एस्टेट बाज़ार ने एक दशक से ज़्यादा समय से हर साल लगातार 12 प्रतिशत की बढ़ोतरी दी है। आपका बजट चाहे कुछ भी हो। चाहे आप न्यू गुरुग्राम के उभरते सेक्टरों में 85 लाख रुपये लगाएं, या प्रतिष्ठित Golf Course Road पर 15 करोड़ — आपका पैसा यहाँ उत्तर भारत में कहीं से भी ज़्यादा काम करता है। बुनियादी ढाँचा फैल रहा है। मेट्रो बढ़ रही है। आईटी सेक्टर फल-फूल रहा है। और जनसंख्या केवल बढ़ रही है। गुरुग्राम की कहानी अभी खत्म नहीं हुई। दरअसल — यह तो अभी शुरू हुई है। और आप इसका हिस्सा बनने के हकदार हैं।`,
  },
  locations: {
    title: 'Our Locations',
    en: `We cover every premium address in Gurgaon. The ultra-prestigious Sector 42 and 43 on Golf Course Road — home to DLF's crown jewels. Sectors 57, 65, 66, and 67 on Golf Course Extension — where modern luxury thrives. Sector 49 and Sohna Road — Gurgaon's most rapidly growing corridor. And the emerging New Gurgaon — Sectors 82 through 103 — where affordable luxury meets future potential. Plus the commercial powerhouses of Cyber City, MG Road, and Udyog Vihar. No matter your preference, your budget, or your lifestyle — we have the perfect location waiting for you.`,
    hi: `हम गुरुग्राम के हर प्रीमियम पते को कवर करते हैं। Golf Course Road पर अल्ट्रा-प्रेस्टीजियस सेक्टर 42 और 43 — DLF के सबसे शानदार प्रोजेक्ट्स का घर। Golf Course Extension पर सेक्टर 57, 65, 66 और 67 — जहाँ आधुनिक लग्ज़री पनपती है। सेक्टर 49 और Sohna Road — गुरुग्राम का सबसे तेज़ी से बढ़ता कॉरिडोर। और उभरता न्यू गुरुग्राम — सेक्टर 82 से 103 — जहाँ किफायती लग्ज़री भविष्य की संभावनाओं से मिलती है। साथ ही Cyber City, MG Road और Udyog Vihar के कमर्शियल पावरहाउस। आपकी पसंद, बजट या जीवनशैली चाहे कुछ भी हो — हमारे पास आपके लिए सबसे सही लोकेशन तैयार है।`,
  },
  features: {
    title: 'What You Get',
    en: `Every single property in the Vertex Living portfolio — without exception — comes fully equipped with world-class amenities. A pristine swimming pool for your morning laps. A premium gymnasium with professional-grade equipment. A three-tier security system so you sleep peacefully. Uninterrupted power backup because comfort should never stop. Beautifully landscaped gardens for your evening strolls. Complete RERA registration for total legal protection. Covered parking for your vehicles. And smart home readiness — because modern living deserves modern technology. This is not just a checklist. This is the standard of living you deserve.`,
    hi: `Vertex Living पोर्टफोलियो की हर प्रॉपर्टी — बिना किसी अपवाद के — वर्ल्ड-क्लास सुविधाओं से पूरी तरह लैस है। सुबह की लैप्स के लिए एक बेदाग स्विमिंग पूल। प्रोफेशनल-ग्रेड उपकरणों वाला एक प्रीमियम जिम। तीन स्तरीय सुरक्षा प्रणाली ताकि आप चैन से सो सकें। निर्बाध पावर बैकअप क्योंकि आराम कभी नहीं रुकना चाहिए। शाम की सैर के लिए सुंदर लैंडस्केप्ड गार्डन। पूर्ण कानूनी सुरक्षा के लिए पूर्ण RERA रजिस्ट्रेशन। आपकी गाड़ियों के लिए कवर्ड पार्किंग। और स्मार्ट होम रेडीनेस — क्योंकि आधुनिक जीवन को आधुनिक तकनीक की ज़रूरत है। यह सिर्फ एक चेकलिस्ट नहीं है। यह वो जीवनस्तर है जिसके आप हकदार हैं।`,
  },
  cta: {
    title: 'Your Story Starts Here',
    en: `Your story starts today. Right now. Browse our 36 RERA-verified properties across Gurgaon's finest sectors. Schedule a completely free, zero-obligation site visit and see your future home with your own eyes. Or simply open WhatsApp and speak directly with our property experts — available right now, any time of day. Gurgaon's finest homes are ready. The infrastructure is in place. The appreciation is proven. The only thing missing — is you. Welcome to Vertex Living. Welcome home.`,
    hi: `आपकी कहानी आज शुरू होती है। अभी इसी वक्त। गुरुग्राम के बेहतरीन सेक्टरों में फैली हमारी 36 RERA-वेरिफाइड प्रॉपर्टीज़ ब्राउज़ करें। पूरी तरह मुफ्त, बिना किसी बंधन के साइट विज़िट बुक करें और अपनी आँखों से अपना भावी घर देखें। या बस WhatsApp खोलें और हमारे प्रॉपर्टी एक्सपर्ट से सीधे बात करें — अभी, दिन के किसी भी समय उपलब्ध। गुरुग्राम के बेहतरीन घर तैयार हैं। बुनियादी ढाँचा मौजूद है। बढ़ोतरी साबित हो चुकी है। बस एक चीज़ की कमी है — आप। Vertex Living में आपका स्वागत है। अपने घर में आपका स्वागत है।`,
  },
};

/* ── helpers ── */
function SplitWords({ text, className, delay = 0, duration = 0.55 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration, delay: delay + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

function StatCounter({ to, prefix = '', suffix = '', label }) {
  const ref = useRef(null);
  const inV = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inV) return;
    let raf;
    const start = performance.now();
    const dur = 1800;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setN(Math.floor(ease * to));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setN(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inV, to]);
  return (
    <div className="sp-stat" ref={ref}>
      <div className="sp-stat-num">{prefix}{n.toLocaleString('en-IN')}{suffix}</div>
      <div className="sp-stat-label">{label}</div>
    </div>
  );
}

function StickyPropSection({ property, index, sectionId }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const spring    = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const imgScale  = useTransform(spring, [0, 1], [1.08, 1.22]);
  const imgOpacity= useTransform(spring, [0, 0.85], [1, 0.2]);
  const textY     = useTransform(spring, [0, 1], ['0%', '-18%']);
  const textOp    = useTransform(spring, [0, 0.6, 0.9], [1, 1, 0]);

  return (
    <div className="sp-sticky-container" ref={containerRef} data-story-section={sectionId}>
      <div className="sp-sticky-inner">
        <motion.div className="sp-bg-img-wrap" style={{ scale: imgScale, opacity: imgOpacity }}>
          <img src={property.image} alt={property.name} className="sp-bg-img" />
          <div className="sp-bg-gradient" />
        </motion.div>
        <motion.div className="sp-sticky-content" style={{ y: textY, opacity: textOp }}>
          <motion.div className="sp-prop-num"
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            {String(index + 1).padStart(2, '0')}
          </motion.div>
          <SplitWords text={property.tagline} className="sp-prop-tagline" delay={0.15} />
          <motion.h2 className="sp-prop-name"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.35 }}>
            {property.name}
          </motion.h2>
          <motion.div className="sp-prop-meta"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}>
            <span>{property.beds} BHK</span>
            <span className="sp-dot" />
            <span>{property.area}</span>
            <span className="sp-dot" />
            <span className="sp-price">{property.price}</span>
          </motion.div>
          <motion.div className="sp-prop-chips"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.65 }}>
            {property.chips.map((c, i) => <span key={i} className="sp-chip">{c}</span>)}
          </motion.div>
        </motion.div>
        <motion.div className="sp-side-line"
          initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }}
          viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} />
      </div>
    </div>
  );
}

/* ── static data ── */
const STORY_PROPS = [
  { id: 1,  name: 'DLF The Camellias', tagline: "India's Most Iconic Residence",
    beds: 4, area: '9,500 sqft', price: '₹8.5 Cr+',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&h=900&fit=crop&q=85',
    chips: ['LEED Platinum', 'Golf Course Access', '3 Pools', '24/7 Concierge'] },
  { id: 13, name: 'M3M Golf Estate', tagline: '75 Acres of Pure Golf Living',
    beds: 3, area: '3,200 sqft', price: '₹4.2 Cr+',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=900&fit=crop&q=85',
    chips: ['Panoramic Views', '75 Acre Township', 'Ready to Move', 'Premium Club'] },
  { id: 14, name: 'Emerald Hills', tagline: 'Where Every Window Is a Masterpiece',
    beds: 4, area: '4,800 sqft', price: '₹6.8 Cr+',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=900&fit=crop&q=85',
    chips: ['Infinity Pool', 'Penthouse Available', 'Concierge', 'City View'] },
];

const SECTORS = [
  'Sector 42','Sector 43','Sector 49','Sector 57','Sector 65','Sector 66',
  'Sector 67','Sector 82','Sector 83','Sector 84','Sector 85','Sector 86',
  'Golf Course Road','Sohna Road','Cyber City','MG Road',
];

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function StoryPage() {
  const navigate = useNavigate();

  /* ── Hero parallax ── */
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroSpring  = useSpring(heroScroll, { stiffness: 80, damping: 25 });
  const heroBgScale = useTransform(heroSpring, [0, 1], [1, 1.18]);
  const heroBgOp    = useTransform(heroSpring, [0, 0.9], [1, 0.15]);
  const heroTextY   = useTransform(heroSpring, [0, 1], ['0%', '-30%']);
  const heroTextOp  = useTransform(heroSpring, [0, 0.5], [1, 0]);

  /* ── Page progress ── */
  const { scrollYProgress: pageProgress } = useScroll();
  const progressBar = useSpring(pageProgress, { stiffness: 100, damping: 30 });

  /* ── Voice system ── */
  const [voiceEnabled,   setVoiceEnabled]   = useState(false);
  const [voiceDismissed, setVoiceDismissed] = useState(false);
  const [voiceLang,      setVoiceLang]      = useState('en');
  const [voiceMuted,     setVoiceMuted]     = useState(false);
  const [isSpeaking,     setIsSpeaking]     = useState(false);
  const [activeSec,      setActiveSec]      = useState('');

  /* stable refs — avoids stale closures */
  const lastSpokenRef   = useRef('');
  const voiceLangRef    = useRef('en');
  const voiceMutedRef   = useRef(false);
  const voiceEnabledRef = useRef(false);
  const isSpeakingRef   = useRef(false);
  const pendingSecRef   = useRef(null);
  const speakFnRef      = useRef(null);

  useEffect(() => { voiceLangRef.current    = voiceLang;    }, [voiceLang]);
  useEffect(() => { voiceMutedRef.current   = voiceMuted;   }, [voiceMuted]);
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);

  /* Core speak logic stored in ref so onend callback always gets latest version */
  speakFnRef.current = (sectionId) => {
    if (!voiceEnabledRef.current || voiceMutedRef.current) return;
    if (lastSpokenRef.current === `${sectionId}_${voiceLangRef.current}`) return;

    /* Don't cancel current speech — queue this section instead */
    if (isSpeakingRef.current) {
      pendingSecRef.current = sectionId;
      return;
    }

    const script = NARRATIONS[sectionId];
    if (!script) return;

    lastSpokenRef.current = `${sectionId}_${voiceLangRef.current}`;
    const text  = voiceLangRef.current === 'hi' ? script.hi : script.en;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate   = voiceLangRef.current === 'hi' ? 0.88 : 0.92;
    utter.pitch  = 1.0;
    utter.volume = 1;

    const voices = window.speechSynthesis?.getVoices() || [];
    if (voiceLangRef.current === 'hi') {
      const v = voices.find(v => v.lang.startsWith('hi'));
      if (v) utter.voice = v;
      utter.lang = 'hi-IN';
    } else {
      const v = voices.find(v => v.lang.startsWith('en') &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
      ) || voices.find(v => v.lang.startsWith('en'));
      if (v) utter.voice = v;
      utter.lang = 'en-IN';
    }

    isSpeakingRef.current = true;
    utter.onstart = () => { setIsSpeaking(true); setActiveSec(sectionId); };
    utter.onend   = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      /* Auto-play queued section when current finishes */
      if (pendingSecRef.current) {
        const next = pendingSecRef.current;
        pendingSecRef.current = null;
        speakFnRef.current?.(next);
      }
    };
    utter.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false); };
    window.speechSynthesis?.speak(utter);
  };

  const speak = useCallback((sectionId) => {
    speakFnRef.current?.(sectionId);
  }, []);

  /* Set up IntersectionObserver after voice is enabled */
  useEffect(() => {
    if (!voiceEnabled) return;
    // Speak hero immediately
    speak('hero');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.storySection;
          if (id) speak(id);
        }
      });
    }, { threshold: 0.45 });

    // Small delay to let DOM settle
    const t = setTimeout(() => {
      document.querySelectorAll('[data-story-section]').forEach(el => observer.observe(el));
    }, 300);

    return () => { clearTimeout(t); observer.disconnect(); };
  }, [voiceEnabled, speak]);

  /* Re-speak current section when lang changes */
  useEffect(() => {
    if (!voiceEnabled || !activeSec) return;
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    pendingSecRef.current = null;
    lastSpokenRef.current = '';
    setTimeout(() => speakFnRef.current?.(activeSec), 120);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceLang]);

  /* Mute/unmute */
  const toggleMute = () => {
    if (!voiceMuted) {
      window.speechSynthesis?.cancel();
      isSpeakingRef.current = false;
      pendingSecRef.current = null;
    }
    setVoiceMuted(v => !v);
  };

  /* Cleanup */
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  /* ── Replay current section ── */
  const replay = () => {
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    pendingSecRef.current = null;
    lastSpokenRef.current = '';
    setTimeout(() => speakFnRef.current?.(activeSec || 'hero'), 120);
  };

  /* ── Switch lang ── */
  const switchLang = (lang) => {
    setVoiceLang(lang);
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    pendingSecRef.current = null;
    setIsSpeaking(false);
    lastSpokenRef.current = '';
  };

  return (
    <div className="sp-root">

      {/* Side progress */}
      <div className="sp-progress-rail">
        <motion.div className="sp-progress-fill" style={{ scaleY: progressBar }} />
      </div>

      {/* Back */}
      <motion.button className="sp-back" onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        ← Back
      </motion.button>

      {/* ── Voice enable overlay (full-screen modal) ── */}
      {!voiceEnabled && !voiceDismissed && (
        <motion.div
          className="sp-voice-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <motion.div
            className="sp-voice-modal"
            initial={{ scale: 0.88, y: 28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5, type: 'spring', stiffness: 280, damping: 28 }}
          >
            <span className="sp-vm-icon">🎙️</span>
            <h2 className="sp-vm-title">Voice Narration</h2>
            <p className="sp-vm-desc">
              Scroll through the story and each section will be narrated automatically.<br />
              Choose your preferred language.
            </p>
            <div className="sp-vm-langs">
              <button
                className={`sp-vm-lang-btn${voiceLang === 'en' ? ' active' : ''}`}
                onClick={() => setVoiceLang('en')}
              >
                <span>🇬🇧</span>
                <strong>English</strong>
                <small>EN</small>
              </button>
              <button
                className={`sp-vm-lang-btn${voiceLang === 'hi' ? ' active' : ''}`}
                onClick={() => setVoiceLang('hi')}
              >
                <span>🇮🇳</span>
                <strong>हिंदी</strong>
                <small>HI</small>
              </button>
            </div>
            <button className="sp-vm-start-btn" onClick={() => setVoiceEnabled(true)}>
              ▶&nbsp;&nbsp;Start Voice Tour
            </button>
            <br />
            <button className="sp-vm-skip" onClick={() => setVoiceDismissed(true)}>
              Continue without sound
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ── Floating voice player bar ── */}
      {voiceEnabled && (
        <motion.div
          className="sp-voice-player"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated waveform */}
          <div className={`sp-vp-wave${isSpeaking ? ' speaking' : ''}`}>
            {[...Array(7)].map((_, i) => <span key={i} />)}
          </div>

          {/* Section info */}
          <div className="sp-vp-info">
            <span className="sp-vp-status">
              {isSpeaking ? '🔊 Now Playing' : '⏸ Scroll to continue'}
            </span>
            <span className="sp-vp-title">
              {activeSec && NARRATIONS[activeSec] ? NARRATIONS[activeSec].title : 'Voice Tour'}
            </span>
          </div>

          {/* Language switch */}
          <div className="sp-vp-langs">
            <button className={`sp-vp-lang${voiceLang === 'en' ? ' active' : ''}`} onClick={() => switchLang('en')}>🇬🇧 EN</button>
            <button className={`sp-vp-lang${voiceLang === 'hi' ? ' active' : ''}`} onClick={() => switchLang('hi')}>🇮🇳 HI</button>
          </div>

          {/* Controls with text labels */}
          <div className="sp-vp-controls">
            <button className="sp-vp-ctrl-btn" onClick={replay}>↺ Replay</button>
            <button className={`sp-vp-ctrl-btn${voiceMuted ? ' muted' : ''}`} onClick={toggleMute}>
              {voiceMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
            <button className="sp-vp-ctrl-btn stop-btn" onClick={() => {
              window.speechSynthesis?.cancel();
              isSpeakingRef.current = false;
              pendingSecRef.current = null;
              setVoiceEnabled(false);
              setIsSpeaking(false);
            }}>✕ Stop</button>
          </div>
        </motion.div>
      )}

      {/* ══ 1. HERO ══ */}
      <div className="sp-hero-container" ref={heroRef} data-story-section="hero">
        <div className="sp-hero-sticky">
          <motion.div className="sp-hero-bg" style={{ scale: heroBgScale, opacity: heroBgOp }}>
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&h=1000&fit=crop&q=85" alt="Gurgaon skyline" className="sp-hero-img" />
            <div className="sp-hero-vignette" />
          </motion.div>
          <motion.div className="sp-hero-text" style={{ y: heroTextY, opacity: heroTextOp }}>
            <motion.div className="sp-hero-eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              Vertex Living · Gurgaon
            </motion.div>
            <motion.h1 className="sp-hero-title" initial={{ opacity: 0, y: 60, filter: 'blur(20px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1.1, delay: 0.5 }}>
              गुरुग्राम
            </motion.h1>
            <motion.p className="sp-hero-sub" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.85 }}>
              Properties that define a generation
            </motion.p>
            <motion.div className="sp-hero-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
              <div className="sp-scroll-mouse"><div className="sp-scroll-dot" /></div>
              <span>Scroll to explore</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ══ 2. BRAND STATEMENT ══ */}
      <section className="sp-section sp-statement-section" data-story-section="statement">
        <div className="sp-container">
          <SplitWords text="Not just properties." className="sp-statement-line sp-statement-dim" delay={0} />
          <br />
          <SplitWords text="Legacies." className="sp-statement-line sp-statement-bright" delay={0.3} />
        </div>
      </section>

      {/* ══ 3. STATS ══ */}
      <section className="sp-section sp-stats-section" data-story-section="stats">
        <div className="sp-container">
          <motion.p className="sp-stats-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            By the numbers
          </motion.p>
          <div className="sp-stats-grid">
            <StatCounter to={36}   suffix="+"  label="Premium Properties"        />
            <StatCounter to={100}  suffix="%"  label="RERA Registered"           />
            <StatCounter to={12}   suffix="%"  label="Avg. Annual Appreciation"  />
            <StatCounter to={5000} prefix="₹" suffix="+" label="Crore in Inventory" />
          </div>
        </div>
      </section>

      {/* ══ 4–6. STICKY PROPERTY REVEALS ══ */}
      {STORY_PROPS.map((p, i) => (
        <StickyPropSection key={p.id} property={p} index={i} sectionId={`prop_${i}`} />
      ))}

      {/* ══ 7. INVESTMENT QUOTE ══ */}
      <section className="sp-section sp-quote-section" data-story-section="quote">
        <div className="sp-container">
          <motion.div className="sp-quote-mark" initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            "
          </motion.div>
          <SplitWords text="Gurgaon has grown 12% every year for a decade." className="sp-quote-text" delay={0.1} duration={0.6} />
          <br />
          <SplitWords text="So does your wealth." className="sp-quote-text sp-quote-accent" delay={0.8} duration={0.7} />
          <motion.div className="sp-quote-line" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 1.6 }} />
        </div>
      </section>

      {/* ══ 8. LOCATION CONSTELLATION ══ */}
      <section className="sp-section sp-locations-section" data-story-section="locations">
        <div className="sp-container">
          <motion.h3 className="sp-loc-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            Gurgaon's Best Addresses
          </motion.h3>
          <div className="sp-loc-grid">
            {SECTORS.map((s, i) => (
              <motion.div key={s} className="sp-loc-chip"
                initial={{ opacity: 0, scale: 0.7, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                whileHover={{ scale: 1.06, color: '#6366f1' }}>
                <span className="sp-loc-dot" />{s}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. FEATURE STRIP ══ */}
      <section className="sp-section sp-features-section" data-story-section="features">
        <div className="sp-container">
          <motion.p className="sp-feat-eyebrow" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            Every property includes
          </motion.p>
          <div className="sp-feat-grid">
            {[
              { icon: '🏊', label: 'Swimming Pool'     },
              { icon: '🏋️', label: 'Premium Gym'       },
              { icon: '🔒', label: '3-Tier Security'   },
              { icon: '⚡', label: 'Power Backup'      },
              { icon: '🌿', label: 'Landscaped Gardens'},
              { icon: '🎯', label: 'RERA Registered'   },
              { icon: '🚗', label: 'Covered Parking'   },
              { icon: '📶', label: 'Smart Home Ready'  },
            ].map((f, i) => (
              <motion.div key={i} className="sp-feat-card"
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -6, borderColor: 'rgba(99,102,241,0.5)' }}>
                <span className="sp-feat-icon">{f.icon}</span>
                <span className="sp-feat-label">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 10. CTA ══ */}
      <section className="sp-section sp-cta-section" data-story-section="cta">
        <div className="sp-container">
          <motion.div className="sp-cta-inner"
            initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8 }}>
            <SplitWords text="Your story starts here." className="sp-cta-title" delay={0.1} duration={0.65} />
            <motion.p className="sp-cta-sub" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.7 }}>
              36 properties · Gurgaon · RERA Verified
            </motion.p>
            <motion.div className="sp-cta-btns" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.9 }}>
              <button className="sp-cta-primary" onClick={() => navigate('/')}>Browse Properties</button>
              <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="sp-cta-secondary">💬 Talk to an Expert</a>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
