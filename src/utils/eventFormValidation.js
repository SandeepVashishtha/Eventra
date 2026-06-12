import { parseTimeToMinutes } from "./eventCreationUtils";

export const validateForm = (formData) => {
  const newErrors = {};

  if (!formData.title.trim()) {
    newErrors.title = "Event title is required";
  } else if (formData.title.length < 3 || formData.title.length > 200) {
    newErrors.title = "Title must be between 3 and 200 characters";
  }

  if (!formData.description.trim()) newErrors.description = "Event description is required";
  if (!formData.category) newErrors.category = "Please select a category";

  if (formData.isMultiDay) {
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }
  } else {
    if (!formData.date) newErrors.date = "Event date is required";
  }

  if (!formData.startTime) newErrors.startTime = "Start time is required";
  if (!formData.endTime) newErrors.endTime = "End time is required";

  if (!newErrors.startTime && !newErrors.endTime && !formData.isMultiDay) {
    const startMinutes = parseTimeToMinutes(formData.startTime);
    const endMinutes = parseTimeToMinutes(formData.endTime);
    if (startMinutes >= endMinutes) {
      newErrors.endTime = "End time must be after start time";
    }
  }

  if (!formData.isVirtual && !formData.location?.name?.trim()) {
    newErrors.location = "Location name is required for offline events";
  }

  if (formData.isVirtual && !formData.virtualLink.trim()) {
    newErrors.virtualLink = "Virtual link is required for online events";
  }

  if (formData.capacity) {
    const capacity = Number(formData.capacity);
    if (!capacity || capacity <= 0) {
      newErrors.capacity = "Please enter a valid number of attendees";
    } else if (capacity > 100000) {
      newErrors.capacity = "Maximum capacity is 100,000 attendees";
    }
  }

  if (formData.registrationStart || formData.registrationEnd) {
    const now = new Date();
    const registrationStart = formData.registrationStart
      ? new Date(formData.registrationStart)
      : null;
    const registrationEnd = formData.registrationEnd
      ? new Date(formData.registrationEnd)
      : null;
    const eventStart = new Date(
      `${formData.isMultiDay ? formData.startDate : formData.date}T${formData.startTime}`
    );

    if (registrationStart && registrationStart < now) {
      newErrors.registrationStart = "Registration start cannot be in the past";
    }

    if (registrationStart && registrationEnd && registrationStart >= registrationEnd) {
      newErrors.registrationEnd = "Registration end must be after registration start";
    }

    if (registrationStart && !isNaN(eventStart.getTime()) && registrationStart >= eventStart) {
      newErrors.registrationStart = "Registration start must be before the event starts";
    }

    if (registrationEnd && !isNaN(eventStart.getTime()) && registrationEnd > eventStart) {
      newErrors.registrationEnd = "Registration must close before the event starts";
    }
  }

  if (formData.ticketTiers && formData.ticketTiers.length > 0) {
    formData.ticketTiers.forEach((tier, index) => {
      if (tier.name && tier.name.trim()) {
        const price = Number(tier.price);
        if (price < 0) {
          newErrors[`ticketPrice_${index}`] = "Ticket price cannot be negative";
        }
        if (tier.capacity) {
          const capacity = Number(tier.capacity);
          if (capacity <= 0) {
            newErrors[`ticketCapacity_${index}`] = "Ticket capacity must be greater than 0";
          }
        }
      }
    });
  }

  return newErrors;
};
