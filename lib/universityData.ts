/**
 * universityData.ts
 * Maps CBC sub-tracks to relevant Kenyan university programmes.
 * Used by the PRO career detail page to show university options.
 */

import type { Career } from './career-data';

export interface UniversityProgram {
  university: string;
  program: string;
  annualFeeKsh: string;
  cutoffPoints?: string;
}

/** Universities mapped by sub-track code (A1–C3) */
const SUBTRACK_UNIVERSITIES: Record<string, UniversityProgram[]> = {
  A1: [
    { university: 'University of Nairobi', program: 'Bachelor of Medicine & Surgery (MBChB)', annualFeeKsh: '216,000', cutoffPoints: 'A plain (80+)' },
    { university: 'Kenyatta University', program: 'Bachelor of Science in Nursing', annualFeeKsh: '180,000', cutoffPoints: 'B+ (75+)' },
    { university: 'JKUAT', program: 'Bachelor of Science in Medical Biochemistry', annualFeeKsh: '192,000', cutoffPoints: 'B+ (75+)' },
    { university: 'Moi University', program: 'Bachelor of Medicine & Surgery', annualFeeKsh: '204,000', cutoffPoints: 'A plain (80+)' },
  ],
  A2: [
    { university: 'University of Nairobi', program: 'Bachelor of Science in Electrical Engineering', annualFeeKsh: '228,000', cutoffPoints: 'B+ (75+)' },
    { university: 'JKUAT', program: 'Bachelor of Science in Electrical & Electronic Engineering', annualFeeKsh: '240,000', cutoffPoints: 'B+ (75+)' },
    { university: 'Strathmore University', program: 'Bachelor of Science in Informatics & Computer Science', annualFeeKsh: '340,000', cutoffPoints: 'B+ (75+)' },
    { university: 'Dedan Kimathi University', program: 'Bachelor of Science in Computer Science', annualFeeKsh: '156,000', cutoffPoints: 'B (65+)' },
  ],
  A3: [
    { university: 'JKUAT', program: 'Bachelor of Science in Agriculture', annualFeeKsh: '168,000', cutoffPoints: 'C+ (55+)' },
    { university: 'University of Nairobi', program: 'Bachelor of Science in Applied Biology', annualFeeKsh: '192,000', cutoffPoints: 'B (65+)' },
    { university: 'Egerton University', program: 'Bachelor of Science in Agriculture', annualFeeKsh: '144,000', cutoffPoints: 'C+ (55+)' },
    { university: 'Kenyatta University', program: 'Bachelor of Science in Environmental Science', annualFeeKsh: '168,000', cutoffPoints: 'C+ (55+)' },
  ],
  B1: [
    { university: 'Kenyatta University', program: 'Bachelor of Arts in Fine Art & Design', annualFeeKsh: '156,000', cutoffPoints: 'C+ (55+)' },
    { university: 'University of Nairobi', program: 'Bachelor of Arts in Film & Theatre Studies', annualFeeKsh: '144,000', cutoffPoints: 'C+ (55+)' },
    { university: 'USIU-Africa', program: 'Bachelor of Arts in Communication', annualFeeKsh: '312,000', cutoffPoints: 'B (65+)' },
    { university: 'Daystar University', program: 'Bachelor of Arts in Communication', annualFeeKsh: '216,000', cutoffPoints: 'C+ (55+)' },
  ],
  B2: [
    { university: 'University of Nairobi', program: 'Bachelor of Arts in Linguistics', annualFeeKsh: '132,000', cutoffPoints: 'B- (60+)' },
    { university: 'Kenyatta University', program: 'Bachelor of Arts in Literature', annualFeeKsh: '132,000', cutoffPoints: 'C+ (55+)' },
    { university: 'Moi University', program: 'Bachelor of Arts in Languages', annualFeeKsh: '120,000', cutoffPoints: 'C+ (55+)' },
    { university: 'Maseno University', program: 'Bachelor of Arts in English & Communication', annualFeeKsh: '108,000', cutoffPoints: 'C (50+)' },
  ],
  B3: [
    { university: 'Kenyatta University', program: 'Bachelor of Science in Sports Science', annualFeeKsh: '144,000', cutoffPoints: 'C+ (55+)' },
    { university: 'Moi University', program: 'Bachelor of Education in Physical Education', annualFeeKsh: '120,000', cutoffPoints: 'C+ (55+)' },
    { university: 'University of Nairobi', program: 'Bachelor of Arts in Sports Management', annualFeeKsh: '156,000', cutoffPoints: 'C+ (55+)' },
    { university: 'Masinde Muliro University', program: 'Bachelor of Science in Sport & Recreation', annualFeeKsh: '108,000', cutoffPoints: 'C (50+)' },
  ],
  C1: [
    { university: 'University of Nairobi', program: 'Bachelor of Laws (LLB)', annualFeeKsh: '204,000', cutoffPoints: 'B+ (75+)' },
    { university: 'Kenyatta University', program: 'Bachelor of Arts in History & Government', annualFeeKsh: '132,000', cutoffPoints: 'C+ (55+)' },
    { university: 'Strathmore University', program: 'Bachelor of Laws (LLB)', annualFeeKsh: '360,000', cutoffPoints: 'A- (78+)' },
    { university: 'Moi University', program: 'Bachelor of Arts in Political Science', annualFeeKsh: '120,000', cutoffPoints: 'C+ (55+)' },
  ],
  C2: [
    { university: 'Strathmore University', program: 'Bachelor of Commerce', annualFeeKsh: '348,000', cutoffPoints: 'B (65+)' },
    { university: 'University of Nairobi', program: 'Bachelor of Commerce', annualFeeKsh: '156,000', cutoffPoints: 'B- (60+)' },
    { university: 'USIU-Africa', program: 'Bachelor of Business Administration', annualFeeKsh: '336,000', cutoffPoints: 'B (65+)' },
    { university: 'Kenyatta University', program: 'Bachelor of Economics', annualFeeKsh: '144,000', cutoffPoints: 'B- (60+)' },
  ],
  C3: [
    { university: 'JKUAT', program: 'Bachelor of Science in Agriculture & Enterprise Development', annualFeeKsh: '168,000', cutoffPoints: 'C+ (55+)' },
    { university: 'Egerton University', program: 'Bachelor of Science in Agricultural Extension', annualFeeKsh: '132,000', cutoffPoints: 'C+ (55+)' },
    { university: 'University of Nairobi', program: 'Bachelor of Science in Food Science', annualFeeKsh: '180,000', cutoffPoints: 'B- (60+)' },
    { university: 'Moi University', program: 'Bachelor of Science in Environmental Science', annualFeeKsh: '144,000', cutoffPoints: 'C+ (55+)' },
  ],
};

/**
 * Returns 3–4 relevant Kenyan university programmes for a given career.
 * Falls back to general university options when sub-track is unknown.
 */
export function getUniversitiesForCareer(career: Career): UniversityProgram[] {
  return SUBTRACK_UNIVERSITIES[career.subTrackCode] ?? [
    { university: 'University of Nairobi', program: 'Relevant degree programme', annualFeeKsh: '132,000–228,000' },
    { university: 'Kenyatta University', program: 'Relevant degree programme', annualFeeKsh: '120,000–192,000' },
    { university: 'JKUAT', program: 'Relevant degree programme', annualFeeKsh: '144,000–240,000' },
  ];
}

/** Roadmap milestone definition */
export interface RoadmapStep {
  stage: string;
  title: string;
  detail: string;
  color: string;
}

/**
 * Generates a career roadmap timeline based on the career's pathway and
 * education requirements.
 */
export function getCareerRoadmap(career: Career): RoadmapStep[] {
  const pathwaySubjects: Record<string, string> = {
    A: 'Pick Biology, Chemistry, Physics & Mathematics',
    B: 'Pick your core arts/sports subjects + 3 electives',
    C: 'Pick History, Business Studies, Geography + electives',
  };

  const universities = getUniversitiesForCareer(career);
  const topUni = universities[0];
  const degreeOrTvet = career.requiresUniversity
    ? `${topUni.university} — ${topUni.program} (3–5 years)`
    : 'Enrol in a TVET/Polytechnic for a Diploma or Certificate (2–3 years)';

  return [
    {
      stage: '1',
      title: 'CBC Junior School (Grade 7–9)',
      detail: 'Build your foundation in core subjects. Explore career interests through CBC project-based learning.',
      color: '#006600',
    },
    {
      stage: '2',
      title: `CBC Senior School — Pathway ${career.pathwayCode}`,
      detail: pathwaySubjects[career.pathwayCode] ?? 'Choose elective subjects aligned with your career goal.',
      color: '#008800',
    },
    {
      stage: '3',
      title: 'KCSE & University Selection',
      detail: `Target minimum grade: ${topUni.cutoffPoints ?? 'C+ and above'}. Apply via KUCCPS for government-sponsored placement.`,
      color: '#F59E0B',
    },
    {
      stage: '4',
      title: 'University or TVET',
      detail: degreeOrTvet,
      color: '#006600',
    },
    {
      stage: '5',
      title: 'Internship / Industrial Attachment',
      detail: 'Complete mandatory attachment (3–6 months) required by most Kenyan institutions for licensure.',
      color: '#0284C7',
    },
    {
      stage: '6',
      title: `First Job as ${career.name}`,
      detail: `Entry-level salary: ${career.salaryRangeKsh.split('–')[0] ?? career.salaryRangeKsh}/month. Register with the relevant professional body where applicable.`,
      color: '#006600',
    },
    {
      stage: '7',
      title: 'Career Growth',
      detail: `Growth outlook: ${career.growthOutlook}. Pursue postgraduate study or professional certifications to advance to senior/managerial roles.`,
      color: career.growthOutlook === 'High' ? '#006600' : career.growthOutlook === 'Medium' ? '#F59E0B' : '#BB0000',
    },
  ];
}
