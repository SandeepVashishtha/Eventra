"use client";

import DynamicFormValidator from "@/components/ui/DynamicFormValidator";

export default function FormValidationDemoPage() {
  function handleSuccess(sanitizedData) {
    console.log("[Eventra] Validated payload:", sanitizedData);
    // In a real flow: forward sanitizedData to the registration endpoint
    // e.g. await registerForHackathon({ ...sanitizedData });
  }

  return (
    <main className="min-h-screen bg-[#fafafa] py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Page heading */}
        <div className="text-center space-y-2">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Issue #18853
          </span>
          <h1 className="text-3xl font-bold text-neutral-900">
            Dynamic Form Field Template Validation
          </h1>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">
            Submissions are validated server-side via{" "}
            <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-indigo-700 text-xs">
              POST /api/forms/validate
            </code>
            . String inputs are sanitized to strip XSS payloads before
            validation runs.
          </p>
        </div>

        {/* Form */}
        <DynamicFormValidator
          title="Hackathon Registration"
          description="Register your team for the Eventra Hackathon. All fields are validated and sanitized."
          onSuccess={handleSuccess}
        />

        {/* How it works card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-neutral-800">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600">
            <li>
              The <strong>field template</strong> (array of descriptors) is
              converted to a JSON Schema on the client side.
            </li>
            <li>
              On submit,{" "}
              <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">
                POST /api/forms/validate
              </code>{" "}
              receives <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">{"{ schema, formData }"}</code>.
            </li>
            <li>
              The server <strong>sanitizes</strong> all string values (strips
              HTML / script tags, removes javascript: URIs).
            </li>
            <li>
              The schema validator checks <strong>type, required,
              minLength, maxLength, minimum, maximum, pattern,
              format, enum</strong>.
            </li>
            <li>
              Errors are returned as a field-keyed map (HTTP 422) or a success
              payload with <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">sanitizedData</code> (HTTP 200).
            </li>
          </ol>

          {/* Example curl snippet */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
              Test with curl
            </p>
            <pre className="text-xs bg-neutral-900 text-green-400 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
{`curl -X POST http://localhost:3000/api/forms/validate \\
  -H "Content-Type: application/json" \\
  -d '{
    "schema": {
      "type": "object",
      "required": ["teamName", "githubHandle"],
      "properties": {
        "teamName":    { "type": "string", "minLength": 3 },
        "githubHandle":{ "type": "string", "pattern": "^[a-zA-Z0-9-]+$" }
      }
    },
    "formData": {
      "teamName": "CodeBuilders <script>alert(1)</script>",
      "githubHandle": "rajatsingh535"
    }
  }'`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
