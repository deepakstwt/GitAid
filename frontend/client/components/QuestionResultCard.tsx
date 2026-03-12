"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, FileText, MessageSquare, Save, User, Clock } from "lucide-react";
import { CodeReferences } from "./CodeReferencesSimple";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface QuestionResultCardProps {
  question: string;
  answer: string;
  fileReferences: FileReference[];
  projectId: string;
  onSaved?: () => void;
}

export function QuestionResultCard({
  question,
  answer,
  fileReferences,
  projectId,
  onSaved
}: QuestionResultCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // TRPC mutation for saving the question
  const queryMutation = api.rag.queryPGVector.useMutation({
    onSuccess: () => {
      toast.success("Question saved successfully");
      if (onSaved) onSaved();
    },
    onError: (error) => {
      toast.error("Failed to save question: " + error.message);
    }
  });

  const handleSaveQuestion = async () => {
    if (!projectId || !question.trim() || !answer.trim()) return;
    
    setIsSaving(true);
    try {
      await queryMutation.mutateAsync({
        projectId,
        question: question.trim(),
        topK: 5
      });
    } catch (error: unknown) {
      console.error('Error saving question:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full shadow-2xl border border-white/5 bg-[#0A0A0B] mt-6 mb-8 rounded-3xl overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
      <CardContent className="p-8 relative z-10">
        {/* Header with user info and timestamp */}
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Contributor</p>
              <p className="font-bold text-white tracking-tight">Engineering Lead</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white text-[#08080c] hover:bg-zinc-200 border-none rounded-xl font-bold h-10 px-5"
            onClick={handleSaveQuestion}
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Question"}
          </Button>
        </div>

        {/* Question display */}
        <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Engineering Query</p>
          <p className="text-xl font-bold text-white tracking-tight leading-snug">
            {question}
          </p>
        </div>

        {/* Main content area with AI answer and file references */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Answer Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 shadow-lg">
                <Brain className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="font-bold text-base text-white tracking-tight">Contextual Analysis</h3>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl h-[50vh] overflow-hidden">
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-6 prose prose-invert prose-base max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-white prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/5">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ className, children, ...props }) => (
                          <code
                            className={`${className} bg-white/10 text-white px-1.5 py-0.5 rounded text-[13px] font-mono`}
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-zinc-950 p-5 rounded-xl text-[13px] overflow-auto border border-white/5 font-mono leading-relaxed my-4">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {answer}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </div>
          </div>

          {/* Code References Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 shadow-lg">
                <FileText className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="font-bold text-base text-white tracking-tight">
                Referenced Metadata 
                <span className="ml-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">{fileReferences.length} units</span>
              </h3>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl h-[50vh] overflow-hidden">
              <CardContent className="p-4 h-full">
                <CodeReferences fileReferences={fileReferences} />
              </CardContent>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}