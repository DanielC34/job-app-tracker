// Import required components and hooks
import { AppLayout } from "@/components/AppLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { invokeJobMatchAnalysis } from "@/lib/services/ai.service";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
}

// Analyze page component - renders when user navigates to /analyze
export default function Analyze(): JSX.Element {
  // State to track the resume text entered by user
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Handler for analyze button click
  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const session = await supabase.auth.getSession();
      console.log("SESSION:", session);
      // Call AI analysis API here
      const result = await invokeJobMatchAnalysis({
        resume: resumeText,
        jobDescription,
      });
      console.log("Full AI Response:", result);
      // The function returns score, strengths, and weaknesses directly at the top level
      setAnalysisResult(result as unknown as AnalysisResult);
    } catch (error) {
      console.error("Error analyzing resume:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    // AppLayout provides sidebar navigation and page structure
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title="Resume Analysis" />

        <div className="max-w-4xl mx-auto space-y-4">
          {/* Resume text input section */}
          <div>
            <Label htmlFor="resume-textarea" className="text-lg font-medium">
              Resume Content
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              Paste your resume text below for AI-powered analysis
            </p>
            <Textarea
              id="resume-textarea"
              placeholder="Paste your resume text here...e.g. Software Engineer with 5+ years experience\n• Proficient in React, TypeScript, Node.js\n• Led team of 4 developers on project X"
              className="min-h-[400px] font-mono text-sm"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          {/* Job Description text input section */}
          <div>
            <Label htmlFor="resume-textarea" className="text-lg font-medium">
              Job Description
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              Paste your job description text below for AI-powered analysis
            </p>
            <Textarea
              id="job-desc-textarea"
              placeholder="Paste your job description text here...e.g. Software Engineer 1 @ Google"
              className="min-h-[400px] font-mono text-sm"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {/* Stats and action button section */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {resumeText.length > 0 ? (
                <span>
                  {resumeText.length} characters •{" "}
                  {resumeText.split(/\s+/).length} words
                </span>
              ) : (
                <span>Start typing or paste your resume</span>
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={resumeText.length === 0 || jobDescription.length === 0 || isAnalyzing}
              className="px-6"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="mt-8 p-6 bg-white border rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>
              
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium text-gray-700">Match Score:</span>
                  <span className={`text-3xl font-bold ${analysisResult.score >= 80 ? 'text-green-600' : analysisResult.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {analysisResult.score}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-700">{strength}</li>
                    ))}
                  </ul>
                  {analysisResult.strengths.length === 0 && <p className="text-gray-500 italic">None identified.</p>}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Areas for Improvement</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-gray-700">{weakness}</li>
                    ))}
                  </ul>
                  {analysisResult.weaknesses.length === 0 && <p className="text-gray-500 italic">None identified.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
