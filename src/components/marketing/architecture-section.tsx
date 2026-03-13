import { Card } from "@/components/ui/card";

const architectureLayers = [
  {
    title: "Upload your resume",
    items: [
      "Add a PDF or DOCX resume from your device",
      "Optionally paste the job description you want to target",
      "Start a new analysis in one step"
    ]
  },
  {
    title: "We compare it to the role",
    items: [
      "Extract the text from your resume",
      "Check the job description for important skills and keywords",
      "Measure how closely your resume matches the role requirements"
    ]
  },
  {
    title: "You get clear feedback",
    items: [
      "A score breakdown across key resume factors",
      "Matched and missing keywords in one view",
      "Suggestions you can apply before sending your application"
    ]
  }
];

const requestFlow = [
  "Upload your resume and add the job description you want to target.",
  "The app extracts text, checks important role keywords, and reviews resume sections.",
  "Your dashboard highlights what matches well and what is still missing.",
  "Suggestions point you toward the most useful edits before you apply.",
  "Each analysis is saved so you can revisit it later or compare a newer resume version."
];

export function ArchitectureSection() {
  return (
    <section id="how-it-works" className="px-6 py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            How it works
          </p>
          <h2 className="mt-4 font-heading text-4xl text-white">A simple workflow from upload to improvement plan.</h2>
          <p className="mt-5 text-base leading-8 text-[var(--muted-foreground)]">
            The experience is designed to help you move quickly: upload your resume, review the match, and make the
            changes that matter most.
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
