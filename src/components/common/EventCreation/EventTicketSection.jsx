import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Ticket } from "lucide-react";
import CharacterCounter from "../CharacterCounter";

const FormField = ({ htmlFor, label, icon: Icon, error, children, required }) => (
  <div className="space-y-2">
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {Icon && <Icon className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />}
      {label}
      {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
    </label>
    {children}
    {error && <p id={`${htmlFor}-error`} className="text-red-500 text-sm" role="alert">{error}</p>}
  </div>
);

const TicketTierCard = ({ tier, index, onChange, onRemove, canRemove, errors }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-4"
    >
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Tier {index + 1}</h4>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm" aria-label={`Remove Tier ${index + 1}`}>
            <Trash2 className="w-4 h-4" aria-hidden="true" /> Remove
          </button>
        )}
      </div>

      <div className="space-y-3">
        <FormField htmlFor={`tier-${index}-name`} label="Tier Name" required error={errors[`ticketTier_${index}_name`]}>
          <input
            id={`tier-${index}-name`}
            type="text"
            value={tier.name}
            onChange={(e) => onChange(index, "name", e.target.value)}
            placeholder="e.g., Early Bird"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField htmlFor={`tier-${index}-price`} label="Price (₹)" required error={errors[`ticketTier_${index}_price`]}>
            <input
              id={`tier-${index}-price`}
              type="number"
              min="0"
              onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              value={tier.price}
              onChange={(e) => onChange(index, "price", e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
            />
          </FormField>
          <FormField htmlFor={`tier-${index}-cap`} label="Capacity" error={errors[`ticketTier_${index}_capacity`]}>
            <input
              id={`tier-${index}-cap`}
              type="number"
              min="1"
              onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              value={tier.capacity}
              onChange={(e) => onChange(index, "capacity", e.target.value)}
              placeholder="Unlimited"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <label htmlFor={`tier-${index}-desc`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            id={`tier-${index}-desc`}
            value={tier.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            rows={2}
            maxLength={200}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 resize-none"
          />
          <div className="flex justify-end">
            <CharacterCounter current={tier.description.length} max={200} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EventTicketSection = ({ formData, addTicketTier, removeTicketTier, updateTicketTier, errors }) => {
  const containerRef = useRef(null);

  // Deep Fix: Restore focus to container when a card is removed to satisfy WCAG 2.4.3
  const handleRemove = (index) => {
    removeTicketTier(index);
    setTimeout(() => containerRef.current?.focus(), 0);
  };

  return (
    <div className="space-y-6" ref={containerRef} tabIndex={-1} className="outline-none">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-indigo-500" /> Ticket Tiers
        </h3>
        <button
          type="button"
          onClick={addTicketTier}
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Add Tier
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
              onRemove={handleRemove}
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