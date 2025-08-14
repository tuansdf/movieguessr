import { MantineProvider } from "@/lib/mantine-provider.js";
import { RouterProvider } from "@/lib/router-provider.js";

export default function App() {
  return (
    <MantineProvider>
      <RouterProvider />
    </MantineProvider>
  );
}
