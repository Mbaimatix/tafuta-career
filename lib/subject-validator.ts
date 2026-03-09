/**
 * CBC Subject Combination Validator
 * Based on Kenya's Ministry of Education CBC Senior School rules.
 * Students select: 1 compulsory track + exactly 3 elective subjects.
 */

export interface ValidationResult {
  valid: boolean;
  message: string;
  suggestions?: string[];
}

// Official CBC Senior School subjects by category
export const OFFICIAL_SUBJECTS: Record<string, string[]> = {
  Sciences: ['Biology', 'Chemistry', 'Physics'],
  Mathematics: ['Mathematics'],
  'Technical & Applied': [
    'Electrical Technology',
    'Metal Technology',
    'Wood Technology',
    'Building Construction',
    'Power Mechanics',
    'Aviation',
    'Agriculture',
  ],
  'Computer & ICT': ['Computer Studies'],
  Languages: ['English', 'Kiswahili', 'French', 'German'],
  'Humanities & Social': [
    'History',
    'Geography',
    'Christian Religious Education',
    'Islamic Religious Education',
    'Political Science',
    'Psychology',
    'Philosophy',
    'Community Studies',
    'Community Service Learning',
  ],
  'Business & Economics': ['Business Studies'],
  'Arts, Sports & Creative': [
    'Fine Art',
    'Music',
    'Music & Dance',
    'Physical Education',
    'Sport & Recreation',
    'Theatre & Film',
  ],
};

export const ALL_OFFICIAL_SUBJECTS = Object.values(OFFICIAL_SUBJECTS).flat();

// CBC maximum elective subjects
const MAX_SUBJECTS = 3;

export function validateSubjectCombination(subjects: string[]): ValidationResult {
  if (subjects.length === 0) {
    return { valid: false, message: 'Please select at least 1 subject.' };
  }

  if (subjects.length > MAX_SUBJECTS) {
    return {
      valid: false,
      message: `You have selected ${subjects.length} subjects. CBC allows a maximum of ${MAX_SUBJECTS} elective subjects.`,
      suggestions: [`Remove ${subjects.length - MAX_SUBJECTS} subject(s) to comply with CBC rules.`],
    };
  }

  // Check for unrecognized subjects
  const unrecognized = subjects.filter(s => !ALL_OFFICIAL_SUBJECTS.includes(s));
  if (unrecognized.length > 0) {
    return {
      valid: false,
      message: `Unrecognized subject(s): ${unrecognized.join(', ')}.`,
      suggestions: ['Ensure subject names match official Ministry of Education terminology.'],
    };
  }

  if (subjects.length < MAX_SUBJECTS) {
    return {
      valid: true,
      message: `${subjects.length} of ${MAX_SUBJECTS} subjects selected. You can add ${MAX_SUBJECTS - subjects.length} more.`,
    };
  }

  return {
    valid: true,
    message: `Valid CBC combination: ${subjects.join(', ')}. Ready to find matching careers!`,
  };
}

/**
 * Get recommended subjects based on pathway selection
 */
export function getRecommendedSubjects(pathwayCode: string): string[] {
  const recommendations: Record<string, string[]> = {
    A: ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'Computer Studies'],
    B: ['English', 'Fine Art', 'Music', 'Theatre & Film', 'Kiswahili'],
    C: ['Business Studies', 'History', 'Geography', 'Christian Religious Education', 'Psychology'],
  };
  return recommendations[pathwayCode] || [];
}

/**
 * Check if a subject belongs to a specific pathway category
 */
export function getSubjectPathwayAffinity(subjectName: string): 'A' | 'B' | 'C' | 'general' {
  if (OFFICIAL_SUBJECTS['Sciences'].includes(subjectName) ||
      OFFICIAL_SUBJECTS['Mathematics'].includes(subjectName) ||
      OFFICIAL_SUBJECTS['Technical & Applied'].includes(subjectName) ||
      OFFICIAL_SUBJECTS['Computer & ICT'].includes(subjectName)) {
    return 'A';
  }
  if (OFFICIAL_SUBJECTS['Languages'].includes(subjectName) ||
      OFFICIAL_SUBJECTS['Arts, Sports & Creative'].includes(subjectName)) {
    return 'B';
  }
  if (OFFICIAL_SUBJECTS['Humanities & Social'].includes(subjectName) ||
      OFFICIAL_SUBJECTS['Business & Economics'].includes(subjectName)) {
    return 'C';
  }
  return 'general';
}
