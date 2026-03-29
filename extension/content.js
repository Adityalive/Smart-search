// content.js (v1.1) - Auth sync with safety checks
console.log("[Smart-search] Extension content script (v1.1) active.");

window.addEventListener("SMART_SEARCH_LOGIN", (event) => {
  const token = event.detail?.token;
  if (!token) return;

  // Defensive check for chrome runtime availability
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage({ action: "SAVE_TOKEN", token }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("[Smart-search] Extension message error:", chrome.runtime.lastError.message);
        } else {
          console.log("[Smart-search] Auth sync successful via background.");
        }
      });
    } catch (e) {
      console.error("[Smart-search] Unexpected error sending message:", e);
    }
  } else {
    console.error("[Smart-search] Extension API is unavailable. Please RELOAD the extension.");
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ status: "alive" });
  }
});
