import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-xl">
          <main className="pb-20">
            <AppRoutes />
          </main>
          <BottomNavigation />
          <Toaster position="top-center" />
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
