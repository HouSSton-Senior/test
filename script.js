document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const birthDateInput = document.getElementById('birthDate');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultSection = document.getElementById('result');
    const spreadCards = document.querySelectorAll('.spread-card');
    
    // Variables
    let currentSpread = 'individual';
    let arcanaData = [];
    let calculatedPositions = {};
    
    // Initialize date picker
    flatpickr(birthDateInput, {
        dateFormat: "d.m.Y",
        locale: "ru",
        maxDate: new Date(),
        allowInput: true
    });
    
    // Load arcana data from JSON
    fetch('arcana.json')
        .then(response => response.json())
        .then(data => {
            arcanaData = data.arcana;
            console.log('Arcana data loaded successfully');
        })
        .catch(error => {
            console.error('Error loading arcana data:', error);
        });
    
    // Spread selection
    spreadCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            spreadCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Update current spread
            currentSpread = this.dataset.spread;
            
            // Re-display results if already calculated
            if (Object.keys(calculatedPositions).length > 0) {
                displayResults(calculatedPositions);
            }
        });
    });
    
    // Calculate button click handler
    calculateBtn.addEventListener('click', function() {
        // Validate input
        const dateStr = birthDateInput.value;
        if (!dateStr || !isValidDate(dateStr)) {
            birthDateInput.classList.add('error');
            return;
        }
        
        birthDateInput.classList.remove('error');
        
        // Parse date
        const [day, month, year] = dateStr.split('.').map(Number);
        
        // Calculate positions
        calculatedPositions = calculatePositions(day, month, year);
        
        // Display results
        displayResults(calculatedPositions);
    });
    
    // Toggle description buttons
    document.querySelectorAll('.toggle-description').forEach(button => {
        button.addEventListener('click', function() {
            const description = this.previousElementSibling;
            description.classList.toggle('hidden');
            
            // Update button text
            this.textContent = description.classList.contains('hidden') 
                ? 'Показать описание' 
                : 'Скрыть описание';
        });
    });
    
    // Helper function to validate date
    function isValidDate(dateStr) {
        const regex = /^\d{2}\.\d{2}\.\d{4}$/;
        if (!regex.test(dateStr)) return false;
        
        const [day, month, year] = dateStr.split('.').map(Number);
        const date = new Date(year, month - 1, day);
        
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }
    
    // Calculate all positions based on birth date
    function calculatePositions(day, month, year) {
        // Calculate basic positions
        const pos1 = normalizeArcana(day);      // Day of birth
        const pos2 = normalizeArcana(month);    // Month of birth
        const pos3 = normalizeArcana(sumDigits(year)); // Year of birth
        
        // Calculate derived positions
        const pos4 = normalizeArcana(pos1 + pos2);
        const pos5 = normalizeArcana(pos2 + pos3);
        const pos6 = normalizeArcana(pos4 + pos5);
        const pos7 = normalizeArcana(pos1 + pos5);
        const pos8 = normalizeArcana(pos2 + pos6);
        const pos9 = normalizeArcana(Math.abs(pos1 - pos2));
        const pos10 = normalizeArcana(Math.abs(pos2 - pos3));
        const pos11 = normalizeArcana(Math.abs(pos9 - pos10));
        
        const pos12 = normalizeArcana(pos7 + pos8);
        const pos13 = normalizeArcana(pos1 + pos4 + pos6);
        const pos14 = normalizeArcana(pos3 + pos5 + pos6);
        const pos15 = normalizeArcana(pos9 + pos10 + pos11 - pos7);
        const pos15_1 = normalizeArcana(Math.abs(pos11 - pos13));
        const pos16 = normalizeArcana(pos1 + pos4 + pos5 + pos3);
        const pos17 = normalizeArcana(pos11 + pos6);
        const pos18 = normalizeArcana(pos11 + pos8);
        const pos19 = normalizeArcana(pos4 + pos6);
        const pos20 = normalizeArcana(pos5 + pos6);
        const pos21 = normalizeArcana(pos1 + pos2 + pos3 + pos4 + pos5 + pos6);
        const pos22 = normalizeArcana(pos1 + pos4);
        const pos23 = normalizeArcana(pos2 + pos4);
        const pos24 = normalizeArcana(pos2 + pos5);
        const pos25 = normalizeArcana(pos3 + pos5);
        const pos26 = normalizeArcana(pos4 + pos6);
        const pos27 = normalizeArcana(pos5 + pos6);
        const pos28 = normalizeArcana(pos24 + pos25);
        const pos28_1 = normalizeArcana(pos23 + pos27);
        const pos29 = normalizeArcana(pos22 + pos26);
        
        return {
            pos1, pos2, pos3, pos4, pos5, pos6, pos7, pos8, pos9, pos10, pos11,
            pos12, pos13, pos14, pos15, pos15_1, pos16, pos17, pos18, pos19, pos20,
            pos21, pos22, pos23, pos24, pos25, pos26, pos27, pos28, pos28_1, pos29
        };
    }
    
    // Normalize arcana number (1-21, 0 for 22)
    function normalizeArcana(number) {
        if (number === 0) return 0;
        if (number <= 22) return number === 22 ? 0 : number;
        
        let result = number;
        while (result > 22) {
            result -= 22;
        }
        return result === 22 ? 0 : result;
    }
    
    // Sum digits of a number
    function sumDigits(number) {
        return String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
    }
    
    // Display results on the page
    function displayResults(positions) {
        // For each position (1-14), display the corresponding arcana
        for (let i = 1; i <= 14; i++) {
            const positionKey = `pos${i}`;
            const arcanaId = positions[positionKey];
            const arcana = arcanaData.find(a => a.id === arcanaId) || arcanaData[0]; // Fallback to Fool if not found
            
            // Get the meaning for this position and spread
            let meaning = arcana.meanings[currentSpread][i] || 
                          arcana.meanings[currentSpread]['default'] || 
                          'Описание отсутствует';
            
            // Special handling for positions with decimal points (like 15.1)
            if (i === 15 && positionKey === 'pos15_1') {
                meaning = arcana.meanings[currentSpread]['15.1'] || 
                          arcana.meanings[currentSpread]['default'] || 
                          'Описание отсутствует';
            }
            
            // Update the DOM
            const resultElement = document.getElementById(`${positionKey}-result`);
            if (resultElement) {
                resultElement.innerHTML = `
                    <h4>${arcana.name} <span class="arcana-number">${arcanaId === 0 ? 22 : arcanaId}</span></h4>
                    <p>${meaning}</p>
                `;
            }
        }
    }
    
    // Design and animations can be added here
    function initDesignElements() {
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

    }
    
    // Initialize design elements
    initDesignElements();
});

// Matrix Background код (без изменений)
