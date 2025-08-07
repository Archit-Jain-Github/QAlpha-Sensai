import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Circle,
  Target,
  FileText,
  Lightbulb
} from "lucide-react";
import assessmentData from "@/data/assessment.json";

interface AssessmentConfig {
  role: string;
  skills: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

interface AssessmentInterfaceProps {
  config: AssessmentConfig;
  onComplete: (results: any) => void;
  onBack: () => void;
}

type QuestionType = "multiple-choice" | "short-answer" | "case-study";

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: number;
  skill?: string;
  maxWords?: number;
  title?: string;
  scenario?: string;
  questions?: string[];
  timeLimit?: number;
}

export function AssessmentInterface({ config, onComplete, onBack }: AssessmentInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [questions, setQuestions] = useState<Question[]>([]);

  // Prepare questions based on config
  useEffect(() => {
    const allQuestions: Question[] = [];
    
    // Add multiple choice questions
    assessmentData.multipleChoice.forEach(q => {
      allQuestions.push({
        ...q,
        type: "multiple-choice" as QuestionType
      });
    });

    // Add short answer questions
    assessmentData.shortAnswer.forEach(q => {
      allQuestions.push({
        ...q,
        type: "short-answer" as QuestionType
      });
    });

    // Add case study
    allQuestions.push({
      id: assessmentData.caseStudy.id,
      type: "case-study" as QuestionType,
      question: "",
      title: assessmentData.caseStudy.title,
      scenario: assessmentData.caseStudy.scenario,
      questions: assessmentData.caseStudy.questions,
      timeLimit: assessmentData.caseStudy.timeLimit
    });

    setQuestions(allQuestions);
  }, [config]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // TODO: Integrate with FastAPI backend to submit results
    // POST /api/assessment/submit
    /*
    const results = {
      config,
      answers,
      timeSpent: 3600 - timeRemaining,
      submittedAt: new Date().toISOString()
    };
    
    fetch('/api/assessment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    });
    */
    
    onComplete({
      config,
      answers,
      timeSpent: 3600 - timeRemaining,
      totalQuestions
    });
  };

  const isAnswered = (questionId: number) => {
    return questionId in answers && answers[questionId] !== null && answers[questionId] !== undefined && answers[questionId] !== "";
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-assessment-bg">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">{config.role} Assessment</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <Badge variant="secondary">
              {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border px-6 py-2">
        <div className="max-w-6xl mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {currentQuestion.type === "multiple-choice" && <Circle className="w-5 h-5 text-primary" />}
                {currentQuestion.type === "short-answer" && <FileText className="w-5 h-5 text-accent" />}
                {currentQuestion.type === "case-study" && <Lightbulb className="w-5 h-5 text-warning" />}
                
                {currentQuestion.type === "case-study" ? currentQuestion.title : 
                 `Question ${currentQuestionIndex + 1}`}
              </CardTitle>
              
              {currentQuestion.skill && (
                <Badge variant="outline">
                  {currentQuestion.skill}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Multiple Choice Question */}
            {currentQuestion.type === "multiple-choice" && (
              <>
                <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-answer-bg p-4 rounded-lg hover:bg-answer-hover transition-colors">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </>
            )}

            {/* Short Answer Question */}
            {currentQuestion.type === "short-answer" && (
              <>
                <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="min-h-32 bg-answer-bg border-border resize-none"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Word limit: {currentQuestion.maxWords} words</span>
                    <span>
                      {answers[currentQuestion.id] ? answers[currentQuestion.id].split(/\s+/).length : 0} words
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Case Study */}
            {currentQuestion.type === "case-study" && (
              <>
                <div className="bg-assessment-question p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-4">Scenario</h3>
                  <p className="leading-relaxed">{currentQuestion.scenario}</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Answer the following questions:</h3>
                  {currentQuestion.questions?.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-base font-medium">
                        {index + 1}. {question}
                      </Label>
                      <Textarea
                        placeholder="Your answer..."
                        value={answers[parseInt(`${currentQuestion.id}${index}`)] || ""}
                        onChange={(e) => handleAnswerChange(parseInt(`${currentQuestion.id}${index}`), e.target.value)}
                        className="min-h-24 bg-answer-bg border-border resize-none"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className="w-10 h-10 p-0 relative"
              >
                {index + 1}
                {isAnswered(questions[index].id) && (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-success" />
                )}
              </Button>
            ))}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button onClick={handleSubmit} className="bg-gradient-primary">
              Submit Assessment
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}