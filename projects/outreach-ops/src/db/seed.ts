/**
 * Seed script for initializing a new project database with demo data.
 *
 * Usage: npx tsx src/db/seed.ts [projectSlug]
 */
import { getProjectDb } from "./index";
import { leads, templates, events } from "./schema";

const projectSlug = process.argv[2] || "default";

console.log(`Seeding database for project: ${projectSlug}`);

const db = getProjectDb(projectSlug);

// -- Demo leads (fictional)
const demoLeads = [
  {
    name: "Alice Chen",
    company: "TechNova Inc",
    title: "VP Engineering",
    email: "alice@technova.example.com",
    linkedinUrl: "https://linkedin.com/in/alicechen",
    channel: "linkedin",
    segment: "startup",
    status: "new" as const,
    companySize: "smb",
    techStackMatch: "strong",
    painSignalStrength: "strong",
    decisionMakerAccess: "direct",
    engagementSignals: "warm",
    segmentFit: "ideal",
    employeeCount: 45,
    techStack: "React,Node.js,PostgreSQL",
    isHiringReact: true,
    hasActiveBlog: true,
    recentFunding: "Seed $2M",
    activeOnLinkedIn: true,
  },
  {
    name: "Bob Martinez",
    company: "CloudScale Systems",
    title: "CTO",
    email: "bob.m@cloudscale.example.com",
    linkedinUrl: "https://linkedin.com/in/bobmartinez",
    channel: "email",
    segment: "enterprise",
    status: "contacted" as const,
    companySize: "enterprise",
    techStackMatch: "perfect",
    painSignalStrength: "explicit",
    decisionMakerAccess: "direct",
    engagementSignals: "active",
    segmentFit: "ideal",
    employeeCount: 2500,
    techStack: "React,TypeScript,AWS,GraphQL",
    isHiringReact: true,
    hasActiveBlog: true,
    recentFunding: "Series C $80M",
    activeOnLinkedIn: true,
  },
  {
    name: "Carol Williams",
    company: "DataFlow Agency",
    title: "Director of Operations",
    email: "carol@dataflow.example.com",
    channel: "linkedin",
    segment: "agency",
    status: "replied" as const,
    companySize: "midMarket",
    techStackMatch: "partial",
    painSignalStrength: "moderate",
    decisionMakerAccess: "introduced",
    engagementSignals: "cold",
    segmentFit: "good",
    employeeCount: 120,
    techStack: "Vue,Python,Django",
    isHiringReact: false,
    hasActiveBlog: false,
    recentFunding: null,
    activeOnLinkedIn: false,
  },
  {
    name: "David Kim",
    company: "FinEdge Solutions",
    title: "Head of Product",
    email: "dkim@finedge.example.com",
    channel: "email",
    segment: "enterprise",
    status: "new" as const,
    companySize: "enterprise",
    techStackMatch: "weak",
    painSignalStrength: "weak",
    decisionMakerAccess: "identified",
    engagementSignals: "none",
    segmentFit: "marginal",
    employeeCount: 5000,
    techStack: "Java,Spring,Oracle",
    isHiringReact: false,
    hasActiveBlog: false,
    recentFunding: null,
    activeOnLinkedIn: false,
  },
  {
    name: "Eva Larsson",
    company: "GreenTech Nordic",
    title: "CEO",
    email: "eva@greentech.example.com",
    linkedinUrl: "https://linkedin.com/in/evalarsson",
    channel: "linkedin",
    segment: "startup",
    status: "booked" as const,
    companySize: "startup",
    techStackMatch: "strong",
    painSignalStrength: "explicit",
    decisionMakerAccess: "direct",
    engagementSignals: "active",
    segmentFit: "ideal",
    employeeCount: 12,
    techStack: "React,Next.js,Tailwind",
    isHiringReact: true,
    hasActiveBlog: true,
    recentFunding: "Series A $8M",
    activeOnLinkedIn: true,
  },
];

// -- Sample templates (A/B/C variants)
const demoTemplates = [
  {
    name: "LinkedIn Initial - Startup A",
    channel: "linkedin",
    segment: "startup",
    type: "initial",
    variant: "A",
    body: "Hi {{name}}, I noticed {{company}} is tackling {{pain_point}}. We've helped similar startups cut their delivery time by 40%. Worth a quick chat?",
    version: 1,
    isActive: true,
  },
  {
    name: "LinkedIn Initial - Startup B",
    channel: "linkedin",
    segment: "startup",
    type: "initial",
    variant: "B",
    body: "{{name}}, congrats on the recent growth at {{company}}! I work with founders scaling their dev teams. Open to connecting?",
    version: 1,
    isActive: true,
  },
  {
    name: "LinkedIn Initial - Startup C",
    channel: "linkedin",
    segment: "startup",
    type: "initial",
    variant: "C",
    body: "Hey {{name}}, I saw your post about {{hook}}. We've solved that exact problem for 3 other {{segment}} companies. Mind if I share how?",
    version: 1,
    isActive: true,
  },
  {
    name: "Email Initial - Enterprise A",
    channel: "email",
    segment: "enterprise",
    type: "initial",
    variant: "A",
    subject: "Quick question about {{company}}'s tech roadmap",
    body: "Hi {{name}},\n\nI've been following {{company}}'s expansion and noticed you might be evaluating new approaches to {{pain_point}}.\n\nWe recently helped [similar company] achieve [specific result]. Would you be open to a 15-minute call to explore if we could help?\n\nBest,\n{{sender}}",
    version: 1,
    isActive: true,
  },
  {
    name: "LinkedIn Follow-up",
    channel: "linkedin",
    segment: "startup",
    type: "follow_up",
    variant: "A",
    body: "Hi {{name}}, just circling back on my earlier message. I understand timing is everything — would next week work better for a quick chat?",
    version: 1,
    isActive: true,
  },
  {
    name: "Email Breakup",
    channel: "email",
    segment: "enterprise",
    type: "breakup",
    variant: "A",
    subject: "Closing the loop",
    body: "Hi {{name}},\n\nI've reached out a few times and want to respect your time. I'll close this thread, but if {{company}} ever needs help with {{pain_point}}, I'm just a reply away.\n\nWishing you all the best,\n{{sender}}",
    version: 1,
    isActive: true,
  },
];

// Insert leads
console.log("Inserting demo leads...");
for (const lead of demoLeads) {
  const inserted = db.insert(leads).values(lead).returning().get();

  // Create import event for each lead
  db.insert(events).values({
    leadId: inserted.id,
    type: "import",
    detail: `Imported from seed data`,
  }).run();
}

// Insert templates
console.log("Inserting demo templates...");
for (const tmpl of demoTemplates) {
  db.insert(templates).values(tmpl).run();
}

console.log(`Seed complete! Created ${demoLeads.length} leads and ${demoTemplates.length} templates.`);
