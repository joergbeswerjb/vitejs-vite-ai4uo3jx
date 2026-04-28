import { useState, useEffect, useRef } from "react";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwxZKU5KNXZDWpESG1NinBrWhInlAQ1Cqp0g71WZbuRF3XcPhmb_JEtf6cXykVb5d-m/exec";

const sendToSheets = async (payload) => {
  try {
    await fetch(SHEETS_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) { console.error("Sheets error", e); }
};

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

const IQ_QUESTIONS = [
  // Числовая логика (8)
  { type: "numeric", q: "Найдите следующее число: 2, 6, 18, 54, ?", options: ["108", "162", "126", "216"], ans: 1 },
  { type: "numeric", q: "Если A > B и B > C, то верно ли что A > C?", options: ["Да", "Нет", "Не всегда", "Невозможно определить"], ans: 0 },
  { type: "numeric", q: "Поезд едет 120 км за 1,5 часа. Какова скорость?", options: ["80 км/ч", "90 км/ч", "60 км/ч", "75 км/ч"], ans: 0 },
  { type: "numeric", q: "Какое число лишнее: 4, 9, 16, 25, 35, 36?", options: ["4", "25", "35", "36"], ans: 2 },
  { type: "numeric", q: "Ряд: 1, 4, 9, 16, 25, ?", options: ["30", "36", "49", "34"], ans: 1 },
  { type: "numeric", q: "Ряд: 3, 7, 13, 21, 31, ?", options: ["41", "43", "45", "39"], ans: 1 },
  { type: "numeric", q: "В команде 12 человек. 1/3 — менеджеры, остальные — исполнители. Сколько исполнителей?", options: ["4", "6", "8", "9"], ans: 2 },
  { type: "numeric", q: "Если товар подорожал на 20%, а затем подешевел на 20%, итоговая цена:", options: ["Осталась той же", "Стала ниже на 4%", "Стала выше на 4%", "Стала ниже на 2%"], ans: 1 },
  // Вербальное мышление (8)
  { type: "verbal", q: "«Горячий» : «холодный» = «быстрый» : ?", options: ["Скорость", "Медленный", "Бегун", "Время"], ans: 1 },
  { type: "verbal", q: "Найдите лишнее: роза, тюльпан, береза, ромашка, пион", options: ["Роза", "Береза", "Ромашка", "Пион"], ans: 1 },
  { type: "verbal", q: "«Педантичный» означает:", options: ["Легкомысленный", "Скрупулёзный и точный", "Общительный", "Ленивый"], ans: 1 },
  { type: "verbal", q: "«Врач» : «пациент» = «судья» : ?", options: ["Закон", "Прокурор", "Обвиняемый", "Свидетель"], ans: 2 },
  { type: "verbal", q: "Синоним слова «лаконичный»:", options: ["Красноречивый", "Краткий", "Подробный", "Запутанный"], ans: 1 },
  { type: "verbal", q: "Найдите лишнее: молоток, пила, гвоздь, отвёртка, рубанок", options: ["Молоток", "Пила", "Гвоздь", "Отвёртка"], ans: 2 },
  { type: "verbal", q: "«Апатия» — это:", options: ["Сильное возбуждение", "Безразличие и отсутствие интереса", "Чувство тревоги", "Радостное ожидание"], ans: 1 },
  { type: "verbal", q: "Противоположное по смыслу слово к «альтруизм»:", options: ["Щедрость", "Эгоизм", "Милосердие", "Доброта"], ans: 1 },
  // Ситуативные задачи (12)
  { type: "situational", q: "Ключевой сотрудник просит отгул в пик работы. Ваши действия?", options: ["Откажу — сейчас не время", "Отпущу, найду замену сам", "Поговорю, выясню срочность и найдём решение вместе", "Попрошу решить вопрос с коллегами самостоятельно"], ans: 2 },
  { type: "situational", q: "Вы нашли ошибку в отчёте, уже отправленном руководству. Что делаете?", options: ["Жду, вдруг не заметят", "Сообщу немедленно и предложу исправление", "Исправлю тихо, если возможно", "Скажу что виноват коллега"], ans: 1 },
  { type: "situational", q: "Клиент агрессивно жалуется, но компания права. Ваши действия?", options: ["Отстаиваю позицию жёстко", "Сразу уступлю", "Выслушаю, признаю неудобство, объясню спокойно", "Переключу на менеджера"], ans: 2 },
  { type: "situational", q: "Два дедлайна одновременно, оба важны. Что делаете?", options: ["Берусь за оба", "Сообщу руководителю и попрошу помочь с приоритетами", "Выберу тот, что проще", "Попрошу продления обоих"], ans: 1 },
  { type: "situational", q: "Коллега делает задачу неправильно, но не просил вашего мнения.", options: ["Промолчу", "Скажу прямо при всех", "Скажу один на один тихо", "Сообщу руководителю"], ans: 2 },
  { type: "situational", q: "Вам поручили задачу, в которой не уверены. Как поступите?", options: ["Попробую сам, не признавая неуверенности", "Откажусь", "Уточню детали, попрошу примеры и сделаю", "Делегирую"], ans: 2 },
  { type: "situational", q: "Проект провалился из-за непредвиденных обстоятельств. Реакция:", options: ["Ищу виноватых", "Признаю ошибки, анализирую, делаю выводы", "Замалчиваю", "Жду что само урегулируется"], ans: 1 },
  { type: "situational", q: "Заметили улучшение процесса не в вашей зоне ответственности:", options: ["Промолчу — не моё", "Внесу изменения сам", "Опишу идею и передам ответственному", "Буду ждать пока спросят"], ans: 2 },
  { type: "situational", q: "Руководитель дал задание с которым вы категорически не согласны. Что делаете?", options: ["Выполню молча", "Открыто откажусь", "Выскажу мнение аргументированно, затем выполню решение руководителя", "Выполню, но спустя рукава"], ans: 2 },
  { type: "situational", q: "В команде конфликт между двумя коллегами, мешающий работе. Вы:", options: ["Не вмешиваюсь — сами разберутся", "Встаю на сторону того кто прав", "Организую разговор, помогаю найти компромисс", "Сообщу руководителю немедленно"], ans: 2 },
  { type: "situational", q: "Вам дали задачу без чётких инструкций и дедлайна. Ваш первый шаг:", options: ["Начну делать как понимаю", "Уточню цели, ожидания и сроки у постановщика задачи", "Отложу до прояснения ситуации", "Попрошу другую задачу"], ans: 1 },
  { type: "situational", q: "Вы заметили что процесс в компании устарел и тормозит работу. Ваши действия:", options: ["Продолжаю работать по старому", "Самостоятельно меняю процесс", "Готовлю предложение с обоснованием и выхожу с инициативой", "Жалуюсь коллегам"], ans: 2 },
  // Нестандартное мышление (8)
  { type: "nonstandard", q: "Сколько раз можно сложить лист бумаги пополам?", options: ["Бесконечно", "Около 7 раз физически", "Ровно 10 раз", "Зависит только от размера листа"], ans: 1 },
  { type: "nonstandard", q: "У фермера 17 овец. Все кроме 9 погибли. Сколько осталось?", options: ["8", "9", "17", "0"], ans: 1 },
  { type: "nonstandard", q: "Что общего между деревом и компанией?", options: ["Оба растут", "Оба имеют ветви", "Оба требуют ресурсов", "Все варианты верны"], ans: 3 },
  { type: "nonstandard", q: "Слово написано неправильно во всех словарях мира. Что это за слово?", options: ["Нет такого", "«Неправильно»", "Зависит от языка", "Это ошибка в задаче"], ans: 1 },
  { type: "nonstandard", q: "Директор аэропорта нашёл бесхозный чемодан. Первый шаг:", options: ["Вызвать охрану и оцепить зону", "Открыть чемодан", "Объявить по громкоговорителю", "Сдать в полицию"], ans: 0 },
  { type: "nonstandard", q: "Вас попросили оценить количество теннисных мячей в автобусе. Ваш подход:", options: ["Откажусь — невозможно точно", "Попрошу уточнить размер автобуса и мяча, затем вычислю приближённо", "Назову случайное число", "Скажу что вопрос некорректный"], ans: 1 },
  { type: "nonstandard", q: "Что тяжелее: килограмм железа или килограмм ваты?", options: ["Железо", "Вата", "Одинаково", "Зависит от условий"], ans: 2 },
  { type: "nonstandard", q: "Как можно использовать кирпич помимо строительства? Выберите наиболее творческий ответ:", options: ["Никак — он для стройки", "Как пресс-папье, подставку, груз для тренировок, мишень", "Разбить его", "Продать"], ans: 1 },
  // Скорость (7)
  { type: "speed", q: "7 × 8 = ?", options: ["54", "56", "48", "63"], ans: 1 },
  { type: "speed", q: "25% от 200 = ?", options: ["25", "50", "75", "100"], ans: 1 },
  { type: "speed", q: "Если сегодня среда, какой день через 10 дней?", options: ["Пятница", "Суббота", "Воскресенье", "Среда"], ans: 1 },
  { type: "speed", q: "Что больше: 3/4 или 7/9?", options: ["3/4", "7/9", "Равны", "Невозможно сравнить"], ans: 1 },
  { type: "speed", q: "50 товаров, продали 40%. Сколько осталось?", options: ["20", "30", "10", "40"], ans: 1 },
  { type: "speed", q: "15% от 80 = ?", options: ["10", "12", "15", "16"], ans: 1 },
  { type: "speed", q: "Если 5 рабочих делают 5 деталей за 5 минут, сколько деталей сделают 10 рабочих за 10 минут?", options: ["10", "20", "25", "50"], ans: 1 },
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

// Shuffle options and track correct answer index
const SHUFFLED_QUESTIONS = IQ_QUESTIONS.map(q => {
  const indexed = q.options.map((opt, i) => ({ opt, correct: i === q.ans }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  const newAns = indexed.findIndex(o => o.correct);
  return { ...q, options: indexed.map(o => o.opt), ans: newAns };
});

const SPEED_Q_IDS = SHUFFLED_QUESTIONS.map((q, i) => q.type === "speed" ? i : -1).filter(i => i >= 0);
const SPEED_TIME = 10;

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

  const totalIQ = IQ_QUESTIONS.length;
  const totalDISC = DISC_PAIRS.length;

  const calcIQScore = () => {
    let scores = { numeric: 0, verbal: 0, situational: 0, nonstandard: 0, speed: 0 };
    IQ_QUESTIONS.forEach((q, i) => { if (iqAnswers[i] === SHUFFLED_QUESTIONS[i].ans) scores[q.type]++; });
    const raw = Object.values(scores).reduce((a, b) => a + b, 0);
    const pct = Math.round((raw / totalIQ) * 100);
    return { scores, raw, pct };
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

  useEffect(() => {
    if (screen === "result" && !sentRef.current) {
      sentRef.current = true;
      const { scores, pct } = calcIQScore();
      const { primary, secondary } = calcDISC();
      const rankInfo = getRank(pct);
      sendToSheets({
        date: new Date().toLocaleString("ru-RU"),
        name: candidateName,
        score: pct,
        rank: rankInfo.label,
        primary: DISC_PROFILES[primary].name,
        secondary: DISC_PROFILES[secondary].name,
        numeric: `${scores.numeric}/${IQ_SECTIONS.find(s=>s.key==="numeric").max}`,
        verbal: `${scores.verbal}/${IQ_SECTIONS.find(s=>s.key==="verbal").max}`,
        situational: `${scores.situational}/${IQ_SECTIONS.find(s=>s.key==="situational").max}`,
        nonstandard: `${scores.nonstandard}/${IQ_SECTIONS.find(s=>s.key==="nonstandard").max}`,
        speed: `${scores.speed}/${IQ_SECTIONS.find(s=>s.key==="speed").max}`,
      });
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
              setTimedOut(prev => ({ ...prev, [currentQ]: true }));
              setTimeout(() => goNext("iq"), 400);
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
    clearInterval(timerRef.current);
    setTimeLeft(null);
    if (mode === "iq") {
      if (currentQ < totalIQ - 1) setCurrentQ(q => q + 1);
      else { setCurrentQ(0); setScreen("disc"); }
    } else {
      if (currentQ < totalDISC - 1) setCurrentQ(q => q + 1);
      else setScreen("result");
    }
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

  const s = {
    wrap: { padding: "1.5rem 1rem", maxWidth: 640, margin: "0 auto", fontFamily: "sans-serif" },
    h1: { fontSize: 22, fontWeight: 500, color: "#111", margin: "0 0 0.5rem" },
    h2: { fontSize: 18, fontWeight: 500, color: "#111", margin: "0 0 1rem" },
    muted: { fontSize: 14, color: "#666", lineHeight: 1.6 },
    btn: { display: "block", width: "100%", padding: "12px 16px", marginBottom: 10, background: "#f5f5f5", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 15, color: "#111", cursor: "pointer", textAlign: "left" },
    btnPrimary: { padding: "12px 24px", background: "#fff", border: "0.5px solid #999", borderRadius: 8, fontSize: 15, fontWeight: 500, color: "#111", cursor: "pointer", marginTop: "1rem" },
    progress: { height: 4, background: "#eee", borderRadius: 2, margin: "1rem 0" },
    progressFill: (pct, col) => ({ height: "100%", width: `${pct}%`, background: col || "#333", borderRadius: 2, transition: "width 0.3s" }),
    card: { background: "#fff", border: "0.5px solid #ddd", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 },
    tag: (col) => ({ display: "inline-block", fontSize: 12, padding: "3px 10px", borderRadius: 8, background: col + "22", color: col, fontWeight: 500, marginBottom: 8 }),
  };

  const resetAll = () => { setScreen("intro"); setIqAnswers({}); setDiscAnswers({}); setCurrentQ(0); setTimedOut({}); setCandidateName(""); sentRef.current = false; };

  if (screen === "intro") return (
    <div style={s.wrap}>
      <h1 style={s.h1}>Тест для кандидатов</h1>
      <p style={s.muted}>Тест состоит из двух блоков:<br/>• Блок 1 — Сообразительность (43 вопроса)<br/>• Блок 2 — Психотип DISC (20 пар утверждений)<br/><br/>Ориентировочное время: 40–50 минут. Некоторые вопросы имеют ограничение по времени.</p>
      <div style={{ marginTop: "1.5rem" }}>
        <label style={{ ...s.muted, display: "block", marginBottom: 6 }}>Имя кандидата</label>
        <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Введите имя..." style={{ width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: 8, border: "0.5px solid #ddd", background: "#f5f5f5", color: "#111", boxSizing: "border-box" }} />
      </div>
      <button style={s.btnPrimary} onClick={() => { if (candidateName.trim()) { sentRef.current = false; setScreen("iq"); } }}>Начать тест →</button>
    </div>
  );

  if (screen === "iq") {
    const q = SHUFFLED_QUESTIONS[currentQ];
    const isSpeed = SPEED_Q_IDS.includes(currentQ);
    const answered = currentQ in iqAnswers;
    const to = timedOut[currentQ];
    const sectionLabel = IQ_SECTIONS.find(s => s.key === q.type)?.label || "";
    const progPct = Math.round(((currentQ + 1) / totalIQ) * 100);
    return (
      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={s.muted}>Блок 1 · {sectionLabel}</span>
          <span style={s.muted}>{currentQ + 1} / {totalIQ}</span>
        </div>
        <div style={s.progress}><div style={s.progressFill(progPct)} /></div>
        {isSpeed && timeLeft !== null && (
          <div style={{ ...s.muted, marginBottom: 8, color: timeLeft <= 3 ? "#c0392b" : "#666" }}>⏱ {timeLeft} сек</div>
        )}
        <div style={{ ...s.card, marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, color: "#111" }}>{q.q}</p>
        </div>
        {q.options.map((opt, i) => {
          let border = "0.5px solid #ddd", bg = "#f5f5f5";
          if (answered || to) {
            if (i === q.ans) { border = "1.5px solid #27ae60"; bg = "#27ae6011"; }
            else if (iqAnswers[currentQ] === i && i !== q.ans) { border = "1.5px solid #c0392b"; bg = "#c0392b11"; }
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
          return (
            <button key={k} style={{ ...s.btn, border: chosen ? "1.5px solid #2980b9" : "0.5px solid #ddd", background: chosen ? "#2980b911" : "#f5f5f5" }}
              onClick={() => answerDISC(item.d)}>{item.text}</button>
          );
        })}
        {answered && (
          <button style={s.btnPrimary} onClick={() => goNext("disc")}>
            {currentQ < totalDISC - 1 ? "Следующая пара →" : "Посмотреть результат →"}
          </button>
        )}
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
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{sc}/{sec.max}</span>
                </div>
                <div style={s.progress}><div style={s.progressFill(p, p >= 80 ? "#27ae60" : p >= 50 ? "#e67e22" : "#c0392b")} /></div>
              </div>
            );
          })}
        </div>
        <h2 style={{ ...s.h2, marginTop: "2rem" }}>Блок 2 — Психотип DISC</h2>
        <div style={{ ...s.card, borderLeft: `3px solid ${pDisc.color}`, borderRadius: 12 }}>
          <div style={s.tag(pDisc.color)}>Основной профиль</div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px", color: "#111" }}>{pDisc.name}</p>
          <p style={{ ...s.muted, margin: 0 }}>{pDisc.desc}</p>
        </div>
        <div style={{ ...s.card, borderLeft: `3px solid ${sDisc.color}`, borderRadius: 12 }}>
          <div style={s.tag(sDisc.color)}>Вторичный профиль</div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px", color: "#111" }}>{sDisc.name}</p>
          <p style={{ ...s.muted, margin: 0 }}>{sDisc.desc}</p>
        </div>
        <div style={{ marginTop: "1rem" }}>
          {Object.entries(DISC_PROFILES).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#666" }}>{v.name}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{counts[k]}</span>
              </div>
              <div style={s.progress}><div style={{ ...s.progressFill(Math.round((counts[k] / maxDisc) * 100), v.color) }} /></div>
            </div>
          ))}
        </div>
        <div style={{ ...s.card, marginTop: "1.5rem", background: "#f5f5f5" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#111", margin: "0 0 6px" }}>Рекомендация</p>
          <p style={{ ...s.muted, margin: 0 }}>
            {pct >= 65 && (primary === "D" || primary === "C")
              ? "Аналитический склад ума + решительность. Подходит для управленческих и проектных ролей."
              : pct >= 65 && (primary === "I" || primary === "S")
              ? "Сильная коммуникация и надёжность. Хорошая база для операционных и клиентских ролей."
              : pct < 65 && (primary === "D" || primary === "I")
              ? "Активный кандидат. Рекомендуется дополнительная проверка аналитических навыков."
              : "Стабильный профиль. Подходит для исполнительских ролей в структурированной среде."}
          </p>
        </div>
        <button style={{ ...s.btnPrimary, marginTop: "1.5rem" }} onClick={resetAll}>← Пройти снова</button>
      </div>
    );
  }
  return null;
}