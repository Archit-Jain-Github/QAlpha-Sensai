import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Assessment, AssessmentItem, MCQItem, SAQItem, CaseletItem } from "@/types/assessment";

interface Props {
  assessment: Assessment;
  setAssessment: (a: Assessment) => void;
}

function downloadJSON(filename: string, data: object) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AssessmentReview({ assessment, setAssessment }: Props) {
  const grouped = useMemo(() => {
    const g: Record<string, AssessmentItem[]> = { mcq: [], saq: [], caselet: [], aptitude: [] };
    for (const it of assessment.items) g[it.type].push(it);
    return g;
  }, [assessment.items]);

  const acceptedOnly = assessment;


  return (
    <section className="container mx-auto grid gap-6">
      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Coverage summary</CardTitle>
            <CardDescription>By skill and difficulty</CardDescription>
          </div>
          
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Skills</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(assessment.coverage.bySkill).map(([k, v]) => (
                <Badge key={k} variant="secondary">{k}: {v}</Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Difficulty</div>
            <div className="flex gap-2">
              {(Object.entries(assessment.coverage.byDifficulty) as [string, number][]).map(([k, v]) => (
                <Badge key={k} variant="outline">{k}: {v}</Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Totals</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(assessment.coverage.totals).map(([k, v]) => (
                <Badge key={k}>{k}: {v}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {grouped.mcq.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>MCQs</CardTitle>
            <CardDescription>Preview (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {grouped.mcq.map((it) => {
              const item = it as MCQItem;
              return (
                <div key={item.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.skill}</Badge>
                    <span className="text-xs text-muted-foreground">Correct answer hidden</span>
                  </div>
                  <div className="font-medium">{item.question}</div>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {item.options.map((opt, idx) => (
                      <li key={idx} className="rounded-md border p-2 text-sm">{opt}</li>
                    ))}
                  </ul>
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
            <CardDescription>Short answers with rubric</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {grouped.saq.map((it) => {
              const item = it as SAQItem;
              return (
                <div key={item.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.skill}</Badge>
                    <span className="text-xs text-muted-foreground">Open-ended</span>
                  </div>
                  <div className="font-medium whitespace-pre-wrap">{item.question}</div>
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
            <CardDescription>Scenario, prompt and rubric</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {grouped.caselet.map((it) => {
              const item = it as CaseletItem;
              return (
                <div key={item.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.skill}</Badge>
                    <span className="text-xs text-muted-foreground">Open-ended</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Scenario</div>
                    <p className="whitespace-pre-wrap">{item.passage}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Prompt</div>
                    <p className="whitespace-pre-wrap">{item.prompt}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">Role: <span className="font-medium text-foreground">{assessment.meta.role}</span> · Difficulty: {assessment.meta.difficulty} · Skills: {assessment.meta.skills.join(", ")}</div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => downloadJSON("assessment.json", acceptedOnly)}>Download assessment.json</Button>
          <Button variant="hero" onClick={() => downloadJSON("coverage.json", assessment.coverage)}>Download coverage report</Button>
        </div>
      </div>
    </section>
  );
}
