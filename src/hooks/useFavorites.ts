import { useState, useEffect, useCallback } from "react";

export interface Favorite {
  id: string;
  title: string;
  category: string;
  source: string;
  description?: string;
  savedAt: number;
}

const STORAGE_KEY = "steuerstoff_favorites_v1";

function loadFavorites(): Favorite[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Favorite[]) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // silently fail
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(() => loadFavorites());

  const addFavorite = useCallback(
    (favorite: Favorite) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === favorite.id);
        if (exists) return prev;

        const updated = [{ ...favorite, savedAt: Date.now() }, ...prev];
        saveFavorites(updated);
        return updated;
      });
    },
    []
  );

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback(
    (favorite: Favorite) => {
      const isFav = favorites.some((f) => f.id === favorite.id);
      if (isFav) {
        removeFavorite(favorite.id);
      } else {
        addFavorite(favorite);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
