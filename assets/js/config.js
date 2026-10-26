/* =====================================================================
 * US KITES — SITE CONFIG (single source of truth)
 * ---------------------------------------------------------------------
 * Edit ONLY this file to update the season, WhatsApp number, licence,
 * dates, products and prices. Every place on the page that shows the
 * year, number, licence etc. is filled from here automatically.
 * ===================================================================== */
window.SITE_CONFIG = {
  /* ---- Season ------------------------------------------------------ */
  basantYear: 2027,                 // <- change once a year, nothing else
  // Govt-notified Basant festival dates (ISO format YYYY-MM-DD).
  // Used for the countdown and the "delivery / pickup" section.
  basantDates: ["2027-03-12", "2027-03-13", "2027-03-14"],
  // Set false while dates are not yet notified — page says "dates to be announced".
  datesConfirmed: true,
  bookingOpen: true,                // false => buttons say "Join waiting list"

  /* ---- Business ---------------------------------------------------- */
  brandName: "US Kites",
  tagline: "Fly with US Kites",
  slogan: "Fly Higher, Stronger!",
  logo: "assets/images/logo.svg",   // replace with the original logo file if you have it
  city: "Lahore",
  siteUrl: "https://uskites.pk",   // used for canonical / Open Graph / schema
  // WhatsApp number in international format, digits only (no +, no spaces).
  whatsappNumber: "923298750100",   // 0329 8750100
  whatsappDisplay: "0329 8750100",
  pickupAddress: "Mochi Gate, Walled City, Lahore", // TODO: real pickup point
  pickupMapUrl: "https://maps.google.com/?q=Mochi+Gate+Lahore",
  deliveryAreas: "All over Lahore (other cities on request)",
  businessHours: "11:00 AM – 10:00 PM, every day",

  /* ---- TikTok ------------------------------------------------------ */
  // username without "@". Leave "" to hide the TikTok section completely.
  // videos: paste full video links (https://www.tiktok.com/@user/video/123...)
  // — each one shows in a phone frame with its cover. Short vm.tiktok.com
  // links do not work; open them in a browser and copy the full link.
  tiktok: {
    username: "uskites.pk",
    videos: [
      // "https://www.tiktok.com/@uskites.pk/video/7300000000000000000",
    ],
  },
  // Instagram username without "@". Leave "" to hide.
  instagram: "uskites.pk",

  /* ---- Manufacturing licence --------------------------------------- */
  licence: {
    number: "PKFA-LHR-0000",                         // TODO: real licence no.
    issuedBy: "Deputy Commissioner Office, Lahore",  // TODO: issuing authority
    validTill: "2027-12-31",
    image: "assets/images/licence-placeholder.svg",  // replace with scan/photo
  },

  /* ---- Analytics (optional) ---------------------------------------- */
  // If GA4 (gtag) or Meta Pixel (fbq) is installed, WhatsApp clicks are
  // tracked automatically as "generate_lead" / "Lead" events.

  /* ---- Products ----------------------------------------------------
   * category: "tawa15" | "gudda" | "dor"
   * price: number in PKR per `unit`, or null to show "Ask for rate".
   * oldPrice: optional strike-through price.
   * images.front / images.back: replace SVGs with real photos (jpg/webp).
   * ----------------------------------------------------------------- */
  currency: "Rs",
  categories: [
    { id: "tawa15", label: "1.5 Tawa Kites", short: "1.5 Tawa" },
    { id: "gudda",  label: "Tawa Gudda",     short: "Tawa Gudda" },
    { id: "dor",    label: "Dor & Pinna",     short: "Dor Pinna" },
  ],
  products: [
    { id: "t15-plain",  category: "tawa15", name: "1.5 Tawa — Plain Basanti",
      desc: "Classic single-colour Lahori patang. Balanced, light and easy to control.",
      unit: "piece", price: null, badge: "Best Seller",
      images: { front: "assets/images/kites/t15-plain-front.svg", back: "assets/images/kites/t15-plain-back.svg" } },
    { id: "t15-dorangi", category: "tawa15", name: "1.5 Tawa — Do Rangi",
      desc: "Two-tone split design. Easy to spot in the sky during pecha.",
      unit: "piece", price: null,
      images: { front: "assets/images/kites/t15-dorangi-front.svg", back: "assets/images/kites/t15-dorangi-back.svg" } },
    { id: "t15-chand",  category: "tawa15", name: "1.5 Tawa — Chand Tara",
      desc: "Crescent & star design, a rooftop favourite every Basant.",
      unit: "piece", price: null, badge: "Popular",
      images: { front: "assets/images/kites/t15-chand-front.svg", back: "assets/images/kites/t15-chand-back.svg" } },
    { id: "t15-shatranj", category: "tawa15", name: "1.5 Tawa — Shatranj",
      desc: "Chequered pattern with reinforced corners for longer life.",
      unit: "piece", price: null,
      images: { front: "assets/images/kites/t15-shatranj-front.svg", back: "assets/images/kites/t15-shatranj-back.svg" } },

    { id: "gd-plain",   category: "gudda", name: "Tawa Gudda — Plain",
      desc: "Bigger, stable Gudda for steady, high flying in strong wind.",
      unit: "piece", price: null, badge: "Best Seller",
      images: { front: "assets/images/kites/gd-plain-front.svg", back: "assets/images/kites/gd-plain-back.svg" } },
    { id: "gd-patti",   category: "gudda", name: "Tawa Gudda — Patti Wala",
      desc: "Striped Gudda with strong bamboo frame (kaanp & thadda).",
      unit: "piece", price: null,
      images: { front: "assets/images/kites/gd-patti-front.svg", back: "assets/images/kites/gd-patti-back.svg" } },
    { id: "gd-chand",   category: "gudda", name: "Tawa Gudda — Chand",
      desc: "Full-moon Gudda design, perfect for evening flying.",
      unit: "piece", price: null, badge: "Limited",
      images: { front: "assets/images/kites/gd-chand-front.svg", back: "assets/images/kites/gd-chand-back.svg" } },
    { id: "gd-tiranga", category: "gudda", name: "Tawa Gudda — Teen Rangi",
      desc: "Three-colour Gudda — bold, festive and built to last.",
      unit: "piece", price: null,
      images: { front: "assets/images/kites/gd-tiranga-front.svg", back: "assets/images/kites/gd-tiranga-back.svg" } },

    { id: "dor-std",    category: "dor", name: "Cotton Dor Pinna — Standard",
      desc: "Govt-approved cotton thread. No metal, no nylon, no chemical coating.",
      unit: "pinna", price: null, badge: "Approved Dor",
      images: { front: "assets/images/kites/dor-std-front.svg", back: "assets/images/kites/dor-std-back.svg" } },
    { id: "dor-big",    category: "dor", name: "Cotton Dor Pinna — Large",
      desc: "Large pinna for full-day flying. Approved cotton dor only.",
      unit: "pinna", price: null,
      images: { front: "assets/images/kites/dor-big-front.svg", back: "assets/images/kites/dor-big-back.svg" } },
  ],
};
