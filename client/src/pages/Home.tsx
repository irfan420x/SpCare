/*
 * SPCare Reference UI Reminder — mobile-first public service dashboard:
 * bright white canvas, compact utility header, location-aware search,
 * scenic feature card, two-row service grid, quick actions, official post,
 * weather/AQI/date insights, and fixed bottom navigation with a central post action.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, Bell, BookOpen, Building2, CalendarDays, ChevronDown, ChevronLeft,
  ChevronRight, Clock3, CloudSun, Heart, HelpCircle, Home as HomeIcon, Landmark, MapPin, Menu,
  MessageCircle, MoreVertical, Navigation, PhoneCall, Search, Send, Share2, ShieldCheck,
  Siren, Sparkles, Star, Stethoscope, Trees, UserRound, Users, Wind, X, Zap, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useSpCareHomepage, useSpCareWeather } from "@/lib/spcareApi";

const LOGO_IMAGE = "/manus-storage/spcare-reference-logo_15746cc1.png";
const FEATURE_IMAGE = "/manus-storage/spcare-madhutila-feature_e192a1b9.jpg";

type IconType = typeof Heart;
type Category = { id: string; title: string; subtitle: string; icon: IconType; color: string };
type Feature = { id: string; tag: string; title: string; location: string; rating: string; reviews: string; image: string; tone: string };

const categoryIconMap: Record<string, IconType> = { stethoscope: Stethoscope, siren: Siren, activity: Activity, landmark: Landmark, users: Users, trees: Trees, heart: Heart, building: Building2 };

const categories: Category[] = [
  { id: "hospital", title: "হাসপাতাল", subtitle: "হাসপাতাল ও স্বাস্থ্যসেবা তথ্য", icon: Stethoscope, color: "red" },
  { id: "emergency", title: "জরুরি সেবা", subtitle: "জরুরি কল ও সহায়তা সেবা", icon: Siren, color: "orange" },
  { id: "blood", title: "ব্লাড ব্যাংক", subtitle: "রক্তদান, খুঁজুন জীবন বাঁচান", icon: Activity, color: "crimson" },
  { id: "government", title: "সরকারি সেবা", subtitle: "সরকারি অফিস ও সেবা সমূহ", icon: Landmark, color: "green" },
  { id: "social", title: "সোশ্যাল", subtitle: "পোস্ট, গ্রুপ ও কমিউনিটি", icon: Users, color: "purple" },
  { id: "tourism", title: "পর্যটন", subtitle: "পর্যটন স্থান ও ভ্রমণ গাইড", icon: Trees, color: "blue" },
  { id: "ngo", title: "সেবা সংস্থা", subtitle: "এনজিও ও সামাজিক সংগঠনসমূহ", icon: Heart, color: "teal" },
  { id: "hotel", title: "হোটেল ও রিসোর্ট", subtitle: "হোটেল ও থাকার ব্যবস্থা", icon: Building2, color: "sky" },
];

const features: Feature[] = [
  { id: "madhutila", tag: "পর্যটন", title: "মধুটিলা ইকোপার্ক", location: "নালিতাবাড়ী, শেরপুর", rating: "৪.২", reviews: "২.২K রিভিউ", image: FEATURE_IMAGE, tone: "green" },
  { id: "hospital", tag: "স্বাস্থ্যসেবা", title: "শেরপুর জেলা হাসপাতাল", location: "শেরপুর সদর", rating: "৪.৭", reviews: "৮৬ রিভিউ", image: "/manus-storage/spcare-tourism_ac7e1da7.jpg", tone: "red" },
  { id: "gajni", tag: "পর্যটন", title: "গজনী অবকাশ কেন্দ্র", location: "ঝিনাইগাতী, শেরপুর", rating: "৪.৫", reviews: "১.৪K রিভিউ", image: "/manus-storage/spcare-tourism_ac7e1da7.jpg", tone: "blue" },
];

const quickActions = [
  { id: "call", title: "জরুরি কল", subtitle: "৯৯৯-এ কল করুন", icon: PhoneCall, color: "green" },
  { id: "nearby", title: "নিকটস্থ সেবা", icon: Navigation, color: "blue" },
  { id: "help", title: "সহায়তা চাই", icon: MessageCircle, color: "purple" },
  { id: "notice", title: "ঘোষণা", icon: Send, color: "orange" },
  { id: "share", title: "শেয়ার করুন", icon: Share2, color: "teal" },
];

const searchItems = [
  { title: "শেরপুর জেলা হাসপাতাল", meta: "স্বাস্থ্যসেবা · সদর", icon: Stethoscope },
  { title: "মধুটিলা ইকোপার্ক", meta: "পর্যটন · নালিতাবাড়ী", icon: Trees },
  { title: "জেলা প্রশাসকের কার্যালয়", meta: "সরকারি সেবা · সদর", icon: Landmark },
  { title: "ফায়ার সার্ভিস", meta: "জরুরি সেবা · ২৪/৭", icon: Siren },
];

function Logo() {
  return <a href="#top" className="app-logo" aria-label="SpCare হোমে ফিরুন"><img src={LOGO_IMAGE} alt="" /><span><strong>SpCare</strong><small>এক জেলা, এক প্ল্যাটফর্ম</small></span></a>;
}

function SectionTitle({ title, action = "সব দেখুন" }: { title: string; action?: string }) {
  return <div className="section-title"><h2>{title}</h2><button onClick={() => toast(`${action} — ডেমো তালিকা শিগগিরই আসছে`)}>{action}<ArrowRight size={16} /></button></div>;
}

export default function Home() {
  const homepageQuery = useSpCareHomepage();
  const weatherQuery = useSpCareWeather();
  const [featureIndex, setFeatureIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("hospital");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const liveFeatures: Feature[] = homepageQuery.data?.featured?.map((item) => ({ id: String(item.id), tag: item.tagBn, title: item.titleBn, location: item.locationBn, rating: item.ratingLabel ?? "ডেমো তথ্য", reviews: "", image: item.imageUrl, tone: item.tagBn === "স্বাস্থ্যসেবা" ? "red" : "green" })) ?? [];
  const visibleFeatures = liveFeatures.length > 0 ? liveFeatures : features;
  const liveServices = homepageQuery.data?.services ?? [];
  const liveNotice = homepageQuery.data?.notices?.[0];

  useEffect(() => {
    const timer = window.setInterval(() => setFeatureIndex((current) => (current + 1) % visibleFeatures.length), 4800);
    return () => window.clearInterval(timer);
    }, [visibleFeatures.length]);
  
  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return searchItems;
    return searchItems.filter((item) => `${item.title} ${item.meta}`.toLowerCase().includes(term));
  }, [search]);
  const liveCategories: Category[] = homepageQuery.data?.categories?.map((item) => ({ id: item.slug, title: item.nameBn, subtitle: item.subtitleBn ?? item.nameEn, icon: categoryIconMap[item.iconKey] ?? Building2, color: item.accent === "gold" ? "orange" : item.accent === "red" ? "red" : "green" })) ?? [];
  const visibleCategories = liveCategories.length > 0 ? liveCategories : categories;
  const feature = visibleFeatures[featureIndex % visibleFeatures.length];

  const openSearchResult = (title: string) => {
    setSearch(title);
    setSearchOpen(false);
    toast.success(`“${title}” এর তথ্য প্রস্তুত`);
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const actionMessage = (id: string) => {
    const messages: Record<string, string> = { call: "জরুরি সহায়তা নম্বর ৯৯৯-এ কল করার প্রস্তুতি নেওয়া হয়েছে", nearby: "আপনার কাছাকাছি সেবা খোঁজা হচ্ছে", help: "সহায়তা অনুরোধের ডেমো ফর্ম শিগগিরই আসছে", notice: "ঘোষণা দেখার জায়গা প্রস্তুত হচ্ছে", share: "শেয়ার অপশন শিগগিরই চালু হবে" };
    if (id === "call") toast.success(messages[id]); else toast(messages[id]);
  };

  return <div className="reference-app" id="top">
    <header className="app-header"><div className="app-header-row"><button className="round-button menu-button" onClick={() => setMenuOpen(true)} aria-label="মেনু খুলুন"><Menu size={23} /></button><Logo /><button className="location-picker" onClick={() => toast("লোকেশন পরিবর্তনের ডেমো আসছে")}><MapPin size={18} /><span>শেরপুর জেলা</span><ChevronDown size={15} /></button><div className="header-tools"><button className={`round-button ${notificationsOpen ? "active" : ""}`} onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} aria-label="নোটিফিকেশন"><Bell size={20} /><span className="notification-count">3</span></button><button className={`profile-avatar ${profileOpen ? "active" : ""}`} onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} aria-label="প্রোফাইল"><UserRound size={21} /></button></div>{notificationsOpen && <div className="header-dropdown notification-menu"><strong>নোটিফিকেশন</strong><div className="drop-notice"><span className="drop-icon drop-icon--red"><Siren size={15} /></span><span><b>জরুরি নোটিস আপডেট</b><small>২ ঘণ্টা আগে</small></span></div><div className="drop-notice"><span className="drop-icon drop-icon--green"><ShieldCheck size={15} /></span><span><b>নতুন সেবা যাচাই হয়েছে</b><small>আজ · SpCare Official</small></span></div></div>}{profileOpen && <div className="header-dropdown profile-menu"><div className="profile-menu-head"><span className="profile-avatar profile-avatar--large"><UserRound size={21} /></span><span><b>রহিম</b><small>শেরপুর সদর</small></span></div><button onClick={() => toast("প্রোফাইল ডেমো মোডে আছে")}><UserRound size={15} /> আমার প্রোফাইল <ArrowRight size={14} /></button><button onClick={() => toast("সংরক্ষিত তালিকা শিগগিরই আসছে")}><BookOpen size={15} /> সংরক্ষিত তালিকা <ArrowRight size={14} /></button></div>}</div><div className="search-area"><div className={`main-search ${searchOpen ? "focused" : ""}`}><Search size={21} /><input value={search} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder="সার্চ করুন (হাসপাতাল, সেবা, পর্যটন...)" aria-label="সার্চ করুন" /><button onClick={() => { setSearchOpen(false); if (search.trim()) openSearchResult(search); }} aria-label="সার্চ"><ArrowRight size={18} /></button></div>{searchOpen && <div className="search-results"><div className="search-results-label">জনপ্রিয় খোঁজ</div>{matches.map((item) => { const Icon = item.icon; return <button key={item.title} onMouseDown={() => openSearchResult(item.title)}><span className="search-result-icon"><Icon size={17} /></span><span><b>{item.title}</b><small>{item.meta}</small></span><ArrowRight size={14} /></button>; })}{matches.length === 0 && <p>এই নামে কোনো demo তথ্য পাওয়া যায়নি।</p>}</div>}</div></header>
    {menuOpen && <div className="mobile-drawer"><div className="drawer-top"><Logo /><button className="round-button" onClick={() => setMenuOpen(false)} aria-label="মেনু বন্ধ করুন"><X size={21} /></button></div><div className="drawer-user"><span className="profile-avatar profile-avatar--large"><UserRound size={22} /></span><span><b>রহিম</b><small>শেরপুর সদর থেকে ব্রাউজ করছেন</small></span></div><a href="#services" onClick={() => setMenuOpen(false)}>সেবা সমূহ <ArrowRight size={17} /></a><a href="#posts" onClick={() => setMenuOpen(false)}>সাম্প্রতিক পোস্ট <ArrowRight size={17} /></a><a href="#about" onClick={() => setMenuOpen(false)}>SpCare সম্পর্কে <ArrowRight size={17} /></a><button onClick={() => toast("সহায়তা কেন্দ্র শিগগিরই আসছে")}>সহায়তা কেন্দ্র <ArrowRight size={17} /></button></div>}

    <main className="app-main">
      <section className="feature-section">{homepageQuery.isLoading ? <div className="section-data-state"><Loader2 size={18} className="animate-spin" /> Featured content লোড হচ্ছে...</div> : !homepageQuery.isError && liveFeatures.length === 0 ? <div className="section-data-state">এই মুহূর্তে কোনো featured content প্রকাশিত হয়নি।</div> : homepageQuery.isError ? <div className="section-data-state section-data-state--fallback">API পাওয়া যায়নি — offline demo featured content দেখানো হচ্ছে।</div> : null}{!homepageQuery.isLoading && (homepageQuery.isError || liveFeatures.length > 0) && <><div className={`feature-card feature-card--${feature.tone}`} style={{ backgroundImage: `url(${feature.image})` }}><div className="feature-shade" /><div className="feature-content"><span className="feature-tag">{feature.tag}</span><h1 key={feature.id}>{feature.title}</h1><p><MapPin size={16} /> {feature.location}</p><div className="feature-bottom"><span className="rating"><Star size={18} fill="currentColor" /> <b>{feature.rating}</b> <span>({feature.reviews})</span></span><button onClick={() => toast(`${feature.title} এর বিস্তারিত ডেমো পেজ শিগগিরই আসছে`)}>বিস্তারিত দেখুন <ArrowRight size={18} /></button></div></div><button className="feature-prev" onClick={() => setFeatureIndex((featureIndex - 1 + visibleFeatures.length) % visibleFeatures.length)} aria-label="আগের featured item"><ChevronLeft size={18} /></button><button className="feature-next" onClick={() => setFeatureIndex((featureIndex + 1) % visibleFeatures.length)} aria-label="পরের featured item"><ChevronRight size={18} /></button></div><div className="carousel-dots">{visibleFeatures.map((item, index) => <button key={item.id} className={index === featureIndex ? "active" : ""} onClick={() => setFeatureIndex(index)} aria-label={`${index + 1} নম্বর featured item`}><span /></button>)}</div></>}</section>

      <section className="content-section" id="services"><SectionTitle title="আমাদের সেবা সমূহ" />{homepageQuery.isFetching ? <p className="data-sync-note">ডিরেক্টরি থেকে তথ্য আপডেট হচ্ছে...</p> : homepageQuery.isError ? <p className="data-sync-note data-sync-note--fallback">অফলাইন demo তথ্য দেখানো হচ্ছে</p> : null}<div className="category-grid">{visibleCategories.map((item) => { const Icon = item.icon; return <button key={item.id} className={`category-tile category-tile--${item.color} ${item.id === "hospital" || item.id === "emergency" ? "priority" : ""} ${selectedCategory === item.id ? "selected" : ""}`} onClick={() => { setSelectedCategory(item.id); toast(`${item.title} বিভাগ নির্বাচিত হয়েছে`); }}><span className="tile-icon"><Icon size={27} /></span><strong>{item.title}</strong><small>{item.subtitle}</small></button>; })}</div></section>

      <section className="content-section directory-section" id="directory"><SectionTitle title="সেবা ডিরেক্টরি" /><div className="directory-state">{homepageQuery.isLoading ? <><Loader2 size={16} className="animate-spin" /> ডিরেক্টরি লোড হচ্ছে...</> : homepageQuery.isError ? <>অফলাইন demo directory দেখানো হচ্ছে</> : liveServices.length === 0 ? <>এখনো কোনো public service প্রকাশিত হয়নি</> : <div className="service-mini-grid">{liveServices.slice(0, 4).map((service) => <button key={service.id} className="service-mini-card" onClick={() => toast(`${service.nameBn} এর বিস্তারিত ডেমো পেজ শিগগিরই আসছে`)}><span className="service-mini-icon"><Building2 size={18} /></span><span><strong>{service.nameBn}</strong><small>{service.categoryNameBn ?? "সেবা"} · {service.upazilaBn ?? service.districtBn}</small></span><ArrowRight size={15} /></button>)}</div>}</div></section>

      <section className="content-section quick-section"><SectionTitle title="দ্রুত কর্ম" action="" /><div className="quick-card">{quickActions.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => actionMessage(item.id)}><span className={`quick-icon quick-icon--${item.color}`}><Icon size={22} /></span><span>{item.title}</span></button>; })}</div></section>

      <section className="content-section" id="posts"><SectionTitle title="সাম্প্রতিক পোস্ট" />{homepageQuery.isLoading ? <div className="section-data-state"><Loader2 size={18} className="animate-spin" /> সাম্প্রতিক পোস্ট লোড হচ্ছে...</div> : !homepageQuery.isError && !liveNotice ? <div className="section-data-state">এখনো কোনো প্রকাশিত পোস্ট/নোটিশ নেই।</div> : homepageQuery.isError ? <div className="section-data-state section-data-state--fallback">API পাওয়া যায়নি — offline demo notice দেখানো হচ্ছে।</div> : null}{(homepageQuery.isError || Boolean(liveNotice)) && <article className="post-card"><div className="post-head"><span className="official-avatar">♥</span><span><strong>SpCare Official <ShieldCheck size={16} fill="currentColor" /></strong><small>২ ঘণ্টা আগে · <MapPin size={11} /> শেরপুর</small></span><button aria-label="আরও অপশন" onClick={() => toast("পোস্ট অপশন ডেমো মোডে আছে")}><MoreVertical size={19} /></button></div><div className="post-body"><div><h3>{liveNotice?.titleBn ?? "শেরপুরে বিনামূল্যে স্বাস্থ্য ক্যাম্প আগামী শনিবার..."}</h3><p>{liveNotice?.bodyBn ?? "জেলা স্বাস্থ্য বিভাগের উদ্যোগে সকাল ৯টা থেকে বিনামূল্যে স্বাস্থ্য পরামর্শ, রক্তচাপ ও ডায়াবেটিস পরীক্ষা।"}</p><span className="post-meta"><Clock3 size={13} /> ৫ সেপ্টেম্বর · সকাল ৯টা</span></div><div className="post-visual"><span>বিনামূল্যে<br /><b>স্বাস্থ্য ক্যাম্প</b></span><Stethoscope size={22} /></div></div><div className="post-actions"><button className={liked ? "liked" : ""} onClick={() => setLiked((value) => !value)}><Heart size={18} fill={liked ? "currentColor" : "none"} /> {liked ? "১২১" : "১২০"}</button><button onClick={() => toast("মন্তব্য ডেমো মোডে আছে")}><MessageCircle size={18} /> ২৩</button><button onClick={() => toast("পোস্ট শেয়ার ডেমো মোডে আছে")}><Share2 size={18} /> ১৫</button><button className={`save-post ${saved ? "saved" : ""}`} onClick={() => { setSaved((value) => !value); toast(saved ? "সংরক্ষণ থেকে সরানো হয়েছে" : "পোস্টটি সংরক্ষণ করা হয়েছে"); }}><BookOpen size={17} /></button></div></article>}</section>

      <section className="content-section insight-section"><div className="insight-grid"><article className="insight-card insight-card--weather"><div className="insight-icon"><CloudSun size={27} /></div><div><strong>{weatherQuery.data ? `${weatherQuery.data.temperatureC}°C` : "৩১°C"}</strong><span>{weatherQuery.data?.labelBn ?? "সুন্দর আবহাওয়া"}</span></div><div className="insight-location"><MapPin size={13} /> {weatherQuery.data?.location ?? "শেরপুর"}</div></article><article className="insight-card insight-card--aqi"><div className="insight-icon"><Wind size={27} /></div><div><strong>AQI 42</strong><span>ভালো</span></div><div className="insight-location"><Activity size={13} /> বায়ুর মান</div></article><article className="insight-card insight-card--date"><div className="insight-icon"><CalendarDays size={27} /></div><div><strong>২৯ আগস্ট ২০২৬</strong><span>শনিবার</span></div><div className="insight-location"><Clock3 size={13} /> ১১:৩৫ পূর্বাহ্ণ</div></article></div></section>

      <section className="about-strip" id="about"><div><span className="about-kicker">SPCARE / COMMUNITY DESK</span><h2>এক জেলা,<br /><strong>এক প্ল্যাটফর্ম।</strong></h2><p>শেরপুরের দরকারি তথ্য ও সেবা—সহজে, একসঙ্গে।</p></div><button onClick={() => toast("SpCare সম্পর্কে বিস্তারিত শিগগিরই আসছে")}>আরও জানুন <ArrowRight size={17} /></button></section>
    </main>

    <nav className="bottom-nav" aria-label="নিচের নেভিগেশন"><button className={activeNav === "home" ? "active" : ""} onClick={() => setActiveNav("home")}><HomeIcon size={21} /><span>হোম</span></button><button className={activeNav === "services" ? "active" : ""} onClick={() => { setActiveNav("services"); document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }}><Sparkles size={21} /><span>সেবা সমূহ</span></button><button className="post-action" onClick={() => toast("নতুন পোস্ট তৈরির ডেমো ফর্ম শিগগিরই আসছে")}><span><span>+</span></span><small>পোস্ট করুন</small></button><button className={activeNav === "messages" ? "active" : ""} onClick={() => { setActiveNav("messages"); toast("বার্তা সেকশন শিগগিরই আসছে"); }}><MessageCircle size={21} /><span>বার্তা</span></button><button className={activeNav === "profile" ? "active" : ""} onClick={() => { setActiveNav("profile"); setProfileOpen(true); }}><UserRound size={21} /><span>প্রোফাইল</span></button></nav>
  </div>;
}
