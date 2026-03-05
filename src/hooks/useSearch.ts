import { useState, useEffect } from 'react';
import { WeedTreatment, APVMAProduct } from '../types/chemical';
import { searchByWeed, searchByChemical, searchTreatments } from '../data/chemicals';
import { searchAPVMAProducts } from '../services/apvmaService';
import { saveAPVMAProducts } from '../services/savedChemicals';

interface SearchState {
  localResults: WeedTreatment[];
  apvmaResults: APVMAProduct[];
  apvmaLoading: boolean;
  apvmaError: string | null;
}

export function useSearch(query: string, mode: 'chemical' | 'weed'): SearchState {
  const [apvmaResults, setApvmaResults] = useState<APVMAProduct[]>([]);
  const [apvmaLoading, setApvmaLoading] = useState(false);
  const [apvmaError, setApvmaError] = useState<string | null>(null);
  // Track saves to trigger re-render of local results
  const [, setSaveCount] = useState(0);

  // Local search is synchronous — includes saved APVMA entries
  let localResults: WeedTreatment[];
  if (!query) {
    localResults = [];
  } else if (mode === 'weed') {
    localResults = searchByWeed(query);
  } else {
    localResults = searchByChemical(query);
    if (localResults.length === 0) {
      localResults = searchTreatments(query);
    }
  }

  // APVMA fallback: trigger when local results are sparse
  useEffect(() => {
    if (!query || query.length < 2) {
      setApvmaResults([]);
      setApvmaError(null);
      return;
    }

    // Only call APVMA if local results are few
    const localCount = mode === 'weed'
      ? searchByWeed(query).length
      : (searchByChemical(query).length || searchTreatments(query).length);

    if (localCount >= 3) {
      setApvmaResults([]);
      setApvmaError(null);
      return;
    }

    let cancelled = false;
    setApvmaLoading(true);
    setApvmaError(null);

    searchAPVMAProducts(query)
      .then((results) => {
        if (!cancelled) {
          setApvmaResults(results);
          setApvmaLoading(false);

          // Auto-save APVMA results to local database for next time
          if (results.length > 0) {
            saveAPVMAProducts(results);
            setSaveCount((c) => c + 1);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setApvmaError(err.message || 'Failed to query APVMA register');
          setApvmaLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [query, mode]);

  return { localResults, apvmaResults, apvmaLoading, apvmaError };
}
