/* ==========================================================================
   LoveToLive.com — SITE CONFIG
   Edit ONLY this file to switch on monetization, forms and donations.
   Everything degrades gracefully while a value is empty.
   ========================================================================== */
window.LTL_CONFIG = {
  siteName: "LoveToLive",
  contactEmail: "hello@lovetolive.com",           // shown on contact page

  /* ---------- Google AdSense ----------
     1) Apply at https://adsense.google.com with your live domain.
     2) Paste your publisher id (ca-pub-XXXXXXXXXXXXXXXX) below and in /ads.txt.
     3) Create ad units and paste slot ids. Unfilled slots show "Advertise here" house ads. */
  adsense: {
    client: "",                   // e.g. "ca-pub-1234567890123456"
    autoAds: false,               // true = let Google place Auto ads too
    slots: {
      header: "",                 // leaderboard / responsive
      inContent: "",              // in-article
      sidebar: "",                // 300x250 / 300x600
      footer: "",                 // responsive
      multiplex: ""               // "related content" native grid
    }
  },

  /* ---------- Analytics (optional) ---------- */
  ga4: "",                        // e.g. "G-XXXXXXXXXX"

  /* ---------- Forms / lead capture ----------
     Any service that accepts a JSON/FormData POST works on GitHub Pages:
     Formspree (https://formspree.io/f/xxxx), Web3Forms, Getform, Basin,
     or a Google Apps Script web-app URL that writes to Google Sheets.
     One endpoint per form type lets you route leads to different buyers/CRMs. */
  forms: {
    default: "",                  // fallback endpoint for any form
    leads: "",                    // moving / real-estate / mortgage / relocation leads (HIGH VALUE)
    newsletter: "",               // or your Mailchimp/ConvertKit/Beehiiv form action
    contest: "",
    careers: "",
    partners: "",
    contact: ""
  },

  /* ---------- Donations & support ----------
     Paste any/all links. Buttons without a link are hidden automatically. */
  donate: {
    stripeOneTime: "",            // Stripe Payment Link (customer chooses amount)
    stripeMonthly: "",            // Stripe Payment Link (subscription)
    paypal: "",                   // e.g. "https://www.paypal.com/donate/?hosted_button_id=XXXX" or paypal.me link
    kofi: "",                     // e.g. "https://ko-fi.com/lovetolive"
    buyMeACoffee: "",             // e.g. "https://buymeacoffee.com/lovetolive"
    githubSponsors: "",           // e.g. "https://github.com/sponsors/WEBWORKSA1"
    patreon: "",
    goal: 25000,                  // annual goal (USD) shown on the meter
    raised: 0                     // update manually or via your payment dashboard
  },

  /* ---------- YouTube ----------
     Add your channel + video ids (the part after v= in a YouTube URL).
     Empty ids render "Watch on YouTube" search cards instead. */
  youtube: {
    channelUrl: "",               // e.g. "https://www.youtube.com/@lovetolive"
    channelId: "",                // UCxxxxxxxx — enables subscribe link
    featured: [
      // { id: "VIDEO_ID", title: "Moving to Lisbon: honest pros & cons" }
    ],
    cityVideos: {
      // "lisbon": "VIDEO_ID"
    }
  },

  /* ---------- Social ---------- */
  social: {
    instagram: "", tiktok: "", x: "", facebook: "", pinterest: "", linkedin: ""
  },

  /* ---------- Contest ---------- */
  contest: {
    name: "Love Where You Live Awards 2027",
    open: true,
    deadline: "2027-03-31T23:59:59Z"
  },

  /* ---------- Lead routing ----------
     Optional affiliate / partner URLs appended to thank-you screens. */
  partners: {
    movers: "",                   // your mover-network affiliate link
    mortgage: "",
    insurance: "",
    realEstate: "",
    nomadInsurance: "",           // e.g. travel-medical affiliate
    vpn: ""
  }
};
