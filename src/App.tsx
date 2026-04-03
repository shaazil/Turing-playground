import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
