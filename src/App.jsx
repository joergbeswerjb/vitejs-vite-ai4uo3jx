import { useState, useEffect, useRef } from "react";

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
  { a: { text: "Мне нравится сложные задачи с высокими ставками", d: "D" }, b: { text: "Мне нравится выстраивать долгосрочные отношения с людьми", d: "S" } },
  { a: { text: "Ошибки нужно разбирать детально, чтобы не повторять", d: "C" }, b: { text: "После ошибки лучше быстро двигаться вперёд", d: "I" } },
  { a: { text: "Мне легко мотивировать людей через общение", d: "I" }, b: { text: "Мне легко структурировать работу и расставлять приоритеты", d: "D" } },
  { a: { text: "Я ценю предсказуемость и последовательность", d: "S" }, b: { text: "Я ценю высокие стандарты и точность", d: "C" } },
  { a: { text: "Для меня важно, чтобы моя работа помогала другим", d: "S" }, b: { text: "Для меня важно, чтобы мои решения были логически обоснованы", d: "C" } },
  { a: { text: "Я готов взять на себя ответственность, даже если нет 100% уверенности", d: "D" }, b: { text: "Мне важно, чтобы люди вокруг были вовлечены и воодушевлены", d: "I" } },
];

const IQ_QUESTIONS = [
  { type: "numeric", q: "Найдите следующее число в ряду: 2, 6, 18, 54, ?", options: ["108", "162", "126", "216"], ans: 1 },
  { type: "numeric", q: "Если A > B и B > C, то верно ли, что A > C?", options: ["Да", "Нет", "Не всегда", "Невозможно определить"], ans: 0 },
  { type: "numeric", q: "Поезд едет 120 км за 1,5 часа. Какова его скорость?", options: ["80 км/ч", "90 км/ч", "60 км/ч", "75 км/ч"], ans: 0 },
  { type: "numeric", q: "Какое число лишнее: 4, 9, 16, 25, 35, 36?", options: ["4", "25", "35", "36"], ans: 2 },
  { type: "numeric", q: "Ряд: 1, 4, 9, 16, 25, ? Что следует дальше?", options: ["30", "36", "49", "34"], ans: 1 },
  { type: "verbal", q: "«Горячий» относится к «холодный» так же как «быстрый» к:", options: ["Скорость", "Медленный", "Бегун", "Время"], ans: 1 },
  { type: "verbal", q: "Найдите лишнее слово: роза, тюльпан, береза, ромашка, пион", options: ["Роза", "Береза", "Ромашка", "Пион"], ans: 1 },
  { type: "verbal", q: "Слово «педантичный» означает:", options: ["Легкомысленный", "Скрупулёзный и точный", "Общительный", "Ленивый"], ans: 1 },
  { type: "verbal", q: "«Врач» лечит «пациента», «судья» выносит приговор:", options: ["Закону", "Прокурору", "Обвиняемому", "Свидетелю"], ans: 2 },
  { type: "verbal", q: "Найдите синоним слова «лаконичный»:", options: ["Красноречивый", "Краткий", "Подробный", "Запутанный"], ans: 1 },
  { type: "situational", q: "Вы руководитель. Ключевой сотрудник просит отгул в самый пик работы. Ваши действия?", options: ["Откажу — сейчас не время", "Отпущу, найду замену сам", "Поговорю, выясню срочность и найдём решение вместе", "Попрошу его решить вопрос с коллегами самостоятельно"], ans: 2 },
  { type: "situational", q: "Вы обнаружили ошибку в отчёте, который уже отправлен руководству. Что делаете?", options: ["Жду, вдруг не заметят", "Сообщу немедленно и предложу исправление", "Исправлю тихо, если возможно", "Обвиню коллегу, который помогал"], ans: 1 },
  { type: "situational", q: "Клиент агрессивно жалуется на сервис, но вы уверены, что компания права. Ваши действия?", options: ["Буду отстаивать позицию жёстко", "Извинюсь и сразу уступлю", "Выслушаю, признаю неудобство, объясню ситуацию спокойно", "Переключу на менеджера"], ans: 2 },
  { type: "situational", q: "У вас два дедлайна одновременно. Оба важны. Что делаете?", options: ["Берусь за оба и стараюсь успеть", "Сообщу руководителю и попрошу помочь с приоритетами", "Выберу тот, что проще", "Попрошу продления обоих"], ans: 1 },
  { type: "situational", q: "Коллега делает задачу неправильно, но не просил вашего мнения. Ваши действия?", options: ["Промолчу — не моё дело", "Скажу прямо при всех", "Тихо скажу ему один на один", "Сообщу руководителю"], ans: 2 },
  { type: "situational", q: "Вам поручили задачу, в которой вы не уверены. Как поступите?", options: ["Попробую сам, не признавая неуверенности", "Скажу, что не умею и откажусь", "Уточню детали, попрошу примеры и сделаю", "Делегирую коллеге"], ans: 2 },
  { type: "situational", q: "Ваш проект провалился из-за непредвиденных обстоятельств. Реакция:", options: ["Ищу виноватых", "Признаю ошибки, анализирую и делаю выводы", "Замалчиваю", "Жду, что всё само урегулируется"], ans: 1 },
  { type: "situational", q: "Вы операционный сотрудник. Заметили улучшение процесса, но не в вашей зоне ответственности:", options: ["Промолчу — не моё", "Внесу изменения сам", "Опишу идею и передам ответственному руководителю", "Буду ждать, пока спросят"], ans: 2 },
  { type: "nonstandard", q: "Сколько раз можно сложить лист бумаги пополам?", options: ["Бесконечно", "Около 7 раз физически", "Ровно 10 раз", "Зависит только от размера листа"], ans: 1 },
  { type: "nonstandard", q: "У фермера 17 овец. Все кроме 9 погибли. Сколько осталось?", options: ["8", "9", "17", "0"], ans: 1 },
  { type: "nonstandard", q: "Что общего между деревом и компанией?", options: ["Оба растут", "Оба могут иметь ветви", "Оба требуют ресурсов для роста", "Все варианты верны"], ans: 3 },
  { type: "nonstandard", q: "Слово написано неправильно во всех словарях мира. Что это за слово?", options: ["Нет такого слова", "«Неправильно»", "Зависит от языка", "Это ошибка в задаче"], ans: 1 },
  { type: "nonstandard", q: "Если бы вы были директором аэропорта и нашли чемодан без хозяина, ваш первый шаг?", options: ["Вызвать охрану и оцепить зону", "Открыть чемодан", "Объявить по громкоговорителю", "Сдать в полицию"], ans: 0 },
  { type: "speed", q: "7 × 8 = ?", options: ["54", "56", "48", "63"], ans: 1 },
  { type: "speed", q: "25% от 200 = ?", options: ["25", "50", "75", "100"], ans: 1 },
  { type: "speed", q: "Если сегодня среда, какой день будет через 10 дней?", options: ["Пятница", "Суббота", "Воскресенье", "Среда"], ans: 1 },
  { type: "speed", q: "Что больше: 3/4 или 7/9?", options: ["3/4", "7/9", "Равны", "Невозможно сравнить"], ans: 1 },
  { type: "speed", q: "В магазине было 50 товаров. Продали 40%. Сколько осталось?", options: ["20", "30", "10", "40"], ans: 1 },
];

const DISC_PROFILES = {
  D: { name: "Доминирование (D)", color: "#c0392b", desc: "Ориентирован на результат, решителен, любит контроль. Силён в условиях давления и конкуренции. Может быть жёстким." },
  I: { name: "Влияние (I)", color: "#e67e22", desc: "Коммуникабелен, энергичен, умеет вовлекать. Отличный командный игрок и переговорщик. Может избегать деталей." },
  S: { name: "Стабильность (S)", color: "#27ae60", desc: "Надёжен, терпелив, лоялен. Ценит гармонию и стабильность. Может сопротивляться переменам." },
  C: { name: "Соответствие (C)", color: "#2980b9", desc: "Аналитичен, точен, следует правилам. Ценит качество и логику. Может быть излишне осторожным." },
};

const IQ_SECTIONS = [
  { key: "numeric", label: "Числовая логика", max: 5 },
  { key: "verbal", label: "Вербальное мышление", max: 5 },
  { key: "situational", label: "Ситуативные задачи", max: 8 },
  { key: "nonstandard", label: "Нестандартное мышление", max: 5 },
  { key: "speed", label: "Скорость решений", max: 5 },
];

const SPEED_Q_IDS = IQ_QUESTIONS.map((q, i) => q.type === "speed" ? i : -1).filter(i => i >= 0);
const SPEED_TIME = 8;

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | iq | disc | result
  const [iqAnswers, setIqAnswers] = useState({});
  const [discAnswers, setDiscAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timedOut, setTimedOut] = useState({});
  const timerRef = useRef(null);
  const [candidateName, setCandidateName] = useState("");

  const totalIQ = IQ_QUESTIONS.length;
  const totalDISC = DISC_PAIRS.length;

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
      } else {
        setTimeLeft(null);
      }
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

  const calcIQScore = () => {
    let scores = { numeric: 0, verbal: 0, situational: 0, nonstandard: 0, speed: 0 };
    IQ_QUESTIONS.forEach((q, i) => {
      if (iqAnswers[i] === q.ans) scores[q.type]++;
    });
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

  const s = {
    wrap: { padding: "1.5rem 1rem", maxWidth: 640, margin: "0 auto", fontFamily: "var(--font-sans)" },
    h1: { fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 0.5rem" },
    h2: { fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 1rem" },
    muted: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 },
    btn: { display: "block", width: "100%", padding: "12px 16px", marginBottom: 10, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", fontSize: 15, color: "var(--color-text-primary)", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" },
    btnPrimary: { padding: "12px 24px", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-primary)", borderRadius: "var(--border-radius-md)", fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", cursor: "pointer", marginTop: "1rem" },
    progress: { height: 4, background: "var(--color-border-tertiary)", borderRadius: 2, margin: "1rem 0" },
    progressFill: (pct, col) => ({ height: "100%", width: `${pct}%`, background: col || "var(--color-text-primary)", borderRadius: 2, transition: "width 0.3s" }),
    card: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: 12 },
    tag: (col) => ({ display: "inline-block", fontSize: 12, padding: "3px 10px", borderRadius: "var(--border-radius-md)", background: col + "22", color: col, fontWeight: 500, marginBottom: 8 }),
  };

  if (screen === "intro") return (
    <div style={s.wrap}>
      <h1 style={s.h1}>Тест для кандидатов</h1>
      <p style={s.muted}>Тест состоит из двух блоков:<br/>• Блок 1 — Сообразительность (28 вопросов)<br/>• Блок 2 — Психотип DISC (20 пар утверждений)<br/><br/>Ориентировочное время: 30–40 минут. Некоторые вопросы имеют ограничение по времени.</p>
      <div style={{ marginTop: "1.5rem" }}>
        <label style={{ ...s.muted, display: "block", marginBottom: 6 }}>Имя кандидата</label>
        <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Введите имя..." style={{ width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
      </div>
      <button style={s.btnPrimary} onClick={() => { if (candidateName.trim()) setScreen("iq"); }}>Начать тест →</button>
    </div>
  );

  if (screen === "iq") {
    const q = IQ_QUESTIONS[currentQ];
    const isSpeed = SPEED_Q_IDS.includes(currentQ);
    const answered = currentQ in iqAnswers;
    const to = timedOut[currentQ];
    const sectionLabel = IQ_SECTIONS.find(s => s.key === q.type)?.label || "";
    const progPct = Math.round(((currentQ + 1) / totalIQ) * 100);
    return (
      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={s.muted}>Блок 1 · {sectionLabel}</span>
          <span style={s.muted}>{currentQ + 1} / {totalIQ}</span>
        </div>
        <div style={s.progress}><div style={s.progressFill(progPct)} /></div>
        {isSpeed && timeLeft !== null && (
          <div style={{ ...s.muted, marginBottom: 8, color: timeLeft <= 3 ? "#c0392b" : "var(--color-text-secondary)" }}>
            ⏱ {timeLeft} сек
          </div>
        )}
        <div style={{ ...s.card, marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, color: "var(--color-text-primary)" }}>{q.q}</p>
        </div>
        {q.options.map((opt, i) => {
          let border = "0.5px solid var(--color-border-tertiary)";
          let bg = "var(--color-background-secondary)";
          if (answered || to) {
            if (i === q.ans) { border = "1.5px solid #27ae60"; bg = "#27ae6011"; }
            else if (iqAnswers[currentQ] === i && i !== q.ans) { border = "1.5px solid #c0392b"; bg = "#c0392b11"; }
          }
          return (
            <button key={i} style={{ ...s.btn, border, background: bg }} onClick={() => answerIQ(i)}>
              {opt}
            </button>
          );
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={s.muted}>Блок 2 · Психотип</span>
          <span style={s.muted}>{currentQ + 1} / {totalDISC}</span>
        </div>
        <div style={s.progress}><div style={s.progressFill(progPct, "#2980b9")} /></div>
        <p style={{ ...s.muted, marginBottom: "1.25rem" }}>Выберите утверждение, которое точнее описывает вас:</p>
        {["a", "b"].map(k => {
          const item = pair[k];
          const chosen = discAnswers[currentQ] === item.d;
          return (
            <button key={k} style={{ ...s.btn, border: chosen ? "1.5px solid #2980b9" : "0.5px solid var(--color-border-tertiary)", background: chosen ? "#2980b911" : "var(--color-background-secondary)" }}
              onClick={() => answerDISC(item.d)}>
              {item.text}
            </button>
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
    const rank = getRank(pct);
    const pDisc = DISC_PROFILES[primary];
    const sDisc = DISC_PROFILES[secondary];
    const maxDisc = Math.max(...Object.values(counts));
    return (
      <div style={s.wrap}>
        <h1 style={s.h1}>Результаты · {candidateName}</h1>

        <h2 style={{ ...s.h2, marginTop: "1.5rem" }}>Блок 1 — Сообразительность</h2>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 36, fontWeight: 500, color: rank.color }}>{pct}%</span>
          <span style={s.tag(rank.color)}>{rank.label}</span>
        </div>
        <p style={s.muted}>{raw} правильных ответов из {totalIQ}</p>
        <div style={{ marginTop: "1rem" }}>
          {IQ_SECTIONS.map(sec => {
            const sc = scores[sec.key] || 0;
            const p = Math.round((sc / sec.max) * 100);
            return (
              <div key={sec.key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{sec.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{sc}/{sec.max}</span>
                </div>
                <div style={s.progress}>
                  <div style={s.progressFill(p, p >= 80 ? "#27ae60" : p >= 50 ? "#e67e22" : "#c0392b")} />
                </div>
              </div>
            );
          })}
        </div>

        <h2 style={{ ...s.h2, marginTop: "2rem" }}>Блок 2 — Психотип DISC</h2>
        <div style={{ ...s.card, borderLeft: `3px solid ${pDisc.color}`, borderRadius: "var(--border-radius-lg)" }}>
          <div style={s.tag(pDisc.color)}>Основной профиль</div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px", color: "var(--color-text-primary)" }}>{pDisc.name}</p>
          <p style={{ ...s.muted, margin: 0 }}>{pDisc.desc}</p>
        </div>
        <div style={{ ...s.card, borderLeft: `3px solid ${sDisc.color}`, borderRadius: "var(--border-radius-lg)" }}>
          <div style={s.tag(sDisc.color)}>Вторичный профиль</div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px", color: "var(--color-text-primary)" }}>{sDisc.name}</p>
          <p style={{ ...s.muted, margin: 0 }}>{sDisc.desc}</p>
        </div>
        <div style={{ marginTop: "1rem" }}>
          {Object.entries(DISC_PROFILES).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{v.name}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{counts[k]}</span>
              </div>
              <div style={s.progress}>
                <div style={{ ...s.progressFill(Math.round((counts[k] / maxDisc) * 100), v.color) }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...s.card, marginTop: "1.5rem", background: "var(--color-background-secondary)" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 6px" }}>Рекомендация</p>
          <p style={{ ...s.muted, margin: 0 }}>
            {pct >= 65 && (primary === "D" || primary === "C")
              ? "Аналитический склад ума + решительность. Подходит для управленческих и проектных ролей."
              : pct >= 65 && (primary === "I" || primary === "S")
              ? "Сильная коммуникация и надёжность. Хорошая база для операционных и клиентских ролей."
              : pct < 65 && (primary === "D" || primary === "I")
              ? "Активный, уверенный в себе кандидат. Рекомендуется дополнительная проверка аналитических навыков."
              : "Стабильный и надёжный профиль. Подходит для исполнительских ролей в структурированной среде."}
          </p>
        </div>

        <button style={{ ...s.btnPrimary, marginTop: "1.5rem" }} onClick={() => { setScreen("intro"); setIqAnswers({}); setDiscAnswers({}); setCurrentQ(0); setTimedOut({}); setCandidateName(""); }}>
          ← Пройти снова
        </button>
      </div>
    );
  }

  return null;
}