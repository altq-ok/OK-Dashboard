'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, Info, Trash2, Edit2, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from './calendar-constants';

interface EventDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  events: any[];
  onEdit: (event: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function EventDetailDialog({
  isOpen,
  onOpenChange,
  selectedDate,
  events,
  onEdit,
  onDelete,
  onAdd,
}: EventDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-112.5 gap-0 p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 bg-secondary text-secondary-foreground relative flex justify-between items-center">
          <div className="flex items-center gap-2 font-mono">
            <CalendarIcon className="h-5 w-5 opacity-80" />
            <DialogTitle className="text-xl font-bold tracking-tight">{selectedDate}</DialogTitle>
          </div>
          <div className="flex items-center gap-4 mr-8">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[10px] font-bold border-foreground/20 text-secondary-foreground"
            >
              {events.length} Events
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-[50vh] p-6 bg-card border-b">
          <div className="space-y-3 pr-3">
            {events.length > 0 ? (
              events.map((e) => {
                const isoStr = e.start.toString();
                const displayTime = isoStr.includes('T') ? isoStr.split('T')[1].substring(0, 5) : 'All Day';
                const catConfig = CATEGORIES.find((c) => c.id === e.calendarId);
                return (
                  <div
                    key={e.id}
                    className={cn(
                      'p-4 rounded-xl border flex flex-col gap-2 transition-all hover:shadow-md group relative',
                      e._isError ? 'bg-red-500/5 border-red-500/30' : 'bg-muted/30 border-muted',
                    )}
                  >
                    <div className="flex items-center justify-between min-h-7">
                      <div className="flex items-center gap-2 flex-1 mr-2 overflow-hidden">
                        <div
                          className={cn('h-2.5 w-2.5 rounded-full shrink-0', e._isError && 'bg-red-500 animate-pulse')}
                          style={!e._isError ? { backgroundColor: catConfig?.lightColors.main } : {}}
                        />
                        <span className={cn('text-sm font-bold leading-tight truncate', e._isError && 'text-red-600')}>
                          {e.title}
                        </span>
                      </div>

                      {/* Edit and delete buttons */}
                      {!e._isSystem && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all mr-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:bg-background shadow-sm border border-transparent hover:border-border"
                            onClick={() => onEdit(e)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              if (confirm('Do you delete the user event?')) onDelete(e.event_id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}

                      <Badge variant="secondary" className="text-[9px] uppercase font-black tabular-nums shrink-0">
                        {displayTime}
                      </Badge>
                    </div>

                    {e.description && (
                      <p className="text-xs text-muted-foreground pl-4.5 border-l-2 ml-1 leading-relaxed">
                        {e.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1 pl-1">
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                        <User className="h-3 w-3" /> {e._isSystem ? 'Market System' : e.user}
                      </div>
                      {e._isError && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 flex flex-col items-center gap-2 opacity-20 text-muted-foreground">
                <Info className="h-10 w-10" />
                <p className="text-sm italic font-medium">No events for this date.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/20 flex justify-end">
          <Button size="sm" className="gap-2 rounded-full px-6 shadow-lg shadow-blue-500/20" onClick={onAdd}>
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
