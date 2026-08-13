import React, { useState } from "react";
import { Check } from "lucide-react";
import { validateFormPayload } from "../../../utils/forms/jsonSchemaValidator";

export default function DynamicFormRenderer({ schema = {} }) {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateFormPayload(formData, schema);
    if (result.valid) {
      setValidationErrors([]);
      alert("Registration payload fits schema validation constraints!");
    } else {
      setValidationErrors(result.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-4">
      <h3 className="font-bold text-gray-500">Live Registration Form Preview</h3>

      {Object.keys(schema.properties || {}).map((key) => {
        const field = schema.properties[key];
        return (
          <div key={key} className="space-y-1">
            <label className="font-semibold text-gray-600 dark:text-gray-400">{field.title}</label>
            <input
              type={field.type === "number" ? "number" : "text"}
              value={formData[key] || ""}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
            />
          </div>
        );
      })}

      {validationErrors.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[10px] text-rose-600 space-y-1">
          {validationErrors.map((err, index) => (
            <div key={index}>{err.message}</div>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
      >
        Submit Registration
      </button>
    </form>
  );
}
