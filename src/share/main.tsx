import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/index.css";
import { ShareTool } from "./ShareTool";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ShareTool />
  </StrictMode>,
);
