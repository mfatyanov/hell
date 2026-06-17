/* ============================================================
   Приглашение на свидание — логика квеста
   ============================================================ */

// --- Настройки (можно менять) ---
const CONFIG = {
  enableRunaway: true, // кнопка «Нет» убегает от курсора
  telegramBotToken: 'PASTE_BOT_TOKEN_HERE',
  telegramChatId: 'PASTE_CHAT_ID_HERE',
};

const RESTAURANTS = [
  { key: 'it', emoji: '🍕', name: 'Италия' },
  { key: 'su', emoji: '🍣', name: 'Суши' },
  { key: 'bu', emoji: '🍔', name: 'Бургеры' },
  { key: 'as', emoji: '🍜', name: 'Азия' },
  { key: 'de', emoji: '🍰', name: 'Кафе & десерты' },
  { key: 'ro', emoji: '🍷', name: 'Романтик ужин' },
];

const TIMES = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

// --- Состояние ---
const state = {
  step: 0,
  restaurant: null,
  time: null,
};

// --- Ссылки на DOM ---
const steps = [...document.querySelectorAll('.step')];
const dots = [...document.querySelectorAll('#progress .dot')];
const modal = document.getElementById('modal');
const btnNo = document.getElementById('btnNo');

// ============================================================
//  Навигация по шагам
// ============================================================
function goToStep(n) {
  state.step = n;
  steps.forEach((el) => {
    el.hidden = Number(el.dataset.step) !== n;
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === n);
    dot.classList.toggle('done', i < n);
  });
  if (n === 3) launchConfetti();
}

// ============================================================
//  Шаг 1 — кнопка «Нет», которая убегает
// ============================================================
function dodgeNo() {
  if (!CONFIG.enableRunaway) return;
  const x = (Math.random() * 2 - 1) * 120;
  const y = (Math.random() * 2 - 1) * 70;
  btnNo.style.transform = `translate(${x}px, ${y}px)`;
}
btnNo.addEventListener('mouseenter', dodgeNo);

// ============================================================
//  Шаг 2 — карточки ресторанов
// ============================================================
function renderRestaurants() {
  const grid = document.getElementById('restGrid');
  grid.innerHTML = '';
  RESTAURANTS.forEach((r) => {
    const tile = document.createElement('button');
    tile.className = 'tile';
    tile.type = 'button';
    tile.innerHTML = `
      <span class="check">✓</span>
      <span class="tile-emoji">${r.emoji}</span>
      <span class="tile-name">${r.name}</span>`;
    tile.addEventListener('click', () => {
      state.restaurant = r;
      [...grid.children].forEach((c) => c.classList.remove('selected'));
      tile.classList.add('selected');
      document.getElementById('restNext').hidden = false;
    });
    grid.appendChild(tile);
  });
}

// ============================================================
//  Шаг 3 — пилюли времени
// ============================================================
function renderTimes() {
  const wrap = document.getElementById('timePills');
  wrap.innerHTML = '';
  TIMES.forEach((t) => {
    const pill = document.createElement('button');
    pill.className = 'pill';
    pill.type = 'button';
    pill.textContent = t;
    pill.addEventListener('click', () => {
      state.time = t;
      [...wrap.children].forEach((c) => c.classList.remove('selected'));
      pill.classList.add('selected');
      document.getElementById('timeNext').hidden = false;
    });
    wrap.appendChild(pill);
  });
}

// ============================================================
//  Финал — заполнение резюме
// ============================================================
function fillSummary() {
  document.getElementById('sumRest').textContent =
    `${state.restaurant.emoji} ${state.restaurant.name}`;
  document.getElementById('sumTime').textContent = `в ${state.time} 💕`;
}

// ============================================================
//  Отправка ответа в Telegram
// ============================================================
function sendToTelegram() {
  const { telegramBotToken, telegramChatId } = CONFIG;
  if (!telegramBotToken || telegramBotToken.startsWith('PASTE_')) return;

  const text =
    `💌 Она согласилась на свидание!\n` +
    `${state.restaurant.emoji} Ресторан: ${state.restaurant.name}\n` +
    `🕐 Время: ${state.time}`;

  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: telegramChatId, text }),
  }).catch((err) => console.error('Telegram send failed:', err));
}

// ============================================================
//  Конфетти
// ============================================================
function launchConfetti() {
  const layer = document.getElementById('confetti');
  layer.innerHTML = '';
  const chars = ['💖', '🎉', '💕', '✨', '💗', '🌸', '💘', '🩷'];
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('span');
    s.textContent = chars[Math.floor(Math.random() * chars.length)];
    s.style.left = (Math.random() * 100).toFixed(2) + '%';
    s.style.fontSize = (14 + Math.random() * 22).toFixed(0) + 'px';
    s.style.animationDuration = (3 + Math.random() * 3.5).toFixed(2) + 's';
    s.style.animationDelay = (Math.random() * 2.5).toFixed(2) + 's';
    layer.appendChild(s);
  }
}

// ============================================================
//  Сброс
// ============================================================
function restart() {
  state.restaurant = null;
  state.time = null;
  document.getElementById('restNext').hidden = true;
  document.getElementById('timeNext').hidden = true;
  document.getElementById('confetti').innerHTML = '';
  btnNo.style.transform = '';
  renderRestaurants();
  renderTimes();
  goToStep(0);
}

// ============================================================
//  Делегирование кликов по data-action
// ============================================================
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  switch (el.dataset.action) {
    case 'yes':       goToStep(1); break;
    case 'no':        modal.hidden = false; break;
    case 'modal-yes': modal.hidden = true; goToStep(1); break;
    case 'to-time':   goToStep(2); break;
    case 'to-final':  fillSummary(); goToStep(3); break;
    case 'restart':   restart(); break;
  }
});

// --- Инициализация ---
renderRestaurants();
renderTimes();
goToStep(0);
