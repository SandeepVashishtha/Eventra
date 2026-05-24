export const isAlreadyRegistered = (
  eventId,
  email
) => {
  const registrations =
    JSON.parse(
      localStorage.getItem(
        "eventRegistrations"
      )
    ) || {};

  const eventEmails =
    registrations[eventId] || [];

  return eventEmails.includes(
    email.toLowerCase()
  );
};

export const saveRegistration = (
  eventId,
  email
) => {
  const registrations =
    JSON.parse(
      localStorage.getItem(
        "eventRegistrations"
      )
    ) || {};

  if (!registrations[eventId]) {
    registrations[eventId] = [];
  }

  registrations[eventId].push(
    email.toLowerCase()
  );

  localStorage.setItem(
    "eventRegistrations",
    JSON.stringify(registrations)
  );
};