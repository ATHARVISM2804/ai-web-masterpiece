import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import SmoothScroll from "./components/SmoothScroll";
import Index from "./pages/Index";
import Life from "./pages/Life";
import AtharvOS from "./os/AtharvOS";
import NotFound from "./pages/NotFound";

/**
 * Everything inside the router. Split out so the prerender step can wrap it in
 * a StaticRouter while the browser wraps it in a BrowserRouter.
 */
export const AppShell = () => (
  <>
    <Toaster />
    <SmoothScroll />
    <Routes>
      <Route path="/" element={<Life />} />
      <Route path="/classic" element={<Index />} />
      <Route path="/os" element={<div style={{ position: "fixed", inset: 0 }}><AtharvOS /></div>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
