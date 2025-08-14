import { createTheme, MantineProvider as AMantineProvider } from "@mantine/core";
import type { PropsWithChildren } from "react";

const theme = createTheme({});

export const MantineProvider = (props: PropsWithChildren) => {
  return <AMantineProvider theme={theme}>{props.children}</AMantineProvider>;
};
