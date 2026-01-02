'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Edit2 } from 'lucide-react';
import { CATEGORIES } from './calendar-constants';

interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  selectedDate: string;
  values: {
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    category: string;
  };
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  isPending: boolean;
}

export function EventFormDialog({
  isOpen,
  onOpenChange,
  editingId,
  selectedDate,
  values,
  onChange,
  onSave,
  isPending,
}: EventFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingId ? (
              <>
                <Edit2 className="h-4 w-4 text-blue-500" /> Edit Event
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 text-blue-500" /> New Event
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Display date (read only) */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold opacity-60">Target Date</Label>
            <Input value={selectedDate} disabled className="bg-muted font-mono h-9" />
          </div>

          {/* Start and end time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold opacity-60">Start Time</Label>
              <Input
                type="time"
                value={values.startTime}
                onChange={(e) => onChange('startTime', e.target.value)}
                className="h-9 font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold opacity-60">End Time</Label>
              <Input
                type="time"
                value={values.endTime}
                onChange={(e) => onChange('endTime', e.target.value)}
                className="h-9 font-mono"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-[10px] uppercase font-bold opacity-60">
              Title
            </Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Ex: Earnings Call..."
              className="h-9"
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold opacity-60">Category</Label>
            <Select value={values.category} onValueChange={(v) => onChange('category', v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs uppercase font-bold">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.lightColors.main }} />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold opacity-60">Description</Label>
            <Textarea
              value={values.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Additional details..."
              className="resize-none h-20 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:opacity-90 px-8 font-bold"
            onClick={onSave}
            disabled={!values.title.trim() || isPending}
          >
            {isPending ? 'Saving...' : 'Save Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
