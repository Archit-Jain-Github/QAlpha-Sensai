import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AssessmentForm from "@/components/AssessmentForm";
import AssessmentReview from "@/components/AssessmentReview";
import AssessmentQuiz from "@/components/AssessmentQuiz";
import type { Assessment } from "@/types/assessment";

const Index = () => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  const canonical = useMemo(() => (typeof window !== "undefined" ? window.location.href : "/"), []);

  return (
    <>
      <Helmet>
        <title>Role & Skill-Aligned Assessment Generator</title>
        <meta name="description" content="Generate role-relevant MCQs, SAQs, caselets, and aptitude questions from role, skills, and difficulty. Export assessment.json and coverage." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Role & Skill-Aligned Assessment Generator" />
        <meta property="og:description" content="Create assessments aligned to roles and skills in seconds. Includes coverage and reviewer editing." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Role & Skill-Aligned Assessment Generator",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            description:
              "Generate role-relevant assessments (MCQs, SAQs, caselets, aptitude) with coverage and review.",
          })}
        </script>
      </Helmet>

      <header className="bg-hero py-16">
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary-foreground">
            Role & Skill‑Aligned Assessment Generator
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
            From role + skills + difficulty → MCQs, SAQs, mini-caselets and optional aptitude. Export assessment.json and a coverage report.
          </p>
        </div>
      </header>

      <main className="container mx-auto -mt-8 grid gap-8">
        <AssessmentForm onGenerated={(a) => setAssessment(a)} />
        {assessment && (
          <>
            <AssessmentReview assessment={assessment} setAssessment={setAssessment} />
            <AssessmentQuiz assessment={assessment} />
          </>
        )}
      </main>
    </>
  );
};

export default Index;
