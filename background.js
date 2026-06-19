// Слухаємо клік по іконці розширення
chrome.action.onClicked.addListener((tab) => {
  // Відкриваємо наш index.html в новій вкладці
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html")
  });
});