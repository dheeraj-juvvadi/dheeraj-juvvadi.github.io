/* ==========================================================================
   Dheeraj Chandra — Portfolio data
   Quiet · editorial · No vanity metrics.
   ========================================================================== */

const PROFILE = {
  name: "Dheeraj Chandra",
  firstName: "Dheeraj",
  initials: "DC",
  role: "Software Engineer",
  focus: "ML systems · full-stack web",
  intro:
    "I'm Dheeraj — a software engineer in Chennai working at the seam between machine learning and the web. I like telemetry that surfaces problems early, interfaces that get out of the way, and code written like it was meant to be read.",
  intro2:
    "Currently studying Computer Science at SRMIST, shipping side-projects, and open to engineering roles.",
  location: "Chennai, IN",
  email: "dheerajchndra@gmail.com",
  github: "https://github.com/dheeraj-juvvadi",
  linkedin: "https://linkedin.com/in/dheeraj-juvvadi",
  leetcode: "https://leetcode.com/dheeraj-juvvadi",
  availability: "Available for internships & collaborations",
};

// ASCII signature — rendered in <pre>, monospace (figlet "doom")
const ASCII = String.raw`
 ______ _   _  _____ ___________  ___     ___
|  _  \ | | ||  ___|  ___| ___ \/ _ \   |_  |
| | | || |_| || |__ | |__ | |_/ / /_\ \    | |
| | | ||  _  ||  __||  __||    /|  _  |    | |
| |/ / | | | || |___| |___| |\ \| | | |/\__/ /
|___/  \_| |_|\____|\____/\_| \_\_| |_/\____/ `;

const ABOUT = [
  "I build software across the stack — from Python ML pipelines that reason over telemetry and vision, to React frontends that feel weightless. The throughline is making complex systems feel simple to the person on the other side of the screen.",
  "Lately I've been deep in avionics anomaly detection, multimodal accident analysis, and 3D data visualisation. Before that, full-stack apps in healthcare and academics, and a frontend stint at Ashoka Yamaha.",
];

const PROJECTS = [
  {
    name: "Avionics Anomaly Detection",
    year: "2026",
    blurb:
      "Real-time ML over flight telemetry. An ensemble of three models — PCA reconstruction, One-Class SVM and a deep network — gated by deterministic safety checks before any recommendation is made.",
    stack: ["Python", "Spark", "FastAPI", "Docker"],
    repo: "https://github.com/dheeraj-juvvadi/flight-anomaly-detection",
    live: null,
  },
  {
    name: "Accident Detection & Analysis",
    year: "2025",
    blurb:
      "Multimodal deep-learning system fusing YOLO vision, text classification and tabular features to detect incidents and rank severity. From raw ingestion through to visual insight.",
    stack: ["Python", "YOLOv8", "XGBoost", "NLP"],
    repo: "https://github.com/dheeraj-juvvadi/traffic-incident-detection",
    live: null,
  },
  {
    name: "MedInv",
    year: "2025",
    blurb:
      "Full-stack medical inventory and patient management — medicine tracking, orders, logs, expiry alerts, role-based access. Responsive and live in production.",
    stack: ["Next.js", "TypeScript", "MySQL"],
    repo: "https://github.com/dheeraj-juvvadi/MedInv",
    live: "https://medinv.vercel.app",
  },
  {
    name: "Multicloud Analytics",
    year: "2025",
    blurb:
      "Analytics dashboard unifying Google Cloud BigQuery, Azure Storage and Gemini AI — surfacing cross-cloud insight through a clean React interface over a Node backend.",
    stack: ["React", "Node.js", "BigQuery", "Azure", "Gemini"],
    repo: "https://github.com/dheeraj-juvvadi/multicloud-analytics-dashboard",
    live: null,
  },
  {
    name: "Climate Globe",
    year: "2025",
    blurb:
      "An interactive 3D globe visualising climate change — temperature, CO₂, sea-level rise — with AI-powered explanations. Travel decades by clicking a region.",
    stack: ["TypeScript", "Three.js", "Gemini"],
    repo: "https://github.com/dheeraj-juvvadi/climate-globe-visualizer",
    live: null,
  },
  {
    name: "Automotive Parts Detection",
    year: "2025",
    blurb:
      "Real-time YOLOv8 detection across 49 automotive components, with a Flask dashboard, CAD-style 3D visualisation and natural-language part matching.",
    stack: ["Python", "YOLOv8", "Flask", "3D"],
    repo: "https://github.com/dheeraj-juvvadi/automotive-parts-detection",
    live: null,
  },
];

const EXPERIENCE = [
  {
    role: "Frontend Developer",
    org: "Ashoka Yamaha",
    period: "2026",
    detail:
      "Built and maintained responsive interfaces, shipped production features with the design and backend teams, and tuned component performance.",
  },
  {
    role: "Undergraduate Researcher",
    org: "SRMIST",
    period: "2025",
    detail:
      "Researched multi-source accident data integration and severity prediction, working the full pipeline from ingestion to insight.",
  },
];

const STACK = {
  Languages: ["Python", "C++", "SQL", "JavaScript", "TypeScript"],
  "ML / Data": ["YOLOv8", "XGBoost", "Spark", "Gemini AI", "BigQuery"],
  Web: ["React", "Next.js", "Node.js", "Flask", "FastAPI"],
  Infra: ["AWS", "GCP", "Azure", "MySQL", "Docker", "Git"],
};

window.PORTFOLIO = { PROFILE, ASCII, ABOUT, PROJECTS, EXPERIENCE, STACK };
