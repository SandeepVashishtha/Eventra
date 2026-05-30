import TicketTiersSection from "./TicketTiersSection";

const TicketsStep = ({ formData, setFormData, errors, setErrors }) => {
  return (
    <TicketTiersSection
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      setErrors={setErrors}
    />
  );
};

export default TicketsStep;