import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function NewsletterSubscribe() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="w-full flex justify-center py-16 px-4 bg-gradient-to-b from-indigo-50 via-indigo-100 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-black"
    >
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
            Subscribe to our Newsletter
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get the latest updates, articles, and resources straight to your
            inbox.
          </p>

          <form className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="pl-10 w-full rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 p-3"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl px-6 py-3 font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md hover:opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
