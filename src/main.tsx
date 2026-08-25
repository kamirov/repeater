import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import RepeaterApp from "@/App";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RepeaterApp />
  </StrictMode>,
);
