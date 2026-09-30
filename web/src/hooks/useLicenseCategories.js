import { useState, useEffect } from 'react';
import { fetchCategoryBySpdx } from '../data/licenses';

// Module-level cache so we only fetch once per session
let _cache = null;
let _promise = null;

function fetchCategories() {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  _promise = fetchCategoryBySpdx()
    .then(map => {
      _cache = map;
      return _cache;
    })
    .catch(() => {
      // Leave the cache empty so a later mount can retry
      _promise = null;
      return null;
    });

  return _promise;
}

/**
 * Hook that returns the ScanCode LicenseDB categories, keyed by SPDX id.
 * { categoryBySpdx, loading } — categoryBySpdx is null while loading or when
 * ScanCode is unreachable.
 */
export function useLicenseCategories() {
  const [categoryBySpdx, setCategoryBySpdx] = useState(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetchCategories().then(map => {
      setCategoryBySpdx(map);
      setLoading(false);
    });
  }, []);

  return { categoryBySpdx, loading };
}
