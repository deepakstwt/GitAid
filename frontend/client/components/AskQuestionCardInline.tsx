"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, Search, User, Clock, XIcon, Save, FileText, Cpu } from "lucide-react";
import dynamic from "next/dynamic";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { toast } from "sonner";
const CodeReferences = dynamic(() => import("./CodeReferencesSimple").then((mod) => mod.CodeReferences), { ssr: false });
const MarkdownRenderer = dynamic(() => import("./MarkdownRenderer"), { ssr: false });
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface AskQuestionCardInlineProps {
  onQuestionSaved?: () => void;
}

export function AskQuestionCardInline({ onQuestionSaved }: AskQuestionCardInlineProps) {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [fileReferences, setFileReferences] = useState<FileReference[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isDialogOpen]);

  // TRPC hooks
  const queryMutation = api.rag.queryPGVector.useMutation({
    onSuccess: (result) => {
      setAnswer(result.answer);
      const mappedSources = result.sources.map(source => ({
        fileName: source.fileName,
        summary: source.summary,
        sourceCode: source.sourceCode || '',
        similarity: source.similarity,
      }));
      setFileReferences(mappedSources);
      setIsDialogOpen(true);
    },
    onError: (error) => {
      const errorMsg = typeof error === 'string'
        ? error
        : (error && typeof (error as any).message === 'string'
          ? (error as any).message
          : 'Unknown error');
      console.error("Query failed:", errorMsg);
      toast.error("Failed to process your question. " + errorMsg);
      setAnswer("");
      setFileReferences([]);
      setIsDialogOpen(false);
    },
  });

  // queryPGVector already persists Q&A to the database on first run,
  // so there's no need for a separate save mutation.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !project?.id) return;

    setAnswer("");
    setFileReferences([]);

    try {
      await queryMutation.mutateAsync({
        projectId: project.id,
        question: question.trim(),
        topK: 5,
      });
    } catch (error) {
      const errorMsg =
        typeof error === 'string'
          ? error
          : error && typeof (error as any).message === 'string'
            ? (error as any).message
            : 'Unknown error';
      console.error('Error asking question:', errorMsg);
    }
  };

  const handleSaveQuestion = async () => {
    // Q&A was already persisted by queryPGVector — just acknowledge and reset.
    toast.success("Question saved successfully");
    handleQuestionSaved();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleQuestionSaved = () => {
    // Reset the form after saving
    setQuestion("");
    setIsDialogOpen(false);
    setIsSaving(false);

    // Call the parent callback if provided
    if (onQuestionSaved) {
      onQuestionSaved();
    }
  };

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="w-full relative overflow-hidden bg-[#0A0A0B] border border-white/5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] rounded-3xl">
        <div className="absolute inset-0 bg-grid-white/[0.01] -z-1 opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40%] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

        <CardHeader className="relative z-10 pb-4 pt-6">
          <CardTitle className="flex items-center gap-3 text-white tracking-tight">
            <div className="relative group/icon">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-25" />
              <div className="relative p-2 rounded-xl bg-zinc-900 border border-white/10 shadow-xl">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            Ask a Question
          </CardTitle>
          <CardDescription className="text-zinc-500 ml-[3.25rem] font-medium mt-0">
            Query your codebase with natural language using RAG-powered AI
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 w-full mt-2">
          <form onSubmit={handleSubmit} className="relative group/input-row">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-0 group-focus-within/input-row:opacity-100 transition duration-1000" />
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  placeholder="Ask a question about this project..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={queryMutation.isPending}
                  className="h-14 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[1.25rem] pl-12 pr-4 text-[14px] text-white placeholder:text-zinc-500 focus:bg-zinc-900 focus:border-indigo-500/50 transition-all shadow-xl"
                />
              </div>
              <Button
                type="submit"
                disabled={!question.trim() || queryMutation.isPending}
                className="h-14 px-8 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl transition-all font-bold tracking-wide active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {queryMutation.isPending ? (
                  <Loader2 className="w-5 h-5 mr-0 sm:mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-0 sm:mr-2" />
                )}
                <span className="hidden sm:inline">{queryMutation.isPending ? "Asking..." : "Ask"}</span>
              </Button>
            </div>
          </form>
          {queryMutation.isPending && (
            <div className="mt-5 mb-1 flex items-center gap-3 text-[13px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 p-3.5 rounded-xl ml-0 animate-pulse shadow-inner">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="font-bold tracking-wide uppercase text-[10px]">Synthesizing codebase logic...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Result Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden bg-[#08080c] border border-white/5 shadow-2xl rounded-3xl" showCloseButton={false}>
          <DialogTitle className="sr-only">Question Details</DialogTitle>
          
          {/* Header */}
          <div className="bg-zinc-950/40 backdrop-blur-3xl p-8 border-b border-white/5 relative">
            <DialogClose
              className="absolute right-6 top-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all duration-200 shadow-lg focus:outline-none"
              onClick={handleCloseDialog}
            >
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close dialog</span>
            </DialogClose>

            <h2 className="text-2xl font-bold text-white mb-6 pr-12 leading-tight tracking-tight">
              {question}
            </h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-300">Engineering Query</span>
                  <span className="text-zinc-600">{format(new Date(), 'PPp')}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white text-[#08080c] hover:bg-zinc-200 border-none rounded-xl font-bold"
                onClick={handleSaveQuestion}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Question"}
              </Button>
            </div>
          </div>

          {/* Content Area with Scrolling */}
          <div className="flex-1 overflow-hidden bg-[#0A0A0B]">
            <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 h-full overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)] transition-all duration-300 relative z-10`}>
              {/* Answer Section - Left Side */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-5 sticky top-0 py-2 z-10">
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl shadow-lg">
                    <Cpu className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Contextual Response</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Automated Change Context</p>
                  </div>
                </div>

                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
                  <ScrollArea className="h-full p-4 sm:p-8 max-h-[calc(90vh-250px)]">
                    <div className="prose prose-invert prose-base max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-white prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5">
                      <MarkdownRenderer>{answer}</MarkdownRenderer>
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* File References Section - Right Side */}
              {fileReferences && fileReferences.length > 0 && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-5 sticky top-0 py-2 z-10">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl shadow-lg">
                      <FileText className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        Referenced Metadata ({fileReferences.length})
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Change Intelligence Map</p>
                    </div>
                  </div>

                  <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
                    <ScrollArea className="h-full p-4 sm:p-6 max-h-[calc(90vh-250px)]">
                      <CodeReferences fileReferences={fileReferences} />
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}