import { Star } from "lucide-react";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  label?: string;
}

export function FavoriteButton({ isFavorite, onClick, label }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"
      }
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-accent"
      title={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
    >
      <Star
        className={[
          "h-5 w-5 transition-colors",
          isFavorite
            ? "fill-amber-400 stroke-amber-500 text-amber-500"
            : "stroke-muted-foreground text-transparent",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </button>
  );
}
