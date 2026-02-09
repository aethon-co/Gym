"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ClipboardCheck,
  UserPlus,
  Dumbbell,
  Calendar,
  TrendingUp,
  Settings,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";

type NavItemsType = {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  color: string;
};

const Sidebar = () => {
  const [count, setCount] = useState<number | null>(null);
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

  const secondaryNavItems: NavItemsType[] = [
    {
      href: "./analytics",
      label: "Analytics",
      icon: TrendingUp,
      color: "text-cyan-600",
    },
    {
      href: "./settings",
      label: "Settings",
      icon: Settings,
      color: "text-gray-600",
    },
  ];

  return (
    <div className="flex h-full w-72 flex-col border-r border-slate-200 bg-white text-slate-900">
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight">Gym Admin Pro</h1>
            <p className="text-xs text-slate-500">Operations Dashboard</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Management
            </h2>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/home/${item.href}`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full hover:cursor-pointer justify-start h-11 px-3 font-medium transition-all hover:bg-slate-100",
                        "group relative overflow-hidden"
                      )}
                    >
                      <div className="flex items-center space-x-3 relative z-10 w-full">
                        <IconComponent
                          className={cn(
                            "h-4 w-4 transition-colors",
                            item.color
                          )}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
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
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator className="mx-3 bg-slate-200" />

          <div className="space-y-1">
            <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              More
            </h2>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/home/${item.href}`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className="w-full hover:cursor-pointer justify-start h-10 px-3 font-medium hover:bg-slate-100 transition-all group"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <IconComponent className={cn("h-4 w-4", item.color)} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item?.badge && (
                          <Badge
                            variant="destructive"
                            className="h-4 w-4 p-0 flex items-center justify-center text-xs"
                          >
                            {item.badge}
                          </Badge>
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
    </div>
  );
};

export default Sidebar;
