import { useState, useEffect, useMemo } from 'react';

const INDICATORS_API = 'https://everse.software/indicators/api/indicators.json';

// Module-level cache so we only fetch once per session
let _cache = null;
let _promise = null;

function fetchIndicators() {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  _promise = fetch(INDICATORS_API)
    .then(res => res.json())
    .then(data => {
      _cache = data.indicators ?? [];
      return _cache;
    })
    .catch(() => {
      _cache = [];
      return _cache;
    });

  return _promise;
}

/**
 * Hook that returns all indicators from the EVERSE API.
 * { indicators, loading }
 */
export function useIndicators() {
  const [indicators, setIndicators] = useState(_cache ?? []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetchIndicators().then(data => {
      setIndicators(data);
      setLoading(false);
    });
  }, []);

  return { indicators, loading };
}

/**
 * Given a raw value from the tool JSON-LD (single object, array, or undefined)
 * and the full indicators list, returns resolved indicator objects.
 *
 * Each resolved indicator has:
 *   { id, name, abbreviation, description, url }
 */
export function resolveIndicators(refs, allIndicators) {
  if (!refs) return [];
  const arr = Array.isArray(refs) ? refs : [refs];

  return arr.map(ref => {
    const id = typeof ref === 'string' ? ref : ref?.['@id'] ?? '';
    const found = allIndicators.find(ind => ind['@id'] === id);

    if (found) {
      return {
        id: found['@id'],
        name: found.name,
        abbreviation: found.abbreviation,
        description: found.description,
        url: found['@id'],
      };
    }

    // Graceful fallback: humanise the URL slug e.g. "https://w3id.org/everse/i/indicators/dependency_management" -> "ependency_management"
    const slug = id.split('/').pop() ?? id;
    const name = slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { id, name, abbreviation: slug, description: undefined, url: id };
  });
}

function slugToLabel(uri) {
  const tail = uri.split('/').filter(Boolean).pop() || uri;
  return tail.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Returns sorted indicator options ready for dropdowns and filters.
 * { options: Array<{ id: string, label: string }>, loading: boolean }
 */
export function useIndicatorOptions() {
  const { indicators, loading } = useIndicators();
  const options = useMemo(
    () =>
      indicators
        .map(ind => {
          const id = ind?.identifier?.['@id'] ?? ind?.['@id'];
          if (!id) return null;
          return { id, label: ind.name || slugToLabel(id) };
        })
        .filter(Boolean)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [indicators]
  );
  return { options, loading };
}
