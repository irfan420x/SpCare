# SPCare Homepage — Design Brainstorm

## Approach 1 — নদী-খাতের ডিজিটাল টাউনস্কেপ
**Very Brief Intro:** শেরপুরের নদী, মাটি ও নাগরিক সেবার মানচিত্রকে একসঙ্গে ধরে একটি warm editorial civic-tech অভিজ্ঞতা। অফ-হোয়াইট কাগজের মতো পটভূমি, ink navy typography এবং সতর্কতার জন্য উজ্জ্বল coral—একটি বিশ্বাসযোগ্য, মানবিক ও স্থানীয় ডিজিটাল প্ল্যাটফর্মের অনুভূতি তৈরি করবে।

**Probability:** 0.07

## Approach 2 — মেঘ-নীল সার্ভিস ডেস্ক
**Very Brief Intro:** নরম sky blue, পরিষ্কার সাদা প্যানেল এবং সরকারি নীলের উপর দাঁড়ানো শান্ত, utility-first ইন্টারফেস। দ্রুত স্ক্যান করা যায়, কিন্তু একটি সামান্য archival map-texture ও compact navigation এটিকে সাধারণ admin template হতে দেবে না।

**Probability:** 0.04

## Approach 3 — রাতের জরুরি পালস
**Very Brief Intro:** low-key charcoal canvas, signal orange এবং mint-green status accent দিয়ে রিয়েল-টাইম নাগরিক আপডেটের একটি দৃঢ়, আধুনিক control-room mood। জরুরি নোটিসে শক্তিশালী, তবে সাধারণ হোমপেজের জন্য তুলনামূলকভাবে বেশি intense।

**Probability:** 0.09

---

# Selected Direction — Approach 1: নদী-খাতের ডিজিটাল টাউনস্কেপ

## Design Movement
Contemporary editorial wayfinding meets civic-tech utility—local newspaper typography, cartographic annotation, and modern service-directory interaction in one composed interface.

## Core Principles
1. **সিগন্যাল আগে:** জরুরি নোটিস, আবহাওয়া ও প্রধান সার্চ—প্রথম স্ক্রিনেই অগ্রাধিকার পাবে।
2. **কার্ড নয়, পথনির্দেশ:** সবকিছু সমান rounded card না করে, rules, index numbers, notches এবং visual anchors দিয়ে সেকশনগুলোর hierarchy তৈরি হবে।
3. **স্থানীয়তার মর্যাদা:** শেরপুরের নদী, সবুজ, মাটি ও মানুষের ব্যবহারের ভাষা visual system-এর অংশ হবে; stock-tech aesthetic নয়।
4. **কম ঘর্ষণ:** বড় touch target, পরিষ্কার বাংলা copy, keyboard focus এবং reduced-motion support—প্রতিটি interaction-এ।

## Color Philosophy
বেস হিসেবে নরম কাগজ-রঙের **#F5F1E8** ব্যবহার করা হবে, যাতে interface-টি উষ্ণ ও দীর্ঘক্ষণ পড়তে আরামদায়ক হয়। **Ink navy #142A36** হবে বিশ্বাস ও গভীরতার anchor; **river teal #087E8B** তথ্য ও navigation-এ জীবন আনবে; **signal coral #F26457** জরুরি নোটিস ও গুরুত্বপূর্ণ CTA-তে সীমিতভাবে ব্যবহার হবে। **ধান-হলুদ #F2C14E** status ও local warmth-এর ছোট ইঙ্গিত দেবে। রঙের উদ্দেশ্য decoration নয়—দ্রুত decision support এবং emotional trust তৈরি করা।

## Layout Paradigm
কেন্দ্রে সবকিছু গাদাগাদি না করে একটি editorial rail: বামদিকে ছোট section marker ও context labels, ডানদিকে content field। hero-তে asymmetric split, services-এ horizontal scroll rail, categories-এ dense but airy matrix, এবং desktop-এ একটি slim “Sherpur index” side rail থাকবে। মোবাইলে একই hierarchy vertical flow-তে রূপ নেবে।

## Signature Elements
- **River-line rule:** teal বা coral-র একটি পাতলা বাঁকানো রেখা/route motif, section divider ও active state-এ ব্যবহার হবে।
- **Index tags:** `01 / 08`, `LIVE`, `UPDATE`-এর মতো ছোট uppercase বাংলা/Latin micro-label, যেন একটি civic field guide।
- **Paper grain + map contour:** background-এ খুব হালকা noise/contour texture, যাতে flat digital surface না লাগে।

## Interaction Philosophy
ব্যবহারকারীকে browse নয়, “next useful thing” খুঁজে পেতে সাহায্য করা হবে। Search field-এ live suggestion, category click-এ active context, notice slide-এ pause/play ও readable progress, service card-এ clear affordance। Hover subtle lift; click-এ দৃশ্যমান pressed state; placeholder action-এ sonner toast দিয়ে স্পষ্ট feedback।

## Animation
প্রথম load-এ content 30–60ms stagger-এ soft translateY + opacity দিয়ে প্রবেশ করবে; hero slide change হবে 280ms ease-out crossfade/translate-এ; progress indicator 3 সেকেন্ডে এগোবে। Hover transition 160ms, dropdown 180ms, drawer 240ms-এর মধ্যে থাকবে। Reduced-motion mode-এ সব non-essential transform ও autoplay বন্ধ থাকবে।

## Typography System
Display ও headings: **Noto Serif Bengali**, 600–700 weight—স্থানীয় editorial authority ও সংবাদ-ধর্মী urgency-এর জন্য। Body/UI: **Noto Sans Bengali**, 400–600 weight—স্ক্যানযোগ্যতা ও ছোট স্ক্রিনে clarity-এর জন্য। বড় hero heading 42–64px desktop / 30–36px mobile; section title 22–28px; service title 16–18px; metadata 11–12px with letter spacing.

## Brand Essence
**Positioning:** শেরপুরের মানুষ, পরিবার ও সেবাদাতাদের জন্য এক জায়গায় যাচাইকৃত নাগরিক তথ্য, জরুরি আপডেট ও স্থানীয় সেবা খুঁজে পাওয়ার সহজ digital field guide—সাধারণ directory-এর চেয়ে বেশি মানবিক, দ্রুত এবং স্থানভিত্তিক।

**Personality:** মানবিক, নির্ভরযোগ্য, চটপটে

## Brand Voice
Headline-এ সংক্ষিপ্ত, সংবাদ-সদৃশ clarity; CTA-তে নির্দেশনা নয়, সহায়তার টোন; microcopy-তে স্থানীয় ও সরল ভাষা। Generic filler এড়ানো হবে।

**Example lines:**
- “যেখানে দরকার, সেখানেই শেরপুরের সেবা।”
- “আজকের জরুরি আপডেট—জেনে নিন, তারপর এগোন।”

## Wordmark & Logo
Logo mark হবে শেরপুরের মানচিত্রের abstract contour এবং একটি ছোট river bend-এর মিলিত symbol—দুইটি flowing stroke একটি forward-facing location pin তৈরি করবে। Wordmark-এ বাংলা `SPCare`-এর পাশে ছোট `শেরপুর` label থাকবে; logo symbol text ছাড়া standalone favicon হিসেবেও কাজ করবে।

## Signature Brand Color
**River Teal — #087E8B**

এটি SPCare-এর ownable signal color: স্থানীয় জলধারা ও নির্ভরযোগ্য service pathway—দুটিরই visual shorthand।

## Implementation Reminder
এই নীতিগুলো `client/src/index.css`, `client/src/App.tsx`, এবং প্রতিটি page/component ফাইলের শীর্ষে সংক্ষিপ্ত comment হিসেবে রাখা হবে। সিদ্ধান্তের সময় প্রশ্ন থাকবে: **“এই choice কি নদী-খাতের ডিজিটাল টাউনস্কেপকে শক্তিশালী করছে, নাকি dilute করছে?”**

## Demo Scope
এই প্রথম ডেমোতে সম্পূর্ণ ফ্রন্টএন্ড-only mock data ব্যবহার করা হবে: fixed responsive header, search suggestions, autoplay notice slider with manual controls, live-style weather widget, category matrix, service rails, detail drawer/toast interactions, mobile menu, profile dropdown, accessibility labels, and compact footer. Backend/API সংযোগ এই iteration-এর বাইরে থাকবে।

## Style Decisions
- Prefer warm editorial civic-tech over generic SaaS styling.
- Use asymmetry, index labels, route lines, and texture to create hierarchy.
- Keep urgent coral reserved for alerts and primary moments.
- Avoid excessive centered layouts, uniform rounded cards, purple gradients, and Inter-like default typography.
- Make motion purposeful and disable non-essential autoplay/transform under reduced-motion preferences.


# Redesign Ground Truth — SPCare Enterprise Grade

The previous editorial field-guide direction is retired for this iteration. The new source of truth is the user-provided Enterprise Grade design system: a clean, scalable service platform with **primary green #0A6E4B**, **secondary gold #E6A817**, **emergency red #D32F2F**, **neutral background #F8F9FA**, white cards, and **#2D3748** text. Bengali content uses Hind Siliguri; English/UI labels use Inter. The spacing rhythm follows 4px units, the card system uses rounded-xl, buttons use rounded-lg, sheets/modals use rounded-2xl, and elevation follows shadow-sm / shadow-md / shadow-lg by interaction level.

The redesign should feel like a trustworthy, high-clarity civic service hub rather than an editorial field guide. Hierarchy comes from a compact utility header, a direct search-first hero, clear category cards, service filters, and practical status information. Motion stays subtle and functional. The existing demo interactions remain, but composition, typography, colors, radius, and density must be rebuilt to match this specification.

**Decision question:** Does this choice reinforce the Enterprise Grade service-system language, or dilute it with unnecessary editorial decoration?


## Style Decisions — Enterprise Grade Review Pass

- Keep #0A6E4B as the dominant identity color; reserve #E6A817 for status and warmth, and #D32F2F only for emergency or urgent actions.
- Make the first screen read as a compact civic service desk focused on search, emergency access, weather/status, and top service pathways—not a scenic campaign banner.
- Use Hind Siliguri with compact service-platform hierarchy rather than expressive newspaper-style display treatment.
- Apply a stricter, shared card rhythm across quick actions, categories, service listings, and statistics.
- Keep every CTA practical and assistance-led, answering what the visitor can do next.


# Mobile Reference Ground Truth — SPCare App Dashboard

The attached reference image is the source of truth for this pass. Its defining traits are a bright white mobile canvas, a compact top utility row with hamburger/logo/location/notifications/profile, a full-width rounded search field, a large scenic feature card with category pill, location, rating and green CTA, a two-row service category grid, a rounded quick-action rail, a recent official post card, three compact weather/AQI/date cards, and a fixed bottom navigation with a central green post action. The new implementation should preserve this hierarchy closely while adding polished states and realistic demo data.
