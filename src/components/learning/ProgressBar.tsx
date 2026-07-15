import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({
  current,
  total,
}: ProgressBarProps) {

  const percent =
    total === 0
      ? 0
      : (current / total) * 100;

  return (
    <div className="w-full space-y-3">

      <div className="flex items-center justify-between">

        <span className="text-sm font-medium text-muted-foreground">
          Frage {current} von {total}
        </span>

        <span className="text-sm font-semibold text-foreground">
          {Math.round(percent)} %
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted">

        <motion.div
          className="h-full rounded-full bg-foreground"
          animate={{
            width: `${percent}%`,
          }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
        />

      </div>

    </div>
  );
}