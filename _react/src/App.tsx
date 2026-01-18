import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { routes } from "./routes";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrowserRouter>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
