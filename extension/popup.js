// popup.js - The brain of the extension popup
const API_URL = "https://smart-search-4kcq.onrender.com/api/items";

document.addEventListener('DOMContentLoaded', async () => {
  const saveUrlBtn = document.getElementById('save-url');
  const saveImageBtn = document.getElementById('save-image');
  const saveVideoBtn = document.getElementById('save-video');
  const messageEl = document.getElementById('message');
  const contentEl = document.getElementById('content');
  const authErrorEl = document.getElementById('auth-error');

  // 1. Check for token in storage
  const storage = await chrome.storage.local.get(['token']);
  const token = storage.token;

  if (!token) {
    contentEl.style.display = 'none';
    authErrorEl.style.display = 'block';
    return;
  }

  const showMessage = (text, isError = false) => {
    messageEl.textContent = text;
    messageEl.className = isError ? 'error' : 'success';
    messageEl.style.display = 'block';
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 4000);
  };

  const saveToBackend = async (payload) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('Successfully saved to Smart-search!');
      } else {
        showMessage(data.message || 'Failed to save.', true);
      }
    } catch (err) {
      console.error(err);
      showMessage('API Error: Is the server running?', true);
    }
  };

  // 2. Handle Button Clicks
  saveUrlBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    saveToBackend({
      url: tab.url,
      title: tab.title,
      type: 'url'
    });
  });

  saveImageBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    saveToBackend({
      url: tab.url,
      title: tab.title,
      type: 'url',
      sourceType: 'Image' // seeded for deterministic clustering
    });
  });

  saveVideoBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    saveToBackend({
      url: tab.url,
      title: tab.title,
      type: 'url',
      sourceType: 'Video' // seeded for deterministic clustering
    });
  });
});
