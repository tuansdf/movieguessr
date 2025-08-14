import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _var, _ctx, mutation) => {
      if (mutation.options.mutationKey) {
        queryClient.invalidateQueries({
          queryKey: mutation.options.mutationKey,
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      staleTime: 1000 * 60 * 60,
      retry: false,
    },
  },
});

export const QueryProvider = (props: PropsWithChildren) => {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};
