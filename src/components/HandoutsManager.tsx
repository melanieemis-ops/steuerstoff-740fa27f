import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, FolderOpen, Save } from "lucide-react";
import {
  HANDOUT_CATEGORIES,
  type Handout,
  type HandoutCategory,
  deleteHandout,
  listHandouts,
  upsertHandout,
} from "@/lib/knowledgeTopics";

const EMPTY: Omit<Handout, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  category: "DATEV",
  short: "",
  body: "",
  tags: [],
  source: "",
};

export function HandoutsManager() {
  const [items, setItems] = useState<Handout[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Handout | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);

  const refresh = () => setItems(listHandouts());

  useEffect(() => {
    refresh();
    const fn = () => refresh();
    window.addEventListener("steuerstoff:handouts", fn);
    return () => window.removeEventListener("steuerstoff:handouts", fn);
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const startEdit = (h: Handout) => {
    setEditing(h);
    setForm({
      title: h.title,
      category: h.category,
      short: h.short,
      body: h.body,
      tags: h.tags,
      source: h.source,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.title.trim()) return;
    upsertHandout({ ...form, id: editing?.id });
    setOpen(false);
  };

  const remove = (id: string) => {
    if (!confirm("Handout wirklich löschen?")) return;
    deleteHandout(id);
  };

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Wissen verwalten</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Eigene Handouts, Notizen und Kanzlei-Standards lokal hinterlegen.
          </p>
        </div>
        <Button size="sm" onClick={startNew} className="h-9">
          <Plus className="mr-1 h-4 w-4" />
          Neues Handout
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-background p-4 text-xs text-muted-foreground">
          Noch keine eigenen Handouts hinterlegt. Lege über „Neues Handout“ den ersten Eintrag an.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {items.map((h) => (
            <li
              key={h.id}
              className="flex flex-col rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{h.title}</p>
                <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {h.category}
                </span>
              </div>
              {h.short && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{h.short}</p>
              )}
              {h.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {h.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => startEdit(h)}>
                  <Pencil className="mr-1 h-3 w-3" />
                  Bearbeiten
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  onClick={() => remove(h.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Löschen
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
          data-no-swipe="true"
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  {editing ? "Handout bearbeiten" : "Neues Handout"}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Schließen"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid max-h-[70vh] gap-3 overflow-auto p-4">
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">Titel</span>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="z. B. OPOS-Prüfung — Kanzleistandard"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">Kategorie</span>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as HandoutCategory })
                  }
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground"
                >
                  {HANDOUT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">Kurzbeschreibung</span>
                <Input
                  value={form.short}
                  onChange={(e) => setForm({ ...form, short: e.target.value })}
                  placeholder="Kurzer Teaser für die Übersicht"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">Inhalt / Notiztext</span>
                <Textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={6}
                  placeholder="Volltext, Anweisungen, Prüfschritte …"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">
                  Tags (komma-getrennt)
                </span>
                <Input
                  value={form.tags.join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tags: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="z. B. NPO, Sphäre, Mittelverwendung"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">Quelle / Dokumentname</span>
                <Input
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="z. B. Internes PDF, Schulungsunterlage"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border p-3">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={save} disabled={!form.title.trim()}>
                <Save className="mr-1 h-3.5 w-3.5" />
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
