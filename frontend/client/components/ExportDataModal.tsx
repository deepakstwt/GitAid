'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Download, Calendar, Database, Code, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: ExportOptions) => void;
  projectName?: string;
}

interface ExportOptions {
  format: string;
  dateRange: string;
  includeData: {
    commits: boolean;
    comments: boolean;
    team: boolean;
    analytics: boolean;
  };
}

export function ExportDataModal({ isOpen, onClose, onExport, projectName }: ExportDataModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    dateRange: 'all',
    includeData: {
      commits: true,
      comments: true,
      team: true,
      analytics: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onExport(options);
      toast.success('Export started successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to start export');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataToggle = (key: keyof ExportOptions['includeData']) => {
    setOptions(prev => ({
      ...prev,
      includeData: {
        ...prev.includeData,
        [key]: !prev.includeData[key]
      }
    }));
  };

  const hasAnyDataSelected = Object.values(options.includeData).some(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-zinc-950 border border-white/10 p-0 overflow-hidden rounded-[2rem] shadow-2xl shadow-black/50">
        <div className="p-8 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  Export Project Data
                </DialogTitle>
                <DialogDescription className="text-zinc-500 text-xs mt-0.5">
                  Prepare a snapshot of <span className="text-zinc-300 font-medium">"{projectName || 'this project'}"</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Format
              </Label>
              <Select value={options.format} onValueChange={(value) => setOptions(prev => ({ ...prev, format: value }))}>
                <SelectTrigger className="h-11 bg-zinc-900/50 border-white/5 rounded-xl text-xs text-zinc-300 focus:ring-1 focus:ring-indigo-500/50 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Timeline
              </Label>
              <Select value={options.dateRange} onValueChange={(value) => setOptions(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger className="h-11 bg-zinc-900/50 border-white/5 rounded-xl text-xs text-zinc-300 focus:ring-1 focus:ring-indigo-500/50 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
              Data Modules
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'commits', label: 'Commits', desc: 'Code history & stats', icon: Code, color: 'indigo' },
                { id: 'comments', label: 'AI Analysis', desc: 'Summaries & insights', icon: MessageSquare, color: 'indigo' },
                { id: 'team', label: 'Members', desc: 'Activity & workload', icon: Users, color: 'indigo' },
                { id: 'analytics', label: 'Analytics', desc: 'Growth & performance', icon: Database, color: 'indigo' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleDataToggle(item.id as any)}
                  className={cn(
                    "relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group",
                    (options.includeData as any)[item.id]
                      ? "bg-indigo-500/5 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    (options.includeData as any)[item.id] ? "bg-indigo-500/20 group-hover:scale-105" : "bg-white/5"
                  )}>
                    <item.icon className={cn("w-5 h-5", (options.includeData as any)[item.id] ? "text-indigo-400" : "text-zinc-600")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-bold transition-colors", (options.includeData as any)[item.id] ? "text-white" : "text-zinc-400")}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium truncate">
                      {item.desc}
                    </p>
                  </div>
                  <Checkbox
                    checked={(options.includeData as any)[item.id]}
                    className="h-4 w-4 rounded-md border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 bg-white/5 hover:bg-white/10 border-white/5 text-zinc-400 font-bold rounded-2xl transition-all"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
              disabled={isLoading || !hasAnyDataSelected}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Start Export
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
