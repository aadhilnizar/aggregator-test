import { Outlet } from "react-router-dom";
import Sidebar from "./Layouts/Sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function App() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />

        <SidebarInset className="min-w-0">
          <div className="border-b p-4">
            <SidebarTrigger />
          </div>

          <div className="w-full p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default App;
