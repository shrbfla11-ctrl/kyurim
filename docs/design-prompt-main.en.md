# PUF Main Page Design Prompt (for Claude Design)

Paste the text below directly into the Claude Design prompt box.

---

**Project**
"PUF (Physical Unclonable Function)" — a web service that identifies a pill when you point your phone camera at it. It reads the imprint/coated label on the pill surface and shows the pill's ingredients, effects, and warnings. This task is **one main (landing) page**, mobile-first (390px) plus desktop (1440px), two artboards.

**Design Direction**
- Follow the design language of the Korean fintech app Toss: generous whitespace, large and simple typography, card-based layout, one message per screen, minimal decoration, rounded corners (16–24px), subtle shadows.
- Colors: white/blue concept. Background #FFFFFF, secondary background #F2F4F6, accent blue #3182F6, primary text #191F28, secondary text #6B7684, a small amount of green for "recognition complete" states.
- Reflect current trends: use the style seen in Pinterest results for "2025 fintech app UI", "toss app design", "medical app minimal UI", "camera scan UI", "bento grid landing" (bento grids, large hero, soft blue gradients, a few 3D icons, micro-interaction-style status indicators). Prioritize trust and clarity over flashiness.
- Font: Pretendard (fallback Inter / Noto Sans KR). Headings 28–40px Bold, body 15–17px, line-height 1.5.
- Tone: a medical information service, so it must feel trustworthy and safe — not cold like a hospital, but friendly like Toss.

**Page Structure (top to bottom)**
1. Top navigation: logo (PUF blue wordmark with small subtext "Physical Unclonable Function"), 3 menu items (Pill Search, Medication Log, Guide), blue "Get Started" button on the right. Hamburger menu on mobile.
2. Hero: headline "Point your camera at a pill and know instantly" + one-sentence subcopy. Primary CTA "Identify a pill with camera" (large rounded blue button) + secondary CTA "Search by imprint". On the right (below on mobile), a smartphone mockup: a pill inside a camera viewfinder, imprint text highlighted, and a recognition result card floating over it.
3. How it works, 3 steps (3 horizontal cards, stacked on mobile): ① Point camera at the pill → ② Imprint, color, and shape recognized automatically → ③ See ingredients, effects, and warnings. Each card has a simple icon, short title, one-line description.
4. Result preview card: one large card showing what a recognition result looks like — pill image, drug name, main ingredient, 2–3 effect tags, a "Caution when taking" warning box (light yellow/red background), and a confidence badge like "98% match".
5. Key features bento grid (4–5 blocks): Imprint search / Find by color & shape / Save medication log / Drug interaction alerts / Family medication management. Vary block sizes for rhythm.
6. Trust section: "Based on Korea MFDS (Ministry of Food and Drug Safety) public data", plus 3 stats — registered pills, recognition accuracy, users (placeholders).
7. FAQ, 3 items (accordion): when recognition fails, whether photos are stored (privacy), not a substitute for medical advice.
8. Bottom CTA banner + footer: blue banner "Check your pill right now" + button. Footer with service name, Terms, Privacy Policy, and disclaimer ("This service is for reference only and does not replace diagnosis by a doctor or pharmacist").

**Component Rules**
- Buttons: height 52–56px, radius 14–16px, primary solid blue / secondary light blue background (#E8F3FF) with blue text.
- Cards: white background, radius 20px, shadow 0 2px 12px rgba(0,0,0,0.06), inner padding 24px.
- Icons: 2px line icons or soft 3D icons, monochrome blue palette.
- Camera UI mockup: 4 corner viewfinder guides, a scanning line while recognizing, then a green check and a result card sliding up when complete.

**Deliverables**
- One mobile artboard (390 × auto height) and one desktop artboard (1440 × auto height).
- All copy in Korean. Use example drug names (e.g. "타이레놀정 500mg, 아세트아미노펜") and placeholder numbers.
- Align every section to an 8px grid so it is easy to implement with Tailwind.
