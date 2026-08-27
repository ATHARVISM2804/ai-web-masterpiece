import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import SmoothScroll from "./components/SmoothScroll";
import Index from "./pages/Index";
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
      <Route path="/" element={<Index />} />
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
