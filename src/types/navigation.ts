export type ViewKey = 'dashboard' | 'evidence' | 'people' | 'timeline' | 'workspace';

export interface NavItem {
  id: ViewKey;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'people', label: 'People & Locations' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'workspace', label: 'Workspace' },
];
