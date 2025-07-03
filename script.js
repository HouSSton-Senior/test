// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  initPortraitSwitcher();
  updateVisibleCards();
});

function initPortraitSwitcher() {
  const switcher = document.querySelector('.spreads-menu');
  
  if (!switcher) {
    console.error('Контейнер переключения портретов не найден!');
    return;
  }
  
  switcher.addEventListener('click', function(e) {
    const card = e.target.closest('.spread-card');
    if (!card) return;
    
    // Переключение активного состояния
    document.querySelectorAll('.spread-card').forEach(c => {
      c.classList.remove('active');
    });
    card.classList.add('active');
    
    // Обновление интерфейса
    updateTitle(card.getAttribute('data-spread'));
    updateVisibleCards();
    
    // Пересчёт если дата уже введена
    const birthDate = document.getElementById('birthDate').value;
    if (birthDate && isValidDate(birthDate)) {
      calculatePortrait();
    }
  });
}

function updateTitle(spreadType) {
  const titles = {
    individual: '🔮 Индивидуальный портрет личности',
    shadow: '🌑 Теневой портрет личности', 
    karma: '🔄 Кармический портрет личности'
  };
  
  const titleElement = document.querySelector('.container h1');
  if (titleElement) {
    titleElement.textContent = titles[spreadType] || titles.individual;
  }
}

function updateVisibleCards() {
  const activeCard = document.querySelector('.spread-card.active');
  if (!activeCard) return;
  
  const positions = activeCard.getAttribute('data-positions');
  if (!positions) {
    console.error('Не найдены позиции для активного портрета');
    return;
  }
  
  const positionsToShow = positions.split(',');
  
  // Сначала скрываем все
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = 'none';
  });
  
  // Затем показываем нужные
  positionsToShow.forEach(pos => {
    const cardId = `pos${pos}-card`;
    const cardElement = document.getElementById(cardId);
    
    if (cardElement) {
      cardElement.style.display = 'block';
    } else {
      console.warn(`Карточка с ID ${cardId} не найдена`);
    }
  });
}
document.addEventListener('DOMContentLoaded', async function() {
  // Загрузка данных из JSON
  let arcanaData = [];
  try {
    const response = await fetch('arcana.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    arcanaData = data.arcana;
    
    if (!arcanaData || !arcanaData.length) {
      throw new Error('No arcana data loaded');
    }
  } catch (error) {
    console.error('Ошибка загрузки arcana.json:', error);
    alert('Ошибка загрузки данных. Пожалуйста, перезагрузите страницу.');
    return;
  }

  // Глобальные переменные для хранения даты
  let currentDay, currentMonth, currentYear;

  // Функция для получения значения карты
 function getCardMeaning(card, position, spreadType) {
  if (!card || !card.meanings) return 'Нет информации';
  
  const meanings = card.meanings[spreadType];
  if (!meanings) return 'Нет информации';
  
  // Проверяем наличие специального значения для позиции
  const posKey = position.toString(); // Преобразуем в строку для поиска
  if (meanings[posKey] !== undefined && meanings[posKey].trim() !== '') {
    return meanings[posKey];
  }
  
  // Для числовых позиций проверяем без точки (например, 4.1)
  if (position.includes('.')) {
    const mainPos = position.split('.')[0];
    if (meanings[mainPos] !== undefined && meanings[mainPos].trim() !== '') {
      return meanings[mainPos];
    }
  }
  
  return meanings.default || 'Нет информации';
}

  // Функция отображения результата
  function showResult(elementId, cardNum, posNum) {
    const card = arcanaData.find(c => c.id === cardNum);
    if (!card) {
      console.error(`Карта с id ${cardNum} не найдена`);
      return;
    }
    
    const spreadType = document.querySelector('.spread-card.active')?.getAttribute('data-spread') || 'individual';
    const meaning = getCardMeaning(card, posNum, spreadType);
    
    // Специальная обработка для позиции 2.1 (показываем номер месяца)
    const displayNumber = posNum === '2.1' ? (currentMonth > 12 ? currentMonth - 12 : currentMonth) : cardNum;
    
    const html = `
      <h4>${card.name} <span class="arcana-number">${displayNumber}</span></h4>
      <p class="arcana-meaning"><strong>${meaning}</strong></p>
      ${spreadType === 'shadow' ? 
        `<p class="shadow-aspect"><em>Теневая сторона: ${card.meanings.shadow?.default || 'нет информации'}</em></p>` : ''}
    `;
    
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    } else {
      console.error(`Элемент с id ${elementId} не найден`);
    }
  }

  // Функция расчета карты (0-21)
  function calculateCard(num) {
    if (isNaN(num) || !isFinite(num)) return 0;
    let result = num % 22;
    return result === 0 ? 0 : result; // Явно возвращаем 0 для кратных 22
  }

  // Функция расчета всех позиций
  function calculateAllPositions(day, month, year) {
    const positions = {};
    
    // Сохраняем дату в глобальные переменные
    currentDay = day;
    currentMonth = month;
    currentYear = year;
    
    // Основные позиции
    positions[1] = calculateCard(day);
    positions[2] = calculateCard(month);
    const yearSum = String(year).split('').reduce((sum, d) => sum + Number(d), 0);
    positions[3] = calculateCard(yearSum);
    
    // Индивидуальный портрет
    positions[4] = calculateCard(positions[1] + positions[2]);
    positions[5] = calculateCard(positions[2] + positions[3]);
    positions[6] = calculateCard(positions[4] + positions[5]);
    positions[7] = calculateCard(positions[1] + positions[5]);
    positions[8] = calculateCard(positions[2] + positions[6]);
    positions[12] = calculateCard(positions[7] + positions[8]);
    positions[13] = calculateCard(positions[1] + positions[4] + positions[6]);
    positions[14] = calculateCard(positions[3] + positions[5] + positions[6]);
    
    // Теневой портрет
    positions['4.1'] = calculateCard(positions[1] * positions[2]);
    positions[22] = calculateCard(positions[1] + positions[4]);
    positions[23] = calculateCard(positions[2] + positions[4]);
    positions[24] = calculateCard(positions[2] + positions[5]);
    positions[25] = calculateCard(positions[3] + positions[5]);
    positions[26] = calculateCard(positions[4] + positions[6]);
    positions[27] = calculateCard(positions[5] + positions[6]);
    positions[28] = calculateCard(positions[24] + positions[25]);
    positions['28.1'] = calculateCard(positions[23] + positions[27]);
    positions[29] = calculateCard(positions[22] + positions[26]);
    
    // Кармический портрет
    positions['2.1'] = month > 12 ? month - 12 : month; // Для позиции 2.1 (1-12)
    positions[9] = calculateCard(Math.abs(positions[1] - positions[2]));
    positions[10] = calculateCard(Math.abs(positions[2] - positions[3]));
    positions[11] = calculateCard(Math.abs(positions[9] - positions[10]));
    positions[15] = calculateCard(positions[9] + positions[10] + positions[11] - positions[7]);
    positions['15.1'] = calculateCard(positions[11] - positions[13]);
    positions[16] = calculateCard(positions[1] + positions[4] + positions[5] + positions[3]);
    positions[17] = calculateCard(positions[11] + positions[6]);
    positions[18] = calculateCard(positions[11] + positions[8]);
    
    return positions;
  }

  // Функция для обновления видимых карточек
  function updateVisibleCards() {
  const activeCard = document.querySelector('.spread-card.active');
  if (!activeCard) return;
  
  const positionsToShow = activeCard.getAttribute('data-positions').split(',');
  
  // Скрываем все карточки
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = 'none';
    card.style.opacity = '0';
  });
  
  // Показываем нужные карточки с анимацией
  positionsToShow.forEach(pos => {
    const card = document.getElementById(`pos${pos}-card`);
    if (card) {
      card.style.display = 'block';
      setTimeout(() => {
        card.style.opacity = '1';
      }, 50);
    }
  });
}


  // Функция расчета портрета
  function calculatePortrait() {
    const btn = document.getElementById('calculateBtn');
    if (!btn) {
      console.error('Кнопка расчета не найдена');
      return;
    }
    
    btn.classList.add('loading');
    
    setTimeout(() => {
      try {
        const dateStr = document.getElementById('birthDate').value;
        if (!dateStr) {
          alert('Введите дату рождения');
          return;
        }

        if (!isValidDate(dateStr)) {
          alert('Некорректная дата! Проверьте формат: ДД.ММ.ГГГГ');
          return;
        }

        const [day, month, year] = dateStr.split('.').map(Number);
        const positions = calculateAllPositions(day, month, year);
        const activeCard = document.querySelector('.spread-card.active');
        
        if (!activeCard) {
          console.error('Не выбран тип портрета');
          return;
        }
        
        const positionsToShow = activeCard.getAttribute('data-positions').split(',');

        // Отображаем результаты для активного портрета
        positionsToShow.forEach(pos => {
          const key = pos.includes('.') ? pos : parseInt(pos);
          if (positions[key] !== undefined) {
            showResult(`pos${pos}-result`, positions[key], pos);
          } else {
            console.warn(`Позиция ${pos} не найдена в расчетах`);
          }
        });

      } catch (error) {
        console.error('Ошибка расчета:', error);
        alert('Ошибка расчета');
      } finally {
        btn.classList.remove('loading');
      }
    }, 800);
  }

  // Функция проверки даты
  function isValidDate(dateString) {
    const parts = dateString.split('.');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    if (month < 1 || month > 12) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
  }

  // Инициализация календаря
  const datePicker = flatpickr("#birthDate", {
    maxDate: "today",
    locale: "ru",
    allowInput: true,
    clickOpens: true,
    onReady: function(selectedDates, dateStr, instance) {
      instance.input.removeAttribute('readonly');
      
      instance.input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d]/g, '');
        
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
          if (i === 2 || i === 4) formatted += '.';
          formatted += value[i];
          if (formatted.length >= 10) break;
        }
        
        e.target.value = formatted;
        
        if (formatted.length === 10 && !isValidDate(formatted)) {
          e.target.classList.add('error');
        } else {
          e.target.classList.remove('error');
        }
      });
    }
  });

  // Переключение между портретами
  document.querySelectorAll('.spread-card').forEach(card => {
    card.addEventListener('click', function() {
      document.querySelectorAll('.spread-card').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      updateVisibleCards();
      calculatePortrait();
    });
  });

  // Переключение описаний карточек
  document.querySelectorAll('.toggle-description').forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.card');
      if (!card) return;
      
      const description = card.querySelector('.full-description');
      if (!description) return;
      
      if (description.classList.contains('hidden')) {
        description.classList.remove('hidden');
        description.classList.add('show');
        this.textContent = 'Скрыть описание';
      } else {
        description.classList.remove('show');
        description.classList.add('hidden');
        this.textContent = 'Показать описание';
      }
    });
  });

  // Инициализация кнопки расчета
  const calculateBtn = document.getElementById('calculateBtn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculatePortrait);
  } else {
    console.error('Кнопка расчета не найдена');
  }

  // Обработка Enter
  const birthDateInput = document.getElementById('birthDate');
  if (birthDateInput) {
    birthDateInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        calculatePortrait();
      }
    });
  }

  // Инициализация видимых карточек
  updateVisibleCards();
});

// Matrix Background код (без изменений)
document.addEventListener('DOMContentLoaded', function() {
  // Расширенный набор символов (120 элементов)
  const symbols = [
    "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚻ", 
    "ᚾ", "ᚿ", "ᛁ", "ᛂ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛋ",
    "ᛌ", "ᛍ", "ᛎ", "ᛏ", "ᛐ", "ᛑ", "ᛒ", "ᛓ", "ᛔ", "ᛕ",
    "☉", "☿", "♀", "♁", "♂", "♃", "♄", "♅", "♆", "♇",
    "🜀", "🜁", "🜂", "🜃", "🜄", "🜅", "🜆", "🜇", "🜈", "🜉",
    "𓀀", "𓀁", "𓀂", "𓀃", "𓀄", "𓀅", "𓀆", "𓀇", "𓀈", "𓀉",
    "☥", "𓂀", "☤", "⚚", "🕉", "ॐ", "✡", "☯", "☮", "☸",
    "꧁", "꧂", "✺", "✹", "✸", "✷", "✶", "✵", "✴", "✳",
    "✲", "✱", "✰", "✦", "✧", "✩", "✪", "✫", "✬", "✭",
    "⚕", "⚖", "⚗", "⚘", "⚙", "⚚", "⚛", "⚜", "⚝", "⚞",
    "⚟", "⚠", "⚡", "⚢", "⚣", "⚤", "⚥", "⚦", "⚧", "⚨",
    "⚩", "⚪", "⚫", "⚬", "⚭", "⚮", "⚯", "⚰", "⚱", "⚲",
    "✡️","🔮","🜁","🜂","🜃","🜄","🜅","🜆","🜇","🜈",
    "⚕️","⚖️","🔯","🕉️","☥","☬","☸️","☯️","☦️","✝️",
    "☪️","☫️","☬️",
    "⚗️","🔱","🔺","🔻","🔸","🔹","🔶","🔷",
    "⚖️","⚙️","⚔️","⚰️","⚱️","⚖️",
    "🕎","✠","✡︎ ","✦ ","✧ ","✩ ","✪ ","✫ ","✬ ","✭ ",
    "☀️ ","🌙 ","⭐ ","✨ ",
    "🔥 ","💧 ","🌟 ","🌈 ","🌪️ ","🌊 ","🌬️ ",
    "🔮 ","📿 ","🧙‍♂️ ","🧙‍♀️ ","🧙‍♂️‍♀️ ","𓀀","𓁐","𓂀","𓃰","𓄿","𓅓",
    "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚻ",
    "ᚾ", "ᚿ", "ᛁ", "ᛂ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛋ",
    "ᛌ", "ᛍ", "ᛎ", "ᛏ", "ᛐ", "ᛑ", "ᛒ", "ᛓ", "ᛔ", "ᛕ",
    "☉", "☿", "♀", "♁", "♂", "♃", "♄", "♅", "♆", "♇"
  ];

  const colors = [
    "#20c20e", "#ff0000", "#00a2ff", "#ffffff", 
    "#ffd700", "#9400d3", "#ff00ff", "#00ffff",
    "#4b0082", "#ff8c00", "#7cfc00", "#ff1493"
  ];

  const container = document.querySelector('.matrix-background');
  let symbolsCount = 0;
  const maxSymbols = 100; //изменять количество символов

   function createSymbol() {
  if (symbolsCount >= maxSymbols) return;
  
  const symbol = document.createElement('div');
  symbol.className = 'matrix-symbol';
  
  // Размер и прозрачность
  const size = Math.round((0.5 + Math.random() * 4.5) * 16);
  const opacity = 0.4 + Math.random() * 0.6;

  // Генерация позиций (50% с краёв, 50% внутри экрана)
  let startX, startY;
  if (Math.random() > 0.5) {
    const edge = Math.floor(Math.random() * 4);
    const padding = 50;
    startX = edge % 2 ? 
      (edge === 1 ? window.innerWidth + padding : -padding) : 
      Math.random() * window.innerWidth;
    startY = edge % 2 ? 
      Math.random() * window.innerHeight : 
      (edge === 0 ? -padding : window.innerHeight + padding);
  } else {
    startX = Math.random() * window.innerWidth;
    startY = Math.random() * window.innerHeight;
  }

  // Случайное направление и скорость
  const angle = Math.random() * Math.PI * 2;
  const distance = 200 + Math.random() * 600;
  const duration = 4 + Math.random() * 8; // 4-12 секунд

  const endX = startX + Math.cos(angle) * distance;
  const endY = startY + Math.sin(angle) * distance;

  // Настройка элемента
  symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  symbol.style.cssText = `
    --symbol-size: ${size}px;
    --start-x: ${startX}px;
    --start-y: ${startY}px;
    --end-x: ${endX}px;
    --end-y: ${endY}px;
    --start-rotation: ${(Math.random() - 0.5) * 360}deg;
    --end-rotation: ${(Math.random() - 0.5) * 360}deg;
    --max-opacity: ${opacity};
    color: ${colors[Math.floor(Math.random() * colors.length)]};
    animation-duration: ${duration}s;
  `;

  container.appendChild(symbol);
  symbolsCount++;

  // Автоматический респавн при завершении анимации
  symbol.addEventListener('animationend', () => {
    symbol.remove();
    symbolsCount--;
    createSymbol(); // Создаём новый символ вместо исчезнувшего
  });
}
 // Инициализация
function startAnimation() {
  // Первоначальное заполнение
  for (let i = 0; i < 10; i++) createSymbol();
  
  // Постоянное добавление новых символов
  const intervalId = setInterval(createSymbol, 30);
  
  // Обработчик ресайза
  window.addEventListener('resize', () => {
    clearInterval(intervalId);
    document.querySelectorAll('.matrix-symbol').forEach(el => el.remove());
    symbolsCount = 0;
    startAnimation();
  });
}

startAnimation();
});
