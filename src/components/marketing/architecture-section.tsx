import { Card } from "@/components/ui/card";

const architectureLayers = [
  {
    title: "Frontend responsibilities",
    items: [
      "Landing page, upload form, loading states, results dashboard, history view",
      "React Hook Form + Zod validation for job description and file input UX",
      "Charts, section cards, and analysis summaries built from API response models"
    ]
  },
  {
    title: "Backend responsibilities",
    items: [
      "Route handlers or server actions for uploads, parsing orchestration, and analysis persistence",
      "Deterministic scoring service separated from parsing and suggestion generation",
      "Prisma-based data access layer with strong validation and stable response contracts"
    ]
  },
  {
    title: "Analysis pipeline",
    items: [
      "Extract text from PDF and DOCX",
      "Normalize and tokenize resume and job description content",
      "Categorize keywords, compute weighted scores, and persist explainable result artifacts"
    ]
  }
];

const requestFlow = [
  "User uploads a resume and optionally pastes a job description.",
  "Server validates file type and size, stores metadata, and extracts plain text.",
  "JD processor derives keywords, skill phrases, and must-have indicators.",
  "Scoring engine compares normalized resume content against the processed JD.",
  "Suggestion engine converts missing signals into prioritized improvement actions.",
  "Results, score breakdown, and keyword artifacts are saved and shown in the dashboard."
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="px-6 py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            System design
          </p>
          <h2 className="mt-4 font-heading text-4xl text-white">Clear boundaries across every major layer.</h2>
          <p className="mt-5 text-base leading-8 text-[var(--muted-foreground)]">
            This architecture is designed so you can discuss tradeoffs confidently in interviews:
            deterministic scoring, explicit persistence, and UI components that stay free of business logic.
          </p>

          <div className="mt-8 space-y-4">
            {requestFlow.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-5">
          {architectureLayers.map((layer) => (
            <Card key={layer.title}>
              <h3 className="text-2xl font-semibold text-white">{layer.title}</h3>
              <div className="mt-5 space-y-3">
                {layer.items.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
