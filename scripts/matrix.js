const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

// Настройки
const characters = '01';
const charArray = characters.split('');
const fontSize = 16;
let canvasW = 0;
let canvasH = 0;
let columns = 0;
let rows = 2;

// Активные 'капли' по столбцам: 0 - неактивен, >0 - текущая строка
let activeDrops = [];

// Таймер появления новых столбцов (1 столбец в секунду)
const spawnInterval = 1000;
let lastSpawn = 0;

let rafId = null;
let running = true;

function resize() {
    canvasW = window.innerWidth;
    canvasH = window.innerHeight;
    canvas.width = canvasW;
    canvas.height = canvasH;
    columns = Math.floor(canvasW / fontSize);
    rows = Math.floor(canvasH / fontSize);
    activeDrops = new Array(columns).fill(0);
    ctx.font = fontSize + 'px monospace';
    ctx.textBaseline = 'top';
}

function spawnColumn() {
    if (columns === 0) return;
    // Найти случайный свободный столбец
    const freeIndexes = [];
    for (let i = 0; i < columns; i++) if (activeDrops[i] === 0) freeIndexes.push(i);
    if (freeIndexes.length === 0) return;
    const idx = freeIndexes[Math.floor(Math.random() * freeIndexes.length)];
    activeDrops[idx] = 1 + Math.floor(Math.random() * 3); // старт чуть выше
}

function clearFrame() {
    // Полупрозрачная заливка для шлейфа
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, 0, canvasW, canvasH);
}

function drawFrame(timestamp) {
    if (!running) return;

    if (!lastSpawn) lastSpawn = timestamp;
    if (timestamp - lastSpawn >= spawnInterval) {
        spawnColumn();
        lastSpawn = timestamp;
    }

    clearFrame();

    // Рисуем только активные столбцы
    for (let i = 0; i < columns; i++) {
        const drop = activeDrops[i];
        if (drop > 0) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = drop * fontSize;

            // Голова столбца — светлее, хвост не рисуем отдельно, шлейф создаётся заливкой
            ctx.fillStyle = 'rgba(16,255,16,0.95)';
            ctx.fillText(char, x, y);

            activeDrops[i]++;

            // Если столбец ушёл за экран или превысил длину — деактивируем
            if (activeDrops[i] * fontSize > canvasH + fontSize || activeDrops[i] > rows + 20) {
                activeDrops[i] = 0;
            }
        }
    }

    rafId = requestAnimationFrame(drawFrame);
}

function start() {
    if (rafId) cancelAnimationFrame(rafId);
    running = true;
    lastSpawn = 0;
    rafId = requestAnimationFrame(drawFrame);
}

function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
}

// Visibility API: при скрытии страницы — приостанавливаем анимацию
document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
});

window.addEventListener('resize', () => {
    resize();
});

// Инициализация
resize();
// Немного затемним холст сразу, чтобы не было яркого флеша
ctx.fillStyle = 'rgba(0,0,0,1)';
ctx.fillRect(0, 0, canvasW, canvasH);
start();