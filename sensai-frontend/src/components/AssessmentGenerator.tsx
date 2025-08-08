"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Target, Brain, TrendingUp } from "lucide-react";

interface AssessmentConfig {
  role: string;
  skills: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

interface AssessmentGeneratorProps {
  onStartAssessment: (config: AssessmentConfig) => void;
}

const AVAILABLE_ROLES = [
  "Product Analyst",
  "Data Scientist",
  "Software Engineer",
  "Product Manager",
  "Business Analyst",
  "UX Researcher"
];

const AVAILABLE_SKILLS = [
  "SQL", "Python", "JavaScript", "React", "Product-Metrics",
  "Data Analysis", "Statistics", "Machine Learning", "A/B Testing",
  "User Research", "Wireframing", "Agile", "Stakeholder Management"
];

export function AssessmentGenerator({ onStartAssessment }: AssessmentGeneratorProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleGenerate = () => {
    if (selectedRole && selectedSkills.length > 0) {
      onStartAssessment({
        role: selectedRole,
        skills: selectedSkills,
        difficulty
      });
    }
  };

  const isValid = selectedRole && selectedSkills.length > 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Assessment Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create personalized technical assessments tailored to specific roles and skills
          </p>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Configure Assessment
            </CardTitle>
            <CardDescription>
              Set up your assessment parameters to generate targeted questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Target Role
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skills Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Required Skills <span className="text-muted-foreground">(max 5)</span>
              </label>

              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <Select onValueChange={addSkill} value="">
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Add skills..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_SKILLS
                    .filter(skill => !selectedSkills.includes(skill))
                    .map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      <div className="flex items-center gap-2">
                        <Plus className="w-3 h-3" />
                        {skill}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Difficulty Level
              </label>
              <Select value={difficulty} onValueChange={(value: "Easy" | "Medium" | "Hard") => setDifficulty(value)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Easy
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="Hard">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      Hard
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assessment Preview */}
            {isValid && (
              <div className="bg-muted rounded-lg p-4 border border-border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Assessment Preview
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• 15 Multiple Choice Questions</p>
                  <p>• 5 Short Answer Questions</p>
                  <p>• 1 Situational Case Study</p>
                  <p className="text-primary font-medium pt-2">
                    Estimated Time: 45-60 minutes
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!isValid}
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              Generate Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}