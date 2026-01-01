'use client';

import { useQuery } from '@tanstack/react-query';

const API_BASE = 'http://localhost:8000';

export function useSnapshot(targetId: string, dataType: string, version: string = 'latest') {
  // Get content of snapshot
  const { data: result, isLoading: isDataLoading } = useQuery({
    queryKey: ['snapshot', targetId, dataType, 'content', version],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/data/${targetId}/${dataType}/content?version=${version}`);
      if (!res.ok) throw new Error('Data fetch failed');
      const json = await res.json();
      return json.data;
    },
    enabled: !!targetId && !!dataType,
  });

  // Get list of available snapshots
  const { data: snapshots = [] } = useQuery<string[]>({
    queryKey: ['snapshot', targetId, dataType, 'list'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/data/${targetId}/${dataType}/snapshots`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.snapshots;
    },
    enabled: !!targetId && !!dataType,
  });

  return { result, snapshots, isDataLoading };
}
