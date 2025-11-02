"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Code, Zap, Search, FileCode, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface CodeReferencesProps {
  fileReferences: FileReference[];
}

export function CodeReferences({ fileReferences }: CodeReferencesProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getFileExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
    };
    return languageMap[ext || ''] || 'text';
  };

  const getSimilarityColor = (similarity: number) => {
    const percent = Math.round(similarity * 100);
    if (percent >= 80) return 'from-emerald-500 to-green-500';
    if (percent >= 60) return 'from-blue-500 to-cyan-500';
    return 'from-yellow-500 to-orange-500';
  };

  if (!fileReferences.length) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-700/50 to-gray-800/30 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-lg mb-2 text-white">No File References</p>
            <p className="text-gray-400 text-sm">No relevant files found for this question</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* File Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fileReferences.map((file, index) => {
          const similarityPercent = Math.round(file.similarity * 100);
          return (
            <button
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedTab === index
                  ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-gray-900/40 border-white/10 hover:border-white/20 hover:bg-gray-900/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  selectedTab === index
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                    : 'bg-gray-800/60'
                }`}>
                  <FileText className={`w-4 h-4 ${
                    selectedTab === index ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold mb-2 truncate ${
                    selectedTab === index ? 'text-white' : 'text-gray-300'
                  }`}>
                    {file.fileName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`bg-gradient-to-r ${getSimilarityColor(file.similarity)} text-white text-xs px-2 py-0.5 font-semibold`}
                    >
                      {similarityPercent}%
                    </Badge>
                    <span className="text-xs text-gray-400">match</span>
                  </div>
                </div>
              </div>
              
              {/* Active indicator */}
              {selectedTab === index && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected File Details */}
      {fileReferences[selectedTab] && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <Tabs value={selectedTab.toString()} className="flex-1 flex flex-col min-h-0">
            {fileReferences.map((file, index) => (
              <TabsContent 
                key={index} 
                value={index.toString()} 
                className="flex-1 flex flex-col min-h-0 mt-0 space-y-4"
              >
                {/* File Header */}
                <div className="flex items-center justify-between p-4 bg-gray-900/60 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <FileCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">{file.fileName}</h4>
                      <p className="text-xs text-gray-400">Code reference file</p>
                    </div>
                  </div>
                  <Badge 
                    className={`bg-gradient-to-r ${getSimilarityColor(file.similarity)} text-white px-3 py-1 font-semibold`}
                  >
                    {Math.round(file.similarity * 100)}% similarity
                  </Badge>
                </div>

                {/* Summary Section */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                      <Zap className="w-4 h-4 text-green-400" />
                    </div>
                    <h5 className="text-sm font-bold text-white uppercase tracking-wide">
                      Summary
                    </h5>
                  </div>
                  <div className="flex-1 bg-gray-900/40 border border-white/10 rounded-xl p-4 overflow-auto custom-scrollbar">
                    <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                      {file.summary}
                    </p>
                  </div>
                </div>

                {/* Source Code Section */}
                {file.sourceCode && (
                  <div className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                          <Code className="w-4 h-4 text-purple-400" />
                        </div>
                        <h5 className="text-sm font-bold text-white uppercase tracking-wide">
                          Source Code
                        </h5>
                      </div>
                      <button
                        onClick={async () => {
                          const codeToCopy = file.sourceCode.slice(0, 5000) + (file.sourceCode.length > 5000 ? '\n// ... (truncated)' : '');
                          try {
                            await navigator.clipboard.writeText(codeToCopy);
                            setCopiedIndex(index);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          } catch (err) {
                            console.error('Failed to copy:', err);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 hover:bg-gray-700/60 border border-white/10 hover:border-blue-500/50 rounded-lg transition-all duration-200 text-sm font-medium text-white hover:text-blue-400"
                        title="Copy source code"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 relative">
                      <ScrollArea className="h-64 w-full" orientation="both">
                        <div className="min-w-max">
                          <SyntaxHighlighter
                            language={getFileExtension(file.fileName)}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              fontSize: '0.75rem',
                              lineHeight: '1.5',
                              background: 'transparent',
                              minWidth: '100%',
                              width: 'max-content',
                            }}
                            showLineNumbers
                            wrapLines={false}
                            PreTag="pre"
                          >
                            {file.sourceCode.slice(0, 5000)}
                            {file.sourceCode.length > 5000 ? '\n// ... (truncated)' : ''}
                          </SyntaxHighlighter>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
