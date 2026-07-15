interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({
  current,
  total,
}: ProgressBarProps) {
  const percent =
    total === 0 ? 0 : (current / total) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Frage {current} von {total}
        </span>

        <span className="font-semibold">
          {Math.round(percent)} %
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}