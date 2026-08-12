import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import BudgetSummaryCard from "./BudgetSummaryCard";
import {
  calculateTotalBudget,
  calculateCostPerParticipant,
} from "../../utils/budgetCalculatorUtils";

const BudgetCalculator = () => {
  const [budget, setBudget] = useState({
    venue: "",
    speakers: "",
    food: "",
    marketing: "",
    merchandise: "",
    prizePool: "",
    miscellaneous: "",
    participants: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBudget((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalBudget = useMemo(
    () => calculateTotalBudget(budget),
    [budget]
  );

  const costPerParticipant = useMemo(
    () =>
      calculateCostPerParticipant(
        totalBudget,
        Number(budget.participants)
      ),
    [budget.participants, totalBudget]
  );

  return (
    <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-8">
        <Calculator
          size={28}
          className="text-indigo-600"
        />

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Smart Event Budget Calculator
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estimate expenses before publishing your event.
          </p>
        </div>
      </div>

      {/* Input Fields */}

      <div className="grid gap-5 md:grid-cols-2">

        <BudgetInput
          label="Venue Cost"
          name="venue"
          value={budget.venue}
          onChange={handleChange}
        />

        <BudgetInput
          label="Speaker Fees"
          name="speakers"
          value={budget.speakers}
          onChange={handleChange}
        />

        <BudgetInput
          label="Food & Refreshments"
          name="food"
          value={budget.food}
          onChange={handleChange}
        />

        <BudgetInput
          label="Marketing"
          name="marketing"
          value={budget.marketing}
          onChange={handleChange}
        />

        <BudgetInput
          label="Merchandise"
          name="merchandise"
          value={budget.merchandise}
          onChange={handleChange}
        />

        <BudgetInput
          label="Prize Pool"
          name="prizePool"
          value={budget.prizePool}
          onChange={handleChange}
        />

        <BudgetInput
          label="Miscellaneous"
          name="miscellaneous"
          value={budget.miscellaneous}
          onChange={handleChange}
        />

        <BudgetInput
          label="Expected Participants"
          name="participants"
          value={budget.participants}
          onChange={handleChange}
        />

      </div>

      {/* Summary */}

      <div className="mt-8">
        <BudgetSummaryCard
          budget={budget}
          totalBudget={totalBudget}
          costPerParticipant={costPerParticipant}
        />
      </div>

    </div>
  );
};

const BudgetInput = ({
  label,
  name,
  value,
  onChange,
}) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>

    <input
      type="number"
      min="0"
      name={name}
      value={value}
      onChange={onChange}
      placeholder="0"
      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

export default BudgetCalculator;