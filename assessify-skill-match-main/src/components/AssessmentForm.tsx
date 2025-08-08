import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { extractTextFromPdf } from "@/utils/pdf";
import { generateAssessment } from "@/utils/generator";
import type { Assessment, AssessmentMeta, Difficulty } from "@/types/assessment";
import { toast } from "sonner";

interface Props {
  onGenerated: (assessment: Assessment) => void;
}

export default function AssessmentForm({ onGenerated }: Props) {
  const [role, setRole] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [mcq, setMcq] = useState(15);
  const [saq, setSaq] = useState(5);
  const [caselet, setCaselet] = useState(1);
  const [includeAptitude, setIncludeAptitude] = useState(true);
  const [aptitudeCount, setAptitudeCount] = useState(5);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (skills.includes(v)) return;
    setSkills([...skills, v]);
    setSkillInput("");
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const onPdf = async (file?: File | null) => {
    if (!file) return;
    try {
      toast.info("Reading PDF...");
      const text = await extractTextFromPdf(file);
      setJobDesc((prev) => (prev ? prev + "\n\n" : "") + text);
      toast.success("Extracted text from PDF");
    } catch (e) {
      console.error(e);
      toast.error("Failed to extract PDF text");
    }
  };

  const onSubmit = async () => {
    if (!role) {
      toast.error("Please enter a role.");
      return;
    }
    if (skills.length === 0) {
      toast.error("Add at least one skill.");
      return;
    }

    const meta: AssessmentMeta = {
      role,
      skills,
      jobDescription: jobDesc,
      difficulty,
      counts: { mcq, saq, caselet, aptitude: includeAptitude ? aptitudeCount : 0 },
    };

    setLoading(true);
    toast.message("Generating assessment...", { description: "This may take a few seconds." });
    try {
      const assessment = await generateAssessment(meta);
      onGenerated(assessment);
      toast.success("Assessment ready");
    } catch (e) {
      console.error(e);
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="generator" className="container mx-auto">
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle id="generator">Build an assessment</CardTitle>
          <CardDescription>Enter role, skills, difficulty and optional JD or PDF.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-sm font-medium">Role</label>
            <Input placeholder="e.g., Product Analyst" value={role} onChange={(e) => setRole(e.target.value)} />

            <label className="text-sm font-medium">Skills</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill and press Add"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button variant="secondary" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(s)}>
                  {s}
                </Badge>
              ))}
            </div>

            <label className="text-sm font-medium">Difficulty</label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <label className="text-sm font-medium">Job description / context</label>
            <Textarea rows={8} placeholder="Paste JD or context here" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => onPdf(e.target.files?.[0])}
                aria-label="Upload PDF"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Question counts</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">MCQs</span>
                <Input type="number" min={0} value={mcq} onChange={(e) => setMcq(parseInt(e.target.value || "0", 10))} />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">SAQs</span>
                <Input type="number" min={0} value={saq} onChange={(e) => setSaq(parseInt(e.target.value || "0", 10))} />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Caselets</span>
                <Input type="number" min={0} value={caselet} onChange={(e) => setCaselet(parseInt(e.target.value || "0", 10))} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-md border">
              <div>
                <div className="text-sm font-medium">Include Aptitude</div>
                <div className="text-xs text-muted-foreground">Adds logical/numeric questions</div>
              </div>
              <Switch checked={includeAptitude} onCheckedChange={setIncludeAptitude} />
            </div>

            {includeAptitude && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Aptitude count</span>
                <Input type="number" min={0} value={aptitudeCount} onChange={(e) => setAptitudeCount(parseInt(e.target.value || "0", 10))} />
              </div>
            )}

            <div className="pt-2">
              <Button variant="hero" className="w-full" onClick={onSubmit} disabled={loading}>
                {loading ? "Generating..." : "Generate Assessment"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
