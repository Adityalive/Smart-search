// background.js - service worker for context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-image-cm",
    title: "Save Image to Smart-search",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "save-video-cm",
    title: "Save Video URL to Smart-search",
    contexts: ["video"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const tokenRecord = await chrome.storage.local.get(['token']);
  const token = tokenRecord.token;

  if (!token) {
    console.warn("[Background] No auth token found. User must log in.");
    return;
  }

  let payload = {
    url: info.srcUrl || info.linkUrl || tab.url,
    title: tab.title || "Context Saved Item",
    type: "url"
  };

  if (info.menuItemId === "save-image-cm") {
    payload.sourceType = "Image";
  } else if (info.menuItemId === "save-video-cm") {
    payload.sourceType = "Video";
  }

  try {
    const response = await fetch('http://localhost:3000/api/items', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log("[Background] Successfully saved item from context menu.");
    } else {
      console.error("[Background] Failed to save item.");
    }
  } catch (err) {
    console.error("[Background] API Error:", err);
  }
});

// 2. Listen for auth signals from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SAVE_TOKEN" && request.token) {
    chrome.storage.local.set({ token: request.token }, () => {
      console.log("[Background] Token successfully synced to Chrome storage.");
      sendResponse({ status: "success" });
    });
    return true; // Keep channel open for async response
  }
});
