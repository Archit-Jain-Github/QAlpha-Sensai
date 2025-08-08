import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  RotateCcw
} from "lucide-react";
import assessmentData from "@/data/assessment.json";

interface AssessmentResultsProps {
  results: {
    config: {
      role: string;
      skills: string[];
      difficulty: string;
    };
    answers: Record<number, any>;
    timeSpent: number;
    totalQuestions: number;
  };
  onRestart: () => void;
}

export function AssessmentResults({ results, onRestart }: AssessmentResultsProps) {
  const { config, answers, timeSpent, totalQuestions } = results;

  // Calculate score for multiple choice questions
  const calculateScore = () => {
    let correct = 0;
    let total = 0;

    assessmentData.multipleChoice.forEach(question => {
      total++;
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  const score = calculateScore();
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding! 🎉";
    if (percentage >= 80) return "Great work! 👏";
    if (percentage >= 70) return "Good job! 👍";
    if (percentage >= 60) return "Not bad, room for improvement 📈";
    return "Keep practicing! 💪";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Assessment Complete</h1>
          </div>
          <Button onClick={onRestart} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Overall Results */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Overall Results
            </CardTitle>
            <CardDescription>
              Assessment for {config.role} • {config.difficulty} Level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score */}
              <div className="text-center space-y-2">
                <div className={`text-4xl font-bold ${getScoreColor(score.percentage)}`}>
                  {score.percentage}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {score.correct} of {score.total} correct
                </p>
                <p className="text-primary font-medium">
                  {getScoreMessage(score.percentage)}
                </p>
              </div>

              {/* Time */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="text-2xl font-bold">{formatTime(timeSpent)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Time spent</p>
              </div>

              {/* Completion */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold">100%</span>
                </div>
                <p className="text-sm text-muted-foreground">Completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Breakdown */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Skills Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.skills.map(skill => {
                const skillQuestions = assessmentData.multipleChoice.filter(q => q.skill === skill);
                const skillCorrect = skillQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
                const skillTotal = skillQuestions.length;
                const skillPercentage = skillTotal > 0 ? Math.round((skillCorrect / skillTotal) * 100) : 0;

                return (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{skill}</Badge>
                      <span className={`font-semibold ${getScoreColor(skillPercentage)}`}>
                        {skillPercentage}%
                      </span>
                    </div>
                    <Progress value={skillPercentage} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {skillCorrect} of {skillTotal} questions correct
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Question Review
            </CardTitle>
            <CardDescription>
              Review your answers to the multiple choice questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessmentData.multipleChoice.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className="bg-muted p-4 rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="font-medium">
                          {index + 1}. {question.question}
                        </p>
                        <div className="text-sm space-y-1">
                          <p className="text-muted-foreground">
                            Your answer: <span className={isCorrect ? "text-green-500" : "text-red-500"}>
                              {question.options[userAnswer] || "Not answered"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-green-500">
                              Correct answer: {question.options[question.correctAnswer]}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {question.skill}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Recommendations based on your performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {score.percentage >= 80 ? (
                <>
                  <p className="text-green-500">✅ Excellent performance! You demonstrate strong competency in the assessed skills.</p>
                  <p>• Consider taking advanced level assessments</p>
                  <p>• You may be ready for senior-level positions</p>
                </>
              ) : (
                <>
                  <p className="text-yellow-500">📚 Consider focusing on areas where you scored lower:</p>
                  {config.skills.map(skill => {
                    const skillQuestions = assessmentData.multipleChoice.filter(q => q.skill === skill);
                    const skillCorrect = skillQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
                    const skillPercentage = skillQuestions.length > 0 ? Math.round((skillCorrect / skillQuestions.length) * 100) : 0;

                    if (skillPercentage < 70) {
                      return <p key={skill}>• Study more {skill} concepts and practice</p>;
                    }
                    return null;
                  })}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}