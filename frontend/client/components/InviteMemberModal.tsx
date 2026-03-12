'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserPlus, Mail, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteData) => Promise<void>;
}

interface InviteData {
  email: string;
  name: string;
  role: string;
  message?: string;
}

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
  const [formData, setFormData] = useState<InviteData>({
    email: '',
    name: '',
    role: 'member',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await onInvite(formData);
      setFormData({ email: '', name: '', role: 'member', message: '' });
      onClose();
    } catch (error) {
      // Error handled by parent toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof InviteData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0A0A0B] border border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-grid-white/[0.01] -z-1 opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[30%] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-[80px] pointer-events-none" />

        <div className="p-8 pb-4 relative z-10">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="relative group/icon">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[1.25rem] blur opacity-25" />
                <div className="relative w-12 h-12 rounded-[1.25rem] bg-zinc-900 flex items-center justify-center border border-white/10 shadow-xl">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                  Invite Team Member
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-[13px] font-medium mt-0.5">
                  Grow your project team with new collaborators
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-7 relative z-10 w-full">
          <div className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Email Address
              </Label>
              <div className="relative group/input">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/input:text-indigo-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 w-full pl-11 bg-zinc-900/60 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-[1.25rem] text-[13px] text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-indigo-500/50 transition-all shadow-md focus:shadow-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Full Name
              </Label>
              <div className="relative group/input">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/input:text-indigo-400 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-12 w-full pl-11 bg-zinc-900/60 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-[1.25rem] text-[13px] text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-indigo-500/50 transition-all shadow-md focus:shadow-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Initial Role
              </Label>
              <div className="relative group/input">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className="h-12 w-1/2 relative bg-zinc-900/60 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-[1.25rem] text-[13px] text-zinc-300 focus:ring-0 focus:ring-offset-0 focus:border-indigo-500/50 transition-all shadow-md">
                    <div className="flex items-center gap-2 font-semibold tracking-wide px-2">
                      <SelectValue placeholder="Select a role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border border-white/10 rounded-[1.25rem] shadow-2xl z-[100] text-zinc-200">
                    <SelectItem value="member" className="focus:bg-zinc-900 focus:text-indigo-300 text-[13px] py-3 cursor-pointer transition-colors rounded-xl mx-1 font-semibold">Team Member</SelectItem>
                    <SelectItem value="admin" className="focus:bg-zinc-900 focus:text-indigo-300 text-[13px] py-3 cursor-pointer transition-colors rounded-xl mx-1 font-semibold">Admin</SelectItem>
                    <SelectItem value="viewer" className="focus:bg-zinc-900 focus:text-indigo-300 text-[13px] py-3 cursor-pointer transition-colors rounded-xl mx-1 font-semibold">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Personal Message <span className="opacity-70 ml-1 tracking-normal font-semibold lowercase italic">(optional)</span>
              </Label>
              <div className="relative group/input">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
                <Textarea
                  id="message"
                  placeholder="Add a welcoming note..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={3}
                  className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-2xl p-4 text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-indigo-500/50 transition-all resize-none shadow-md focus:shadow-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 bg-zinc-900/50 hover:bg-zinc-800 border-white/5 hover:border-white/10 text-zinc-400 hover:text-white text-sm font-bold tracking-wide rounded-[1.25rem] transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold tracking-wide rounded-[1.25rem] shadow-xl hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Send Invitation
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
