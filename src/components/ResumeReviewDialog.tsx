import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Quote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { invokeResumeReview, type ResumeReviewResult } from "@/lib/services/ai.service";

interface ResumeReviewDialogProps {
  resumeId: string;
  parsedContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeReviewDialog({
  resumeId,
  parsedContent,
  open,
  onOpenChange,
}: ResumeReviewDialogProps) {
  const [result, setResult] = useState<ResumeReviewResult | null>(null);

  const { mutate: runReview, isPending, error } = useMutation({
    mutationFn: () => invokeResumeReview({ resumeId, parsedContent }),
    onSuccess: (data) => {
      setResult(data.result);
      toast.success("Resume analysis complete!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to analyze resume");
    },
  });

  const handleStartReview = () => {
    if (!parsedContent) {
      toast.error("Resume content is missing or not yet parsed.");
      return;
    }
    runReview();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-2xl font-heading">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Resume Analysis
          </DialogTitle>
          <DialogDescription>
            Get instant feedback and improvement suggestions for your resume version.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-4">
          {!result && !isPending && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Ready to analyze</h3>
                <p className="text-muted-foreground max-w-sm">
                  Our AI will review your resume for clarity, impact, and presentation, providing actionable feedback.
                </p>
              </div>
              <Button onClick={handleStartReview} size="lg" className="px-8">
                Start Analysis
              </Button>
            </div>
          )}

          {isPending && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground">This may take a moment</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-destructive">Analysis Failed</h3>
                <p className="text-muted-foreground">
                  {error instanceof Error ? error.message : "An unexpected error occurred."}
                </p>
              </div>
              <Button onClick={handleStartReview} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {result && (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-8 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Score & Summary */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-2xl border border-primary/10 min-w-[140px]">
                    <span className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">Score</span>
                    <span className="text-5xl font-bold text-primary">{result.score || 0}</span>
                    <span className="text-xs text-muted-foreground mt-1">out of 100</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Executive Summary</h4>
                    <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strengths */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      <h4>Key Strengths</h4>
                    </div>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 font-semibold">
                      <AlertCircle className="h-5 w-5" />
                      <h4>Areas to Watch</h4>
                    </div>
                    <ul className="space-y-2">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Improvements */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Actionable Improvements</h4>
                  <div className="grid gap-3">
                    {result.improvements.map((imp, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border text-sm leading-relaxed">
                        {imp}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Rewrites */}
                {result.suggested_rewrites && result.suggested_rewrites.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Impact Optimization</h4>
                    <div className="space-y-4">
                      {result.suggested_rewrites.map((sr, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Quote className="h-3 w-3" />
                            <span>Original</span>
                          </div>
                          <p className="text-sm italic text-muted-foreground pl-5 border-l-2 border-muted">
                            {sr.original}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-medium text-primary">
                            <Sparkles className="h-3 w-3" />
                            <span>Suggested Rewrite</span>
                          </div>
                          <p className="text-sm font-medium pl-5 border-l-2 border-primary">
                            {sr.rewrite}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
