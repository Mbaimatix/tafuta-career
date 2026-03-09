import { clsx } from 'clsx';

// Subject to pathway mapping (lightweight local object)
const SUBJECT_PATHWAY_MAP: Record<string, string> = {
  'Agriculture': 'A',
  'Aviation': 'A',
  'Biology': 'A',
  'Building Construction': 'A',
  'Chemistry': 'A',
  'Computer Studies': 'A',
  'Electrical Technology': 'A',
  'Mathematics': 'A',
  'Metal Technology': 'A',
  'Physics': 'A',
  'Power Mechanics': 'A',
  'Wood Technology': 'A',
  'Fine Art': 'B',
  'Music & Dance': 'B',
  'Physical Education': 'B',
  'Sport & Recreation': 'B',
  'Theatre & Film': 'B',
  'Business Studies': 'C',
  'Christian Religious Education': 'C',
  'Community Service Learning': 'C',
  'Community Studies': 'C',
  'Education': 'C',
  'English': 'C',
  'French': 'C',
  'Geography': 'C',
  'German': 'C',
  'History': 'C',
  'Islamic Religious Education': 'C',
  'Kiswahili': 'C',
  'Library Science': 'C',
  'Music': 'C',
  'Philosophy': 'C',
  'Political Science': 'C',
  'Psychology': 'C',
};

interface SubjectTagProps {
  subject: string;
  pathway?: string;
  size?: 'sm' | 'md';
  clickable?: boolean;
  onClick?: (subject: string) => void;
}

export function SubjectTag({ subject, pathway, size = 'sm', clickable = false, onClick }: SubjectTagProps) {
  const resolvedPathway = pathway || SUBJECT_PATHWAY_MAP[subject] || 'C';

  const tagClass = clsx(
    'inline-flex items-center rounded-full font-medium border',
    {
      'px-2 py-0.5 text-xs': size === 'sm',
      'px-3 py-1 text-sm': size === 'md',
      'subject-tag-a': resolvedPathway === 'A',
      'subject-tag-b': resolvedPathway === 'B',
      'subject-tag-c': resolvedPathway === 'C',
      'cursor-pointer hover:opacity-80 transition-opacity': clickable,
    }
  );

  if (clickable && onClick) {
    return (
      <button type="button" className={tagClass} onClick={() => onClick(subject)}>
        {subject}
      </button>
    );
  }

  return <span className={tagClass}>{subject}</span>;
}
