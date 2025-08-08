import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Assessment, AssessmentItem, MCQItem, SAQItem, CaseletItem, AptitudeItem } from "@/types/assessment";

interface Props {
  assessment: Assessment;
}

type AnswerState = Record<string, number | string | undefined>;

export default function AssessmentQuiz({ assessment }: Props) {
  const grouped = useMemo(() => {
    const g: Record<string, AssessmentItem[]> = { mcq: [], saq: [], caselet: [], aptitude: [], coding: [] };
    for (const it of assessment.items) g[it.type].push(it);
    return g;
  }, [assessment.items]);

  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const totalAutoGradable = grouped.mcq.length + grouped.aptitude.length + grouped.saq.length * 3 + (((grouped as any).coding?.length) ?? 0);

  const setAnswer = (id: string, value: number | string) => setAnswers((prev) => ({ ...prev, [id]: value }));

  // SAQ scoring helpers
  const STOP_WORDS = new Set([
    "the","a","an","and","or","but","if","then","than","to","of","for","on","in","with","as","by","is","are","was","were","be","been","being","at","from"
  ]);
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const tokenize = (s: string) => normalize(s).split(" ").filter((t) => t && !STOP_WORDS.has(t));
  const jaccard = (a: string[], b: string[]) => { const A = new Set(a); const B = new Set(b); const inter = [...A].filter((x) => B.has(x)).length; const uni = new Set([...a, ...b]).size; return uni === 0 ? 0 : inter / uni; };
  const scoreSAQ = (answer: string, expected: string) => {
    const sim = jaccard(tokenize(answer), tokenize(expected));
    if (sim >= 0.7) return 3;
    if (sim >= 0.4) return 2;
    if (sim > 0.15) return 1;
    return 0;
  };
  const isCodingCorrect = (answer: string, expected: string) => normalize(answer) === normalize(expected);

  const grade = () => {
    let s = 0;
    // MCQs (1 point each)
    for (const it of grouped.mcq as MCQItem[]) {
      const selIdx = answers[it.id];
      if (typeof selIdx === "number" && selIdx === it.answerIndex) s += 1;
    }
    // Aptitude (1 point each)
    for (const it of grouped.aptitude as AptitudeItem[]) {
      const selIdx = answers[it.id];
      if (typeof selIdx === "number") {
        const chosen = it.options?.[selIdx];
        if (chosen && it.answer && chosen.toString().trim() === it.answer.toString().trim()) s += 1;
      }
    }
    // SAQs (0-3 points each based on similarity)
    for (const it of grouped.saq as SAQItem[]) {
      const ans = typeof answers[it.id] === "string" ? (answers[it.id] as string) : "";
      s += scoreSAQ(ans, it.expectedAnswer);
    }
    // Coding (full or zero)
    const codingItems = ((grouped as any).coding ?? []) as any[];
    for (const it of codingItems) {
      const ans = typeof answers[it.id] === "string" ? (answers[it.id] as string) : "";
      const expected = (it?.expectedAnswer as string) ?? "";
      if (isCodingCorrect(ans, expected)) s += 1;
    }
    setScore(s);
    setSubmitted(true);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <section className="container mx-auto grid gap-6">
      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Take the quiz</CardTitle>
            <CardDescription>SAQs auto-graded (0–3). Caselets not auto-graded.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!submitted ? (
              <Button variant="hero" onClick={grade} disabled={totalAutoGradable === 0}>Submit</Button>
            ) : (
              <>
                <Badge>{`Score: ${score} / ${totalAutoGradable}`}</Badge>
                <Button variant="secondary" onClick={reset}>Reset</Button>
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      {grouped.mcq.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>MCQs</CardTitle>
            <CardDescription>Select one option</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(grouped.mcq as MCQItem[]).map((item) => {
              const selIdx = typeof answers[item.id] === "number" ? (answers[item.id] as number) : -1;
              const isCorrect = submitted && selIdx === item.answerIndex;
              return (
                <div key={item.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.skill}</Badge>
                    {submitted && (
                      <Badge variant={isCorrect ? "default" : "destructive"}>{isCorrect ? "Correct" : "Incorrect"}</Badge>
                    )}
                  </div>
                  <div className="font-medium">{item.question}</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {item.options.map((opt, idx) => {
                      const chosen = selIdx === idx;
                      const showCorrect = submitted && idx === item.answerIndex;
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer transition-colors ${
                            chosen ? "border-primary" : "border-border"
                          } ${submitted && showCorrect ? "ring-1 ring-primary" : ""}`}
                        >
                          <input
                            type="radio"
                            name={item.id}
                            checked={chosen}
                            onChange={() => setAnswer(item.id, idx)}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  {submitted && selIdx !== item.answerIndex && (
                    <div className="text-xs text-muted-foreground">Correct answer: {item.options[item.answerIndex]}</div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {grouped.aptitude.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Aptitude</CardTitle>
            <CardDescription>Choose the correct answer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(grouped.aptitude as AptitudeItem[]).map((item) => {
              const selIdx = typeof answers[item.id] === "number" ? (answers[item.id] as number) : -1;
              const correctIdx = item.options?.findIndex((o) => o.toString().trim() === (item.answer ?? "").toString().trim()) ?? -1;
              const isCorrect = submitted && selIdx === correctIdx;
              return (
                <div key={item.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.skill}</Badge>
                    {submitted && (
                      <Badge variant={isCorrect ? "default" : "destructive"}>{isCorrect ? "Correct" : "Incorrect"}</Badge>
                    )}
                  </div>
                  <div className="font-medium">{item.question}</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {item.options?.map((opt, idx) => {
                      const chosen = selIdx === idx;
                      const showCorrect = submitted && idx === correctIdx;
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer transition-colors ${
                            chosen ? "border-primary" : "border-border"
                          } ${submitted && showCorrect ? "ring-1 ring-primary" : ""}`}
                        >
                          <input
                            type="radio"
                            name={item.id}
                            checked={chosen}
                            onChange={() => setAnswer(item.id, idx)}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  {submitted && selIdx !== correctIdx && correctIdx >= 0 && item.options && (
                    <div className="text-xs text-muted-foreground">Correct answer: {item.options[correctIdx]}</div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {grouped.saq.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>SAQs</CardTitle>
            <CardDescription>Auto-graded up to 3 points.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(grouped.saq as SAQItem[]).map((item) => {
              const ans = (answers[item.id] as string) ?? "";
              const awarded = submitted ? scoreSAQ(ans, item.expectedAnswer) : null;
              return (
                <div key={item.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.skill}</Badge>
                    {submitted && (
                      <Badge variant="outline">Score: {awarded}/3</Badge>
                    )}
                  </div>
                  <div className="font-medium whitespace-pre-wrap">{item.question}</div>
                  <Textarea
                    rows={3}
                    placeholder="Your answer"
                    value={ans}
                    onChange={(e) => setAnswer(item.id, e.target.value)}
                  />
                  {submitted && (
                    <div className="text-xs text-muted-foreground">Expected answer: {item.expectedAnswer}</div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {(grouped as any).coding?.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Coding</CardTitle>
            <CardDescription>Full marks or zero based on exact answer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(((grouped as any).coding ?? []) as any[]).map((item: any) => {
              const ans = (answers[item.id] as string) ?? "";
              const correct = submitted && isCodingCorrect(ans, item.expectedAnswer ?? "");
              return (
                <div key={item.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.skill ?? "coding"}</Badge>
                    {submitted && (
                      <Badge variant={correct ? "default" : "destructive"}>{correct ? "Correct" : "Incorrect"}</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Prompt</div>
                    <p className="whitespace-pre-wrap">{item.prompt ?? item.question}</p>
                  </div>
                  <Textarea
                    rows={4}
                    placeholder="Your answer"
                    value={ans}
                    onChange={(e) => setAnswer(item.id, e.target.value)}
                  />
                  {submitted && !correct && item.expectedAnswer && (
                    <div className="text-xs text-muted-foreground">Expected answer: {item.expectedAnswer}</div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {grouped.caselet.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Mini-caselets</CardTitle>
            <CardDescription>These are not auto-graded.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(grouped.caselet as CaseletItem[]).map((item) => (
              <div key={item.id} className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary">{item.skill}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Scenario</div>
                  <p className="whitespace-pre-wrap">{item.passage}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Prompt</div>
                  <p className="whitespace-pre-wrap">{item.prompt}</p>
                </div>
                <Textarea
                  rows={4}
                  placeholder="Your approach"
                  value={(answers[item.id] as string) ?? ""}
                  onChange={(e) => setAnswer(item.id, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {submitted && (
        <div className="text-center text-sm text-muted-foreground">
          You scored {score} out of {totalAutoGradable}. Caselets are not auto-graded.
        </div>
      )}
    </section>
  );
}
