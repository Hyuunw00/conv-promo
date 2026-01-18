import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes";
import BottomNavigation from "@/components/layout/bottom-navigation";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-xl">
        <main className="pb-20">
          <AppRoutes />
        </main>
        <BottomNavigation />
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
}
