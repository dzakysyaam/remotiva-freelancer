export const categoryIconMap = {
  "Programming & Tech": "programming-tech",
  "Graphics & Design": "graphic-design",
  "Graphic & Design": "graphic-design",
  "Digital Marketing": "digital-marketing",
  "Writing & Translation": "writing-translation",
  "Video & Animation": "video-animation",
  "AI Services": "ai-services",
  "Music & Audio": "music-audio",
  "Business": "business",
  "Consulting": "consulting",
  "Data": "data-analytics",
  "Desain": "graphic-design",
  "Pemasaran": "digital-marketing",
  "Penulisan": "writing-translation",
  "Video": "video-animation",
  "Pemrograman": "programming-tech",
};

export function getCategoryIconName(categoryName) {
  const value = String(categoryName || "").toLowerCase();

  if (value.includes("program") || value.includes("tech") || value.includes("pemrograman")) return "programming-tech";
  if (value.includes("design") || value.includes("desain") || value.includes("graphic") || value.includes("grafis")) return "graphic-design";
  if (value.includes("marketing") || value.includes("pemasaran")) return "digital-marketing";
  if (value.includes("writing") || value.includes("penulisan") || value.includes("translation") || value.includes("terjemahan")) return "writing-translation";
  if (value.includes("video") || value.includes("animation") || value.includes("animasi")) return "video-animation";
  if (value.includes("ai") || value.includes("kreator")) return "ai-services";
  if (value.includes("music") || value.includes("audio")) return "music-audio";
  if (value.includes("business") || value.includes("bisnis")) return "business";
  if (value.includes("consult")) return "consulting";
  if (value.includes("data") || value.includes("analytics")) return "data-analytics";

  return "business";
}

export const dashboardIconMap = {
  earnings: "earnings",
  orders: "orders",
  activeOrders: "active-orders",
  completed: "completed",
  incomingOrders: "incoming-orders",
  customerService: "headset",
  analytics: "analytics",
  settings: "settings",
  users: "users",
  payments: "payments",
  tickets: "tickets",
  userManagement: "user-management",
};

export const paymentIconMap = {
  card: "credit-card",
  bank: "bank-transfer",
  wallet: "e-wallet",
  qris: "qris",
  lock: "lock-payment",
};

export const csIconMap = {
  chat: "chat",
  send: "send",
  headset: "headset",
  close: "close",
};

export const emptyStateIconMap = {
  orders: "empty-orders",
  services: "empty-services",
  chat: "empty-chat",
  saved: "empty-saved",
};
