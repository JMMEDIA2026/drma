export type MemberGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const MIN_MEMBER_GRADE = 1 as const;
export const MAX_MEMBER_GRADE = 7 as const;
export const SUPER_ADMIN_GRADE = 7 as const;

// Whichever account signs up/logs in with this email is automatically
// granted super-admin (grade 7). Its password is whatever that person
// sets at signup — never hardcode a real password here, since this file
// ships to the browser bundle and would expose it to anyone reading the
// deployed JS.
export const SUPER_ADMIN_EMAIL = 'nkjoy@naver.com';

export interface MemberGradeInfo {
  grade: MemberGrade;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgClass: string;
  borderClass: string;
  isVip: boolean;
}

export const MEMBER_GRADES: MemberGradeInfo[] = [
  {
    grade: 1,
    label: '1등급 · 일반',
    shortLabel: '1등급',
    description: '기본 무료 회원',
    color: 'text-zinc-300',
    bgClass: 'bg-zinc-500/20',
    borderClass: 'border-zinc-500/30',
    isVip: false,
  },
  {
    grade: 2,
    label: '2등급 · 브론즈',
    shortLabel: '2등급',
    description: '출석·코인 혜택 강화',
    color: 'text-orange-300',
    bgClass: 'bg-orange-500/20',
    borderClass: 'border-orange-500/30',
    isVip: false,
  },
  {
    grade: 3,
    label: '3등급 · 실버',
    shortLabel: '3등급',
    description: 'HD 화질 · 광고 감소',
    color: 'text-slate-300',
    bgClass: 'bg-slate-400/20',
    borderClass: 'border-slate-400/30',
    isVip: false,
  },
  {
    grade: 4,
    label: '4등급 · 골드',
    shortLabel: '4등급',
    description: '보너스 코인 2배 적립',
    color: 'text-yellow-300',
    bgClass: 'bg-yellow-500/20',
    borderClass: 'border-yellow-500/30',
    isVip: false,
  },
  {
    grade: 5,
    label: '5등급 · 플래티넘',
    shortLabel: '5등급',
    description: '일부 유료 회차 무료',
    color: 'text-cyan-300',
    bgClass: 'bg-cyan-500/20',
    borderClass: 'border-cyan-500/30',
    isVip: false,
  },
  {
    grade: 6,
    label: '6등급 · VIP',
    shortLabel: '6등급',
    description: '전편 무제한 · 광고 없음',
    color: 'text-amber-300',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-500/30',
    isVip: true,
  },
  {
    grade: 7,
    label: '7등급 · 최고관리자',
    shortLabel: '7등급',
    description: '최고 등급 · 관리자 권한',
    color: 'text-rose-300',
    bgClass: 'bg-rose-500/20',
    borderClass: 'border-rose-500/30',
    isVip: true,
  },
];

export function getMemberGradeInfo(grade: MemberGrade): MemberGradeInfo {
  return MEMBER_GRADES.find(g => g.grade === grade) ?? MEMBER_GRADES[0];
}

export function clampMemberGrade(value: number): MemberGrade {
  const clamped = Math.min(MAX_MEMBER_GRADE, Math.max(MIN_MEMBER_GRADE, Math.round(value)));
  return clamped as MemberGrade;
}

export function isSuperAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

export function isSuperAdminGrade(grade: MemberGrade): boolean {
  return grade === SUPER_ADMIN_GRADE;
}
