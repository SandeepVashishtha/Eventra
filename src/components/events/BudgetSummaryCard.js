import { PieChart, Users, Wallet, TrendingUp } from "lucide-react";
import {
  formatCurrency,
  getHighestExpense,
  getExpenseBreakdown,
} from "../../utils/budgetCalculatorUtils";

const BudgetSummaryCard = ({
  budget,
  totalBudget,
  costPerParticipant,
}) => {
  const highestExpense = getHighestExpense(budget);
  const breakdown = getExpenseBreakdown(budget);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">
        <PieChart
          size={26}
          className="text-indigo-600"
        />

        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Budget Summary
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estimated budget overview
          </p>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wallet
              size={20}
              className="text-green-600"
            />

            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Total Budget
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalBudget)}
          </h3>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users
              size={20}
              className="text-blue-600"
            />

            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Cost / Participant
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(costPerParticipant)}
          </h3>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp
              size={20}
              className="text-orange-600"
            />

            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Highest Expense
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {highestExpense.category || "N/A"}
          </h3>

          <p className="text-sm text-slate-500">
            {formatCurrency(highestExpense.amount || 0)}
          </p>
        </div>

      </div>

      {/* Expense Breakdown */}

      <div className="mt-8">

        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
          Expense Breakdown
        </h3>

        <div className="space-y-3">

          {breakdown.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-800"
            >
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.category}
              </span>

              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
};

export default BudgetSummaryCard;