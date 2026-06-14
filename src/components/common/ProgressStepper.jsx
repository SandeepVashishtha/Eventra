import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ProgressStepper = ({ steps, currentStep }) => {
  const getStepStatus = (index) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full mb-8">
      {/* Progress Bar Background */}
      <div className="relative mb-8">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -translate-y-1/2" />
        
        {/* Progress Fill */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full -translate-y-1/2"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {/* Step Circles */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300
                    ${
                      status === "completed"
                        ? "bg-green-500 border-green-500 text-white"
                        : status === "active"
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                    }
                  `}
                >
                  {status === "completed" ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </motion.div>

                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center hidden sm:block
                    ${
                      status === "active"
                        ? "text-blue-600 dark:text-blue-400"
                        : status === "completed"
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="text-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Step {currentStep + 1} of {steps.length} -{" "}
          {steps[currentStep]?.label}
        </span>
      </div>
    </div>
  );
};

export default ProgressStepper;