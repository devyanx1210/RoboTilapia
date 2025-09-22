import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
// Pages
import HomePage from "./components/HomePage.jsx";
import DashBoard from "./components/Dashboard.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import WaterParameters from "./components/WaterParameters.jsx";
import FeedingManagement from "./components/FeedingManagement.jsx";
import SettingsPage from "./components/Settings.jsx";
// import SettingsPage from "./components/SettingsPage.jsx";
import Settings from "./components/Settings.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
    ],
  },
  {
    path: "/dashboard",
    element: <DashBoard />,
    children: [
      {
        index: true,
        element: <Navigate to="water-parameter-monitoring" replace />,
      },
      { path: "water-parameter-monitoring", element: <WaterParameters /> },
      { path: "feeding-management", element: <FeedingManagement /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
