// 1. Налаштування при встановленні
chrome.runtime.onInstalled.addListener(() => {
  // Наказуємо Хрому відкривати Сайдбар при кліці на іконку розширення
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  // Створюємо фічу, якої немає у Моніки — пункт у контекстному меню
  chrome.contextMenus.create({
    id: "explainWithGemini",
    title: "Пояснити через Gemini Nano",
    contexts: ["selection"] // Показувати меню тільки тоді, коли виділено текст
  });
});

// 2. Обробка кліку по правій кнопці миші (Контекстне меню)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainWithGemini" && info.selectionText) {
    sendTextToSidePanel(tab.id, info.selectionText);
  }
});

// 3. Обробка повідомлень від плаваючої кнопки (з файлу content.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSidePanelWithText" && message.text) {
    sendTextToSidePanel(sender.tab.id, message.text);
  }
});

// Допоміжна функція: відкриває сайдбар і передає туди текст
function sendTextToSidePanel(tabId, text) {
  chrome.sidePanel.open({ tabId: tabId }).then(() => {
    // Невеликий таймаут (400мс), щоб сайдбар встиг ініціалізуватися в пам'яті, якщо він був закритий
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: "insertPrompt",
        text: text
      });
    }, 400);
  });
}