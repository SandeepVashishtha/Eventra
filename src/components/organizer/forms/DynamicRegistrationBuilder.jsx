import React, { useState } from "react";
import { Sliders, Wrench, Eye, CheckCircle } from "lucide-react";
import DynamicFormRenderer from "./DynamicFormRenderer";

export default function DynamicRegistrationBuilder() {
  const [schema, setSchema] = useState({
    type: "object",
    properties: {
      fullName: { type: "string", title: "Full Name" },
      age: { type: "number", title: "Attendee Age" },
    },
    required: ["fullName"],
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Dynamic Registration Builder</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 space-y-3">
          <h3 className="font-bold text-gray-500">JSON Schema Config</h3>
          <pre className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] overflow-auto">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>

        <DynamicFormRenderer schema={schema} />
      </div>
    </div>
  );
}
