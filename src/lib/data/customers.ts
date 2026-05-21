export type CohortId = "tourist" | "expat" | "local" | "jakarta";

export type Cohort = {
  id: CohortId;
  label: string;
  icon: string;
  dormantDays: number;
  totalCount: number;
  newDormantThisWeek: number;
  note?: string;
};

export type DormantCustomer = {
  id: string;
  name: string;
  cohort: CohortId;
  lastVisit: string; // "X days ago"
  lastVisitDays: number;
  reactivationScore: number; // 0–100
  topProducts: string[];
  lifetimeValueIDR: number;
  suggestedOffer: string;
  location: string;
  status: "ready" | "sent" | "approved";
  emailSubject: string;
  emailBody: string;
};

export const COHORTS: Cohort[] = [
  {
    id: "tourist",
    label: "Tourist",
    icon: "🧳",
    dormantDays: 30,
    totalCount: 3420,
    newDormantThisWeek: 184,
    note: "Shorter window — most leave the island within 2 weeks",
  },
  {
    id: "expat",
    label: "Expat",
    icon: "🏝️",
    dormantDays: 60,
    totalCount: 1180,
    newDormantThisWeek: 42,
  },
  {
    id: "local",
    label: "Local",
    icon: "🏠",
    dormantDays: 90,
    totalCount: 2750,
    newDormantThisWeek: 67,
  },
  {
    id: "jakarta",
    label: "Jakarta visitor",
    icon: "✈️",
    dormantDays: 45,
    totalCount: 640,
    newDormantThisWeek: 28,
  },
];

export const DORMANT_CUSTOMERS: DormantCustomer[] = [
  {
    id: "c01",
    name: "Sarah K.",
    cohort: "tourist",
    lastVisit: "45 days ago",
    lastVisitDays: 45,
    reactivationScore: 87,
    topProducts: ["Pain au Chocolat", "Almond Croissant", "Iced Latte"],
    lifetimeValueIDR: 2_840_000,
    suggestedOffer: "Welcome back to Bali — 15% off pastries",
    location: "Seminyak",
    status: "ready",
    emailSubject: "Sarah, we saved a Pain au Chocolat for you",
    emailBody:
      "Hi Sarah! It's been a while since your last visit to BAKED. Seminyak, and we've been saving a warm Pain au Chocolat with your name on it. You always loved the croissants — and this season we've added a few new pastries we think you'll enjoy. Planning your next Bali trip? Use this message for 15% off any pastry order. We can't wait to see you again. — The BAKED. team",
  },
  {
    id: "c02",
    name: "Made A.",
    cohort: "local",
    lastVisit: "95 days ago",
    lastVisitDays: 95,
    reactivationScore: 92,
    topProducts: ["Almond Croissant", "Cold Brew", "Sourdough Loaf"],
    lifetimeValueIDR: 8_120_000,
    suggestedOffer: "Your favorite Almond Croissant is back, 20% off next visit",
    location: "Canggu",
    status: "ready",
    emailSubject: "Made, your Almond Croissant is waiting — 20% off",
    emailBody:
      "Halo Made! Sudah 95 hari sejak kunjungan terakhir Anda ke BAKED. Canggu, dan kami merindukanmu. Almond Croissant favoritmu selalu segar setiap pagi, dan kami punya pastri baru yang belum kamu coba. Datang minggu ini dan nikmati diskon 20% untuk semua pastri — cukup tunjukkan pesan ini. Sampai jumpa! — Tim BAKED.",
  },
  {
    id: "c03",
    name: "Tom W.",
    cohort: "expat",
    lastVisit: "68 days ago",
    lastVisitDays: 68,
    reactivationScore: 74,
    topProducts: ["Cold Brew", "Sourdough Loaf", "Avocado Toast"],
    lifetimeValueIDR: 5_450_000,
    suggestedOffer: "We miss you — free coffee with any pastry order",
    location: "Canggu",
    status: "ready",
    emailSubject: "Tom — free Cold Brew on us, any day this week",
    emailBody:
      "Hi Tom! Life in Bali keeps you busy, and we get it — it's been 68 days since your last visit to BAKED. Canggu. You always started your mornings with a Cold Brew and our Sourdough, and honestly the café hasn't felt the same. Come in any day this week and enjoy a complimentary Cold Brew with any food order. No code needed, just show this message. — The BAKED. team",
  },
  {
    id: "c04",
    name: "Ayu P.",
    cohort: "local",
    lastVisit: "102 days ago",
    lastVisitDays: 102,
    reactivationScore: 81,
    topProducts: ["Banana Bread", "Matcha Cake Slice", "Iced Latte"],
    lifetimeValueIDR: 6_780_000,
    suggestedOffer: "Your favorite Banana Bread awaits — 20% off this week",
    location: "Ubud",
    status: "ready",
    emailSubject: "Ayu, your Banana Bread is freshly baked — come back",
    emailBody:
      "Halo Ayu! Sudah lebih dari 3 bulan sejak kunjungan terakhir di BAKED. Ubud. Banana Bread dan Matcha Cake Slice favoritmu masih ada, bahkan kami baru menambahkan resep baru bulan ini. Kunjungi kami minggu ini untuk mendapatkan diskon 20% untuk semua item favorit — cukup tunjukkan email ini. Kami senang menyambutmu kembali! — Tim BAKED.",
  },
  {
    id: "c05",
    name: "James R.",
    cohort: "jakarta",
    lastVisit: "52 days ago",
    lastVisitDays: 52,
    reactivationScore: 68,
    topProducts: ["Brownie", "Iced Latte", "Cinnamon Roll"],
    lifetimeValueIDR: 1_920_000,
    suggestedOffer: "Planning your next Bali trip? 10% off your visit",
    location: "Seminyak",
    status: "ready",
    emailSubject: "James — 10% off waiting for your next Bali visit",
    emailBody:
      "Hi James! You visited BAKED. Seminyak on your last Bali trip and we'd love to see you again. Your go-to Brownie and Iced Latte are exactly as you remember them — and we've added some new pastries this season. Next time you're in Bali, use code JAKARTA10 for 10% off your entire order. Looking forward to your visit! — The BAKED. team",
  },
  {
    id: "c06",
    name: "Ni Wayan S.",
    cohort: "local",
    lastVisit: "88 days ago",
    lastVisitDays: 88,
    reactivationScore: 77,
    topProducts: ["Brownie", "Cold Brew", "Pain au Chocolat"],
    lifetimeValueIDR: 4_350_000,
    suggestedOffer: "Your Brownie is calling — 20% off this week",
    location: "Seminyak",
    status: "ready",
    emailSubject: "Ni Wayan, your Brownie is fresh and ready — 20% off",
    emailBody:
      "Halo Ni Wayan! Kami sangat merindukanmu di BAKED. Seminyak. Sudah hampir 3 bulan, dan Brownie kesukaanmu tetap dibuat fresh setiap hari. Datang minggu ini untuk mendapatkan 20% off semua pesanan pastri dan minuman — tunjukkan email ini kepada barista kami. Sampai jumpa! — Tim BAKED.",
  },
  {
    id: "c07",
    name: "Emma L.",
    cohort: "tourist",
    lastVisit: "38 days ago",
    lastVisitDays: 38,
    reactivationScore: 94,
    topProducts: ["Coconut Cake Slice", "Almond Croissant", "Iced Latte"],
    lifetimeValueIDR: 1_560_000,
    suggestedOffer: "Planning your next Bali trip? 15% off pastries",
    location: "Ubud",
    status: "ready",
    emailSubject: "Emma, Bali (and your Coconut Cake) misses you",
    emailBody:
      "Hi Emma! You left Bali 38 days ago and we haven't forgotten you — or your love for the Coconut Cake Slice. It was so good to have you at BAKED. Ubud. When you're planning your next trip to Bali, we'll have a slice waiting. Use code EMMA15 for 15% off pastries on your first visit back. See you in paradise! — The BAKED. team",
  },
  {
    id: "c08",
    name: "Ryan T.",
    cohort: "jakarta",
    lastVisit: "47 days ago",
    lastVisitDays: 47,
    reactivationScore: 65,
    topProducts: ["Sourdough Loaf", "Cold Brew", "Brownie"],
    lifetimeValueIDR: 2_100_000,
    suggestedOffer: "Back in Jakarta? Visit BAKED. SCBD — 10% off",
    location: "Jakarta SCBD",
    status: "ready",
    emailSubject: "Ryan — your BAKED. table is ready at SCBD",
    emailBody:
      "Hi Ryan! Thanks for visiting us in Bali last month. Did you know we also have BAKED. right in Jakarta SCBD? Your favourites — Sourdough, Cold Brew, Brownie — are on the menu there too. Come in and use code RYAN10 for 10% off your order. No need to wait for a Bali trip to get your BAKED. fix! — The BAKED. team",
  },
  {
    id: "c09",
    name: "Ketut B.",
    cohort: "local",
    lastVisit: "115 days ago",
    lastVisitDays: 115,
    reactivationScore: 88,
    topProducts: ["Cold Brew", "Avocado Toast", "Sourdough Loaf"],
    lifetimeValueIDR: 7_230_000,
    suggestedOffer: "We saved your Cold Brew — 20% off this week",
    location: "Kuta",
    status: "ready",
    emailSubject: "Ketut, your Cold Brew table is waiting — 20% off",
    emailBody:
      "Halo Ketut! Sudah 115 hari sejak kunjungan terakhirmu ke BAKED. Kuta. Cold Brew kesukaanmu masih dituang fresh dari batch pagi, dan kami punya menu sarapan baru yang yakin akan kamu suka. Minggu ini, nikmati diskon 20% untuk semua pesanan — cukup tunjukkan email ini. Kami kangen melihatmu di sini! — Tim BAKED.",
  },
  {
    id: "c10",
    name: "Sophie M.",
    cohort: "expat",
    lastVisit: "72 days ago",
    lastVisitDays: 72,
    reactivationScore: 71,
    topProducts: ["Pain au Chocolat", "Iced Latte", "Coconut Cake Slice"],
    lifetimeValueIDR: 4_890_000,
    suggestedOffer: "Sunday brunch at BAKED — free coffee with any pastry",
    location: "Seminyak",
    status: "ready",
    emailSubject: "Sophie — Sunday brunch, on us (free coffee with pastry)",
    emailBody:
      "Hi Sophie! It's been 72 days since your last visit to BAKED. Seminyak and Sundays haven't quite been the same. You always loved a Pain au Chocolat with your morning coffee — so here's our offer: come in any Sunday this month and enjoy a complimentary coffee with any pastry order. No code needed. We'll have your table ready. — The BAKED. team",
  },
];
