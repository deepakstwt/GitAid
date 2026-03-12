"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { format, formatDistanceToNow } from "date-fns";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, User, RefreshCcw, Search, X as XIcon, Cpu, FileText } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const AskQuestionCardInline = dynamic(() => import("@/components/AskQuestionCardInline").then((mod) => mod.AskQuestionCardInline), { ssr: false });
const CodeReferences = dynamic(() => import("@/components/CodeReferencesSimple").then((mod) => mod.CodeReferences), { ssr: false });

import Image from "next/image";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface Question {
  id: string;
  text: string;
  answer: string;
  fileReferences: FileReference[];
  createdAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    emailAddress: string;
  };
}

const MarkdownRenderer = dynamic(() => import("@/components/MarkdownRenderer"), { ssr: false });

const QAPage = () => {
  const { project } = useProject();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  const { data: questions, isLoading, error, refetch } = api.project.getQuestions.useQuery(
    { projectId: project?.id || "" },
    { enabled: !!project?.id }
  );

  // Filter questions based on search query
  const filteredQuestions =
    questions?.filter((question) =>
      question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${question.user.firstName} ${question.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.user.emailAddress.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const selectedQuestion = selectedQuestionIndex !== null ? filteredQuestions[selectedQuestionIndex] : null;

  const handleQuestionClick = (index: number) => {
    setSelectedQuestionIndex(index);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setSelectedQuestionIndex(null);
    }, 300);
  };

  // Keyboard shortcuts and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDialogOpen) handleDialogClose();
      if ((event.metaKey || event.ctrlKey) && event.key === "r" && !isDialogOpen) {
        event.preventDefault();
        refetch();
      }
    };

    if (isDialogOpen && closeButtonRef.current) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, refetch]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = isDialogOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDialogOpen]);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please select a project to view Q&A</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Ask Question Card */}
      <div className="mb-8">
        <AskQuestionCardInline onQuestionSaved={refetch} />
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group/title-icon">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-25 group-hover/title-icon:opacity-50 transition-opacity" />
              <div className="relative p-2 rounded-xl bg-zinc-900 border border-white/10 shadow-xl">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
              Saved Questions
              {questions && (
                <span className="text-sm font-bold tracking-normal text-indigo-400 ml-3 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 relative top-[-2px]">
                  {filteredQuestions.length}{searchQuery && ` of ${questions.length}`}
                </span>
              )}
            </h1>
          </div>
          <Button
            onClick={() => {
              refetch();
              toast.success("Questions refreshed!");
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white rounded-xl h-10 px-4 transition-colors font-semibold"
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Search Bar */}
        {questions && questions.length > 0 && (
          <div className="relative group/search mt-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[1.25rem] blur opacity-0 group-focus-within/search:opacity-100 transition duration-500" />
            <div className="relative flex">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Search questions, answers, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[1.25rem] text-[14px] text-white placeholder:text-zinc-500 focus:bg-zinc-900 focus:border-indigo-500/50 transition-all shadow-xl"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading questions...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Error loading questions</h3>
              <p className="text-muted-foreground text-center mb-4">
                {error.message || "Failed to load questions. Please try again."}
              </p>
              <Button
                onClick={() => {
                  refetch();
                  toast.success("Retrying...");
                }}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : !questions || questions.length === 0 ? (
          <Card className="border border-white/5 shadow-2xl bg-[#0A0A0B] rounded-[2.5rem] overflow-hidden relative mt-8">
            <div className="absolute inset-0 bg-grid-white/[0.01] -z-1 opacity-20 pointer-events-none" />
            <CardContent className="flex flex-col items-center justify-center py-24 relative z-10 w-full h-full text-center">
              <div className="relative mt-4 mb-8">
                {/* Outer Glow */}
                <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-24 h-24 rounded-[2rem] bg-zinc-900/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group/bot cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover/bot:opacity-100 transition-opacity duration-500" />
                  <MessageSquare className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover/bot:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-3">No questions yet</h3>
              <p className="text-[14px] text-zinc-400 max-w-[360px] leading-relaxed mx-auto font-medium mb-4">
                Ask your first question above to start building your knowledge base for this project.
              </p>
            </CardContent>
          </Card>
        ) : filteredQuestions.length === 0 ? (
          <Card className="border border-white/5 shadow-2xl bg-[#0A0A0B] rounded-[2.5rem] overflow-hidden relative mt-8">
            <div className="absolute inset-0 bg-grid-white/[0.01] -z-1 opacity-20 pointer-events-none" />
            <CardContent className="flex flex-col items-center justify-center py-24 relative z-10 w-full h-full text-center">
              <div className="relative mt-4 mb-8">
                {/* Outer Glow */}
                <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-24 h-24 rounded-[2rem] bg-zinc-900/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group/bot cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover/bot:opacity-100 transition-opacity duration-500" />
                  <Search className="w-10 h-10 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover/bot:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-3">No matching questions</h3>
              <p className="text-[14px] text-zinc-400 max-w-[360px] leading-relaxed mx-auto font-medium">
                Try adjusting your search terms or{" "}
                <button onClick={() => setSearchQuery("")} className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors">
                  clear the search
                </button>.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4 mt-8">
            {filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                className="group relative flex items-start gap-5 bg-[#0A0A0B] hover:bg-[#0F0F11] text-card-foreground p-6 shadow-xl border border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all duration-300 rounded-[1.5rem]"
                onClick={() => handleQuestionClick(index)}
              >
                {/* User Avatar */}
                <div className="flex-shrink-0 relative z-10 mt-1">
                  {question.user.imageUrl ? (
                    <Image src={question.user.imageUrl} alt="User avatar" width={44} height={44} className="rounded-xl border border-white/10 shadow-md group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Question Content */}
                <div className="flex-1 min-w-0 relative z-10 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                      {question.user.firstName && question.user.lastName
                        ? `${question.user.firstName} ${question.user.lastName}`
                        : question.user.emailAddress}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-white text-[16px] font-bold line-clamp-1 group-hover:text-indigo-100 transition-colors tracking-tight">
                    {question.text}
                  </p>
                  <p className="text-zinc-500 text-[14px] leading-relaxed line-clamp-2">
                    {question.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Question Details */}
      {isDialogOpen && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/80 backdrop-blur-md transition-all duration-300 ease-in-out ${isDialogOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            onClick={handleDialogClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 transition-all duration-300 ease-in-out ${isDialogOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-detail-title"
            ref={modalRef}
          >
            <div className="bg-[#08080c] text-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden border border-white/5 transition-all duration-300 ease-in-out">
              {/* Header */}
              <div className="bg-zinc-950/40 backdrop-blur-3xl p-8 border-b border-white/5 relative">
                <button
                  onClick={handleDialogClose}
                  className="absolute right-6 top-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all duration-200 shadow-lg focus:outline-none"
                  aria-label="Close dialog"
                  ref={closeButtonRef}
                >
                  <XIcon className="h-5 w-5" />
                </button>

                <h2 id="question-detail-title" className="text-3xl font-bold text-white mb-8 pr-12 leading-tight tracking-tight">
                  {selectedQuestion.text}
                </h2>

                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-300">Originating Member</span>
                      <span className="text-zinc-600">{format(new Date(selectedQuestion.createdAt), "PPp")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden bg-[#0A0A0B] relative">
                <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
                <div
                  className={`grid ${isMobile ? "grid-cols-1" : selectedQuestion.fileReferences && Array.isArray(selectedQuestion.fileReferences) && selectedQuestion.fileReferences.length > 0 ? "grid-cols-5" : "grid-cols-1"} gap-8 p-10 h-full overflow-y-auto custom-scrollbar transition-all duration-300 relative z-10`}
                  style={{ maxHeight: 'calc(92vh - 200px)' }}
                >
                  {/* Answer Section - Left Side (3/5 width) */}
                  <div className={`flex flex-col ${selectedQuestion.fileReferences && Array.isArray(selectedQuestion.fileReferences) && selectedQuestion.fileReferences.length > 0 ? "col-span-3" : "col-span-1"}`}>
                    <div className="flex items-center gap-4 mb-6 sticky top-0 py-2 z-10">
                      <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl shadow-lg">
                        <Cpu className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Contextual Analysis</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Automated Change Context</p>
                      </div>
                    </div>

                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[1.5rem] shadow-xl overflow-hidden">
                      <div className="h-full overflow-auto p-8 custom-scrollbar">
                        <div
                          className="prose prose-invert prose-base max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-white prose-code:text-white prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/5"
                        >
                          <MarkdownRenderer>
                            {selectedQuestion.answer}
                          </MarkdownRenderer>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File References Section - Right Side (2/5 width) */}
                  {selectedQuestion.fileReferences &&
                    Array.isArray(selectedQuestion.fileReferences) &&
                    selectedQuestion.fileReferences.length > 0 ? (
                    <div className="flex flex-col col-span-2">
                      <div className="flex items-center gap-4 mb-6 sticky top-0 py-2 z-10">
                        <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl shadow-lg">
                          <FileText className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white tracking-tight">
                            Referenced Metadata ({Array.isArray(selectedQuestion.fileReferences) ? selectedQuestion.fileReferences.length : 0})
                          </h3>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Change Intelligence Map</p>
                        </div>
                      </div>

                      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[1.5rem] shadow-xl overflow-hidden">
                        <div className="h-full overflow-auto p-2 custom-scrollbar">
                          <CodeReferences fileReferences={selectedQuestion.fileReferences as unknown as FileReference[]} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAPage;
