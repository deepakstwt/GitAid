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
  onInvite: (data: InviteData) => void;
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      onInvite(formData);
      toast.success('Invitation sent successfully');
      setFormData({ email: '', name: '', role: 'member', message: '' });
      onClose();
    } catch (error) {
      toast.error('Failed to send invitation');
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
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-white/10 p-0 overflow-hidden rounded-[2rem] shadow-2xl shadow-black/50">
        <div className="p-8 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                <UserPlus className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  Invite Team Member
                </DialogTitle>
                <DialogDescription className="text-zinc-500 text-xs mt-0.5">
                  Grow your project team with new collaborators
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-11 bg-zinc-900/50 border-white/5 rounded-xl text-xs text-zinc-300 placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 h-11 bg-zinc-900/50 border-white/5 rounded-xl text-xs text-zinc-300 placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Initial Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="h-11 bg-zinc-900/50 border-white/5 rounded-xl text-xs text-zinc-300 focus:ring-1 focus:ring-indigo-500/50 transition-all">
                  <div className="flex items-center gap-2">
                    <SelectValue placeholder="Select a role" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                  <SelectItem value="member">Team Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Personal Message <span className="text-[8px] opacity-50">(Optional)</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Add a welcoming note..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
                className="bg-zinc-900/50 border-white/5 rounded-xl text-xs text-zinc-300 placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
              />
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
