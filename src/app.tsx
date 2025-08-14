import { MantineProvider } from "@/lib/mantine-provider.js";
import { QueryProvider } from "@/lib/query-provider.js";
import { RouterProvider } from "@/lib/router-provider.js";

export default function App() {
  return (
    <MantineProvider>
      <QueryProvider>
        <RouterProvider />
      </QueryProvider>
    </MantineProvider>
  );
}
