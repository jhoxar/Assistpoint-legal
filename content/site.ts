/**
 * Site content.
 *
 * The arrays in `_extracted.json` were lifted mechanically out of the decoded
 * artifact by scripts/extract-content.mjs and are byte-identical to it — em
 * dashes, apostrophes and the Unicode glyph icons included. Do not retype
 * them; re-run the extractor if they ever need refreshing.
 *
 * The strings in `copy` below live in the artifact's template markup rather
 * than its data arrays, so they are transcribed here, verbatim, with one
 * deliberate exception noted at `form.note`.
 */
import raw from "./_extracted.json";

/* --- Shapes ---------------------------------------------------------------- */

export type PageId =
  | "home" | "rcm" | "care" | "ops" | "hospital" | "serve" | "team" | "contact";

export type IconCard = readonly [icon: string, title: string, desc: string];
export type TitleDesc = readonly [title: string, desc: string];
export type IconTitle = readonly [icon: string, title: string];

export interface Service {
  icon: string; title: string; desc: string; link: string; page: PageId;
}
export interface CareProgram {
  key: string; full: string; icon: string; desc: string; short: string;
}
export interface TeamMember {
  img: string; name: string; role: string; bio: string; more: string;
}
export interface Program {
  tag: string; key: string; full: string; what: string;
  bullets: string[]; example: string;
}

/* --- Routes ---------------------------------------------------------------- */

export const ROUTES: Record<PageId, string> = {
  home: "/", rcm: "/rcm", care: "/care", ops: "/ops",
  hospital: "/hospital", serve: "/serve", team: "/team", contact: "/contact",
};

export const navDefs = raw.navDefs as unknown as [PageId, string][];
/** The header shows the first five inline and the last three under "About". */
export const navMain = navDefs.slice(0, 5);
export const navTop = navDefs.slice(5);
export const topMeta = raw.topMeta as unknown as Record<string, [string, string]>;

/* --- Data ------------------------------------------------------------------ */

export const services = raw.svcDefs as unknown as Service[];
export const careDefs = raw.careDefs as unknown as CareProgram[];
export const careChainLabels = raw.careChainLabels as string[];
export const flowDefs = raw.flowDefs as unknown as TitleDesc[];
export const rcmDefs = raw.rcmDefs as unknown as IconCard[];
export const rcmChips = raw.rcmChips as string[][];
export const chain = raw.chain as string[];
export const team = raw.team as unknown as TeamMember[];
export const cmp = raw.cmp as string[][];
export const programs = raw.programs as unknown as Program[];
export const pillars = raw.pillars as unknown as [string, string, string, PageId][];
export const difference = raw.difference as unknown as IconCard[];
export const rcmCards = raw.rcmCards as unknown as IconCard[];
export const specialties = raw.specialties as unknown as IconCard[];
export const infusionFeatures = raw.infusionFeatures as unknown as TitleDesc[];
export const infusionFlow = raw.infusionFlow as unknown as IconCard[];
export const careSteps = raw.careSteps as string[];
export const forPatients = raw.forPatients as string[];
export const forPractices = raw.forPractices as string[];
export const hospitalCards = raw.hospitalCards as unknown as IconCard[];
export const hospitalFeatures = raw.hospitalFeatures as string[];
export const opsCards = raw.opsCards as unknown as IconCard[];
export const orgs = raw.orgs as unknown as IconTitle[];

/** The ticker reads seamlessly only because the 10-item chain is duplicated
 *  against a translateX(-50%) loop. Keep both halves. */
export const tickerChain = [...chain, ...chain].map((label, i) => ({
  label,
  n: String((i % 10) + 1).padStart(2, "0"),
}));

/* --- Images ---------------------------------------------------------------- */
/** The artifact hot-linked stock photos and third-party URLs. These are the
 *  upgraded local assets that replace them, per Assets/web-16x9/README.md. */
export const img = {
  heroPoster16x9: "/media/hero-16x9-poster.webp",
  heroPoster9x16: "/media/hero-9x16-poster.webp",
  rpm: "/media/rpm-home-monitoring.webp",
  infusion: "/media/infusion-center.webp",
  infusionTall: "/media/infusion-center-3x4.webp",
  hospital: "/media/hospital-rural-ward.webp",
  hospitalTall: "/media/hospital-rural-ward-9x16.webp",
  practice: "/media/physician-practice-team.webp",
  leadership: "/media/leadership-meeting.webp",
  clinician: "/media/hero-clinician-mobile.webp",
} as const;

export const serveTiles: { img: string; title: string }[] = [
  { img: img.practice, title: "Physician Practices" },
  { img: img.hospital, title: "Hospitals & Rural Health" },
  { img: img.infusion, title: "Infusion Centers" },
];

/* --- Contact --------------------------------------------------------------- */

export const contact = {
  email: "info@assistpointclinical.com",
  phoneLabel: "+1 (832) 761-2821",
  phoneHref: "tel:+18327612821",
} as const;

/* --- Static copy ----------------------------------------------------------- */

export const copy = {
  brand: "AssistPoint Clinical",
  mark: "⌁",
  ctaFull: "Book a Consultation",
  ctaShort: "Book a Call",

  home: {
    eyebrow: "HEALTHCARE OPERATIONS • REVENUE • PATIENT CARE",
    h1a: "Stronger Healthcare Operations ",
    h1em: "Start Here.",
    lede: "AssistPoint Clinical partners with healthcare organizations to strengthen operations, improve financial performance, and build sustainable systems that support better patient care.",
    cta1: "Book a Consultation",
    cta2: "Explore Services",
    whatEyebrow: "WHAT WE DO",
    whatH2: "One Partner. Multiple Solutions.",
    whatLede: "From revenue cycle performance to care management and executive support, AssistPoint brings practical healthcare expertise to the areas that matter most.",
    careEyebrow: "CARE BEYOND THE VISIT",
    careH2: "Keep Patients Connected Between Appointments.",
    careLede: "CCM, RPM and PCM create structured ways to support patients outside the traditional office visit—from ongoing chronic-care coordination to physiologic monitoring and focused management of a complex condition.",
    careLink: "See how CCM, RPM & PCM work →",
    flowEyebrow: "HOW ASSISTPOINT WORKS",
    flowH2: "From Assessment to Measurable Improvement.",
    specEyebrow: "SPECIALTY EXPERTISE",
    specH2: "RCM Built Around the Care You Deliver.",
    specLede: "Different service lines create different revenue-cycle risks. Our approach can be tailored to the operational realities of your organization.",
    tileInfusion: "Infusion & Specialty RCM",
    tileInfusionDesc: "Benefits, authorization, specialty-drug workflows, coding, claims, denials and A/R.",
    tileInfusionLink: "Explore Infusion RCM →",
    tileHospital: "Hospital & Rural Health",
    tileHospitalLink: "Explore Hospital Support →",
    tilePractice: "Physician Practices",
    tilePracticeDesc: "Primary care and multi-specialty operational support.",
    diffEyebrow: "THE ASSISTPOINT DIFFERENCE",
    diffH2: "More Than Advice. Support That Moves the Work Forward.",
    serveEyebrow: "WHO WE SERVE",
    serveH2: "Healthcare Organizations Across the Care Continuum.",
    serveBtn: "View Who We Serve",
    ctaEyebrow: "READY TO STRENGTHEN YOUR OPERATIONS?",
    ctaH2: "Start with a no-obligation conversation.",
    ctaLede: "Tell us where the pressure is. We'll help you identify a practical starting point.",
  },

  rcm: {
    eyebrow: "REVENUE CYCLE MANAGEMENT",
    h1a: "Maximize Revenue.",
    h1em: "Minimize Denials.",
    lede: "A connected revenue-cycle strategy helps protect reimbursement from the first patient interaction through final payment.",
    cta: "Talk With Our Team",
    matrixEyebrow: "FROM SERVICE TO PAYMENT",
    hub: "⟳ CONNECTED REVENUE CYCLE",
    flowEyebrow: "END-TO-END WORKFLOW",
    flowH2a: "Your Revenue Cycle, ",
    flowH2em: "Connected.",
    midEyebrow: "READY TO IMPROVE YOUR REVENUE CYCLE?",
    midH2: "Let your team focus on patients.",
    midLede: "AssistPoint can help strengthen the systems behind reimbursement.",
    midCta: "BOOK A CONSULTATION",
    specEyebrow: "SPECIALTY RCM",
    specH2: "Revenue Cycle Expertise for Different Care Environments",
    specLede: "Billing workflows are not one-size-fits-all. AssistPoint can align processes to the clinical setting, payer mix and operational complexity.",
    infEyebrow: "SPECIALTY RCM EXPERTISE",
    infH2a: "Infusion & Specialty Drug ",
    infH2em: "Revenue Cycle",
    infLede: "Infusion billing adds another layer of complexity to the revenue cycle. AssistPoint connects benefits, authorization, drug acquisition, coding, administration services, claims and follow-up in one coordinated workflow.",
    infH3: "From Order to Payment",
  },

  care: {
    eyebrow: "CCM • RPM • PCM",
    h1a: "Better Care Beyond",
    h1em: "the Office Visit.",
    lede: "Care management programs create structured touchpoints between visits—helping practices stay connected with eligible patients while supporting coordination, monitoring and ongoing condition management.",
    cta: "Discuss a Care Program",
    chainEyebrow: "CONNECTED CARE BETWEEN VISITS",
    progEyebrow: "UNDERSTANDING THE PROGRAMS",
    progH2: "CCM, RPM and PCM Serve Different Patient Needs.",
    progLede: "The right program depends on the patient's conditions, clinical needs, payer requirements and the services actually furnished.",
    whatLabel: "What it is:",
    exampleLabel: "Example:",
    cmpEyebrow: "AT A GLANCE",
    cmpH2: "How the Programs Differ",
    /* The artifact's disclaimer ended with an instruction to the page's own
       author — "The website should describe the opportunity without promising
       payment for every patient." — which is not addressed to a visitor. The
       clause that *is* addressed to visitors is kept verbatim. */
    disclaimer: "Important: Program eligibility, coding, time/data requirements, patient consent, supervision and reimbursement vary by payer and current rules.",
    wfEyebrow: "PROGRAM WORKFLOW",
    wfH2: "From Patient Identification to Ongoing Management",
    forPatientsTitle: "For Patients",
    forPracticesTitle: "For Practices",
  },

  hospital: {
    eyebrow: "HOSPITAL & RURAL HEALTH SUPPORT",
    h1: "Operational Strength for Complex Healthcare Environments.",
    lede: "AssistPoint supports hospitals, rural health organizations and community providers with operational leadership, financial performance, revenue cycle, analytics and practical implementation support.",
    cta: "Start a Conversation",
    helpEyebrow: "WHERE WE CAN HELP",
    helpH2: "Connect Strategy, Finance and Day-to-Day Operations.",
    execEyebrow: "PRACTICAL EXECUTION",
    execH2a: "Turn Plans Into ",
    execH2em: "Operating Discipline.",
    execLede: "Healthcare organizations often know where improvement is needed. The challenge is translating priorities into ownership, workflows, reporting and consistent follow-through. AssistPoint can help bridge that gap.",
    ctaH2: "Facing transition, financial pressure or operational complexity?",
    ctaLede: "Start with a focused conversation about the challenges in front of your organization.",
  },

  ops: {
    eyebrow: "OPERATIONS & CONSULTING",
    h1a: "Experienced Leadership.",
    h1em: "Practical Solutions.",
    lede: "Support for organizations navigating growth, transition, financial pressure, operational complexity or strategic change.",
    cta: "Book a Consultation",
  },

  serve: {
    eyebrow: "WHO WE SERVE",
    h1a: "Healthcare Organizations",
    h1em: "Across the Care Continuum.",
    lede: "Flexible support for mission-driven organizations and physician practices facing different operational, financial and care-delivery challenges.",
  },

  team: {
    h1a: "Healthcare Leaders Who",
    h1em: "Understand the Work.",
    lede: "Experienced leaders with backgrounds spanning hospital operations, finance, revenue cycle and organizational performance.",
    leadEyebrow: "LEAD EXECUTIVE",
    leadName: "Raji Kumar",
    leadBio: "CEO of Crescent Regional Hospital, Hill Regional Hospital, and Specialty Care Clinics, a multi-location specialty group in Texas. Her experience includes hospital acquisitions, financial recovery, operational leadership and growth through complex healthcare environments.",
    leadChips: ["EXECUTIVE LEADERSHIP", "HOSPITAL OPERATIONS", "GROWTH & TURNAROUND"],
    leadImg: "https://www.assistpointclinical.com/assets/img/raji-kumar.webp",
    openBio: "Read expanded bio",
    closeBio: "Close bio",
  },

  contact: {
    h1a: "Ready to Strengthen",
    h1em: "Your Operations?",
    lede: "Whether you're navigating financial pressure, a leadership transition, launching a new program, improving your revenue cycle, or looking to drive sustainable growth — we're here to help.",
    panelEyebrow: "START A CONVERSATION",
    panelH2: "Let's talk about what your organization needs next.",
    panelLede: "No obligation. Tell us where the pressure is — revenue cycle, operations, care management, financial performance or leadership support — and our team can discuss the right starting point.",
    emailLabel: "EMAIL",
    phoneLabel: "PHONE",
    chips: ["RCM", "CCM • RPM • PCM", "Operations", "Financial Strategy"],
    formEyebrow: "NO-OBLIGATION CONSULTATION",
    formH2: "Tell Us How We Can Help",
    submit: "Request Consultation",
    /* Replaces the artifact's two notes addressed to the client's IT team,
       which were rendered to visitors. The form now posts to Netlify Forms. */
    sentH2: "Thanks — your request is on its way.",
    sentBody: "A member of the AssistPoint team will be in touch shortly to arrange your consultation.",
    back: "← Back to form",
    fields: {
      name: "Full Name",
      org: "Organization",
      email: "Email Address",
      phone: "Phone Number",
      orgType: "Organization Type",
      interest: "Primary Area of Interest",
      message: "What challenges or goals would you like to discuss?",
    },
    orgTypes: ["Physician Practice", "Hospital", "FQHC / Community Health", "Rural Health Clinic", "Other"],
    interests: ["Revenue Cycle Management", "CCM / RPM / PCM", "Operations & Consulting", "Financial / Strategic Support"],
  },

  footerCopyright: "© AssistPoint Clinical. All rights reserved.",
} as const;
