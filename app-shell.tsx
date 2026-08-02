import { Link, useLocation } from 'wouter';
import { Home, BookOpen, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: '進度ダッシュボード', icon: Home },
    { href: '/units', label: '単元一覧', icon: BookOpen },
    { href: '/lessons', label: '授業一覧', icon: List },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex-shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground font-serif">
            国語授業進度
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Progress Tracker</p>
        </div>
        <nav className="p-4 space-y-1" data-testid="nav-main">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? location === '/'
                : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                data-testid={`nav-link-${item.href === '/' ? 'dashboard' : item.href.slice(1)}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
