import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <div className="relative bg-white dark:bg-slate-950 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
      
      {/* Main CTA Section */}
      <section className="relative max-w-6xl mx-auto py-16 sm:py-20 px-6 sm:px-12 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl shadow-indigo-500/10 dark:shadow-black/50">
        
        {/* ✅ FIXED: Background opacity 90%/95% kar diya hai taaki text hamesha crystal clear dikhe */}
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md -z-10" />

        {/* Soft Background Orbs (Thoda bright kiya hai taaki effect dikhe) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-pink-500/20 dark:bg-pink-500/15 blur-3xl pointer-events-none" />

        {/* CTA Content Wrapper */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          
          {/* Tag-style subheading */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="inline-flex items-center gap-2 border border-indigo-200 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/80 rounded-full px-4 py-1.5 justify-center mx-auto mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span className="text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm font-bold tracking-wide uppercase">
              Innovate Ideas, Build Projects, Join Events
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1] drop-shadow-sm"
          >
            Ignite Ideas,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Connect Innovators
            </span>
          </motion.h2>

          {/* ✅ FIXED: Description text ko dark mode mein 'slate-200' kar diya hai maximum readability ke liye */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-700 dark:text-slate-200 max-w-2xl mx-auto text-base sm:text-lg mb-10 leading-relaxed font-medium"
          >
            Participate in hackathons, showcase your projects, and collaborate
            with creators around the world. Eventra makes it effortless, fun,
            and inspiring.
          </motion.p>

          {/* Buttons container */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-10"
          >
            {/* ✅ FIXED: 'group' class add ki hai taaki arrow hover animation kaam kare */}
            <Link
              to="/hackathons"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out"
            >
              <Users className="w-5 h-5" aria-hidden="true" />
              Explore Hackathons
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>

            {/* ✅ FIXED: Secondary button text ko dark mode mein 'white' aur border ko thoda visible kiya hai */}
            <Link
              to="/about"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out"
            >
              Know us better
              <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* ✅ FIXED: Last line text ko bhi thoda bright kiya hai (slate-300) */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold"
          >
            Connect, create, and grow with your community today.
          </motion.p>
        </div>
      </section>
    </div>
  );
}