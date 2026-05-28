import { Link, useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center bg-white dark:bg-slate-950">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-slate-50/90 p-10 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 mb-4">404</p>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          Oops! This page doesn&apos;t exist.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
          The page you&apos;re looking for can&apos;t be found. It may have been moved, renamed, or never existed.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border-2 border-indigo-600 px-6 py-3 text-indigo-600 font-semibold transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900"
          >
            ← Go Back
          </button>

          <Link
            to="/"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold transition-colors hover:bg-indigo-500"
          >
            Go to Home
          </Link>

          <Link
            to="/events"
            className="rounded-xl bg-slate-900 px-6 py-3 text-white font-semibold transition-colors hover:bg-slate-800"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
