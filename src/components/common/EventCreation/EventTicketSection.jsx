import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Ticket } from "lucide-react";
import CharacterCounter from "../CharacterCounter";

const FormField = ({ label, icon: Icon, error, children, required }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {Icon && <Icon className="mr-2 inline-block h-5 w-5 text-indigo-500" />}
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
    </label>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const TicketTierCard = ({ tier, index, onChange, onRemove, canRemove, errors }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Tier {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        )}
      </div>

      <div className="space-y-3">
        <FormField label="Tier Name" required error={errors[`ticketTier_${index}_name`]}>
          <input
            type="text"
            value={tier.name}
            onChange={(e) => onChange(index, "name", e.target.value)}
            placeholder="e.g., Early Bird"
            className="w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price (₹)" required error={errors[`ticketTier_${index}_price`]}>
            <input
              type="number"
              value={tier.price}
              onChange={(e) => onChange(index, "price", e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
            />
          </FormField>
          <FormField label="Capacity" error={errors[`ticketTier_${index}_capacity`]}>
            <input
              type="number"
              value={tier.capacity}
              onChange={(e) => onChange(index, "capacity", e.target.value)}
              placeholder="Unlimited"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={tier.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            rows={2}
            maxLength={200}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
          />
          <div className="flex justify-end">
            <CharacterCounter current={tier.description.length} max={200} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EventTicketSection = ({
  formData,
  addTicketTier,
  removeTicketTier,
  updateTicketTier,
  errors,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <Ticket className="h-5 w-5 text-indigo-500" /> Ticket Tiers
        </h3>
        <button
          type="button"
          onClick={addTicketTier}
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Tier
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {formData.ticketTiers.map((tier, index) => (
            <TicketTierCard
              key={tier.id || index}
              tier={tier}
              index={index}
              onChange={updateTicketTier}
              onRemove={removeTicketTier}
              canRemove={formData.ticketTiers.length > 1}
              errors={errors}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventTicketSection;
