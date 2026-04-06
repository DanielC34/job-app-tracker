import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Sparkles, History, Mail } from "lucide-react";
import { toast } from "sonner";
import { generateFollowUpEmail, getFollowUpEmails } from "@/lib/services/followUpEmails.service";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";

interface FollowUpCardProps {
  applicationId: string;
}

export function FollowUpCard({ applicationId }: FollowUpCardProps) {
  const queryClient = useQueryClient();
  const [tone, setTone] = useState<"professional" | "friendly" | "concise">("professional");
  const [contactName, setContactName] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["follow-up-emails", applicationId],
    queryFn: () => getFollowUpEmails(applicationId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      generateFollowUpEmail({
        applicationId,
        tone,
        contactName: contactName.trim() || undefined,
        context: additionalContext.trim() || undefined,
      }),
    onSuccess: (data) => {
      setGeneratedEmail(data.result);
      queryClient.invalidateQueries({ queryKey: ["follow-up-emails", applicationId] });
      toast.success("Follow-up email generated!");
    },
    onError: (error: any) => {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate email");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Card className="border-primary/20 shadow-sm overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Follow-Up Specialist
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select
              value={tone}
              onValueChange={(v: any) => setTone(v)}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Name (Optional)</Label>
            <Input
              id="contact"
              placeholder="e.g. Sarah Jenkins"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Additional Context (Optional)</Label>
          <Textarea
            id="context"
            placeholder="e.g. Mention our conversation about React performance..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            disabled={mutation.isPending}
            className="resize-none"
          />
        </div>

        <Button
          onClick={() => mutation.mutate()}
          className="w-full gap-2"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Draft...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Follow-Up Draft
            </>
          )}
        </Button>

        {generatedEmail && (
          <div className="space-y-3 pt-2 border-t animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
              <div className="flex justify-between items-start gap-2">
                <div className="font-bold">Subject: {generatedEmail.subject}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{generatedEmail.body}</div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="pt-4 border-t">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="history" className="border-none">
                <AccordionTrigger className="hover:no-underline py-0 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                    <History className="h-4 w-4" />
                    Previous Drafts ({history.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-3">
                  {history.map((email) => (
                    <div key={email.id} className="p-3 border rounded-md text-sm bg-background/50 space-y-2">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="capitalize px-1.5 py-0.5 rounded-full bg-muted border">
                            {email.tone}
                          </span>
                          <span>{format(new Date(email.created_at), "MMM d, h:mm a")}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(`${email.subject}\n\n${email.body}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-semibold line-clamp-1">Subject: {email.subject}</div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">{email.body}</div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
