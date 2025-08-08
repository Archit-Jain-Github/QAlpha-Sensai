export type Difficulty = "easy" | "medium" | "hard";

export type ItemType = "mcq" | "saq" | "caselet" | "aptitude";

export interface BaseItem {
  id: string;
  type: ItemType;
  skill: string;
  difficulty: Difficulty;
  accepted?: boolean;
}

export interface MCQItem extends BaseItem {
  type: "mcq";
  question: string;
  options: string[];
  answerIndex: number;
  rationale?: string;
}

export interface SAQItem extends BaseItem {
  type: "saq";
  question: string;
  expectedAnswer: string;
  rubric?: string;
}

export interface CaseletItem extends BaseItem {
  type: "caselet";
  passage: string;
  prompt: string;
  rubric?: string;
}

export interface AptitudeItem extends BaseItem {
  type: "aptitude";
  question: string;
  options?: string[];
  answer?: string;
}

export type AssessmentItem = MCQItem | SAQItem | CaseletItem | AptitudeItem;

export interface AssessmentMeta {
  role: string;
  skills: string[];
  jobDescription?: string;
  difficulty: Difficulty;
  counts: {
    mcq: number;
    saq: number;
    caselet: number;
    aptitude?: number;
  };
}

export interface CoverageReport {
  bySkill: Record<string, number>;
  byDifficulty: Record<Difficulty, number>;
  totals: { items: number; mcq: number; saq: number; caselet: number; aptitude: number };
}

export interface Assessment {
  meta: AssessmentMeta;
  items: AssessmentItem[];
  coverage: CoverageReport;
}
