import { useState, useEffect, lazy, Suspense } from 'react';
import { AlertCircle, X as XIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useReducedMotion from "../../hooks/useReducedMotion";

const LoginForm = lazy(() => import('./LoginForm'));
const SignupForm = lazy(() => import('./SignupForm'));

const AuthPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const isLogin = location.pathname === '/login';
  const sessionExpired = location.state?.sessionExpired === true;
  const from = location.state?.from;
  const redirectPath =
    typeof from === "string"
      ? from
      : from?.pathname
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/dashboard";
  const [showExpiredBanner, setShowExpiredBanner] = useState(sessionExpired);
  
  useDocumentTitle(isLogin ? "Login | Eventra" : "Sign Up | Eventra");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, isAuthenticated, redirectPath]);

  const introPoints = [
    "Create your account to post events, join hackathons, and submit projects.",
    "Track your activity, registrations, and community engagement from one profile.",
    "Get quick access to the tools you need to start contributing immediately.",
  ];

  // Animation variants
  const formVariants = {
    hidden: (isLoginView) => ({
      x: isLoginView ? -50 : 50,
      opacity: 0,
      scale: 0.95,
    }),
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (isLoginView) => ({
      x: isLoginView ? 50 : -50,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.2,
      },
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] dark:bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-5xl w-full mx-auto relative z-10">
        <div className="bg-[var(--card-bg-color)] dark:bg-[#1e293b]/80 backdrop-blur-xl border border-[var(--border-color)] dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl flex flex-col md:flex-row min-h-[600px] transition-all duration-300">
          
          {/* LEFT PANEL */}
          <div className="md:w-[40%] bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-slate-800 dark:to-slate-900 border-r border-[var(--border-color)] dark:border-slate-700/50 p-10 flex flex-col justify-center relative overflow-hidden transition-all duration-300">
            {/* Subtle glow inside left panel */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 group/panel">
              <motion.h2 
                key={isLogin ? 'login-title' : 'signup-title'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-200 hover:from-blue-200 hover:to-pink-200 transition-all duration-500 cursor-default"
                style={{ letterSpacing: '1px' }}
                whileHover={{ scale: 1.02, textShadow: "0px 0px 8px rgba(147, 197, 253, 0.5)" }}
              >
                Join<br />Eventra
              </motion.h2>
              
              <motion.p 
                key={isLogin ? 'login-desc' : 'signup-desc'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10 text-lg text-white/90 dark:text-slate-300 leading-relaxed font-medium group-hover/panel:text-white transition-colors duration-500"
              >
                {isLogin 
                  ? "Sign in to your Eventra account and pick up where you left off."
                  : "Create your free account and start building amazing events."
                }
              </motion.p>
              
              <div className="space-y-4">
                {introPoints.map((point, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                    key={point}
                    className="group flex items-start gap-4 rounded-xl border border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-800/50 p-4 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-slate-700/60 hover:border-white/40 dark:hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)] cursor-default hover:-translate-y-1"
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] shrink-0 group-hover:scale-125 group-hover:bg-blue-400 transition-all duration-300" />
                    <span className="text-sm text-white/90 dark:text-slate-300 leading-relaxed group-hover:text-white transition-colors duration-300">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="md:w-[60%] p-10 relative bg-transparent dark:bg-[#1e293b]/40 overflow-hidden flex flex-col justify-center transition-all duration-300">
            {/* Session-expired banner */}
            {showExpiredBanner && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto mb-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 text-amber-400" />
                <span className="flex-1">Your session has expired. Please log in again.</span>
                <button
                  onClick={() => setShowExpiredBanner(false)}
                  className="shrink-0 p-1 rounded-md hover:bg-amber-500/20 transition-colors"
                  aria-label="Dismiss session expired notice"
                >
                  <XIcon size={14} />
                </button>
              </motion.div>
            )}
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            }>
              <AnimatePresence mode="wait" custom={isLogin}>
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  custom={isLogin}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-w-md mx-auto"
                >
                  {isLogin ? <LoginForm /> : <SignupForm />}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
