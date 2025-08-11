import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <header className="h-14 flex items-center border-b bg-card">
        <div className="container flex items-center gap-3">
          <SidebarTrigger className="mr-2" />
          <div className="font-semibold">Deriv Pay Portal</div>
          <div className="ml-auto text-sm text-muted-foreground truncate max-w-[50%]">
            {user?.email}
          </div>
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
