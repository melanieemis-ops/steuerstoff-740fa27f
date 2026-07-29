import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
import { lohnsteuerArbeitnehmersparzulage } from "@/lib/knowledgeBaseAdditions/lohnsteuer-arbeitnehmersparzulage";

if (!KNOWLEDGE_BASE.some((entry) => entry.id === lohnsteuerArbeitnehmersparzulage.id)) {
  KNOWLEDGE_BASE.push(lohnsteuerArbeitnehmersparzulage);
}
