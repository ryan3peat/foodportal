import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-medium text-foreground">
            Essential Flavours
          </h1>
          <p className="text-xl text-muted-foreground">
            Supplier Portal - Module 1 Complete
          </p>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Database Schema & Foundation Setup</CardTitle>
            <CardDescription>
              The core infrastructure has been successfully initialized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-chart-1" />
                  Database Tables Created
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>✓ Users (with role-based access)</li>
                  <li>✓ Suppliers</li>
                  <li>✓ Raw Materials</li>
                  <li>✓ Quote Requests</li>
                  <li>✓ Request Suppliers (junction)</li>
                  <li>✓ Supplier Quotes</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-chart-1" />
                  Core Features Configured
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>✓ Authentication System (Replit Auth)</li>
                  <li>✓ PostgreSQL Database</li>
                  <li>✓ Object Storage</li>
                  <li>✓ Session Management</li>
                  <li>✓ Role-based Access Control</li>
                  <li>✓ Storage Layer Interface</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium mb-3">Ready for Module 2</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The foundation is complete. Next module will implement the authentication UI, 
                user management, and role-based access for admins, suppliers, and procurement staff.
              </p>
              <Button asChild data-testid="button-login">
                <a href="/api/login">
                  Test Authentication System
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Module 1 of 9 - Essential Flavours Supplier Portal
          </p>
        </div>
      </div>
    </div>
  );
}
