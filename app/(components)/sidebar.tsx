"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  UserPlus,
  Dumbbell,
  TrendingUp,
  Settings,
  LogOut,
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NavItemsType = {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  color: string;
};

const Sidebar = () => {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const fetchMemberCount = async () => {
      try {
        const response = await fetch("/api/members/count");
        const data = await response.json();
        setCount(data.count);
      } catch (err) {
        console.error("Fetch count error:", err);
      }
    };
    fetchMemberCount();
  }, []);

  const mainNavItems: NavItemsType[] = [
    {
      href: "./frontdesk",
      label: "Front Desk",
      icon: LayoutDashboard,
      color: "text-orange-600",
    },
    {
      href: "./students",
      label: "Members",
      icon: Users,
      badge: count !== null ? count.toString() : "...",
      color: "text-blue-600",
    },
    {
      href: "./attendance",
      label: "Attendance",
      icon: ClipboardCheck,
      color: "text-green-600",
    },
    {
      href: "./newStudents",
      label: "Registration",
      icon: UserPlus,
      color: "text-purple-600",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    sessionStorage.removeItem("adminToken");
    router.push("/");
    router.refresh();
  };

  const secondaryNavItems: NavItemsType[] = [
    {
      href: "./analytics",
      label: "Analytics",
      icon: TrendingUp,
      color: "text-cyan-600",
    },
    {
      href: "./expenses",
      label: "Expenses",
      icon: Wallet,
      color: "text-emerald-600",
    },
    {
      href: "./settings",
      label: "Settings",
      icon: Settings,
      color: "text-gray-600",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white text-slate-900 transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[72px]" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex h-20 items-center border-b border-slate-200 px-3 justify-between">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "space-x-3")}>
          <img src="/logo.png" alt="Logo" className="h-10 w-10 flex-shrink-0 rounded-lg object-contain" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-bold tracking-tight whitespace-nowrap">Gym Admin Pro</h1>
              <p className="text-xs text-slate-500 whitespace-nowrap">Operations Dashboard</p>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-6">
          <div className="space-y-1">
            {!collapsed && (
              <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Management
              </h2>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/home/${item.href}`}
                    className="block"
                    title={collapsed ? item.label : undefined}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full hover:cursor-pointer h-11 font-medium transition-all hover:bg-slate-100",
                        "group relative overflow-hidden",
                        collapsed ? "justify-center px-0" : "justify-start px-3"
                      )}
                    >
                      <div className={cn("flex items-center relative z-10", collapsed ? "justify-center" : "space-x-3 w-full")}>
                        <IconComponent
                          className={cn(
                            "h-4 w-4 flex-shrink-0 transition-colors",
                            item.color
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant={
                                  item.badge === "Live" ? "default" : "secondary"
                                }
                                className={cn(
                                  "h-5 px-1.5 text-xs font-medium",
                                  item.badge === "Live" &&
                                    "bg-green-100 text-green-800 animate-pulse"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator className="mx-1 bg-slate-200" />

          <div className="space-y-1">
            {!collapsed && (
              <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                More
              </h2>
            )}
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/home/${item.href}`}
                    className="block"
                    title={collapsed ? item.label : undefined}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full hover:cursor-pointer h-10 font-medium hover:bg-slate-100 transition-all group",
                        collapsed ? "justify-center px-0" : "justify-start px-3"
                      )}
                    >
                      <div className={cn("flex items-center", collapsed ? "justify-center" : "space-x-3 w-full")}>
                        <IconComponent className={cn("h-4 w-4 flex-shrink-0", item.color)} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                            {item?.badge && (
                              <Badge
                                variant="destructive"
                                className="h-4 w-4 p-0 flex items-center justify-center text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-200 p-2 space-y-1">
        <Button
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full h-10 font-medium hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-700",
            collapsed ? "justify-center px-0" : "justify-start px-3"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 flex-shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="whitespace-nowrap">Collapse</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full h-10 font-medium hover:bg-red-50 hover:text-red-700 transition-all",
            collapsed ? "justify-center px-0" : "justify-start px-3"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3 whitespace-nowrap">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
