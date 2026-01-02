export const CATEGORIES = [
  {
    id: 'earnings',
    label: 'Earnings',
    lightColors: { main: '#3b82f6', container: '#dbeafe', onContainer: '#1e40af' },
    darkColors: { main: '#60a5fa', container: '#1e3a8a', onContainer: '#dbeafe' },
  },
  {
    id: 'macro',
    label: 'Macro',
    lightColors: { main: '#f59e0b', container: '#fef3c7', onContainer: '#92400e' },
    darkColors: { main: '#fbbf24', container: '#78350f', onContainer: '#fef3c7' },
  },
  {
    id: 'meeting',
    label: 'Meeting',
    lightColors: { main: '#a855f7', container: '#f3e8ff', onContainer: '#6b21a8' },
    darkColors: { main: '#c084fc', container: '#4c1d95', onContainer: '#f3e8ff' },
  },
  {
    id: 'holiday',
    label: 'Holiday',
    lightColors: { main: '#10b981', container: '#dcfce7', onContainer: '#166534' },
    darkColors: { main: '#34d399', container: '#064e3b', onContainer: '#dcfce7' },
  },
  {
    id: 'error',
    label: 'Data Error',
    lightColors: { main: '#ef4444', container: '#fee2e2', onContainer: '#991b1b' },
    darkColors: { main: '#f87171', container: '#7f1d1d', onContainer: '#fee2e2' },
  },
  {
    id: 'other',
    label: 'Other',
    lightColors: { main: '#64748b', container: '#f1f5f9', onContainer: '#334155' },
    darkColors: { main: '#94a3b8', container: '#1e293b', onContainer: '#f1f5f9' },
  },
] as const;
