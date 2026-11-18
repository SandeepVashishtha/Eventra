"use client";

import DynamicFormValidator from "@/components/ui/DynamicFormValidator";

export default function HackathonRegisterPage() {
  function handleSuccess(sanitizedData) {
    // Forward to real registration endpoint
    console.log("[Eventra] Registration payload:", sanitizedData);
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans">

      {/* Page header — matches existing Eventra editorial style */}
      <section className="border-b border-neutral-200/80 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
              <span>Hackathons · Registration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950 leading-tight">
              Register for a Hackathon
            </h1>
            <p className="text-base text-neutral-500 leading-relaxed">
              Fill in your team details below. All fields are reviewed before your registration is confirmed.
            </p>
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 items-start">

            {/* Left: form */}
            <div className="lg:col-span-2">
              <DynamicFormValidator
                title="Team Registration"
                description="Complete all required fields to secure your spot. You can register as a solo participant or as a team of up to 4."
                onSuccess={handleSuccess}
              />
            </div>

            {/* Right: sidebar info — matches existing Eventra card style */}
            <div className="space-y-6">

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
                <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide font-mono">
                  Registration Info
                </h2>
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0"></span>
                    Teams of 1–4 members are accepted.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0"></span>
                    GitHub handle must contain only letters, numbers, and hyphens.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0"></span>
                    Choose a track that best matches your project idea.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0"></span>
                    You will receive a confirmation email within 24 hours.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-3">
                <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide font-mono">
                  Tracks Available
                </h2>
                <ul className="space-y-2 text-sm text-neutral-600">
                  {[
                    ["AI / ML", "Machine learning, LLMs, generative AI"],
                    ["Web3 / Blockchain", "DeFi, NFTs, smart contracts"],
                    ["Open Innovation", "Any problem you choose to solve"],
                    ["Social Impact", "Education, health, sustainability"],
                  ].map(([track, desc]) => (
                    <li key={track} className="flex flex-col gap-0.5">
                      <span className="font-medium text-neutral-800">{track}</span>
                      <span className="text-xs text-neutral-400">{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
