export { GlobalSearch } from './components/GlobalSearch';
export { SearchModal } from './components/SearchModal';
export { SearchResultCard } from './components/SearchResultCard';
export { buildSearchResultHref, getSearchEntityLabel } from './build-search-href';
export { detectSearchIntent, getSearchIntentHint } from './detect-search-intent';
export { useGlobalSearch } from './hooks/use-global-search';
export { searchAdminEntities, SearchService } from './search-service';
export type {
  AdminSearchEntityType,
  AdminSearchGroup,
  AdminSearchIntent,
  AdminSearchQuery,
  AdminSearchResponse,
  AdminSearchResultItem,
} from './types';
