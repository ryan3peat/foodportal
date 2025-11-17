import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import SupplierDashboard from "@/pages/supplier-dashboard";
import UserManagement from "@/pages/user-management";
import Suppliers from "@/pages/suppliers";
import QuoteRequests from "@/pages/quote-requests";
import CreateQuoteRequest from "@/pages/create-quote-request";
import QuoteRequestDetail from "@/pages/quote-request-detail";
import QuoteDetail from "@/pages/quote-detail";
import QuoteSubmission from "@/pages/quote-submission";
import SupplierQuoteDetail from "@/pages/supplier-quote-detail";
import VerifyLogin from "@/pages/verify-login";
import SetPassword from "@/pages/set-password";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/quote-submission/:id" component={QuoteSubmission} />
      <Route path="/verify-login" component={VerifyLogin} />
      <Route path="/set-password" component={SetPassword} />
    </Switch>
  );
}

function SupplierQuoteRequestsGuard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Invalid Link",
      description: "The quote request link appears to be incomplete. Please check your email or access quotes from your dashboard.",
      variant: "destructive",
    });
    navigate('/supplier/dashboard');
  }, [navigate, toast]);

  return null;
}

function AuthenticatedRouter() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'procurement';
  const isSupplier = user?.role === 'supplier';

  return (
    <Switch>
      <Route path="/" component={isAdmin ? AdminDashboard : SupplierDashboard} />
      {isAdmin && <Route path="/suppliers" component={Suppliers} />}
      {isAdmin && <Route path="/quote-requests" component={QuoteRequests} />}
      {isAdmin && <Route path="/quote-requests/create" component={CreateQuoteRequest} />}
      {isAdmin && <Route path="/quote-requests/:requestId/quotes/:quoteId" component={QuoteDetail} />}
      {isAdmin && <Route path="/quote-requests/:id" component={QuoteRequestDetail} />}
      {isAdmin && <Route path="/users" component={UserManagement} />}
      {/* Supplier routes */}
      <Route path="/supplier/dashboard" component={SupplierDashboard} />
      <Route path="/supplier/quote-requests" component={SupplierQuoteRequestsGuard} />
      <Route path="/supplier/quote-requests/:requestId" component={SupplierQuoteDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes that don't require authentication
  if (location.startsWith('/quote-submission/') || location.startsWith('/verify-login') || location.startsWith('/set-password')) {
    return <PublicRouter />;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return <AuthenticatedRouter />;
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'procurement';

  if (!isLoading && isAuthenticated) {
    return (
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-4 border-b border-border">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                {isAdmin && <NotificationBell />}
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <Router />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
