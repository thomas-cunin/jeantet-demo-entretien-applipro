import { getTemplates } from "@/lib/data";
import { TemplatesList } from "@/components/templates/TemplatesList";

export default function TemplatesPage() {
  const seedTemplates = getTemplates();
  return <TemplatesList seedTemplates={seedTemplates} />;
}
