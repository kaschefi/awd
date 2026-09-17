/**
 * Domain data models for Project ReMotion Investigation Portal
 */

export interface CaseData {
  caseId: string;
  title: string;
  subtitle: string;
  status: string;
  opened: string;
  summary: string;
  location: string;
  leadInvestigator: string;
  notes: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  speciality: string;
  responsibilities: string[];
  statement: string;
  background: string;
  avatar: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  contains: string[];
}

export type TimelineCertainty = 'confirmed' | 'contradictory' | 'reported';

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: string;
  certainty: TimelineCertainty;
  personIds: string[];
  locationIds: string[];
  evidenceIds: string[];
}

export type EvidenceStatus = 'unreviewed' | 'reviewed' | 'flagged';
export type EvidenceRelevance = 'unknown' | 'relevant' | 'irrelevant';

export interface Evidence {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  summary: string;
  content: string;
  /**
   * Note on domain data inconsistency:
   * In raw evidence.json, personIds sometimes contains entity IDs (e.g. 'patch-vector')
   * and sometimes full display names (e.g. 'Nova Byte' in E04).
   * Typed as string[] to accommodate both identifiers during lookups.
   */
  personIds: string[];
  locationIds: string[];
  tags: string[];
  status: EvidenceStatus;
  relevance: EvidenceRelevance;
}

export interface HypothesisDraft {
  suspect: string;
  nature: 'accidental' | 'deliberate' | 'unclear' | '';
  evidenceIds: string[];
  confidence: number;
  explanation: string;
  alternative: string;
}

export interface AppState {
  caseData: Partial<CaseData>;
  allEvidence: Evidence[];
  filteredEvidence: Evidence[];
  allPeople: Person[];
  allLocations: Location[];
  allTimeline: TimelineEvent[];
  bookmarks: string[];
  notes: Record<string, string>;
  activeFilters: {
    type: string;
    person: string;
    location: string;
    status: string;
    relevance: string;
    search: string;
  };
  currentSort: string;
  timelineSortOrder: 'asc' | 'desc';
  timelineFilters: {
    person: string;
    location: string;
    type: string;
  };
  currentPeopleTab: 'people' | 'locations';
  loadingStepsRemaining: number;
  evidenceViewLoading: boolean;
  currentPage: string;
}
