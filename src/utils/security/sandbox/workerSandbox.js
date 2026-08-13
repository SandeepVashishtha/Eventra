/**
 * Secure Javascript sandboxed runner in web worker (#16272)
 */

export function getSandboxWorkerSource() {
  return `
    self.onmessage = function(e) {
      const { userScript, contextData } = e.data;
      
      try {
        // Enforce strict sandbox context by limiting access to browser objects
        const sandboxedFunc = new Function('data', \`
          const self = {};
          const fetch = null;
          const XMLHttpRequest = null;
          const WebSocket = null;
          const postMessage = null;
          const importScripts = null;

          \${userScript}
        \`);

        const result = sandboxedFunc(contextData);
        self.postMessage({ success: true, result });
      } catch (err) {
        self.postMessage({ success: false, error: err.message });
      }
    };
  `;
}
