/**
 * Single source of truth for everything the site says.
 * Edit here — no copy lives inside components.
 *
 * Fields marked TODO need your real numbers before this goes live.
 */

export const profile = {
  name: "Atharv Golait",
  company: "VelyxLabs",
  role: "Founder — VelyxLabs",
  email: "atharv.golait@gmail.com",
  phone: "+91 8329310930",
  whatsapp:
    "https://wa.me/918329310930?text=Hi%20Atharv%2C%20I'd%20like%20to%20talk%20about%20a%20project",
  calendly: "https://calendly.com/atharv-golait",
  portrait:
    "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766859539/ChatGPT_Image_Dec_27_2025_11_44_07_PM_uwdulb.jpg",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/atharv-golait-9048772ab/" },
    { label: "GitHub", href: "https://github.com/ATHARVISM2804" },
    { label: "X", href: "https://x.com/Atharv_Golait" },
    { label: "Instagram", href: "https://www.instagram.com/_atharv.vv__/" },
  ],
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
  { label: "Pricing", href: "#pricing" },
];

export const hero = {
  headline: "I Build Agentic Systems That Run Real Operations",
  sub: "Agentic automation, AI infrastructure, SaaS platforms, and MVPs for B2B and capital-intensive teams — from scope call to launch.",
  primaryCta: "Book a Free Scope Call",
  secondaryCta: "View My Work",
};

/** Screenshots that scroll past under the hero. */
export const showcase = [
  "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935302/estatico_zeiizm.png",
  "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935298/Claim_ai_png_t8jyrt.png",
  "https://res.cloudinary.com/dmhabztbf/image/upload/v1780922037/GetCredentialing_Done_nzpipr.png",
  "https://res.cloudinary.com/dmhabztbf/image/upload/v1780920594/NEOREACH_IMG_x63j9h.png",
  "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935300/Vyomira_azh3oy.png",
  "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935302/Green_Wrench_mxogv2.png",
  "https://res.cloudinary.com/dmhabztbf/image/upload/v1780920154/Velar_lukfaq.png",
  "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935297/Skipit_cloud_serqjz.png",
];

export const clients = [
  "Estatico",
  "Claim AI",
  "getCredentialingDone",
  "NEOREACH",
  "Vyomira",
  "Overshoot",
  "Greenwrench",
  "Narayan Kripa",
  "Skipit Cloud",
  "Pahadicraft",
];

/**
 * Intro video.
 *
 * ⚠️ ADD YOUR VIDEO HERE. Set ONE of these:
 *   youtubeId — the id from the URL, e.g. "dQw4w9WgXcQ" for
 *               youtube.com/watch?v=dQw4w9WgXcQ  (recommended: nothing loads
 *               from YouTube until someone clicks play)
 *   src       — a direct .mp4 URL (Cloudinary, S3, etc.)
 *
 * Leave both empty and the section shows the poster with a "coming soon"
 * label instead of a play button.
 */
export const intro = {
  badge: "Meet Me",
  title: "Hi, I'm Atharv",
  lede: "Ninety seconds on what I build, who I build it for, and how I work.",
  youtubeId: "",
  src: "",
  poster:
    "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766859539/ChatGPT_Image_Dec_27_2025_11_44_07_PM_uwdulb.jpg",
};

export const about = {
  badge: "About Me",
  title: "Founder, builder,\npermanently in motion",
  lede: "I help founders and operators put AI to work — then make sure it holds up under real load.",
  body: [
    "I'm Co-founder and CEO of VelyxLabs, where we help founders leverage AI to scale their business, and build AI infrastructure for B2B and capital-intensive firms.",
    "Alongside that I'm Tech Lead at Getlandy AI, a Netherlands-based SaaS startup, and I previously co-founded GoRan AI agency. I'm also in my final year at NIT Hamirpur.",
  ],
  roles: [
    {
      company: "VelyxLabs",
      role: "Co-founder & CEO",
      note: "AI infrastructure and agentic systems for B2B and capital-intensive firms",
      current: true,
    },
    {
      company: "Getlandy AI",
      role: "Tech Lead",
      note: "Netherlands-based SaaS startup",
      current: true,
    },
    {
      company: "GoRan AI",
      role: "Co-founder",
      note: "AI agency — previously",
      current: false,
    },
    {
      company: "NIT Hamirpur",
      role: "Final year",
      note: "Computer science",
      current: true,
    },
  ],
  hobbies: {
    heading: "Outside the work",
    lede: "Same thing, different reps.",
    items: [
      { icon: "lift", label: "Weightlifting", note: "Heavy, consistently" },
      { icon: "calisthenics", label: "Calisthenics", note: "Bodyweight, everywhere" },
      { icon: "run", label: "Marathons", note: "Long distance running" },
    ],
  },
};

export const process = {
  badge: "Process",
  title: "Easy Process\nPowerful Results",
  lede: "A structured workflow that gets working software in front of you fast.",
  steps: [
    {
      icon: "call",
      title: "SCOPE CALL",
      body: "First, we walk the process you want automated or the product you want built, and agree what success looks like.",
    },
    {
      icon: "blueprint",
      title: "BLUEPRINT & DESIGN",
      body: "I map the architecture, the integrations it touches, and what's automated versus reviewed by a person — then fix the scope and the price.",
    },
    {
      icon: "build",
      title: "BUILD & EVALUATE",
      body: "You see working software every week. Agents ship with evals, tracing, and a human gate before anything consequential happens.",
    },
    {
      icon: "launch",
      title: "DEPLOYMENT & SUPPORT",
      body: "Deployed to your infrastructure, documented, and your team trained on it — with a support window while it beds in.",
    },
  ],
};

export const benefits = {
  badge: "Benefits",
  title: "Benefits of working\nwith me",
  lede: "Speed, ownership, and systems that hold up in production.",
  items: [
    {
      title: "Fixed Price, No Surprises",
      body: "Scope and price are agreed before anyone writes code. The number you're quoted is the number you pay.",
    },
    {
      title: "You Own Everything",
      body: "Complete source code ownership on every engagement. Deployed to your infrastructure, no lock-in, no licence to keep paying.",
    },
    {
      title: "Human in the Loop",
      body: "Every agent ships with a trace of what it did and a gate where a person can say no. You decide where the line sits.",
    },
    {
      title: "Works With Your Stack",
      body: "Agents integrate with the ERP, CRM, and internal systems you already run. Your tools don't have to move.",
    },
    {
      title: "Weeks, Not Quarters",
      body: "A first automation is live in 2–3 weeks. You see working software every week rather than a status deck.",
    },
    {
      title: "One Person Accountable",
      body: "You talk to me from the scope call through handover. No layers, no handoff to a junior team you never met.",
    },
  ],
};

/**
 * Selected work. `metric` is TODO — add the real number the client saw,
 * or leave it empty and the line won't render.
 */
export const work = {
  badge: "Projects",
  title: "Systems Showcasing\nMy Expertise",
  lede: "Live products and automations built for operators in real estate, insurance, healthcare, and industry.",
  items: [
    {
      name: "Estatico – Automate the Real Estate Deal Workflow",
      blurb:
        "Estatico automates the deal pipeline for real estate teams — intake, qualification, and follow-up handled by agents so brokers spend their time closing instead of copying data between tools. Built with a document-parsing layer, routing logic, and a review gate before anything reaches the CRM.",
      metric: "", // TODO e.g. "9 hrs/week returned per broker"
      image:
        "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935302/estatico_zeiizm.png",
      href: "https://estatico.app/",
    },
    {
      name: "Claim AI – Automated Insurance Claim Processing",
      blurb:
        "A claims platform that reads submitted documents, extracts the fields that matter, and moves each claim through automated processing with a human review step before payout. Cuts the manual keying that makes claims desks slow and error-prone.",
      metric: "", // TODO
      image:
        "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935298/Claim_ai_png_t8jyrt.png",
      href: "https://claim-ai-navigator.vercel.app/",
    },
    {
      name: "getCredentialingDone – Credentialing as a Tracked Pipeline",
      blurb:
        "Credentialing platform for medical practices. Turns a paperwork-heavy, weeks-long process into a pipeline clinics can actually see the status of, with automated follow-up on outstanding documents and payer responses.",
      metric: "", // TODO
      image:
        "https://res.cloudinary.com/dmhabztbf/image/upload/v1780922037/GetCredentialing_Done_nzpipr.png",
      href: "https://getcredentialingdone.com/",
    },
    {
      name: "NEOREACH – Consumer Intelligence for Global Brands",
      blurb:
        "A consumer intelligence platform for international brands that pulls scattered market signals into one view teams can act on. Data APIs, dashboards, and reporting built for brand and finance teams at scale.",
      metric: "", // TODO
      image:
        "https://res.cloudinary.com/dmhabztbf/image/upload/v1780920594/NEOREACH_IMG_x63j9h.png",
      href: "https://noreach-kappa.vercel.app/",
    },
    {
      name: "Vyomira – Cloud Infrastructure Platform",
      blurb:
        "Positioning, product site, and inbound pipeline for a cloud infrastructure company — services, solutions, and a qualification flow built to bring enterprise enquiries in rather than just look good.",
      metric: "", // TODO
      image:
        "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935300/Vyomira_azh3oy.png",
      href: "https://www.vyomiratech.com/",
    },
    {
      name: "Greenwrench – Vehicle Recycling Marketplace",
      blurb:
        "A marketplace connecting vehicle owners with certified scrap and recycling processors. Instant valuation, inquiry routing to the right processor, and listing management for an industry that ran on phone calls.",
      metric: "", // TODO
      image:
        "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935302/Green_Wrench_mxogv2.png",
      href: "https://www.greenwrenchsolutions.in/",
    },
  ],
};

export const alsoShipped = [
  "Velar",
  "Overshoot",
  "Narayan Kripa",
  "Skipit Cloud",
  "Pahadicraft",
  "Codewave",
  "Kumar Power",
  "Hayat",
  "Goran AI",
  "MOQO",
  "ROXO",
  "WISA",
];

export const testimonialsMeta = {
  badge: "Testimonials",
  title: "What Clients\nAre Saying",
  lede: "Real feedback from the teams these systems run for.",
};

/**
 * ⚠️ PLACEHOLDER CONTENT — these are not real clients.
 *
 * They exist so the section renders while you collect real quotes. Names are
 * deliberately generic so nothing here reads as genuine social proof if the
 * site goes live before you swap them.
 *
 * To replace: overwrite each entry with the real quote, person, and role.
 * Add `avatar: "<url>"` for a photo, or leave it off and initials are used.
 * To hide the section entirely: set this to [].
 */
export const testimonials: {
  quote: string;
  name: string;
  title: string;
  avatar?: string;
  placeholder?: boolean;
}[] = [
  {
    quote:
      "The intake process used to take three people most of a morning. It now runs on its own before anyone opens their laptop, and we only look at the exceptions.",
    name: "Client Name",
    title: "Head of Operations, Company",
    placeholder: true,
  },
  {
    quote:
      "What sold me was the review gate. I could see exactly what the agent had done and step in where it mattered, instead of being asked to trust a black box.",
    name: "Client Name",
    title: "Founder, Company",
    placeholder: true,
  },
  {
    quote:
      "Scope and price were agreed up front and neither moved. We had working software in the second week and shipped on the date we were given.",
    name: "Client Name",
    title: "Managing Director, Company",
    placeholder: true,
  },
  {
    quote:
      "It plugged into the systems we already run rather than asking us to replace them. That was the difference between a pilot and something we actually rolled out.",
    name: "Client Name",
    title: "CTO, Company",
    placeholder: true,
  },
];

export const pricing = {
  badge: "Pricing",
  title: "Engagement Plans\nDesigned for You",
  lede: "Choose the plan that fits your operation and budget.",
  plans: [
    {
      name: "Automation Pilot",
      pitch: "Perfect for teams who want to validate fast",
      price: "$3,500",
      timeline: "2–3 weeks",
      featured: false,
      includes: [
        "One agent or automation, in production",
        "Integration with up to 3 of your tools",
        "Evals and a human review gate",
        "30 days post launch support",
        "Complete source code ownership",
        "Unlimited revisions within scope",
        "Weekly progress updates",
      ],
    },
    {
      name: "Agentic System",
      pitch: "For teams ready to automate a whole function",
      price: "$9,000",
      timeline: "4–8 weeks",
      featured: true,
      includes: [
        "Multi-agent workflow with routing",
        "Retrieval over your documents and data",
        "Admin dashboard and audit trail",
        "Tracing, logging, and cost controls",
        "60 days post launch support",
        "Complete source code ownership",
        "Unlimited revisions within scope",
        "Weekly progress updates",
      ],
    },
    {
      name: "Product Partner",
      pitch: "For operators building serious platforms",
      price: "$18,000",
      timeline: "8+ weeks",
      featured: false,
      includes: [
        "Everything in Agentic System",
        "Full SaaS product: auth, billing, admin",
        "AI infrastructure and model routing",
        "Deployment to your cloud",
        "Team training and documentation",
        "90 days post launch support",
        "Complete source code ownership",
        "Retainer available after launch",
      ],
    },
  ],
};

export const contact = {
  badge: "Contact Me",
  title: "Get in Touch\nwith Me",
  lede: "Whether you have a process to automate, a product to build, or just questions — I'm here.",
  budgets: ["$3,000–$6,000", "$6,000–$12,000", "$12,000–$25,000", "$25,000+"],
};

export const faq = {
  badge: "FAQs",
  title: "Questions?\nAnswered",
  lede: "Everything you'd want to know before booking a call.",
  items: [
    {
      q: "How do we get started?",
      a: "Book a 30-minute scope call. We go through the process or product you have in mind, and you get an honest read on feasibility, timeline, and cost. No deck, no pitch.",
    },
    {
      q: "What if I only have the problem, not a spec?",
      a: "That's the normal case. The blueprint stage exists for exactly this — I map the workflow, decide what should be automated versus reviewed by a person, and write the scope before anyone commits to a build.",
    },
    {
      q: "How do I know my project won't get delayed?",
      a: "Scope is fixed before the build starts and you see working software every week. If something is going to slip you'll hear it from me in that week's update, not at the deadline.",
    },
    {
      q: "Will an agent make decisions I can't see?",
      a: "No. Every system ships with a trace of what it did and why, and anything consequential goes through a human gate you control. You decide where the line sits.",
    },
    {
      q: "Can you work with our existing systems?",
      a: "That's usually the point. Most engagements involve integrating with an ERP, CRM, or internal database that isn't going anywhere. The agents work around your stack, not the other way round.",
    },
    {
      q: "Do I own the code and product?",
      a: "Yes, on every engagement. It's deployed to your infrastructure, documented, and handed over. There's no lock-in and no licence to keep paying.",
    },
    {
      q: "Do you sign an NDA?",
      a: "Yes. Send yours over, or I can provide one before the scope call.",
    },
  ],
};

export const footer = {
  tagline: "I build agentic systems and AI infrastructure that run real operations.",
  /** What the mark means — shown beside the logo at the foot of the page. */
  meaning:
    "A blade that runs the work through clear steps until nothing is left to do by hand.",
  columns: [
    {
      heading: "Services",
      links: [
        { label: "Agentic Automation", href: "#benefits" },
        { label: "AI Infrastructure", href: "#benefits" },
        { label: "SaaS & MVP Builds", href: "#pricing" },
        { label: "Systems Integration", href: "#process" },
      ],
    },
    {
      heading: "About",
      links: [
        { label: "My Work", href: "#work" },
        { label: "Process", href: "#process" },
        { label: "FAQs", href: "#faq" },
        { label: "Contact", href: "#contact" },
      ],
    },
  ],
};

export const WEB3FORMS_KEY = "e479de59-5b06-4109-a2dc-519979737137";
