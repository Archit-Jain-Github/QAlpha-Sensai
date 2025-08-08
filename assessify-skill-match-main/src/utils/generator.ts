import { Assessment, AssessmentItem, AssessmentMeta, CoverageReport, Difficulty } from "@/types/assessment";

const API_BASE = "https://agent.dev.hyperverge.org";
const API_KEY = "sk-RuZUaXy0PsLLRMgi-6bcgA"; // Provided by user. Frontend-only app.

function uid(prefix = "itm"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sentenceCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function difficultyLabel(d: Difficulty) {
  return d === "easy" ? "Easy" : d === "medium" ? "Medium" : "Hard";
}

function buildCoverage(meta: AssessmentMeta, items: AssessmentItem[]): CoverageReport {
  const bySkill: Record<string, number> = {};
  const byDifficulty: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  let mcq = 0, saq = 0, caselet = 0, aptitude = 0;

  for (const it of items) {
    bySkill[it.skill] = (bySkill[it.skill] ?? 0) + 1;
    byDifficulty[it.difficulty] += 1;
    if (it.type === "mcq") mcq += 1;
    else if (it.type === "saq") saq += 1;
    else if (it.type === "caselet") caselet += 1;
    else if (it.type === "aptitude") aptitude += 1;
  }

  return {
    bySkill,
    byDifficulty,
    totals: { items: items.length, mcq, saq, caselet, aptitude },
  };
}

function generateMCQ(skill: string, difficulty: Difficulty, role: string) {
  const variants = [
    `Which of the following best applies ${skill} in a ${role} context?`,
    `In the ${role} role, what is a correct approach related to ${skill}?`,
    `Select the most accurate statement about ${skill} for a ${role}.`,
  ];
  const correct = `A solid ${skill} practice for ${role}`;
  const distractors = [
    `An unrelated task not tied to ${skill}`,
    `A partially correct ${skill} idea with a flaw`,
    `An anti-pattern for ${skill}`,
  ];
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
  const answerIndex = options.indexOf(correct);
  return {
    id: uid("mcq"),
    type: "mcq" as const,
    skill,
    difficulty,
    question: pick(variants),
    options,
    answerIndex,
    rationale: `${sentenceCase(difficulty)}: The correct option reflects best practice for ${skill} in a ${role} context.`,
  };
}

function generateSAQ(skill: string, difficulty: Difficulty, role: string) {
  const prompts = [
    `Explain how you would apply ${skill} to a ${role} problem scenario.`,
    `Describe a step-by-step approach using ${skill} in a ${role} setting.`,
  ];
  return {
    id: uid("saq"),
    type: "saq" as const,
    skill,
    difficulty,
    question: pick(prompts),
    expectedAnswer: `A concise explanation demonstrating ${skill} proficiency with ${difficultyLabel(difficulty)} complexity for a ${role}.`,
    rubric: `Looks for clarity, correctness, and ${skill}-specific reasoning.`,
  };
}

function generateCaselet(skill: string, difficulty: Difficulty, role: string) {
  const scenario = `You are a ${role} facing a ${difficultyLabel(difficulty).toLowerCase()} scenario involving ${skill}.`;
  return {
    id: uid("case"),
    type: "caselet" as const,
    skill,
    difficulty,
    passage: `${scenario} Stakeholders have conflicting goals and limited data.`,
    prompt: `Outline how you would approach the problem, trade-offs, and success metrics.`,
    rubric: `Assesses structured thinking, ${skill} application, and communication.`,
  };
}

function generateAptitude(difficulty: Difficulty) {
  const n1 = Math.floor(Math.random() * 40) + 10;
  const n2 = Math.floor(Math.random() * 40) + 10;
  const correct = (n1 + n2).toString();
  const options = [correct, (n1 + n2 + 1).toString(), (n1 + n2 - 1).toString(), (n1 + n2 + 2).toString()].sort(() => Math.random() - 0.5);
  return {
    id: uid("apt"),
    type: "aptitude" as const,
    skill: "aptitude",
    difficulty,
    question: `Compute ${n1} + ${n2}.`,
    options,
    answer: correct,
  };
}

export async function buildLocalAssessment(meta: AssessmentMeta): Promise<Assessment> {
  const items: AssessmentItem[] = [];

  const cycleSkills = (count: number): string[] => {
    const s: string[] = [];
    for (let i = 0; i < count; i++) s.push(meta.skills[i % Math.max(1, meta.skills.length)] || "general");
    return s;
  };

  const mcqSkills = cycleSkills(meta.counts.mcq);
  const saqSkills = cycleSkills(meta.counts.saq);
  const caseSkills = cycleSkills(meta.counts.caselet);

  mcqSkills.forEach((skill) => items.push(generateMCQ(skill, meta.difficulty, meta.role)));
  saqSkills.forEach((skill) => items.push(generateSAQ(skill, meta.difficulty, meta.role)));
  caseSkills.forEach((skill) => items.push(generateCaselet(skill, meta.difficulty, meta.role)));

  if (meta.counts.aptitude && meta.counts.aptitude > 0) {
    for (let i = 0; i < (meta.counts.aptitude ?? 0); i++) {
      items.push(generateAptitude(meta.difficulty));
    }
  }

  const coverage = buildCoverage(meta, items);
  return { meta, items, coverage };
}

export async function tryHypervergeLLM(meta: AssessmentMeta): Promise<Assessment | null> {
  try {
    const prompt = `You are an expert test designer. Create a JSON assessment aligned to the role and skills.\n` +
      `Return strictly valid JSON matching this TypeScript type shape: { meta, items, coverage }.\n` +
      `Constraints: items must include MCQs (with options and answerIndex), SAQs (with expectedAnswer), caselets (passage + prompt), and optional aptitude (with options and answer).\n` +
      `Ensure coverage counts match the requested numbers. Avoid explanations outside JSON. Include correct answers as specified.\n\n` +
      `Input: ${JSON.stringify(meta)}`;

    const res = await fetch(`${API_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Respond ONLY with JSON. No prose." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";

    // Try to parse JSON block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const jsonStr = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    const assessment = JSON.parse(jsonStr) as Assessment;
    return assessment;
  } catch (e) {
    console.warn("Hyperverge LLM generation failed, using local generator.", e);
    return null;
  }
}

export async function generateAssessment(meta: AssessmentMeta): Promise<Assessment> {
  const llm = await tryHypervergeLLM(meta);
  if (llm) return llm;
  return buildLocalAssessment(meta);
}
