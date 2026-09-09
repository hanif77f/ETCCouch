import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import ToolsGrid from "@/components/time-date-tools/ToolsGrid";
import { TOOLS } from "@/data/tools";
import { absoluteUrl } from "@/lib/site";

const title = "Free Online Tools";
const description =
  "Use free browser-based time and date tools from ETC Entertainment Couch, including an epoch and Unix timestamp converter. No download or sign-up required.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/free-online-tools" },
  openGraph: {
    type: "website",
    title,
    description,
    url: absoluteUrl("/free-online-tools"),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function FreeOnlineToolsPage() {
  return (
    <Section className="pt-12">
      <PageHeader
        title="Free online tools"
        subtitle="Handy browser-based time and date tools you can use instantly — no downloads, no sign-up."
        className="mb-10"
      />
      <ToolsGrid tools={TOOLS} />
    </Section>
  );
}
