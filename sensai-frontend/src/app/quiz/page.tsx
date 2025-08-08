"use client";

import { useState } from "react";
import { AssessmentGenerator } from "@/components/AssessmentGenerator";
import { AssessmentInterface } from "@/components/AssessmentInterface";
import { AssessmentResults } from "@/components/AssessmentResults";

interface AssessmentConfig {
  role: string;
  skills: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

type AppState = "generator" | "assessment" | "results";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("generator");
  const [assessmentConfig, setAssessmentConfig] = useState<AssessmentConfig | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  const handleStartAssessment = (config: AssessmentConfig) => {
    setAssessmentConfig(config);
    setAppState("assessment");

    // TODO: Integrate with FastAPI backend to log assessment start
    /*
    fetch('/api/assessment/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        startedAt: new Date().toISOString()
      })
    });
    */
  };

  const handleCompleteAssessment = (results: any) => {
    setAssessmentResults(results);
    setAppState("results");

    // TODO: Integrate with FastAPI backend to save results
    /*
    fetch('/api/assessment/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    });
    */
  };

  const handleRestart = () => {
    setAppState("generator");
    setAssessmentConfig(null);
    setAssessmentResults(null);
  };

  const handleBackToGenerator = () => {
    setAppState("generator");
  };

  // Render based on current state
  if (appState === "generator") {
    return <AssessmentGenerator onStartAssessment={handleStartAssessment} />;
  }

  if (appState === "assessment" && assessmentConfig) {
    return (
      <AssessmentInterface
        config={assessmentConfig}
        onComplete={handleCompleteAssessment}
        onBack={handleBackToGenerator}
      />
    );
  }

  if (appState === "results" && assessmentResults) {
    return (
      <AssessmentResults
        results={assessmentResults}
        onRestart={handleRestart}
      />
    );
  }

  // Fallback
  return <AssessmentGenerator onStartAssessment={handleStartAssessment} />;
};

export default Index;
