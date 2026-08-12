import React, { useEffect, useState } from 'react';

export default function EventOutlineNavigator({ selector = ".prose" }) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(`${selector} h1, ${selector} h2, ${selector} h3`));
    setHeadings(elements.map((el, i) => {
      if (!el.id) el.id = `outline-heading-${i}`;
      return { id: el.id, text: el.textContent };
    }));
  }, [selector]);

  if (headings.length === 0) return null;

  return (
    <nav className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 my-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Event Outline</h4>
      <ul className="space-y-1 text-sm">
        {headings.map(h => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
