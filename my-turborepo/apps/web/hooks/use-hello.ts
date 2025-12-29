import { useQuery } from '@tanstack/react-query';

export function useHello() {
  return useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/hello');
      if (!res.ok) throw new Error('Network error');
      return res.json() as Promise<{ message: string }>;
    },
  });
}
