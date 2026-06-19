let floatBtn = null;

document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  // Якщо користувач дійсно виділив текст
  if (selectedText.length > 0 && selection.rangeCount > 0) {
    
    // Отримуємо точні координати виділеного блоку тексту
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (!floatBtn) {
      floatBtn = document.createElement('button');
      floatBtn.innerText = "🤖";
      
      Object.assign(floatBtn.style, {
        position: 'absolute',
        zIndex: '9999999',
        backgroundColor: '#4285f4', // Чистий Google-синій
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        fontSize: '14px',
        display: 'none',
        transition: 'transform 0.1s ease'
      });
      
      floatBtn.onmouseenter = () => floatBtn.style.transform = 'scale(1.1)';
      floatBtn.onmouseleave = () => floatBtn.style.transform = 'scale(1.0)';
      
      document.body.appendChild(floatBtn);
    }
    
    // ІДЕАЛЬНЕ ПОЗИЦІОНУВАННЯ:
    // rect.left — ліва межа тексту, rect.top — верхня межа.
    // Додаємо window.scroll, щоб врахувати прокрутку сторінки.
    // Зсуваємо кнопку трохи лівіше (-15px) та вище (-25px) від початку першого слова.
    floatBtn.style.left = `${rect.left + window.scrollX - 15}px`;
    floatBtn.style.top = `${rect.top + window.scrollY - 25}px`;
    floatBtn.style.display = 'block';
    
    floatBtn.dataset.selectedText = selectedText;
  } else {
    hideButton();
  }
});

// Обробка кліку по кнопці-роботу
document.addEventListener('mousedown', (e) => {
  if (floatBtn && e.target === floatBtn) {
    e.preventDefault(); // Щоб виділення тексту не зникло при кліку
    const textToSend = floatBtn.dataset.selectedText;
    
    chrome.runtime.sendMessage({
      action: "openSidePanelWithText",
      text: textToSend
    });
    
    hideButton();
  } else if (floatBtn && e.target !== floatBtn) {
    hideButton();
  }
});

function hideButton() {
  if (floatBtn) floatBtn.style.display = 'none';
}