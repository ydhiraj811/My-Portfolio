export type Link = {
  label: string;
  url: string;
};

export type Portfolio = {
  _id?: string;
  profile: {
    name: string;
    role: string;
    location: string;
    phone: string;
    email: string;
    headline: string;
    summary: string;
    about: string;
    resumeUrl: string;
    github: string;
    linkedin: string;
    leetcode: string;
  };
  stats: Array<{ value: string; label: string }>;
  stack: string[];
  skills: Array<{ title: string; items: string[] }>;
  experience: Array<{ role: string; company: string; period: string; location: string; bullets: string[] }>;
  projects: Array<{ title: string; year: string; summary: string; stack: string[]; links: Link[] }>;
  education: Array<{ title: string; institution: string; period: string; detail: string }>;
  blogs: Array<{ title: string; date: string; excerpt: string; slug?: string; body?: string; published?: boolean }>;
};

export type ActivityDay = {
  date: string;
  count: number;
  level: number;
};

export type ActivityProvider = {
  provider: string;
  username?: string;
  profileUrl?: string;
  source?: string;
  note?: string;
  total?: number;
  accepted?: number;
  currentStreak?: number;
  bestStreak?: number;
  totalActiveDays?: number;
  days?: ActivityDay[];
  error?: string;
};

export type ActivityResponse = {
  github: ActivityProvider;
  leetcode: ActivityProvider;
};
