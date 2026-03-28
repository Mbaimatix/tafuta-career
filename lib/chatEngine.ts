/**
 * TAFUTA CAREER Chat Engine
 * Free, client-side chatbot powered entirely by the existing career data.
 * No API key, no backend, no cost. Uses matchCareers + searchCareers internally.
 */

import { careers, subjects, pathways, subTracks } from './career-data';
import { matchCareers } from './matching';
import { searchCareers } from './search';

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  links?: { label: string; href: string }[];
}

type Intent =
  | 'greeting'
  | 'subject_search'
  | 'career_search'
  | 'pathway_info'
  | 'salary_info'
  | 'how_to_use'
  | 'high_growth'
  | 'university_required'
  | 'subject_list'
  | 'career_count'
  | 'fallback';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lower(s: string): string {
  return s.toLowerCase().trim();
}

const ALL_SUBJECT_NAMES = subjects.map(s => s.name.toLowerCase());

function detectMentionedSubjects(message: string): string[] {
  const msg = lower(message);
  return subjects
    .filter(s => msg.includes(s.name.toLowerCase()))
    .map(s => s.name);
}

function detectPathwayCode(message: string): string | null {
  const msg = lower(message);
  if (/pathway\s*a\b|stem\b|root\b|pure science|applied science/.test(msg)) return 'A';
  if (/pathway\s*b\b|arts\b|creative|sports science|performing/.test(msg)) return 'B';
  if (/pathway\s*c\b|social science|humanities|business|economics/.test(msg)) return 'C';
  return null;
}

function detectIntent(message: string): Intent {
  const msg = lower(message);

  if (/^(hi|hello|hey|jambo|habari|mambo|hujambo|sasa|good morning|good afternoon|good evening|niaje|sema)/.test(msg)) {
    return 'greeting';
  }
  if (/how (many|much) career|total career|number of career/.test(msg)) return 'career_count';
  if (/what subjects|list subjects|which subjects|all subjects|available subjects/.test(msg)) return 'subject_list';
  if (/salary|earn|pay\b|income|money|ksh|how much/.test(msg)) return 'salary_info';
  if (/high growth|fast growing|growing career|best career|top career|future career/.test(msg)) return 'high_growth';
  if (/university|degree|college|needs degree|requires university/.test(msg)) return 'university_required';
  if (/how (do i|to) use|how does (this|the site|it) work|get started|where (do i|to) start/.test(msg)) return 'how_to_use';
  if (/pathway|stem\b|root\b|arts\b|social science/.test(msg)) return 'pathway_info';
  if (detectMentionedSubjects(message).length > 0) return 'subject_search';

  // If any career name shows up in search results for the message, treat as career search
  return 'career_search';
}

// ─── Response Generators ──────────────────────────────────────────────────────

function replyGreeting(): ChatMessage {
  return {
    role: 'bot',
    text: "Habari! 👋 I'm the TAFUTA CAREER assistant. I can help you:\n\n• Find careers based on your subjects\n• Explore pathways (ROOT, Arts & Sports, Social Sciences)\n• Learn about salary ranges and growth\n• Understand CBC subject requirements\n\nTry asking: \"I study Biology and Chemistry, what careers suit me?\"",
    links: [
      { label: 'Start Career Matcher', href: '/matcher' },
      { label: 'Explore Subjects', href: '/subjects' },
    ],
  };
}

function replyHowToUse(): ChatMessage {
  return {
    role: 'bot',
    text: "Here's how to use TAFUTA CAREER in 3 steps:\n\n1️⃣ Go to Career Matcher → select your CBC pathway (A, B, or C)\n2️⃣ Pick up to 3 subjects you study\n3️⃣ See careers ranked by how well they match your subjects\n\nYou can also:\n• Type a subject (like 'Biology') and I'll show matching careers right here\n• Browse the Subject Explorer to see all careers per subject\n• Search for any career by name",
    links: [
      { label: 'Career Matcher', href: '/matcher' },
      { label: 'Subject Explorer', href: '/subjects' },
      { label: 'Search', href: '/search' },
    ],
  };
}

function replyCareerCount(): ChatMessage {
  const byPathway = pathways.map(p => {
    const count = careers.filter(c => c.pathwayCode === p.code).length;
    return `• Pathway ${p.code} (${p.name.split(' ')[0]}): ${count} careers`;
  });
  return {
    role: 'bot',
    text: `TAFUTA CAREER covers **1,252 careers** across 3 pathways and 9 sub-tracks:\n\n${byPathway.join('\n')}\n\nAll careers are mapped to Kenya's CBC curriculum subjects.`,
    links: [{ label: 'Browse All Careers', href: '/search' }],
  };
}

function replySubjectList(): ChatMessage {
  const grouped: Record<string, string[]> = {
    Sciences: [],
    Mathematics: [],
    Languages: [],
    'Humanities & Social': [],
    'Business & Technical': [],
    'Arts & Sports': [],
  };

  for (const s of subjects) {
    if (['Biology', 'Chemistry', 'Physics'].includes(s.name)) grouped['Sciences'].push(s.name);
    else if (s.name.includes('Mathematics')) grouped['Mathematics'].push(s.name);
    else if (['English', 'Kiswahili', 'French', 'German'].includes(s.name)) grouped['Languages'].push(s.name);
    else if (['History', 'Geography', 'Christian Religious Education', 'Islamic Religious Education', 'Psychology', 'Political Science', 'Philosophy', 'Community Studies', 'Community Service Learning'].includes(s.name)) grouped['Humanities & Social'].push(s.name);
    else if (['Business Studies', 'Computer Studies', 'Electrical Technology', 'Metal Technology', 'Wood Technology', 'Building Construction', 'Power Mechanics', 'Aviation', 'Agriculture'].includes(s.name)) grouped['Business & Technical'].push(s.name);
    else grouped['Arts & Sports'].push(s.name);
  }

  const lines = Object.entries(grouped)
    .filter(([, names]) => names.length > 0)
    .map(([cat, names]) => `**${cat}:** ${names.join(', ')}`);

  return {
    role: 'bot',
    text: `There are **${subjects.length} CBC subjects** available:\n\n${lines.join('\n\n')}\n\nSelect up to 3 subjects in the Career Matcher or Subject Explorer to find matching careers.`,
    links: [{ label: 'Subject Explorer', href: '/subjects' }],
  };
}

function replySalaryInfo(message: string): ChatMessage {
  const pathwayCode = detectPathwayCode(message);

  // Find top-earning careers (those with 500K+ in salary)
  const highEarners = careers
    .filter(c => {
      if (pathwayCode && c.pathwayCode !== pathwayCode) return false;
      return c.salaryRangeKsh.includes('800') || c.salaryRangeKsh.includes('600') || c.salaryRangeKsh.includes('500');
    })
    .slice(0, 5);

  if (highEarners.length === 0) {
    return {
      role: 'bot',
      text: "Salary varies by career. In Kenya's CBC system, medical, engineering, and tech careers typically earn the most. Use the Search page to find careers and check their salary ranges.",
      links: [{ label: 'Search Careers', href: '/search' }],
    };
  }

  const examples = highEarners
    .map(c => `• ${c.name} — ${c.salaryRangeKsh}`)
    .join('\n');

  return {
    role: 'bot',
    text: `Top-earning careers${pathwayCode ? ` in Pathway ${pathwayCode}` : ''} in Kenya:\n\n${examples}\n\nSalaries depend on experience, employer, and specialisation. Click any career to see full details.`,
    links: highEarners.slice(0, 3).map(c => ({ label: c.name, href: `/career/${c.id}` })),
  };
}

function replyHighGrowth(message: string): ChatMessage {
  const pathwayCode = detectPathwayCode(message);
  const growing = careers
    .filter(c => {
      if (pathwayCode && c.pathwayCode !== pathwayCode) return false;
      return c.growthOutlook === 'High';
    })
    .slice(0, 5);

  const list = growing.map(c => `• ${c.name} (${c.salaryRangeKsh})`).join('\n');

  return {
    role: 'bot',
    text: `High-growth careers${pathwayCode ? ` in Pathway ${pathwayCode}` : ''} with strong future demand:\n\n${list}\n\nThese careers have growing demand in Kenya's economy.`,
    links: growing.slice(0, 3).map(c => ({ label: c.name, href: `/career/${c.id}` })),
  };
}

function replyUniversityRequired(message: string): ChatMessage {
  const noUni = careers.filter(c => !c.requiresUniversity).slice(0, 5);
  const withUni = careers.filter(c => c.requiresUniversity).slice(0, 3);

  return {
    role: 'bot',
    text: `**Careers that DON'T require a university degree** (you can enter with a diploma/certificate):\n\n${noUni.map(c => `• ${c.name}`).join('\n')}\n\n**Careers that require a university degree:**\n\n${withUni.map(c => `• ${c.name}`).join('\n')}\n\nEach career detail page shows whether a degree is required.`,
    links: [
      { label: 'Browse All Careers', href: '/search' },
    ],
  };
}

function replyPathwayInfo(message: string): ChatMessage {
  const code = detectPathwayCode(message);

  if (!code) {
    // General pathway overview
    const lines = pathways.map(p => {
      const count = careers.filter(c => c.pathwayCode === p.code).length;
      const tracks = subTracks.filter(st => st.pathwayCode === p.code).map(st => st.name);
      return `**Pathway ${p.code} — ${p.name}**\n${count} careers across ${tracks.length} sub-tracks:\n${tracks.map(t => `  • ${t}`).join('\n')}`;
    });
    return {
      role: 'bot',
      text: `Kenya's CBC has 3 Senior School pathways:\n\n${lines.join('\n\n')}`,
      links: pathways.map(p => ({ label: `Pathway ${p.code}`, href: `/pathway/${p.code}` })),
    };
  }

  const pathway = pathways.find(p => p.code === code)!;
  const count = careers.filter(c => c.pathwayCode === code).length;
  const tracks = subTracks.filter(st => st.pathwayCode === code);

  const trackList = tracks.map(st => {
    const trackCount = careers.filter(c => c.subTrackCode === st.code).length;
    return `• ${st.name} (${st.code}) — ${trackCount} careers`;
  }).join('\n');

  return {
    role: 'bot',
    text: `**Pathway ${code} — ${pathway.name}**\n\n${pathway.description}\n\n${count} careers across ${tracks.length} sub-tracks:\n\n${trackList}`,
    links: [
      { label: `Explore Pathway ${code}`, href: `/pathway/${code}` },
      ...tracks.map(st => ({ label: st.name, href: `/pathway/${code}/${st.code}` })),
    ],
  };
}

function replySubjectSearch(message: string): ChatMessage {
  const foundSubjects = detectMentionedSubjects(message);
  const pathwayCode = detectPathwayCode(message) ?? undefined;

  const results = matchCareers(foundSubjects, careers, pathwayCode, 1);
  const top = results.slice(0, 6);

  if (top.length === 0) {
    return {
      role: 'bot',
      text: `I found you study **${foundSubjects.join(', ')}** but couldn't find matching careers. Try the full Career Matcher for more options.`,
      links: [{ label: 'Career Matcher', href: `/matcher` }],
    };
  }

  const list = top
    .map(r => `• ${r.career.name} (${r.matchPercentage}% match) — ${r.career.salaryRangeKsh}`)
    .join('\n');

  return {
    role: 'bot',
    text: `Based on **${foundSubjects.join(', ')}**, here are your top career matches:\n\n${list}\n\nClick a career to see full details, or use the Career Matcher for a complete ranked list.`,
    links: [
      ...top.slice(0, 3).map(r => ({ label: r.career.name, href: `/career/${r.career.id}` })),
      { label: 'See All Matches', href: `/subjects` },
    ],
  };
}

function replyCareerSearch(message: string): ChatMessage {
  const results = searchCareers(message, careers);
  const top = results.slice(0, 5);

  if (top.length === 0) {
    return {
      role: 'bot',
      text: `I couldn't find a career matching "${message}". Try searching with different keywords, or browse all 1,252 careers.`,
      links: [
        { label: 'Search Careers', href: `/search?q=${encodeURIComponent(message)}` },
        { label: 'Career Matcher', href: '/matcher' },
      ],
    };
  }

  if (top.length === 1) {
    const c = top[0];
    return {
      role: 'bot',
      text: `I found **${c.name}**!\n\n📚 Subjects: ${c.subjects.join(', ')}\n💰 Salary: ${c.salaryRangeKsh}\n📈 Growth: ${c.growthOutlook}\n🎓 Needs degree: ${c.requiresUniversity ? 'Yes' : 'Not always'}\n\n${c.description}`,
      links: [{ label: `View ${c.name}`, href: `/career/${c.id}` }],
    };
  }

  const list = top.map(c => `• ${c.name} — ${c.salaryRangeKsh}`).join('\n');
  return {
    role: 'bot',
    text: `I found ${results.length} careers matching "${message}":\n\n${list}${results.length > 5 ? `\n\n…and ${results.length - 5} more.` : ''}`,
    links: [
      ...top.slice(0, 3).map(c => ({ label: c.name, href: `/career/${c.id}` })),
      { label: 'See All Results', href: `/search?q=${encodeURIComponent(message)}` },
    ],
  };
}

function replyFallback(message: string): ChatMessage {
  return {
    role: 'bot',
    text: `I'm not sure how to answer that, but here are some things I can help with:\n\n• **"I study Biology and Maths"** → career matches\n• **"Tell me about Software Engineer"** → career details\n• **"What is Pathway A?"** → pathway info\n• **"Which careers pay well?"** → salary info\n• **"How do I use this site?"** → quick guide\n\nOr search directly for any career by name.`,
    links: [
      { label: 'Search Careers', href: `/search?q=${encodeURIComponent(message)}` },
      { label: 'Career Matcher', href: '/matcher' },
    ],
  };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function getBotReply(userMessage: string): ChatMessage {
  const intent = detectIntent(userMessage);

  switch (intent) {
    case 'greeting':        return replyGreeting();
    case 'how_to_use':      return replyHowToUse();
    case 'career_count':    return replyCareerCount();
    case 'subject_list':    return replySubjectList();
    case 'salary_info':     return replySalaryInfo(userMessage);
    case 'high_growth':     return replyHighGrowth(userMessage);
    case 'university_required': return replyUniversityRequired(userMessage);
    case 'pathway_info':    return replyPathwayInfo(userMessage);
    case 'subject_search':  return replySubjectSearch(userMessage);
    case 'career_search':   return replyCareerSearch(userMessage);
    default:                return replyFallback(userMessage);
  }
}

export const SUGGESTED_QUESTIONS = [
  'I study Biology and Chemistry',
  'What is Pathway A?',
  'Which careers pay well?',
  'High growth careers',
  'Tell me about Software Engineer',
  'Do I need a degree?',
];
