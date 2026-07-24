import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
import { lohnsteuerAufmerksamkeiten } from "@/lib/knowledgeBaseAdditions/lohnsteuer-aufmerksamkeiten";

if (!KNOWLEDGE_BASE.some((entry) => entry.id === lohnsteuerAufmerksamkeiten.id)) {
  KNOWLEDGE_BASE.push(lohnsteuerAufmerksamkeiten);
}
