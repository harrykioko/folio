
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderKanban, 
  Database, 
  CheckSquare, 
  BarChart3, 
  Bot, 
  Settings,
} from 'lucide-react';
import { NavItem } from '@/types/navigation';

export const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { name: 'Workspace', path: '/workspace', icon: FolderKanban },
  { name: 'Assets', path: '/assets', icon: Database },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Foley', path: '/assistant', icon: Bot },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const commandDestinations = [
  ...navItems,
  { name: 'New Task', path: '/tasks/new', icon: CheckSquare },
  { name: 'New Document', path: '/workspace/new', icon: FolderKanban },
  { name: 'User Profile', path: '/profile', icon: Settings },
];
