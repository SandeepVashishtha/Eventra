/**
 * useMFA.js
 * 
 * Logic for Multi-Factor Authentication enrollment and verification.
 * Simulates TOTP (Time-based One-Time Password) generation.
 */

import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useMFA = () => {
  const [qrCode, setQrCode] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);

  const startEnrollment = useCallback(async () => {
    setIsEnrolling(true);
    // Simulate API call to generate TOTP secret
    await new Promise(resolve => setTimeout(resolve, 1000));
    setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Eventra:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Eventra");
    setIsEnrolling(false);
  }, []);

  const verifyAndEnable = useCallback(async (code) => {
    if (code === "123456") { // Simulated success code
      toast.success("MFA successfully enabled!");
      setBackupCodes(["ABCD-1234", "EFGH-5678", "IJKL-9012"]);
      return true;
    } else {
      toast.error("Invalid verification code.");
      return false;
    }
  }, []);

  return {
    qrCode,
    isEnrolling,
    backupCodes,
    startEnrollment,
    verifyAndEnable
  };
};


export default useMFA;
