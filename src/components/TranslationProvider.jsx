import { I18nextProvider } from "react-i18next";
import i18n from "../i18n/i18n";
import { LanguageProvider } from "../context/LanguageContext";

export default function TranslationProvider({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>{children}</LanguageProvider>
    </I18nextProvider>
  );
}
