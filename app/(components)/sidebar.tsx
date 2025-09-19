import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ClipboardCheck,
  UserPlus,
  Dumbbell,
  Calendar,
  TrendingUp,
  Settings,
  Bell
} from 'lucide-react';

const Sidebar = () => {
  const mainNavItems = [
    {
      href: './students',
      label: 'Members',
      icon: Users,
      badge: '247',
      color: 'text-blue-600'
    },
    {
      href: './attendance',
      label: 'Attendance',
      icon: ClipboardCheck,
      color: 'text-green-600'
    },
    {
      href: './newStudents',
      label: 'Registration',
      icon: UserPlus,
      badge: '12',
      color: 'text-purple-600'
    }
  ];

  const secondaryNavItems = [
    {
      href: './analytics',
      label: 'Analytics',
      icon: TrendingUp,
      color: 'text-cyan-600'
    },
    {
      href: './settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="flex h-full w-72 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight">
              Gym admin
            </h1>
            <p className="text-xs text-muted-foreground">
              Gym Management
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Management
            </h2>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.href} href={`/home/${item.href}`} className="block">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full hover:cursor-pointer justify-start h-11 px-3 font-medium transition-all hover:bg-accent/50",
                        "group relative overflow-hidden"
                      )}
                    >
                      <div className="flex items-center space-x-3 relative z-10 w-full">
                        <IconComponent className={cn("h-4 w-4 transition-colors", item.color)} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant={item.badge === 'Live' ? 'default' : 'secondary'}
                            className={cn(
                              "h-5 px-1.5 text-xs font-medium",
                              item.badge === 'Live' && "bg-green-100 text-green-800 animate-pulse"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator className="mx-3" />

          <div className="space-y-1">
            <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              More
            </h2>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.href} href={`/${item.href}`} className="block">
                    <Button
                      variant="ghost"
                      className="w-full hover:cursor-pointer justify-start h-10 px-3 font-medium hover:bg-accent/50 transition-all group"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <IconComponent className={cn("h-4 w-4", item.color)} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center text-xs">
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