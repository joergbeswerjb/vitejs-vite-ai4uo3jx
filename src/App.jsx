import { useState, useEffect, useRef, useMemo } from "react";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwxZKU5KNXZDWpESG1NinBrWhInlAQ1Cqp0g71WZbuRF3XcPhmb_JEtf6cXykVb5d-m/exec";

const sendToSheets = async (payload) => {
  try {
    await fetch(SHEETS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  } catch (e) { console.error("Sheets error", e); }
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const RAW_QUESTIONS = [
  // Числовая логика (8)
  { type: "numeric", q: "Ряд: 1, 2, 6, 24, 120, ?", options: ["240", "720", "600", "360"], ans: 1 },
  { type: "numeric", q: "Если за 5 дней 5 станков производят 5 деталей, сколько деталей произведут 100 станков за 100 дней?", options: ["100", "500", "1000", "2000"], ans: 3 },
  { type: "numeric", q: "Лилипад удваивается каждый день и покрывает пруд за 48 дней. За сколько дней он покроет половину пруда?", options: ["24", "47", "36", "32"], ans: 1 },
  { type: "numeric", q: "Верёвка делит площадь круга пополам. Сколько максимум частей можно получить из круга двумя верёвками?", options: ["3", "4", "5", "6"], ans: 1 },
  { type: "numeric", q: "Батарейка теряет 20% заряда каждый час. Через сколько часов останется менее 50% от начального заряда?", options: ["2", "3", "4", "5"], ans: 1 },
  { type: "numeric", q: "Ряд: 2, 3, 5, 8, 13, 21, ? Что следует?", options: ["29", "32", "34", "36"], ans: 2 },
  { type: "numeric", q: "Компания выросла на 50%, затем упала на 50%. Итог относительно старта:", options: ["–25%", "0%", "+25%", "–50%"], ans: 0 },
  { type: "numeric", q: "Сумма углов выпуклого многоугольника с 7 сторонами:", options: ["720°", "900°", "1080°", "540°"], ans: 1 },
  // Вербальное мышление (8)
  { type: "verbal", q: "Найдите лишнее: индукция, дедукция, абдукция, интуиция, редукция", options: ["Индукция", "Дедукция", "Интуиция", "Редукция"], ans: 2 },
  { type: "verbal", q: "«Консенсус» означает:", options: ["Большинство голосов", "Единогласное согласие всех сторон", "Компромисс с уступками", "Решение руководителя"], ans: 1 },
  { type: "verbal", q: "«Имплицитный» — противоположность слова:", options: ["Явный", "Сложный", "Двусмысленный", "Скрытый"], ans: 0 },
  { type: "verbal", q: "Библиотека : книга = портфель : ?", options: ["Офис", "Документ", "Менеджер", "Папка"], ans: 1 },
  { type: "verbal", q: "Найдите лишнее: рентабельность, ликвидность, амортизация, харизма, маржа", options: ["Рентабельность", "Ликвидность", "Амортизация", "Харизма"], ans: 3 },
  { type: "verbal", q: "«Когнитивное искажение» — это:", options: ["Ошибка памяти из-за усталости", "Систематическая ошибка мышления влияющая на суждения", "Намеренное введение в заблуждение", "Расстройство внимания"], ans: 1 },
  { type: "verbal", q: "Выберите пару с той же логикой что у «хирург : скальпель»:", options: ["Повар : кухня", "Программист : алгоритм", "Дирижёр : палочка", "Архитектор : здание"], ans: 2 },
  { type: "verbal", q: "«Эфемерный» означает:", options: ["Загадочный и непонятный", "Кратковременный и мимолётный", "Тёмный и мрачный", "Чрезмерно сложный"], ans: 1 },
  // Ситуативные задачи (12)
  { type: "situational", q: "Вы PM. Клиент требует фичу которая принесёт ему ценность но разрушит архитектуру продукта долгосрочно. Ваш ход:", options: ["Сделаю — клиент всегда прав", "Откажу — архитектура важнее", "Объясню компромисс: сделаем временное решение и запланируем рефакторинг", "Передам решение техлиду"], ans: 2 },
  { type: "situational", q: "Вы узнали что коллега берёт откат от поставщика. Доказательств нет, только косвенные признаки. Ваши действия:", options: ["Промолчу — нет доказательств", "Публично обвиню коллегу", "Сообщу руководителю о своих наблюдениях без обвинений", "Поговорю с коллегой напрямую"], ans: 2 },
  { type: "situational", q: "Вас просят подписать отчёт с которым вы не полностью согласны но дедлайн через час. Что делаете:", options: ["Подпишу — нет времени разбираться", "Откажусь подписывать в любом случае", "Быстро зафиксирую свои возражения письменно и подпишу с оговоркой", "Попрошу перенести дедлайн"], ans: 2 },
  { type: "situational", q: "Вы видите что проект провалится через месяц но руководство этого не замечает. Ваши действия:", options: ["Буду молчать — меня не спрашивали", "Подниму тревогу громко на общем совещании", "Подготовлю краткий анализ рисков и передам руководителю лично", "Начну искать другую работу"], ans: 2 },
  { type: "situational", q: "Вы руководитель. Лучший сотрудник просит повышение которое вы не можете одобрить сейчас. Ваши действия:", options: ["Скажу просто «нет» — не время", "Пообещаю повышение чтобы удержать", "Объясню причины, дам чёткий план что нужно для повышения и назову срок", "Переведу разговор на другую тему"], ans: 2 },
  { type: "situational", q: "Задача выполнена в срок но качество ниже ожидаемого. Команда устала. Сдаёте или доделываете:", options: ["Сдаю — срок важнее качества", "Доделаю сам не говоря команде", "Обсужу с заказчиком: покажу что есть, объясню ситуацию и согласую приоритет", "Скрою недостатки в презентации"], ans: 2 },
  { type: "situational", q: "Два топ-менеджера дают вам противоречивые указания. Оба считают что правы. Ваши действия:", options: ["Выполню указание того кто старше по должности", "Сделаю то что считаю правильным сам", "Сведу обоих вместе чтобы они синхронизировались и дали единое решение", "Проигнорирую обоих до прояснения"], ans: 2 },
  { type: "situational", q: "Вы операционный менеджер. Поставщик срывает дедлайн. Производство встанет через 2 дня. Первый шаг:", options: ["Жду — может сам исправится", "Сразу расторгну контракт", "Свяжусь с поставщиком прямо сейчас, параллельно активирую резервного поставщика", "Сообщу руководству и жду их решения"], ans: 2 },
  { type: "situational", q: "Новый коллега явно некомпетентен но нанят по протекции. Это мешает работе команды. Ваши действия:", options: ["Буду работать вокруг него молча", "Открыто скажу что он некомпетентен", "Документирую конкретные случаи влияния на результат и обсужу с руководителем", "Настрою команду против него"], ans: 2 },
  { type: "situational", q: "Клиент хочет скидку 30% угрожая уйти к конкуренту. Вы знаете что конкурент хуже. Ваши действия:", options: ["Сразу дам скидку чтобы не потерять", "Откажу — у нас лучше продукт", "Уточню реальные потребности, обосную ценность и предложу альтернативу скидке", "Скажу что конкурент плохой"], ans: 2 },
  { type: "situational", q: "Вы заметили что регулярный процесс занимает 3 часа но можно автоматизировать за 1 день работы. Что делаете:", options: ["Продолжаю делать вручную — не моя зона", "Автоматизирую сам без согласования", "Оцениваю ROI, предлагаю руководителю с обоснованием и прошу добро", "Жду пока кто-то другой это сделает"], ans: 2 },
  { type: "situational", q: "Вы провалили важные переговоры. Руководитель ждёт отчёт о причинах. Ваш подход:", options: ["Напишу что причины внешние — рынок, клиент", "Признаю ошибки, опишу что именно пошло не так и что сделаю иначе", "Минимизирую провал в отчёте", "Попрошу коллегу написать отчёт за меня"], ans: 1 },
  // Нестандартное мышление (8)
  { type: "nonstandard", q: "Сколько пианистов в Астане? Выберите наиболее логичный подход к оценке:", options: ["Невозможно оценить без данных", "Население ÷ средний размер класса × долю занимающихся музыкой", "Поискать в интернете", "Спросить в музыкальной школе"], ans: 1 },
  { type: "nonstandard", q: "Вы можете взять с собой только одну вещь на необитаемый остров. Что выбрать с точки зрения выживания?", options: ["Нож", "Спички", "Спутниковый телефон", "Рыболовная сеть"], ans: 2 },
  { type: "nonstandard", q: "Компания теряет клиентов. Данных почти нет. С чего начать диагностику?", options: ["Запустить рекламу чтобы привлечь новых", "Поговорить с 5-10 ушедшими клиентами напрямую", "Снизить цены", "Нанять консультанта"], ans: 1 },
  { type: "nonstandard", q: "Если вы удвоите скорость работы но будете делать не то что нужно — результат:", options: ["Лучше — больше сделано", "Хуже — быстрее двигаетесь в неверном направлении", "Нейтральный — усилия компенсируют ошибку", "Зависит от ситуации"], ans: 1 },
  { type: "nonstandard", q: "Мост выдерживает 10 тонн. Грузовик весит ровно 10 тонн. Водитель везёт 100 кг груза сверху. Как переехать?", options: ["Невозможно — превышение веса", "Разгрузить 100 кг и перевезти отдельно", "Открыть все окна чтобы уменьшить вес", "Проехать очень быстро"], ans: 1 },
  { type: "nonstandard", q: "Вам нужно измерить 4 литра воды имея только кувшины на 3 и 5 литров. Сколько шагов минимум?", options: ["2", "3", "4", "Невозможно"], ans: 2 },
  { type: "nonstandard", q: "Продукт продаётся плохо. Что проверить в первую очередь?", options: ["Цену — снизить", "Рекламу — усилить", "Понять кто покупает сейчас и почему — найти паттерн", "Добавить новые функции"], ans: 2 },
  { type: "nonstandard", q: "Три лампочки в соседней комнате. Три выключателя здесь. Зайти можно только один раз. Как определить какой выключатель от какой лампы?", options: ["Невозможно за один заход", "Включить один, войти, потрогать лампочки — горячая = тот что был включён дольше", "Взять помощника", "Включить все и отметить"], ans: 1 },
  // Скорость (7) — сложнее, без подсказок
  { type: "speed", q: "Если A = 2B и B = 3C, то A/C = ?", options: ["5", "6", "8", "9"], ans: 1 },
  { type: "speed", q: "Цена выросла с 80 до 100. Рост в процентах:", options: ["20%", "25%", "80%", "125%"], ans: 1 },
  { type: "speed", q: "Поезд A едет 60 км/ч, поезд B — 90 км/ч навстречу. Расстояние 300 км. Через сколько минут встретятся?", options: ["100", "120", "150", "200"], ans: 1 },
  { type: "speed", q: "2^10 = ?", options: ["512", "1024", "2048", "256"], ans: 1 },
  { type: "speed", q: "Треугольник со сторонами 3, 4, 5 — какой угол напротив стороны 5?", options: ["60°", "90°", "45°", "120°"], ans: 1 },
  { type: "speed", q: "Если x² = 49, то x может быть:", options: ["Только 7", "Только –7", "7 или –7", "Нет решений"], ans: 2 },
  { type: "speed", q: "Вероятность выпадения орла дважды подряд:", options: ["1/2", "1/3", "1/4", "1/8"], ans: 2 },
];

const DISC_PAIRS = [
  { a: { text: "Я предпочитаю быстро принимать решения, даже с риском ошибиться", d: "D" }, b: { text: "Я предпочитаю тщательно анализировать перед тем, как действовать", d: "C" } },
  { a: { text: "Мне важно, чтобы команда была дружной и стабильной", d: "S" }, b: { text: "Мне важно достигать результата, даже если это создаёт напряжение", d: "D" } },
  { a: { text: "Я легко нахожу общий язык с новыми людьми", d: "I" }, b: { text: "Я предпочитаю работать с проверенным кругом коллег", d: "S" } },
  { a: { text: "Мне нравится соблюдать правила и процедуры", d: "C" }, b: { text: "Мне нравится вдохновлять и убеждать других", d: "I" } },
  { a: { text: "В конфликте я стараюсь сохранить мир и найти компромисс", d: "S" }, b: { text: "В конфликте я открыто отстаиваю свою позицию", d: "D" } },
  { a: { text: "Для меня важна точность и качество работы", d: "C" }, b: { text: "Для меня важна скорость и видимый результат", d: "D" } },
  { a: { text: "Я умею зажечь энтузиазм в команде", d: "I" }, b: { text: "Я умею выстроить надёжный процесс", d: "C" } },
  { a: { text: "Мне комфортно в стабильной, предсказуемой среде", d: "S" }, b: { text: "Мне нравится общаться и презентовать идеи", d: "I" } },
  { a: { text: "Я задаю много вопросов перед тем, как начать задачу", d: "C" }, b: { text: "Я сразу берусь за дело и по ходу разбираюсь", d: "D" } },
  { a: { text: "Мне важно, чтобы коллеги чувствовали поддержку с моей стороны", d: "S" }, b: { text: "Мне важно, чтобы моя работа была заметна и признана", d: "I" } },
  { a: { text: "Я предпочитаю детальные инструкции и чёткие критерии", d: "C" }, b: { text: "Я предпочитаю свободу действий и самостоятельность", d: "D" } },
  { a: { text: "В команде я чаще генерирую идеи и вовлекаю других", d: "I" }, b: { text: "В команде я чаще слежу за тем, чтобы всё шло по плану", d: "S" } },
  { a: { text: "Я чувствую себя уверенно, когда данные подтверждают решение", d: "C" }, b: { text: "Я чувствую себя уверенно, когда команда поддерживает идею", d: "I" } },
  { a: { text: "Изменения — это возможность двигаться вперёд", d: "D" }, b: { text: "Изменения лучше внедрять постепенно, не нарушая стабильность", d: "S" } },
  { a: { text: "Мне нравятся сложные задачи с высокими ставками", d: "D" }, b: { text: "Мне нравится выстраивать долгосрочные отношения с людьми", d: "S" } },
  { a: { text: "Ошибки нужно разбирать детально, чтобы не повторять", d: "C" }, b: { text: "После ошибки лучше быстро двигаться вперёд", d: "I" } },
  { a: { text: "Мне легко мотивировать людей через общение", d: "I" }, b: { text: "Мне легко структурировать работу и расставлять приоритеты", d: "D" } },
  { a: { text: "Я ценю предсказуемость и последовательность", d: "S" }, b: { text: "Я ценю высокие стандарты и точность", d: "C" } },
  { a: { text: "Для меня важно, чтобы моя работа помогала другим", d: "S" }, b: { text: "Для меня важно, чтобы мои решения были логически обоснованы", d: "C" } },
  { a: { text: "Я готов взять на себя ответственность, даже если нет 100% уверенности", d: "D" }, b: { text: "Мне важно, чтобы люди вокруг были вовлечены и воодушевлены", d: "I" } },
];

const DISC_PROFILES = {
  D: { name: "Доминирование (D)", color: "#c0392b", desc: "Ориентирован на результат, решителен, любит контроль. Силён в условиях давления и конкуренции. Может быть жёстким." },
  I: { name: "Влияние (I)", color: "#e67e22", desc: "Коммуникабелен, энергичен, умеет вовлекать. Отличный командный игрок и переговорщик. Может избегать деталей." },
  S: { name: "Стабильность (S)", color: "#27ae60", desc: "Надёжен, терпелив, лоялен. Ценит гармонию и стабильность. Может сопротивляться переменам." },
  C: { name: "Соответствие (C)", color: "#2980b9", desc: "Аналитичен, точен, следует правилам. Ценит качество и логику. Может быть излишне осторожным." },
};

const IQ_SECTIONS = [
  { key: "numeric", label: "Числовая логика", max: 8 },
  { key: "verbal", label: "Вербальное мышление", max: 8 },
  { key: "situational", label: "Ситуативные задачи", max: 12 },
  { key: "nonstandard", label: "Нестандартное мышление", max: 8 },
  { key: "speed", label: "Скорость решений", max: 7 },
];

const SPEED_TIME = 12;

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [iqAnswers, setIqAnswers] = useState({});
  const [discAnswers, setDiscAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timedOut, setTimedOut] = useState({});
  const timerRef = useRef(null);
  const [candidateName, setCandidateName] = useState("");
  const sentRef = useRef(false);

  const QUESTIONS = useMemo(() => RAW_QUESTIONS.map(q => {
    const indexed = q.options.map((opt, i) => ({ opt, correct: i === q.ans }));
    const shuffled = shuffle(indexed);
    return { ...q, options: shuffled.map(o => o.opt), ans: shuffled.findIndex(o => o.correct) };
  }), []);

  const SPEED_Q_IDS = useMemo(() => QUESTIONS.map((q, i) => q.type === "speed" ? i : -1).filter(i => i >= 0), [QUESTIONS]);
  const totalIQ = QUESTIONS.length;
  const totalDISC = DISC_PAIRS.length;

  const calcIQScore = () => {
    let scores = { numeric: 0, verbal: 0, situational: 0, nonstandard: 0, speed: 0 };
    QUESTIONS.forEach((q, i) => { if (iqAnswers[i] === q.ans) scores[q.type]++; });
    const raw = Object.values(scores).reduce((a, b) => a + b, 0);
    return { scores, raw, pct: Math.round((raw / totalIQ) * 100) };
  };

  const calcDISC = () => {
    let counts = { D: 0, I: 0, S: 0, C: 0 };
    Object.values(discAnswers).forEach(d => counts[d]++);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { counts, primary: sorted[0][0], secondary: sorted[1][0] };
  };

  const getRank = (pct) => {
    if (pct >= 85) return { label: "Высокий потенциал", color: "#27ae60" };
    if (pct >= 65) return { label: "Выше среднего", color: "#2980b9" };
    if (pct >= 45) return { label: "Средний уровень", color: "#e67e22" };
    return { label: "Ниже ожиданий", color: "#c0392b" };
  };

  const downloadPDF = () => {
    const { scores, raw, pct } = calcIQScore();
    const { counts, primary, secondary } = calcDISC();
    const rankInfo = getRank(pct);
    const date = new Date().toLocaleString("ru-RU");
    const maxD = Math.max(...Object.values(counts));

    const barHtml = (val, max, col) => {
      const p = Math.round((val / max) * 100);
      const c = col || (p >= 80 ? "#27ae60" : p >= 50 ? "#e67e22" : "#c0392b");
      return `<div style="height:6px;background:#eee;border-radius:3px;margin:4px 0 10px"><div style="height:100%;width:${p}%;background:${c};border-radius:3px"></div></div>`;
    };

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Результаты · ${candidateName}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:720px;margin:0 auto;font-size:14px}
      h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;border-bottom:1px solid #eee;padding-bottom:6px;margin:24px 0 14px}
      .score{font-size:38px;font-weight:bold}.tag{display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:bold;margin-left:10px;vertical-align:middle}
      .row{display:flex;justify-content:space-between;font-size:13px;margin:6px 0 2px}
      .card{border:1px solid #ddd;border-radius:8px;padding:12px 16px;margin-bottom:10px}
      .label{font-size:11px;font-weight:bold;margin-bottom:4px}.cname{font-size:14px;font-weight:bold;margin-bottom:4px}
      .desc{font-size:12px;color:#666}.footer{margin-top:32px;font-size:11px;color:#aaa;text-align:center}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>Результаты тестирования</h1>
    <div style="color:#666;font-size:12px;margin-bottom:20px">Кандидат: <b>${candidateName}</b> &nbsp;·&nbsp; ${date}</div>
    <h2>Блок 1 — Сообразительность</h2>
    <div><span class="score" style="color:${rankInfo.color}">${pct}%</span>
    <span class="tag" style="background:${rankInfo.color}22;color:${rankInfo.color}">${rankInfo.label}</span></div>
    <div style="font-size:12px;color:#666;margin:8px 0 16px">${raw} правильных ответов из ${totalIQ}</div>
    ${IQ_SECTIONS.map(sec => {
      const sc = scores[sec.key] || 0;
      return `<div class="row"><span>${sec.label}</span><span>${sc}/${sec.max}</span></div>${barHtml(sc, sec.max)}`;
    }).join("")}
    <h2>Блок 2 — Психотип DISC</h2>
    <div class="card" style="border-left:3px solid ${DISC_PROFILES[primary].color}">
      <div class="label" style="color:${DISC_PROFILES[primary].color}">Основной профиль</div>
      <div class="cname">${DISC_PROFILES[primary].name}</div>
      <div class="desc">${DISC_PROFILES[primary].desc}</div>
    </div>
    <div class="card" style="border-left:3px solid ${DISC_PROFILES[secondary].color}">
      <div class="label" style="color:${DISC_PROFILES[secondary].color}">Вторичный профиль</div>
      <div class="cname">${DISC_PROFILES[secondary].name}</div>
      <div class="desc">${DISC_PROFILES[secondary].desc}</div>
    </div>
    <h2>Распределение DISC</h2>
    ${Object.entries(DISC_PROFILES).map(([k, v]) =>
      `<div class="row"><span>${v.name}</span><span>${counts[k]} / 20</span></div>${barHtml(counts[k], maxD, v.color)}`
    ).join("")}
    <h2>Рекомендация</h2>
    <div class="card" style="background:#f9f9f9">
      ${pct >= 65 && (primary === "D" || primary === "C")
        ? "Аналитический склад ума + решительность. Подходит для управленческих и проектных ролей."
        : pct >= 65 && (primary === "I" || primary === "S")
        ? "Сильная коммуникация и надёжность. Хорошая база для операционных и клиентских ролей."
        : pct < 65 && (primary === "D" || primary === "I")
        ? "Активный кандидат. Рекомендуется дополнительная проверка аналитических навыков."
        : "Стабильный профиль. Подходит для исполнительских ролей в структурированной среде."}
    </div>
    <div class="footer">Сформировано автоматически</div>
    </body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Результат_${candidateName}_${new Date().toLocaleDateString("ru-RU")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (screen === "result" && !sentRef.current) {
      sentRef.current = true;
      const { scores, pct } = calcIQScore();
      const { primary, secondary } = calcDISC();
      const rankInfo = getRank(pct);
      sendToSheets({ date: new Date().toLocaleString("ru-RU"), name: candidateName, score: pct, rank: rankInfo.label, primary: DISC_PROFILES[primary].name, secondary: DISC_PROFILES[secondary].name, numeric: scores.numeric, verbal: scores.verbal, situational: scores.situational, nonstandard: scores.nonstandard, speed: scores.speed });
    }
  }, [screen]);

  useEffect(() => {
    if (screen === "iq") {
      const isSpeed = SPEED_Q_IDS.includes(currentQ);
      if (isSpeed && !(currentQ in iqAnswers) && !timedOut[currentQ]) {
        setTimeLeft(SPEED_TIME);
        timerRef.current = setInterval(() => {
          setTimeLeft(t => {
            if (t <= 1) {
              clearInterval(timerRef.current);
              // Засчитываем неправильный ответ (-1 означает "нет ответа = неверно")
              setIqAnswers(prev => ({ ...prev, [currentQ]: -1 }));
              setTimedOut(prev => ({ ...prev, [currentQ]: true }));
              setTimeout(() => goNext("iq"), 600);
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      } else { setTimeLeft(null); }
      return () => clearInterval(timerRef.current);
    }
  }, [currentQ, screen]);

  const goNext = (mode) => {
    clearInterval(timerRef.current); setTimeLeft(null);
    if (mode === "iq") { if (currentQ < totalIQ - 1) setCurrentQ(q => q + 1); else { setCurrentQ(0); setScreen("disc"); } }
    else { if (currentQ < totalDISC - 1) setCurrentQ(q => q + 1); else setScreen("result"); }
  };

  const answerIQ = (idx) => {
    if (currentQ in iqAnswers || timedOut[currentQ]) return;
    clearInterval(timerRef.current);
    setIqAnswers(prev => ({ ...prev, [currentQ]: idx }));
    setTimeout(() => goNext("iq"), 500);
  };

  const answerDISC = (disc) => {
    if (currentQ in discAnswers) return;
    setDiscAnswers(prev => ({ ...prev, [currentQ]: disc }));
    setTimeout(() => goNext("disc"), 500);
  };

  const resetAll = () => { setScreen("intro"); setIqAnswers({}); setDiscAnswers({}); setCurrentQ(0); setTimedOut({}); setCandidateName(""); sentRef.current = false; };

  const s = {
    wrap: { padding: "1.5rem 1rem", maxWidth: 640, margin: "0 auto", fontFamily: "sans-serif" },
    h1: { fontSize: 22, fontWeight: 500, color: "#111", margin: "0 0 0.5rem" },
    h2: { fontSize: 18, fontWeight: 500, color: "#111", margin: "0 0 1rem" },
    muted: { fontSize: 14, color: "#666", lineHeight: 1.6 },
    btn: { display: "block", width: "100%", padding: "12px 16px", marginBottom: 10, background: "#f5f5f5", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 15, color: "#111", cursor: "pointer", textAlign: "left" },
    btnPrimary: { padding: "12px 24px", background: "#fff", border: "0.5px solid #999", borderRadius: 8, fontSize: 15, fontWeight: 500, color: "#111", cursor: "pointer", marginTop: "1rem" },
    progress: { height: 4, background: "#eee", borderRadius: 2, margin: "1rem 0" },
    progressFill: (p, col) => ({ height: "100%", width: `${p}%`, background: col || "#333", borderRadius: 2, transition: "width 0.3s" }),
    card: { background: "#fff", border: "0.5px solid #ddd", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 },
    tag: (col) => ({ display: "inline-block", fontSize: 12, padding: "3px 10px", borderRadius: 8, background: col + "22", color: col, fontWeight: 500, marginBottom: 8 }),
  };

  if (screen === "intro") return (
    <div style={s.wrap}>
      <h1 style={s.h1}>Тест для кандидатов</h1>
      <p style={s.muted}>Два блока:<br/>• Блок 1 — Сообразительность (43 вопроса)<br/>• Блок 2 — Психотип DISC (20 пар)<br/><br/>Время: 40–50 минут. Вопросы на скорость имеют таймер — не успел = неверно.</p>
      <div style={{ marginTop: "1.5rem" }}>
        <label style={{ ...s.muted, display: "block", marginBottom: 6 }}>Имя кандидата</label>
        <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Введите имя..." style={{ width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: 8, border: "0.5px solid #ddd", background: "#f5f5f5", color: "#111", boxSizing: "border-box" }} />
      </div>
      <button style={s.btnPrimary} onClick={() => { if (candidateName.trim()) { sentRef.current = false; setScreen("iq"); } }}>Начать тест →</button>
    </div>
  );

  if (screen === "iq") {
    const q = QUESTIONS[currentQ];
    const answered = currentQ in iqAnswers;
    const to = timedOut[currentQ];
    const isSpeed = SPEED_Q_IDS.includes(currentQ);
    const sectionLabel = IQ_SECTIONS.find(s => s.key === q.type)?.label || "";
    const progPct = Math.round(((currentQ + 1) / totalIQ) * 100);
    return (
      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={s.muted}>Блок 1 · {sectionLabel}</span>
          <span style={s.muted}>{currentQ + 1} / {totalIQ}</span>
        </div>
        <div style={s.progress}><div style={s.progressFill(progPct)} /></div>
        {isSpeed && timeLeft !== null && !answered && (
          <div style={{ ...s.muted, marginBottom: 8, color: timeLeft <= 4 ? "#c0392b" : "#e67e22", fontWeight: 500 }}>⏱ {timeLeft} сек</div>
        )}
        {to && !answered && <div style={{ ...s.muted, marginBottom: 8, color: "#c0392b" }}>⏱ Время вышло</div>}
        <div style={{ ...s.card, marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, color: "#111" }}>{q.q}</p>
        </div>
        {q.options.map((opt, i) => {
          let border = "0.5px solid #ddd", bg = "#f5f5f5";
          if (answered || to) {
            if (i === q.ans) { border = "1.5px solid #27ae60"; bg = "#27ae6011"; }
            else if (iqAnswers[currentQ] === i) { border = "1.5px solid #c0392b"; bg = "#c0392b11"; }
          }
          return <button key={i} style={{ ...s.btn, border, background: bg }} onClick={() => answerIQ(i)}>{opt}</button>;
        })}
        {(answered || to) && (
          <button style={s.btnPrimary} onClick={() => goNext("iq")}>
            {currentQ < totalIQ - 1 ? "Следующий вопрос →" : "Перейти к блоку 2 →"}
          </button>
        )}
      </div>
    );
  }

  if (screen === "disc") {
    const pair = DISC_PAIRS[currentQ];
    const answered = currentQ in discAnswers;
    const progPct = Math.round(((currentQ + 1) / totalDISC) * 100);
    return (
      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={s.muted}>Блок 2 · Психотип</span>
          <span style={s.muted}>{currentQ + 1} / {totalDISC}</span>
        </div>
        <div style={s.progress}><div style={s.progressFill(progPct, "#2980b9")} /></div>
        <p style={{ ...s.muted, marginBottom: "1.25rem" }}>Выберите утверждение, которое точнее описывает вас:</p>
        {["a", "b"].map(k => {
          const item = pair[k];
          const chosen = discAnswers[currentQ] === item.d;
          return <button key={k} style={{ ...s.btn, border: chosen ? "1.5px solid #2980b9" : "0.5px solid #ddd", background: chosen ? "#2980b911" : "#f5f5f5" }} onClick={() => answerDISC(item.d)}>{item.text}</button>;
        })}
        {answered && <button style={s.btnPrimary} onClick={() => goNext("disc")}>{currentQ < totalDISC - 1 ? "Следующая пара →" : "Посмотреть результат →"}</button>}
      </div>
    );
  }

  if (screen === "result") {
    const { scores, raw, pct } = calcIQScore();
    const { counts, primary, secondary } = calcDISC();
    const rankInfo = getRank(pct);
    const pDisc = DISC_PROFILES[primary];
    const sDisc = DISC_PROFILES[secondary];
    const maxDisc = Math.max(...Object.values(counts));
    return (
      <div style={s.wrap}>
        <h1 style={s.h1}>Результаты · {candidateName}</h1>
        <h2 style={{ ...s.h2, marginTop: "1.5rem" }}>Блок 1 — Сообразительность</h2>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 36, fontWeight: 500, color: rankInfo.color }}>{pct}%</span>
          <span style={s.tag(rankInfo.color)}>{rankInfo.label}</span>
        </div>
        <p style={s.muted}>{raw} правильных ответов из {totalIQ}</p>
        <div style={{ marginTop: "1rem" }}>
          {IQ_SECTIONS.map(sec => {
            const sc = scores[sec.key] || 0;
            const p = Math.round((sc / sec.max) * 100);
            return (
              <div key={sec.key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "#666" }}>{sec.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{sc}/{sec.max}</span>
                </div>
                <div style={s.progress}><div style={s.progressFill(p, p >= 80 ? "#27ae60" : p >= 50 ? "#e67e22" : "#c0392b")} /></div>
              </div>
            );
          })}
        </div>
        <h2 style={{ ...s.h2, marginTop: "2rem" }}>Блок 2 — Психотип DISC</h2>
        <div style={{ ...s.card, borderLeft: `3px solid ${pDisc.color}` }}>
          <div style={s.tag(pDisc.color)}>Основной профиль</div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>{pDisc.name}</p>
          <p style={{ ...s.muted, margin: 0 }}>{pDisc.desc}</p>
        </div>
        <div style={{ ...s.card, borderLeft: `3px solid ${sDisc.color}` }}>
          <div style={s.tag(sDisc.color)}>Вторичный профиль</div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>{sDisc.name}</p>
          <p style={{ ...s.muted, margin: 0 }}>{sDisc.desc}</p>
        </div>
        <div style={{ marginTop: "1rem" }}>
          {Object.entries(DISC_PROFILES).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#666" }}>{v.name}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{counts[k]}</span>
              </div>
              <div style={s.progress}><div style={s.progressFill(Math.round((counts[k] / maxDisc) * 100), v.color)} /></div>
            </div>
          ))}
        </div>
        <div style={{ ...s.card, marginTop: "1.5rem", background: "#f5f5f5" }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 6px" }}>Рекомендация</p>
          <p style={{ ...s.muted, margin: 0 }}>
            {pct >= 65 && (primary === "D" || primary === "C") ? "Аналитический склад ума + решительность. Подходит для управленческих и проектных ролей."
              : pct >= 65 && (primary === "I" || primary === "S") ? "Сильная коммуникация и надёжность. Хорошая база для операционных и клиентских ролей."
              : pct < 65 && (primary === "D" || primary === "I") ? "Активный кандидат. Рекомендуется дополнительная проверка аналитических навыков."
              : "Стабильный профиль. Подходит для исполнительских ролей в структурированной среде."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button style={s.btnPrimary} onClick={resetAll}>← Пройти снова</button>
          <button style={{ ...s.btnPrimary, background: "#2980b9", color: "#fff", border: "none" }} onClick={downloadPDF}>⬇ Скачать отчёт</button>
        </div>
      </div>
    );
  }
  return null;
}