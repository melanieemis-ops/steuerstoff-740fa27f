// Öffentliche Wissensdatenbank — wird in der Wissensdatenbank-UI angezeigt.
// Re-Export der bestehenden KNOWLEDGE_BASE, damit Chat und UI dieselbe
// Quelle nutzen und die Trennung public/internal klar sichtbar ist.

export { KNOWLEDGE_BASE as PUBLIC_KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
