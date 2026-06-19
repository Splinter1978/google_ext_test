const loginBtn = document.getElementById('loginBtn');
const authBlock = document.getElementById('authBlock');
const mainBlock = document.getElementById('mainBlock');
const userInfo = document.getElementById('userInfo');

loginBtn.addEventListener('click', () => {
  // Хром сам відкриє вікно згоди, без редіректів та сторонніх вікон
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError) {
      alert('Помилка входу: ' + chrome.runtime.lastError.message);
      return;
    }
    
    // Отримуємо дані профілю користувача за допомогою токена
    fetch(`https://www.googleapis.com/oauth2/gaiahub/v1/userinfo`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(user => {
      authBlock.classList.add('hidden');
      mainBlock.classList.remove('hidden');
      userInfo.innerHTML = `<p>Вітаємо, <b>${user.name}</b> (${user.email})</p>`;
    });
  });
});

// --- ЛОГІКА ПОШУКУ ---
const searchInp = document.getElementById('searchInp');
const mySite = "example.com"; // Зміни на свій сайт

document.getElementById('searchWebBtn').addEventListener('click', () => {
  const query = encodeURIComponent(searchInp.value.trim());
  chrome.tabs.create({ url: `https://www.google.com/search?q=${query}` });
});

document.getElementById('searchSiteBtn').addEventListener('click', () => {
  const query = encodeURIComponent(`${searchInp.value.trim()} site:${mySite}`);
  chrome.tabs.create({ url: `https://www.google.com/search?q=${query}` });
});


// --- ЛОГІКА ВБУДОВАНОГО ШІ (Gemini Nano) ---
const aiInp = document.getElementById('aiInp');
const chatBox = document.getElementById('chatBox');
const botSelector = document.getElementById('botSelector');

document.getElementById('aiBtn').addEventListener('click', async () => {
  const text = aiInp.value.trim();
  if (!text) return;

  chatBox.innerHTML += `<div><b>Ви:</b> ${text}</div>`;
  aiInp.value = '';

  // Перевірка, чи доступний локальний ШІ в Хромі
  if (!window.ai || (await ai.languageModel.capabilities()).available === "no") {
    chatBox.innerHTML += `<div style="color:red;"><b>ШІ:</b> Локальний Gemini Nano не увімкнено в налаштуваннях вашого Chrome.</div>`;
    return;
  }

  try {
    // Створюємо сесію з системною інструкцією (роллю бота) з селектора
    const session = await ai.languageModel.create({
      systemInstruction: botSelector.value
    });

    // Генеруємо відповідь локально
    const response = await session.prompt(text);
    chatBox.innerHTML += `<div><b>Помічник:</b> ${response}</div>`;
    
    // Закриваємо сесію для звільнення оперативної пам'яті
    session.destroy();
  } catch (err) {
    chatBox.innerHTML += `<div style="color:red;"><b>Помилка ШІ:</b> ${err.message}</div>`;
  }
  
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Слухаємо повідомлення від фонового скрипту (background.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "insertPrompt" && message.text) {
    const aiInp = document.getElementById('aiInp');
    const botSelector = document.getElementById('botSelector');
    
    if (aiInp) {
      // Формуємо гарний промпт для ШІ. 
      // Можна також автоматично перемикати роль бота, якщо потрібно
      aiInp.value = `Проаналізуй або поясни цей фрагмент тексту:\n"${message.text}"`;
      
      // Автоматично тицяємо на кнопку "Запитати", щоб користувач не робив зайвих кліків!
      const aiBtn = document.getElementById('aiBtn');
      if (aiBtn) aiBtn.click();
    }
  }
});