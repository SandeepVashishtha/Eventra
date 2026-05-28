import { AnimatePresence, motion } from 'framer-motion';

export default function FormField({ label, id, type = 'text', value, onChange, error, ...rest }) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-500 focus:ring-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-600'
            : 'border-gray-300 focus:ring-indigo-300 dark:border-gray-600 dark:bg-gray-800'
        }`}
        {...rest}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <span aria-hidden="true">⚠</span> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
