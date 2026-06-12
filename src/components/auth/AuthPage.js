import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { AlertCircle, X as XIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useReducedMotion from "../../hooks/useReducedMotion";

const LoginForm = lazy(() => import("./LoginForm"));
const SignupForm = lazy(() => import("./SignupForm"));

const AuthPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const isLogin = location.pathname === "/login";
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
      // Only redirect to dashboard for actual auth routes, not event registration pages
      const authRoutes = ["/login", "/register", "/signup", "/unauthorized", "/password-reset"];
      const isAuthRoute = authRoutes.includes(rawRedirectPath);
      const safeRedirectPath = isAuthRoute ? "/dashboard" : rawRedirectPath;

      navigate(safeRedirectPath, { replace: true });
    }
  }, [navigate, isAuthenticated, rawRedirectPath]);

  // 🔥 FIX 2: Memoized Animation Variants
  // Hoisted into useMemo to prevent unnecessary re-instantiation and layout thrashing.
  const formVariants = useMemo(
    () => ({
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
          type: "spring",
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
    }),
    [prefersReducedMotion]
  );

  return (
    <div className="bg-bg flex min-h-screen items-center justify-center px-4 py-12 transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="w-full max-w-[32rem]">
        <div className="bg-card-bg border-border shadow-premium-lg rounded-3xl border p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-text text-3xl font-extrabold tracking-tight">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-text-light mt-2 text-sm">
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
                className="mb-4 flex w-full items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700"
              >
                <AlertCircle size={18} className="shrink-0 text-amber-500" />
                <span className="flex-1">Your session has expired. Please log in again.</span>
                <button
                  onClick={() => setShowExpiredBanner(false)}
                  className="shrink-0 rounded-md p-1 transition-colors hover:bg-amber-100"
                  aria-label="Dismiss session expired notice"
                >
                  <XIcon size={14} />
                </button>
              </motion.div>
            )}
            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
                </div>
              }
            >
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
