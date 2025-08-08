import { Assessment, AssessmentItem, AssessmentMeta, CoverageReport, Difficulty } from "@/types/assessment";

// Updated to use OpenAI's actual API endpoint
const API_BASE = "https://api.openai.com";
const API_KEY = "sk-RuZUaXy0PsLLRMgi-6bcgA"; // Your provided API key

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

// Enhanced prompt for better question generation
function buildPrompt(meta: AssessmentMeta): string {
  const totalQuestions = (meta.counts?.mcq || 0) + (meta.counts?.saq || 0) + (meta.counts?.caselet || 0) + (meta.counts?.aptitude || 0);
  const skillsList = meta.skills && meta.skills.length > 0 ? meta.skills.join(", ") : "general skills";

  return `You are an expert assessment designer creating a professional quiz for a ${meta.role} position.

REQUIREMENTS:
- Role: ${meta.role}
- Skills to assess: ${skillsList}
- Difficulty level: ${meta.difficulty}
- Question counts: ${meta.counts?.mcq || 0} MCQs, ${meta.counts?.saq || 0} SAQs, ${meta.counts?.caselet || 0} Caselets, ${meta.counts?.aptitude || 0} Aptitude questions

CRITICAL UNIQUENESS REQUIREMENTS:
- ALL questions must be completely UNIQUE and DISTINCT
- NO duplicate or similar questions
- Each question must test DIFFERENT aspects of the skills
- Vary scenarios, contexts, and approaches for each question
- Use diverse examples, situations, and problem types
- Ensure no repetitive patterns in question stems or content

QUESTION TYPES:

1. MCQ (Multiple Choice Questions):
   - Must have exactly 4 realistic options
   - Only one correct answer
   - Include answerIndex (0-3) for correct option
   - Professional, role-specific scenarios
   - Each MCQ must have UNIQUE scenario and DISTINCT options
   - No similar answer choices across different MCQs

2. SAQ (Short Answer Questions):
   - Open-ended questions requiring 2-3 sentence responses
   - Include expectedAnswer with sample response
   - Include rubric for evaluation
   - Each SAQ must ask about DIFFERENT aspects or scenarios
   - Vary question formats and focus areas

3. Caselet (Case Study Questions):
   - Real-world scenario with context (passage)
   - Clear problem statement (prompt)
   - Include rubric for structured evaluation
   - Each caselet must have COMPLETELY DIFFERENT business scenarios
   - Use varied industries, challenges, and contexts

4. Aptitude (if requested):
   - Logical reasoning, numerical, or analytical questions
   - 4 options with one correct answer
   - Include answer field with correct option text
   - Each aptitude question must use DIFFERENT problem types
   - Vary mathematical concepts and reasoning approaches

IMPORTANT CONSTRAINTS:
- Create exactly ${totalQuestions} total questions
- Distribute skills evenly across questions
- All questions must be ${meta.difficulty} difficulty level
- ENSURE MAXIMUM DIVERSITY in question content, scenarios, and approaches
- NO repetitive language or similar structures
- Return ONLY valid JSON, no explanations

Return JSON in this exact structure:
{
  "meta": ${JSON.stringify(meta)},
  "items": [array of questions],
  "coverage": {coverage object}
}

Each item must match these TypeScript interfaces:
- MCQ: { id, type: "mcq", skill, difficulty, question, options: string[4], answerIndex: number, rationale }
- SAQ: { id, type: "saq", skill, difficulty, question, expectedAnswer, rubric }
- Caselet: { id, type: "caselet", skill, difficulty, passage, prompt, rubric }
- Aptitude: { id, type: "aptitude", skill: "aptitude", difficulty, question, options: string[4], answer }`;
}

function generateMCQ(skill: string, difficulty: Difficulty, role: string) {
  const questionStems = [
    `Which approach best demonstrates advanced ${skill} expertise for a ${role}?`,
    `In a complex ${role} project requiring ${skill}, what strategy would be most effective?`,
    `When implementing ${skill} as a ${role}, which practice ensures optimal outcomes?`,
    `For a ${role} facing ${skill} challenges, what methodology shows professional competency?`,
    `Which ${skill} technique would a senior ${role} prioritize in high-stakes situations?`,
  ];

  const contexts = [
    `enterprise-level implementation`,
    `time-critical project delivery`,
    `cross-functional team collaboration`,
    `stakeholder management scenario`,
    `quality assurance framework`,
  ];

  const selectedContext = contexts[Math.floor(Math.random() * contexts.length)];
  const questionVariants = questionStems.map(stem =>
    stem + ` Consider ${selectedContext} requirements.`
  );

  const correctAnswers = [
    `Implement comprehensive ${skill} strategy with ${selectedContext} best practices and measurable outcomes`,
    `Apply industry-standard ${skill} methodology while ensuring ${selectedContext} alignment`,
    `Execute structured ${skill} approach with continuous monitoring for ${selectedContext}`,
    `Deploy proven ${skill} framework optimized for ${selectedContext} success`,
  ];

  const distractorTemplates = [
    `Use basic ${skill} approach without considering ${selectedContext} implications`,
    `Apply outdated ${skill} methods that may conflict with ${selectedContext} needs`,
    `Focus primarily on speed rather than ${skill} quality in ${selectedContext}`,
    `Implement ${skill} without proper ${selectedContext} validation or testing`,
  ];

  const correct = correctAnswers[Math.floor(Math.random() * correctAnswers.length)];
  const distractors = distractorTemplates
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
  const answerIndex = options.indexOf(correct);

  return {
    id: uid("mcq"),
    type: "mcq" as const,
    skill,
    difficulty,
    question: pick(questionVariants),
    options,
    answerIndex,
    rationale: `${sentenceCase(difficulty)}: This tests practical ${skill} application in ${selectedContext}. The correct answer demonstrates comprehensive understanding and professional implementation approach for ${role} professionals.`,
  };
}

function generateSAQ(skill: string, difficulty: Difficulty, role: string) {
  const questionTypes = [
    {
      prompt: `Analyze a challenging situation where ${skill} implementation failed in a ${role} context. What lessons would you apply to prevent similar issues?`,
      focus: "failure analysis and prevention"
    },
    {
      prompt: `Design a comprehensive ${skill} strategy for a ${role} leading a diverse, remote team. Address key considerations and success metrics.`,
      focus: "strategic planning and leadership"
    },
    {
      prompt: `Evaluate the trade-offs between different ${skill} approaches when working as a ${role} under resource constraints. Justify your recommendation.`,
      focus: "critical evaluation and decision-making"
    },
    {
      prompt: `Describe how you would mentor junior ${role}s in developing their ${skill} capabilities. Include specific techniques and milestones.`,
      focus: "mentoring and knowledge transfer"
    },
    {
      prompt: `Outline how to integrate ${skill} principles with emerging technologies in a ${role} position. Consider innovation and risk management.`,
      focus: "innovation and technology integration"
    }
  ];

  const selectedQuestion = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  return {
    id: uid("saq"),
    type: "saq" as const,
    skill,
    difficulty,
    question: selectedQuestion.prompt,
    expectedAnswer: `A comprehensive response should demonstrate: 1) Deep understanding of ${skill} principles and their application to ${selectedQuestion.focus}, 2) Specific, actionable strategies relevant to ${role} responsibilities, 3) Consideration of potential challenges and mitigation approaches, 4) Clear success metrics and evaluation criteria, 5) Integration with broader organizational objectives.`,
    rubric: `Assessment criteria: ${skill} technical knowledge (25%), ${selectedQuestion.focus} expertise (25%), Practical application to ${role} context (25%), Problem-solving methodology (15%), Communication clarity and structure (10%).`,
  };
}

function generateCaselet(skill: string, difficulty: Difficulty, role: string) {
  const scenarios = [
    {
      context: "merger and acquisition",
      passage: `As a ${role}, you're managing ${skill} during a complex merger between two companies with different technological infrastructures and cultural approaches. The timeline is aggressive, stakeholders have conflicting priorities, and there's uncertainty about resource allocation post-merger.`,
      challenge: "integration and change management"
    },
    {
      context: "digital transformation",
      passage: `You're a ${role} leading ${skill} initiatives in a traditional organization undergoing digital transformation. The leadership team has mixed comfort levels with technology, existing systems are legacy-based, and there's resistance to change from long-term employees.`,
      challenge: "modernization and adoption"
    },
    {
      context: "crisis management",
      passage: `As a ${role}, you must maintain ${skill} excellence during an unexpected crisis that has disrupted normal operations. Resources are limited, remote work is mandatory, and customer expectations remain high despite the challenging circumstances.`,
      challenge: "crisis adaptation and continuity"
    },
    {
      context: "scaling operations",
      passage: `You're a ${role} responsible for ${skill} as the company scales from startup to enterprise level. The team has grown 300% in six months, processes that worked for 10 people are breaking down with 50+, and maintaining quality while increasing velocity is critical.`,
      challenge: "scalability and process optimization"
    },
    {
      context: "regulatory compliance",
      passage: `As a ${role}, you need to ensure ${skill} practices meet new industry regulations while maintaining operational efficiency. The compliance requirements are complex, penalties for non-compliance are severe, and the regulations affect multiple aspects of current workflows.`,
      challenge: "compliance integration and risk management"
    }
  ];

  const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  const prompts = [
    `Develop a comprehensive strategy addressing: 1) Immediate priorities and quick wins, 2) Medium-term roadmap for ${selectedScenario.challenge}, 3) Stakeholder communication plan, 4) Success metrics and monitoring approach.`,
    `Create an action plan that covers: 1) Risk assessment and mitigation strategies, 2) Resource requirements and timeline, 3) Change management approach for ${selectedScenario.challenge}, 4) Contingency planning for potential setbacks.`,
    `Design your approach including: 1) Current state analysis and gap identification, 2) Solution architecture for ${selectedScenario.challenge}, 3) Implementation phases with dependencies, 4) Quality assurance and feedback mechanisms.`
  ];

  return {
    id: uid("case"),
    type: "caselet" as const,
    skill,
    difficulty,
    passage: selectedScenario.passage,
    prompt: prompts[Math.floor(Math.random() * prompts.length)],
    rubric: `Evaluation framework: Strategic thinking and situational analysis (20%), ${skill} technical application and methodology (25%), ${selectedScenario.challenge} specific expertise (20%), Implementation feasibility and planning (20%), Stakeholder management and communication (15%).`,
  };
}

function generateAptitude(difficulty: Difficulty) {
  const problemTypes = {
    easy: [
      () => {
        const n1 = Math.floor(Math.random() * 25) + 15;
        const n2 = Math.floor(Math.random() * 25) + 15;
        const correct = (n1 + n2).toString();
        return {
          question: `Calculate: ${n1} + ${n2}`,
          correct,
          options: [correct, (n1 + n2 + 2).toString(), (n1 + n2 - 3).toString(), (n1 + n2 + 5).toString()]
        };
      },
      () => {
        const base = Math.floor(Math.random() * 12) + 8;
        const multiplier = Math.floor(Math.random() * 6) + 3;
        const correct = (base * multiplier).toString();
        return {
          question: `What is ${base} × ${multiplier}?`,
          correct,
          options: [correct, (base * multiplier + 1).toString(), (base * multiplier - 2).toString(), (base * (multiplier + 1)).toString()]
        };
      }
    ],
    medium: [
      () => {
        const a = Math.floor(Math.random() * 8) + 3;
        const pattern = a * 3;
        const correct = (a * 3 * 3).toString();
        return {
          question: `In the sequence ${a}, ${pattern}, ?, what is the next number?`,
          correct,
          options: [correct, (pattern + a).toString(), (pattern * 2).toString(), (pattern + 3).toString()]
        };
      },
      () => {
        const total = Math.floor(Math.random() * 200) + 100;
        const percentage = Math.floor(Math.random() * 30) + 10;
        const correct = Math.round(total * percentage / 100).toString();
        return {
          question: `What is ${percentage}% of ${total}?`,
          correct,
          options: [correct, Math.round(total * (percentage + 5) / 100).toString(), Math.round(total * (percentage - 5) / 100).toString(), Math.round(total * percentage / 50).toString()]
        };
      }
    ],
    hard: [
      () => {
        const x = Math.floor(Math.random() * 7) + 3;
        const equation = `2x + 5 = ${2 * x + 5}`;
        const correct = (x * x).toString();
        return {
          question: `If ${equation}, what is x²?`,
          correct,
          options: [correct, ((x + 1) * (x + 1)).toString(), ((x - 1) * (x - 1)).toString(), (x * 3).toString()]
        };
      },
      () => {
        const workers = Math.floor(Math.random() * 8) + 4;
        const days = Math.floor(Math.random() * 6) + 8;
        const newWorkers = workers + 2;
        const correct = Math.round(workers * days / newWorkers).toString();
        return {
          question: `If ${workers} workers can complete a task in ${days} days, how many days will ${newWorkers} workers take?`,
          correct,
          options: [correct, (days - 1).toString(), (days + 1).toString(), Math.round(days * 0.8).toString()]
        };
      },
      () => {
        const investment = Math.floor(Math.random() * 5000) + 10000;
        const rate = Math.floor(Math.random() * 8) + 5;
        const years = 2;
        const correct = Math.round(investment * Math.pow(1 + rate/100, years)).toString();
        return {
          question: `An investment of ${investment} at ${rate}% compound interest per year. What's the value after ${years} years?`,
          correct,
          options: [correct, (investment * (1 + rate/100) * years).toString(), Math.round(investment * 1.15).toString(), Math.round(investment * 1.25).toString()]
        };
      }
    ]
  };

  const availableProblems = problemTypes[difficulty];
  const selectedProblem = pick(availableProblems);
  const problem = selectedProblem();
  const options = problem.options.sort(() => Math.random() - 0.5);

  return {
    id: uid("apt"),
    type: "aptitude" as const,
    skill: "aptitude",
    difficulty,
    question: problem.question,
    options,
    answer: problem.correct,
  };
}

export async function buildLocalAssessment(meta: AssessmentMeta): Promise<Assessment> {
  const items: AssessmentItem[] = [];

  const cycleSkills = (count: number): string[] => {
    const s: string[] = [];
    if (!meta.skills || meta.skills.length === 0) {
      // Fallback if no skills provided
      for (let i = 0; i < count; i++) {
        s.push("general");
      }
    } else {
      for (let i = 0; i < count; i++) {
        s.push(meta.skills[i % meta.skills.length]);
      }
    }
    return s;
  };

  // Safely handle counts with defaults
  const mcqCount = meta.counts?.mcq || 0;
  const saqCount = meta.counts?.saq || 0;
  const caseletCount = meta.counts?.caselet || 0;
  const aptitudeCount = meta.counts?.aptitude || 0;

  const mcqSkills = cycleSkills(mcqCount);
  const saqSkills = cycleSkills(saqCount);
  const caseSkills = cycleSkills(caseletCount);

  mcqSkills.forEach((skill) => items.push(generateMCQ(skill, meta.difficulty, meta.role)));
  saqSkills.forEach((skill) => items.push(generateSAQ(skill, meta.difficulty, meta.role)));
  caseSkills.forEach((skill) => items.push(generateCaselet(skill, meta.difficulty, meta.role)));

  if (aptitudeCount > 0) {
    for (let i = 0; i < aptitudeCount; i++) {
      items.push(generateAptitude(meta.difficulty));
    }
  }

  const coverage = buildCoverage(meta, items);
  return { meta, items, coverage };
}

export async function tryHypervergeLLM(meta: AssessmentMeta): Promise<Assessment | null> {
  try {
    const prompt = buildPrompt(meta);

    const res = await fetch(`${API_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert assessment designer specializing in creating unique, diverse, and high-quality professional quiz questions. Each question must be completely distinct with no repetitive content, scenarios, or answer patterns. Generate varied, creative, and contextually rich questions. Respond ONLY with valid JSON matching the exact structure requested. No explanations or additional text."
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7, // Increased for more creativity and diversity
        max_tokens: 4000,
        top_p: 0.9, // Added for more diverse output
        frequency_penalty: 0.6, // Penalize repetitive content
        presence_penalty: 0.6, // Encourage diverse topics
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API Error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";

    if (!content.trim()) {
      throw new Error("Empty response from OpenAI API");
    }

    // Extract JSON from the response
    let jsonStr = content.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }

    // Find JSON object boundaries
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No valid JSON object found in response");
    }

    jsonStr = jsonStr.slice(start, end + 1);

    const assessment = JSON.parse(jsonStr) as Assessment;

    // Validate the response structure
    if (!assessment.meta || !assessment.items || !Array.isArray(assessment.items)) {
      throw new Error("Invalid assessment structure");
    }

    // Additional validation for uniqueness
    const questions = assessment.items.map(item => {
      if (item.type === "caselet") {
        return item.prompt;
      } else if (item.type === "mcq" || item.type === "saq" || item.type === "aptitude") {
        return item.question;
      }
      return "";
    });
    const uniqueQuestions = new Set(questions);
    if (questions.length !== uniqueQuestions.size) {
      console.warn("Detected duplicate questions, falling back to local generation");
      return null;
    }

    // Check for similar question stems (basic similarity check)
    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const similarity = calculateSimilarity(questions[i], questions[j]);
        if (similarity > 0.7) { // 70% similarity threshold
          console.warn("Detected highly similar questions, falling back to local generation");
          return null;
        }
      }
    }

    // Ensure coverage is calculated correctly
    assessment.coverage = buildCoverage(meta, assessment.items);

    console.log(`Successfully generated ${assessment.items.length} unique questions using OpenAI`);
    return assessment;

  } catch (error) {
    console.warn("OpenAI generation failed:", error);
    // Log more details for debugging
    if (error instanceof Error) {
      console.warn("Error details:", error.message);
    }
    return null;
  }
}

// Helper function to calculate basic text similarity
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const words2 = text2.toLowerCase().split(/\W+/).filter(word => word.length > 3);

  const commonWords = words1.filter(word => words2.includes(word));
  const totalUniqueWords = new Set([...words1, ...words2]).size;

  return totalUniqueWords > 0 ? commonWords.length / totalUniqueWords : 0;
}

export async function generateAssessment(meta: AssessmentMeta): Promise<Assessment> {
  console.log("Attempting to generate assessment using OpenAI...");

  const llmAssessment = await tryHypervergeLLM(meta);
  if (llmAssessment) {
    console.log("Successfully generated assessment using OpenAI");
    return llmAssessment;
  }

  console.log("Falling back to local assessment generation");
  return buildLocalAssessment(meta);
}