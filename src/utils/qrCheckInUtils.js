const STORAGE_KEY = "eventra-checkins";

/**
 * Get all attendance records
 */
export const getAttendanceList = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load attendance:", error);
    return [];
  }
};

/**
 * Save attendance records
 */
export const saveAttendanceList = (attendance) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(attendance)
    );
  } catch (error) {
    console.error("Failed to save attendance:", error);
  }
};

/**
 * Generate QR payload
 */
export const generateQRCodeData = ({
  registrationId,
  attendeeName,
  eventId,
}) => {
  return JSON.stringify({
    registrationId,
    attendeeName,
    eventId,
  });
};

/**
 * Validate QR Code
 */
export const validateQRCode = (qrData) => {
  try {
    const parsed =
      typeof qrData === "string"
        ? JSON.parse(qrData)
        : qrData;

    return (
      parsed &&
      parsed.registrationId &&
      parsed.eventId
    );
  } catch {
    return false;
  }
};

/**
 * Check if attendee already checked in
 */
export const hasCheckedIn = (qrData) => {
  try {
    const parsed =
      typeof qrData === "string"
        ? JSON.parse(qrData)
        : qrData;

    const attendance = getAttendanceList();

    return attendance.some(
      (record) =>
        record.registrationId ===
        parsed.registrationId
    );
  } catch {
    return false;
  }
};

/**
 * Mark attendance
 */
export const markAttendance = (qrData) => {
  try {
    const parsed =
      typeof qrData === "string"
        ? JSON.parse(qrData)
        : qrData;

    if (hasCheckedIn(parsed)) {
      return {
        success: false,
        message: "Already checked in.",
      };
    }

    const attendance = getAttendanceList();

    attendance.push({
      ...parsed,
      checkedInAt: new Date().toISOString(),
    });

    saveAttendanceList(attendance);

    return {
      success: true,
      message: "Attendance recorded successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Invalid QR data.",
    };
  }
};

/**
 * Get attendee by registration ID
 */
export const getAttendanceByRegistration = (
  registrationId
) => {
  return getAttendanceList().find(
    (item) =>
      item.registrationId === registrationId
  );
};

/**
 * Get attendance count
 */
export const getAttendanceCount = () => {
  return getAttendanceList().length;
};

/**
 * Reset attendance
 */
export const resetAttendance = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Export attendance
 */
export const exportAttendance = () => {
  return JSON.stringify(
    getAttendanceList(),
    null,
    2
  );
};