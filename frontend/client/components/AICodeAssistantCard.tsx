import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Cpu, User, Loader2, Sparkles, Brain, Search, Info, RotateCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ fileName: string; similarity: number }>;
}

export function AICodeAssistantCard() {
  const { project, projectId } = useProject();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const queryMutation = api.rag.queryPGVector.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources.map(s => ({ fileName: s.fileName, similarity: s.similarity }))
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast.error("AI Assistant Error: " + error.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please make sure your repository is indexed."
      }]);
    }
  });

  const indexMutation = api.rag.indexGithubRepository.useMutation({
    onSuccess: async (data) => {
      if (data.processedCount > 0) {
        toast.success(`Successfully indexed ${data.processedCount} files! AI is now ready.`);
        await utils.rag.getPGVectorStats.invalidate({ projectId: projectId || '' });
      } else if (data.errors && data.errors.length > 0) {
        toast.error(`Indexing failed: ${data.errors[0]}. Check the server logs for details.`);
      } else {
        const hint = (data as { message?: string }).message;
        toast.warning(
          hint ??
            '0 files were indexed. If this is a private repository, add a GitHub Personal Access Token in the Sync tab (project settings). Also verify the GitHub URL is correct.',
          { duration: 8000 }
        );
      }
    },
    onError: (error) => {
      toast.error("Indexing failed: " + error.message);
    }
  });

  const { data: stats } = api.rag.getPGVectorStats.useQuery(
    { projectId: projectId || '' },
    { enabled: !!projectId }
  );

  const isIndexed = stats && stats.totalFiles > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !projectId || queryMutation.isPending) return;

    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion("");

    queryMutation.mutate({
      projectId,
      question: currentQuestion,
      topK: 5
    });
  };

  const handleIndex = () => {
    if (!projectId || !project?.githubUrl) {
      toast.error("Project must have a GitHub URL to index. Add one in project Settings (Sync tab).");
      return;
    }
    indexMutation.mutate({
      projectId,
      githubUrl: project.githubUrl,
      githubToken: project.githubToken ?? undefined,
    });
  };

  return (
    <Card className="col-span-3 flex flex-col h-[calc(100vh-8rem)] min-h-[650px] max-h-[900px] relative overflow-hidden bg-[#0A0A0B] border border-white/5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.01] -z-1 opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40%] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full opacity-40" />
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full opacity-40" />

      {/* Technical Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4 border-white/5 relative z-10 bg-zinc-950/20 backdrop-blur-xl rounded-t-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="relative p-2.5 rounded-xl bg-zinc-900 border border-white/10 shadow-xl">
              <Cpu className="w-5 h-5 text-zinc-400" />
            </div>
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Repository Context
              <Badge className="bg-white/5 text-zinc-400 border-white/10 text-[9px] font-black tracking-widest px-2 py-0.5 pointer-events-none">
                PLATFORM CORE
              </Badge>
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-0.5">
              Semantic Query Protocol
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isIndexed ? (
            <div className="relative cursor-default">
              <Badge variant="outline" className="relative bg-white/5 border-white/10 text-zinc-400 text-[10px] font-black flex gap-2 py-1.5 px-3 rounded-full overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                INDEXED: {stats?.totalFiles || 0} FILES
              </Badge>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleIndex}
              disabled={indexMutation.isPending}
              className="h-9 px-4 bg-white/5 border-white/10 text-white hover:bg-white/10 text-[10px] font-black rounded-xl transition-all active:scale-95"
            >
              {indexMutation.isPending ? <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-2 text-zinc-400" />}
              INITIALIZE CONTEXT
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 flex flex-col p-0 relative overflow-hidden">
        {/* Messages display */}
        <ScrollArea className="flex-1 min-h-0 overflow-hidden" ref={scrollRef}>
          <div className="p-8 pb-12 space-y-8">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-start mt-6 mb-8 text-center space-y-8">
                <div className="relative">
                  <div className="relative w-20 h-20 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group/bot cursor-default">
                    <Cpu className="w-10 h-10 text-zinc-500 group-hover/bot:scale-110 transition-transform duration-500" />
                  </div>
                </div>

                <div className="space-y-3 relative z-10 max-w-lg mx-auto">
                  <h3 className="text-2xl font-black text-white tracking-tight">Semantic Repository Query</h3>
                  <p className="text-[13px] text-zinc-500 max-w-[360px] leading-relaxed mx-auto font-medium">
                    Query project architecture, debug application logic, or analyze patterns across indexed technical debt.
                  </p>
                </div>

                {/* Intelligent Starter Suggestions – one click runs the query */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-12 pb-8">
                  {[
                    { text: "Explain terminal project architecture", icon: Search },
                    { text: "List core business logic routines", icon: Brain },
                    { text: "Trace middleware processing flow", icon: Cpu }
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!projectId || queryMutation.isPending) return;
                        if (!isIndexed) {
                          toast.warning(
                            'Repository not indexed yet. Click "INITIALIZE CONTEXT" above to index your codebase first.',
                            { duration: 5000 }
                          );
                          return;
                        }
                        const q = suggestion.text;
                        setMessages(prev => [...prev, { role: 'user', content: q }]);
                        setQuestion('');
                        queryMutation.mutate({ projectId, question: q, topK: 5 });
                      }}
                      disabled={!projectId || queryMutation.isPending}
                      className="group/sug relative overflow-hidden flex items-center gap-3.5 p-4 bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800/80 border border-white/5 hover:border-indigo-500/30 rounded-2xl text-left transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-indigo-500/10 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover/sug:from-indigo-500/5 group-hover/sug:to-transparent transition-all duration-500" />
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover/sug:border-indigo-500/30 group-hover/sug:bg-indigo-500/10 transition-colors">
                        <suggestion.icon className="w-4 h-4 text-zinc-500 group-hover/sug:text-indigo-400 transition-colors" />
                      </div>
                      <span className="text-[13px] font-bold text-zinc-400 group-hover/sug:text-zinc-200 transition-colors tracking-tight truncate pr-2">
                        {suggestion.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex flex-col gap-3 max-w-[88%]",
                    msg.role === 'user' ? "ml-auto" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2.5",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center border shadow-lg",
                      msg.role === 'user'
                        ? "bg-zinc-800 border-white/10"
                        : "bg-white text-[#08080c] border-white/10"
                    )}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-zinc-400" /> : <Cpu className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      {msg.role === 'user' ? 'Engineering' : 'Platform Context'}
                    </span>
                  </div>

                  <div className={cn(
                    "p-5 rounded-[1.5rem] text-[13.5px] leading-relaxed relative overflow-hidden",
                    msg.role === 'user'
                      ? "bg-zinc-100 text-zinc-950 shadow-xl font-semibold rounded-tr-none"
                      : "bg-[#141416] border border-white/5 text-zinc-300 shadow-2xl rounded-tl-none ring-1 ring-white/[0.02]"
                  )}>
                    <div className="relative z-10">{msg.content}</div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-5 pt-5 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-3 flex items-center gap-2">
                          <Search className="w-3 h-3 text-indigo-400" /> Grounded References
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.sources.slice(0, 4).map((source, si) => (
                            <div key={si} className="bg-white/[0.02] border border-white/5 px-2.5 py-1.5 rounded-xl flex items-center justify-between group/src cursor-default hover:bg-white/[0.04] transition-colors">
                              <span className="text-[10px] font-bold text-zinc-500 truncate max-w-[120px] group-hover/src:text-zinc-300">{source.fileName}</span>
                              <span className="text-[9px] font-black text-indigo-500/80 bg-indigo-500/5 px-1.5 rounded-md border border-indigo-500/10">
                                {Math.round(source.similarity * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {queryMutation.isPending && (
              <div className="mr-auto max-w-[88%] flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Platform Context</span>
                </div>
                <div className="p-5 rounded-[1.5rem] rounded-tl-none bg-[#141416] border border-white/5 flex items-center gap-4 group/loading shadow-2xl">
                  <div className="relative">
                    <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                  </div>
                  <span className="text-xs text-zinc-600 animate-pulse font-bold uppercase tracking-widest">Parsing technical context...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Improved Input Area */}
        <div className="shrink-0 p-8 pt-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent relative z-10">
          <form onSubmit={handleSubmit} className="relative group/input-row">
            {/* Input Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-0 group-focus-within/input-row:opacity-100 transition duration-1000" />

            <div className="relative">
              <Input
                placeholder={isIndexed ? "Enter your technical query..." : "Please initialize AI index above..."}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={!isIndexed || queryMutation.isPending}
                className="h-16 bg-zinc-900/60 backdrop-blur-xl border-white/10 rounded-[1.5rem] pl-6 pr-16 text-sm text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-indigo-500/50 transition-all shadow-2xl"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!isIndexed || !question.trim() || queryMutation.isPending}
                className={cn(
                  "absolute right-2.5 top-2.5 h-11 w-11 rounded-2xl shadow-xl transition-all duration-500 active:scale-90",
                  question.trim() ? "bg-indigo-600 hover:bg-indigo-500 text-white translate-x-0" : "bg-zinc-800 text-zinc-500 pointer-events-none"
                )}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-indigo-500/50" /> Engine: Gemini 2.0 Flash
              </p>
              <div className="h-3 w-[1px] bg-white/5" />
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="w-3 h-3" /> Encrypted Context
              </p>
            </div>

            {!isIndexed && project?.githubUrl && (
              <button
                onClick={handleIndex}
                className="text-[10px] text-indigo-400 hover:text-white font-black uppercase tracking-widest flex items-center gap-2 transition-all p-1 hover:bg-indigo-500/10 rounded-lg group/init"
              >
                <RotateCw className="w-3.5 h-3.5 group-hover/init:rotate-180 transition-transform duration-500" />
                BOOTSTRAP AI PROTOCOL
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}