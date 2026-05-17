import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  type KnowledgeTopic,
  type Handout,
  handoutsForCategory,
} from "@/lib/knowledgeTopics";

interface Props {
  topic: KnowledgeTopic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KnowledgeSheet({ topic, open, onOpenChange }: Props) {
  const [handouts, setHandouts] = useState<Handout[]>([]);

  useEffect(() => {
    if (!topic) return;
    const update = () => setHandouts(handoutsForCategory(topic.handoutCategory));
    update();
    window.addEventListener("steuerstoff:handouts", update);
    return () => window.removeEventListener("steuerstoff:handouts", update);
  }, [topic, open]);

  if (!topic) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        data-no-swipe="true"
        className="max-h-[88vh] focus:outline-none"
      >
        <DrawerHeader className="text-left pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DrawerTitle className="text-base font-semibold tracking-tight">
                {topic.title}
              </DrawerTitle>
              <DrawerDescription className="mt-0.5 text-xs">
                {topic.subtitle}
              </DrawerDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Schließen"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-6" style={{ overscrollBehavior: "contain" }}>
          <p className="text-sm text-foreground">{topic.summary}</p>

          {/* Prüfpunkte */}
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Prüfpunkte
            </p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {topic.checklist.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Schnellaktionen */}
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Schnellaktionen
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {topic.quickActions.map((qa) => (
                <Button
                  key={qa.label}
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  <Link to={qa.to}>
                    {qa.label}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Handouts */}
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Handouts & Kanzlei-Standards
            </p>
            <div className="mt-2 grid gap-2">
              {topic.builtInHandouts?.map((h) => (
                <div
                  key={h.title}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <p className="text-sm font-medium text-foreground">{h.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{h.desc}</p>
                  {h.tags && h.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {h.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {handouts.map((h) => (
                <div key={h.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{h.title}</p>
                    <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {h.category}
                    </span>
                  </div>
                  {h.short && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{h.short}</p>
                  )}
                  {h.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {h.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!topic.builtInHandouts?.length && handouts.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-background p-3 text-xs text-muted-foreground">
                  Noch keine eigenen Handouts hinterlegt. Lege über{" "}
                  <Link to="/wissensdatenbank" className="underline" onClick={() => onOpenChange(false)}>
                    Wissen verwalten
                  </Link>{" "}
                  ein neues Handout an.
                </p>
              )}
            </div>
          </div>

          {/* Module */}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {topic.module && (
              <Button asChild className="h-10 flex-1" onClick={() => onOpenChange(false)}>
                <Link to={topic.module.to}>
                  {topic.module.label}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="h-10 flex-1"
              onClick={() => onOpenChange(false)}
            >
              <Link to="/wissensdatenbank">
                <BookOpen className="mr-1.5 h-4 w-4" />
                In Wissensdatenbank öffnen
              </Link>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
