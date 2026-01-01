'use client';

import { useState } from 'react';
import { useSnapshot } from '@/hooks/use-snapshot';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { SUPPORTED_DATA_TYPES, DataType } from '@/lib/widget-registry';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, Check, ChevronRight, History } from 'lucide-react';
import { formatSnapshotTimestamp, isSnapshotToday, cn } from '@/lib/utils';

export function SnapshotSelector() {
  const { targetId, versions, setVersion } = useDashboardParams();
  const [activeDataId, setActiveDataId] = useState<DataType>(SUPPORTED_DATA_TYPES[0].id);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="font-bold text-xs uppercase tracking-tight">Snapshots</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="center" className="w-125 p-0 shadow-2xl border-muted-foreground/20 overflow-hidden">
        <div className="flex h-100">
          {/* --- Left sidebar to select data type --- */}
          <div className="w-45 bg-muted/30 border-r flex flex-col">
            <div className="p-3">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Data Source</h4>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {SUPPORTED_DATA_TYPES.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeDataId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveDataId(item.id)}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                        isActive
                          ? 'bg-background shadow-sm text-blue-600 ring-1 ring-border'
                          : 'text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-blue-500' : 'text-muted-foreground')} />
                        {item.label}
                      </div>
                      {isActive && <ChevronRight className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* --- Right: snapshots --- */}
          <div className="flex-1 flex flex-col bg-background">
            <div className="p-3 border-b bg-muted/10 flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Timeline</h4>
              <Badge variant="outline" className="text-[9px] font-mono">
                {activeDataId}
              </Badge>
            </div>

            <SnapshotList
              targetId={targetId}
              dataType={activeDataId}
              currentVersion={versions[activeDataId as keyof typeof versions]}
              onSelect={(v) => setVersion(activeDataId, v)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Snapshot list
 */
function SnapshotList({
  targetId,
  dataType,
  currentVersion,
  onSelect,
}: {
  targetId: string;
  dataType: string;
  currentVersion: string;
  onSelect: (v: string) => void;
}) {
  const { snapshots, isDataLoading } = useSnapshot(targetId, dataType, 'latest');
  const latestFile = snapshots?.[0];
  const isLatestToday = isSnapshotToday(latestFile);
  const latestFileTimestamp = formatSnapshotTimestamp(latestFile) || 'No data';

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-2 space-y-1">
        {/* Latest Option */}
        <button
          onClick={() => onSelect('latest')}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left',
            currentVersion === 'latest'
              ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/20'
              : 'border-transparent hover:bg-muted',
          )}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Latest</span>
              {isLatestToday ? (
                <Badge className="h-4 px-1.5 text-[8px] bg-emerald-500 hover:bg-emerald-500 border-none">RECENT</Badge>
              ) : (
                <Badge className="h-4 px-1.5 text-[8px] bg-amber-500 hover:bg-amber-500 text-black border-none animate-pulse">
                  STALE
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {latestFileTimestamp}
            </span>
          </div>
          {currentVersion === 'latest' && <Check className="h-4 w-4 text-blue-500 stroke-3" />}
        </button>

        <div className="py-2 px-3">
          <Separator />
        </div>

        {/* History Items - exclude latest */}
        {isDataLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Scanning timeline...</div>
        ) : snapshots.length > 1 ? (
          snapshots.slice(1).map((v) => (
            <button
              key={v}
              onClick={() => onSelect(v)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left group',
                currentVersion === v
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/20'
                  : 'border-transparent hover:bg-muted',
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-mono font-bold tracking-tight text-foreground">
                  {formatSnapshotTimestamp(v)}
                </span>
                <span className="text-[9px] text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {v}
                </span>
              </div>
              {currentVersion === v && <Check className="h-4 w-4 text-blue-500" />}
            </button>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">No snapshot history</div>
        )}
      </div>
    </ScrollArea>
  );
}
