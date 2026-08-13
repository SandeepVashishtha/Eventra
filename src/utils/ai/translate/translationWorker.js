/**
 * Dynamic on-device translation worker exporter (#16280)
 */

export function getTranslationWorkerSource() {
  return `
    self.onmessage = function(e) {
      const { text, targetLang } = e.data;
      if (!text) {
        self.postMessage({ translatedText: "" });
        return;
      }

      // Simple translator mapping for dynamic forms
      const dict = {
        es: { "Full Name": "Nombre Completo", "Attendee Age": "Edad del Asistente" },
        fr: { "Full Name": "Nom Complet", "Attendee Age": "Âge de l'invité" }
      };

      const langDict = dict[targetLang] || {};
      const translated = langDict[text] || \`\${text} [\${targetLang.toUpperCase()}]\`;

      self.postMessage({ translatedText: translated });
    };
  `;
}
