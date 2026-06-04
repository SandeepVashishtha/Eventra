import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
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
  
  // 🔥 FIX 1A: Derived the raw path
  const rawRedirectPath =
    typeof from === "string"
      ? from
      : from?.pathname
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/dashboard";
        
  const [showExpiredBanner, setShowExpiredBanner] = useState(sessionExpired);
  
  useDocumentTitle(isLogin ? "Login | Eventra" : "Sign Up | Eventra");

  useEffect(() => {
    if (isAuthenticated()) {
      // 🔥 FIX 1B: The Infinite Redirect Guard
      // Prevents redirecting authenticated users back into an auth-loop.
      const safeRedirectPath = 
        rawRedirectPath.includes('/login') || rawRedirectPath.includes('/register')
          ? '/dashboard' 
          : rawRedirectPath;

      navigate(safeRedirectPath, { replace: true });
    }
  }, [navigate, isAuthenticated, rawRedirectPath]);

  // 🔥 FIX 2: Memoized Animation Variants
  // Hoisted into useMemo to prevent unnecessary re-instantiation and layout thrashing.
  const formVariants = useMemo(() => ({
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
  }), [prefersReducedMotion]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="w-full max-w-[32rem]">
        <div className="bg-card-bg border border-border rounded-3xl shadow-premium-lg p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-extrabold text-text tracking-tight">{isLogin ? "Welcome Back" : "Create Your Account"}</h2>
            <p className="mt-2 text-sm text-text-light">
              {isLogin
                ? "Sign in to continue to your Eventra dashboard."
                : "Create an account to start using Eventra features."}
            </p>
          </div>

          <div className="w-full">
            {/* Session-expired banner */}
            {showExpiredBanner && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-4 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-700 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 text-amber-500" />
                <span className="flex-1">Your session has expired. Please log in again.</span>
                <button
                  onClick={() => setShowExpiredBanner(false)}
                  className="shrink-0 p-1 rounded-md hover:bg-amber-100 transition-colors"
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
                  className="w-full"
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