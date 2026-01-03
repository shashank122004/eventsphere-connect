import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import HostEvent from "./pages/HostEvent";
import JoinEvent from "./pages/JoinEvent";
import ExploreEvents from "./pages/ExploreEvents";
import MyEvents from "./pages/MyEvents";
import Contacts from "./pages/Contacts";
import EventHistory from "./pages/EventHistory";
import EventDetails from "./pages/EventDetails";
import AttendingEvent from "./pages/AttendingEvent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/host" element={<HostEvent />} />
                <Route path="/dashboard/join" element={<JoinEvent />} />
                <Route path="/dashboard/explore" element={<ExploreEvents />} />
                <Route path="/dashboard/my-events" element={<MyEvents />} />
                <Route path="/dashboard/contacts" element={<Contacts />} />
                <Route path="/dashboard/history" element={<EventHistory />} />
                <Route path="/dashboard/event/:id" element={<EventDetails />} />
                <Route path="/dashboard/event/attending/:id" element={<AttendingEvent />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
