export function createSingleFlightGate() {
  let activeToken = null;

  return {
    acquire() {
      if (activeToken !== null) return null;

      const token = Symbol("single-flight-lease");
      activeToken = token;

      return {
        release() {
          if (activeToken !== token) return false;
          activeToken = null;
          return true;
        },
      };
    },
  };
}
