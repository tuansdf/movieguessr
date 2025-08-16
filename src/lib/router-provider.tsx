import IndexPage from "@/pages/index.page.js";
import { createBrowserRouter, Navigate, RouterProvider as ARouterProvider } from "react-router";

const router = createBrowserRouter([
  { index: true, Component: IndexPage },
  { path: "*", element: <Navigate to="/" /> },
]);

export const RouterProvider = () => {
  return <ARouterProvider router={router} />;
};
