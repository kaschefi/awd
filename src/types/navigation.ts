export type ViewKey = 'dashboard' | 'evidence' | 'people' | 'timeline' | 'workspace';

export interface NavItem {
  id: ViewKey;
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'evidence', label: 'Evidence', path: '/evidence' },
  { id: 'people', label: 'People & Locations', path: '/team/people' },
  { id: 'timeline', label: 'Timeline', path: '/timeline' },
  { id: 'workspace', label: 'Workspace', path: '/workspace' },
];
