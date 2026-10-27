/**
 * Reducer for managing the Evidence Catalogue filter, search, and sort state domain.
 * Consolidates 7+ interrelated controls into a single state machine with discrete actions.
 */

export type EvidenceSortOrder = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';

export interface EvidenceFilterState {
  searchTerm: string;
  filterType: string;
  filterPerson: string;
  filterLocation: string;
  filterStatus: string;
  filterRelevance: string;
  sortValue: EvidenceSortOrder;
}

export const initialFilterState: EvidenceFilterState = {
  searchTerm: '',
  filterType: '',
  filterPerson: '',
  filterLocation: '',
  filterStatus: '',
  filterRelevance: '',
  sortValue: 'date-desc',
};

export type EvidenceFilterAction =
  | { type: 'SET_SEARCH'; payload: string }
  | {
      type: 'SET_FILTER';
      payload: {
        filterKey: 'filterType' | 'filterPerson' | 'filterLocation' | 'filterStatus' | 'filterRelevance';
        value: string;
      };
    }
  | { type: 'SET_SORT'; payload: EvidenceSortOrder }
  | { type: 'CLEAR_FILTERS' };

export function evidenceFilterReducer(
  state: EvidenceFilterState,
  action: EvidenceFilterAction
): EvidenceFilterState {
  switch (action.type) {
    case 'SET_SEARCH':
      return {
        ...state,
        searchTerm: action.payload,
      };

    case 'SET_FILTER':
      return {
        ...state,
        [action.payload.filterKey]: action.payload.value,
      };

    case 'SET_SORT':
      return {
        ...state,
        sortValue: action.payload,
      };

    case 'CLEAR_FILTERS':
      // Reset all 7 related fields back to canonical defaults in a single atomic tick
      return {
        ...initialFilterState,
      };

    default:
      return state;
  }
}
