import React from "react";
import { BrowserRouter } from "react-router-dom";
import AnimatedRoutes from "./Route/AnimatedRoutes";
import TabBar from "./pages/tabbar.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <TabBar />
    </BrowserRouter>
  );
}