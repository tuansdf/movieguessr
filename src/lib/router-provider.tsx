import IndexPage from "@/pages/index.page.js";
import { createBrowserRouter, RouterProvider as ARouterProvider } from "react-router";

const router = createBrowserRouter([{ index: true, Component: IndexPage }]);

export const RouterProvider = () => {
  return <ARouterProvider router={router} />;
};
