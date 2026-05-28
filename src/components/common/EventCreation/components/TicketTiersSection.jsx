import React from "react";
import { motion } from "framer-motion";
import { TicketIcon } from "@heroicons/react/24/solid";
import { Plus } from "lucide-react";
import CharacterCounter from "../../../common/CharacterCounter";

const TicketTiersSection = ({
  formData,
  setFormData,
  errors,
  setErrors,
}) => {

  const handleTicketTierChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      ),
    }));

    const errorKey =
    field === "price"
        ? `ticketPrice_${index}`
        : field === "capacity"
        ? `ticketCapacity_${index}`
        : null;

    if (errorKey && errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const addTicketTier = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: [
        ...prev.ticketTiers,
        {
          name: "",
          price: 0,
          capacity: "",
          description: "",
        },
      ],
    }));
  };

  const removeTicketTier = (index) => {
    if (formData.ticketTiers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        ticketTiers: prev.ticketTiers.filter((_, i) => i !== index),
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="border-t border-gray-200 dark:border-gray-600 pt-6"
    >

    <div className="flex items-center gap-2 mb-4">
  <TicketIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
    Ticket Tiers
  </h3>
</div>

<div className="space-y-6">
  {formData.ticketTiers.map((tier, index) => (
    <div
      key={index}
      className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-800"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold text-gray-800 dark:text-white">
          Ticket Tier #{index + 1}
        </h4>

        {formData.ticketTiers.length > 1 && (
          <button
            type="button"
            onClick={() = aria-label="button"> removeTicketTier(index)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tier Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ticket Name
          </label>

          <input
            type="text"
            value={tier.name}
            onChange={(e) =>
              handleTicketTierChange(index, "name", e.target.value)
            }
            placeholder="VIP / Early Bird / General"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price (₹)
          </label>

          <input
            type="number"
            min="0"
            value={tier.price}
            onChange={(e) =>
              handleTicketTierChange(index, "price", e.target.value)
            }
            className={`w-full border ${
              errors[`ticketPrice_${index}`]
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          />

          {errors[`ticketPrice_${index}`] && (
            <span className="text-red-500 text-sm mt-1">
              {errors[`ticketPrice_${index}`]}
            </span>
          )}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Capacity
          </label>

          <input
            type="number"
            min="1"
            value={tier.capacity}
            onChange={(e) =>
              handleTicketTierChange(index, "capacity", e.target.value)
            }
            placeholder="100"
            className={`w-full border ${
              errors[`ticketCapacity_${index}`]
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          />

          {errors[`ticketCapacity_${index}`] && (
            <span className="text-red-500 text-sm mt-1">
              {errors[`ticketCapacity_${index}`]}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>

          <textarea
            rows={3}
            maxLength={200}
            value={tier.description}
            onChange={(e) =>
              handleTicketTierChange(index, "description", e.target.value)
            }
            placeholder="Describe perks and benefits"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
          />

          <CharacterCounter
            current={tier.description.length}
            max={200}
          />
        </div>
      </div>
    </div>
  ))}

  <button
    type="button"
    onClick={addTicketTier}
    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black text-white hover:bg-zinc-800 transition-all duration-300"
   aria-label="button">
    <Plus className="w-4 h-4" />
    Add Ticket Tier
  </button>
</div>

    </motion.div>
  );
};

export default React.memo(TicketTiersSection);