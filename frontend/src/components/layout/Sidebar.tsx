import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Phone, 
  Users, 
  BarChart3, 
  Settings, 
  MessageSquare,
  FileText,
  Headphones,
  HelpCircle
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: 'Campaigns',
      href: '/campaigns',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'Leads',
      href: '/leads',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Calls',
      href: '/calls',
      icon: <Phone className="h-5 w-5" />
    },
    {
      title: 'Voice Demo',
      href: '/voice-demo',
      icon: <Headphones className="h-5 w-5" />
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: 'Conversations',
      href: '/conversations',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: 'Help',
      href: '/help',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  return (
    <div className="h-screen w-64 border-r bg-background flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">AI Caller</h2>
        <p className="text-sm text-muted-foreground">Cold Calling Agent</p>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 rounded-md bg-muted px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <span className="text-sm font-medium">AI</span>
          </div>
          <div>
            <p className="text-sm font-medium">AI Cold Caller</p>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
