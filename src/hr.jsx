import { useState, useMemo } from "react";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwxZKU5KNXZDWpESG1NinBrWhInlAQ1Cqp0g71WZbuRF3XcPhmb_JEtf6cXykVb5d-m/exec";
const HR_PASSWORD = "hr2024";

const RANK_COLOR = {
  "A — Высокий потенциал": "#27ae60",
  "B — Выше среднего": "#2980b9",
  "C — Средний уровень": "#e67e22",
  "D — Ниже ожиданий": "#c0392b"
};

const DISC_COLOR = {
  "Доминирование (D)": "#c0392b",
  "Влияние (I)": "#e67e22",
  "Стабильность (S)": "#27ae60",
  "Соответствие (C)": "#2980b9"
};

const DISC_DATA = {
  "Доминирование (D)": {
    strengths: ["Кризисное управление", "Быстрые решения", "Лидерство в задаче", "Высокая результативность"],
    risks: ["Давит на команду, игнорирует чужое мнение", "Нетерпелив — срезает углы в ущерб качеству", "Плохо слушает, конфликтует с другими D", "Выгорает если нет видимого результата"],
    not_for: ["Поддержка клиентов", "Монотонные операционные задачи", "Роли требующие высокой эмпатии", "Работа в тени без признания"],
  },
  "Влияние (I)": {
    strengths: ["Продажи и переговоры", "Вдохновение команды", "Нетворкинг", "Презентации и выступления"],
    risks: ["Избегает деталей и рутины", "Обещает больше чем может выполнить", "Непоследователен, переключается между задачами", "Принимает решения на эмоциях"],
    not_for: ["Аналитика и работа с данными", "Контроль качества", "Задачи требующие усидчивости", "Финансовый учёт и отчётность"],
  },
  "Стабильность (S)": {
    strengths: ["Надёжность и последовательность", "Поддержка команды", "Хранитель процессов", "Долгосрочная лояльность"],
    risks: ["Сопротивляется переменам даже когда они необходимы", "Медленно принимает решения под давлением", "Избегает конфликтов в ущерб результату", "Не говорит о проблемах пока они не стали критическими"],
    not_for: ["Антикризисное управление", "Стартап-среда с частыми изменениями", "Роли требующие жёстких переговоров", "Управление сложными конфликтами"],
  },
  "Соответствие (C)": {
    strengths: ["Точность и высокие стандарты", "Системный анализ", "Соблюдение регламентов", "Глубокая экспертиза"],
    risks: ["Медленно принимает решения — ищет идеальный вариант", "Боится риска, избегает неопределённости", "Чрезмерно критичен к другим", "Сложно делегирует — не доверяет качеству других"],
    not_for: ["Продажи и переговоры", "Роли требующие быстрых решений", "Публичные выступления", "Управление людьми с высокой эмоциональностью"],
  },
};

const BELBIN_DATA = {
  "Генератор идей": {
    strengths: ["Нестандартные решения", "Инновации", "Выход из тупика", "Свежий взгляд на проблему"],
    risks: ["Не доводит идеи до конца", "Игнорирует практические ограничения", "Плохо работает в жёстких структурах", "Может демотивировать нереалистичными идеями"],
    not_for: ["Исполнение рутинных процессов", "Контроль качества", "Административная работа", "Роли с чётким регламентом"],
  },
  "Исследователь ресурсов": {
    strengths: ["Нетворкинг", "Поиск внешних возможностей", "Переговоры с партнёрами", "Быстрый старт проектов"],
    risks: ["Теряет интерес после старта", "Не доводит проекты до финала", "Зависит от внешней стимуляции", "Поверхностно вникает в детали"],
    not_for: ["Долгосрочные проекты без внешних контактов", "Детальная техническая работа", "Финальные этапы проектов", "Монотонные задачи"],
  },
  "Координатор": {
    strengths: ["Организация команды", "Делегирование", "Фокус на цели", "Управление встречами"],
    risks: ["Может выглядеть как манипулятор", "Присваивает чужие заслуги", "Слабый исполнитель сам по себе", "Зависит от сильной команды вокруг"],
    not_for: ["Глубокая техническая экспертиза", "Самостоятельное выполнение без команды", "Роли без необходимости координировать людей"],
  },
  "Мотиватор": {
    strengths: ["Преодоление препятствий", "Высокая энергия", "Давление на результат", "Антикризисное ускорение"],
    risks: ["Создаёт напряжение и стресс в команде", "Груб и нетактичен под давлением", "Провоцирует конфликты", "Игнорирует эмоции коллег"],
    not_for: ["Работа с чувствительными сотрудниками", "Долгосрочное наставничество", "Клиентский сервис", "Роли требующие дипломатии"],
  },
  "Аналитик-стратег": {
    strengths: ["Стратегическое мышление", "Объективная оценка", "Предотвращение ошибок", "Взвешенные решения"],
    risks: ["Медленно принимает решения", "Демотивирует излишним скептицизмом", "Не вдохновляет и не мотивирует", "Чрезмерно критичен к идеям других"],
    not_for: ["Роли требующие быстрых решений", "Мотивация команды", "Продажи", "Публичные коммуникации"],
  },
  "Командный игрок": {
    strengths: ["Сплочение команды", "Дипломатия", "Поддержка в кризис", "Разрешение конфликтов"],
    risks: ["Избегает жёстких решений", "Не может уволить или отказать", "Медлит в конфликтах", "Слишком ориентирован на консенсус в ущерб скорости"],
    not_for: ["Жёсткие переговоры", "Антикризисные решения с непопулярными мерами", "Роли с жёсткими KPI", "Управление некомпетентными сотрудниками"],
  },
  "Реализатор": {
    strengths: ["Дисциплина", "Надёжное исполнение", "Организация процессов", "Системность"],
    risks: ["Негибкий при изменении планов", "Сопротивляется нестандартным подходам", "Медленно адаптируется", "Может тормозить инновации"],
    not_for: ["Стартап-среда", "Роли требующие постоянной адаптации", "Творческие задачи", "Антикризисные ситуации"],
  },
  "Контролёр качества": {
    strengths: ["Внимание к деталям", "Высокий стандарт", "Минимизация ошибок", "Финальная проверка"],
    risks: ["Создаёт узкое место — всё через него", "Парализует команду перфекционизмом", "Медленно выпускает результат", "Тревожность передаётся команде"],
    not_for: ["Быстрые итерации", "MVP-подход", "Продажи", "Роли где скорость важнее качества"],
  },
  "Специалист": {
    strengths: ["Глубокая экспертиза", "Высокая ценность в своей области", "Надёжный источник знаний"],
    risks: ["Узкий кругозор вне своей области", "Сложно работает кросс-функционально", "Не видит общей картины", "Защищает свою область в ущерб общему результату"],
    not_for: ["Управленческие роли", "Кросс-функциональные задачи", "Стратегическое планирование"],
  },
};

const RANK_DESC = {
  "A — Высокий потенциал": "Исключительный результат. Сильное аналитическое мышление, быстрая обработка информации, высокое качество решений под давлением.",
  "B — Выше среднего": "Хороший результат. Справляется со сложными задачами, мыслит системно. Рекомендуется для позиций требующих самостоятельности.",
  "C — Средний уровень": "Базовый уровень. Справляется со стандартными задачами. Рекомендуется для структурированных ролей с чётким руководством.",
  "D — Ниже ожиданий": "Результат ниже минимального порога. Рекомендуется дополнительное собеседование для уточнения причин.",
};

const SECTIONS = [
  { key: "Числовая логика (макс 8)", label: "Числовая логика", max: 8 },
  { key: "Вербальное мышление (макс 8)", label: "Вербальное", max: 8 },
  { key: "Ситуативные задачи (макс 12)", label: "Ситуативные", max: 12 },
  { key: "Нестандартное мышление (макс 8)", label: "Нестандартное", max: 8 },
  { key: "Скорость решений (макс 7)", label: "Скорость", max: 7 },
];

const Bar = ({ val, max, color, height = 6 }) => {
  const p = Math.min(100, Math.round((val / max) * 100));
  const c = color || (p >= 80 ? "#27ae60" : p >= 50 ? "#e67e22" : "#c0392b");
  return (
    <div style={{ height, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: p + "%", background: c, borderRadius: 3, transition: "width 0.4s" }} />
    </div>
  );
};

const Tag = ({ label, color }) => (
  <span style={{ display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 20, background: (color || "#666") + "22", color: color || "#666", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
);

const RiskBlock = ({ title, items, color, icon }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 6 }}>{icon} {title}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, background: color + "11", color: "#333", border: "1px solid " + color + "33" }}>{item}</div>
      ))}
    </div>
  </div>
);

const AIInsight = ({ candidate }) => {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate })
      });
      const data = await res.json();
      setInsight(data.result || "Не удалось получить анализ.");
      setDone(true);
    } catch (e) {
      setInsight("Ошибка при генерации анализа.");
      setDone(true);
    }
    setLoading(false);
  };

  if (!done && !loading) return (
    <button onClick={generate} style={{ padding: "10px 20px", background: "#6c5ce7", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      ✦ Сгенерировать AI-анализ
    </button>
  );

  if (loading) return (
    <div style={{ fontSize: 13, color: "#888", padding: "12px 0" }}>Анализирую профиль кандидата...</div>
  );

  return (
    <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{insight}</div>
  );
};

export default function App() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [compare, setCompare] = useState([]);
  const [filterRank, setFilterRank] = useState("all");
  const [filterDisc, setFilterDisc] = useState("all");
  const [filterBelbin, setFilterBelbin] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");

  const deleteCandidate = async (candidate) => {
    if (!window.confirm("Удалить запись " + candidate["Имя"] + "?")) return;
    try {
      const date = String(candidate["Дата"]).slice(0, 10);
      const name = encodeURIComponent(candidate["Имя"]);
      await fetch(`${SHEETS_URL}?action=delete&name=${name}&date=${date}`);
      setCandidates(prev => prev.filter(c => !(c["Имя"] === candidate["Имя"] && c["Дата"] === candidate["Дата"])));
      if (selected) setSelected(null);
    } catch (e) { alert("Ошибка удаления"); }
  };

  const login = () => {
    if (pass === HR_PASSWORD) { setAuth(true); loadData(); }
    else setPassErr(true);
  };

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(SHEETS_URL);
      const json = await res.json();
      if (json.result === "success") setCandidates(json.data.reverse());
      else setError("Ошибка загрузки данных");
    } catch (e) { setError("Не удалось подключиться к таблице"); }
    setLoading(false);
  };

  const filtered = useMemo(() => candidates.filter(c => {
    if (search && !c["Имя"]?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRank !== "all" && c["Ранг"] !== filterRank) return false;
    if (filterDisc !== "all" && c["DISC осн."] !== filterDisc) return false;
    if (filterBelbin !== "all" && c["Белбин осн."] !== filterBelbin) return false;
    return true;
  }), [candidates, search, filterRank, filterDisc, filterBelbin]);

  const ranks = [...new Set(candidates.map(c => c["Ранг"]).filter(Boolean))];
  const discs = [...new Set(candidates.map(c => c["DISC осн."]).filter(Boolean))];
  const belbins = [...new Set(candidates.map(c => c["Белбин осн."]).filter(Boolean))];
  const avgScore = candidates.length ? Math.round(candidates.reduce((s, c) => s + (Number(c["Балл % (макс 100)"]) || 0), 0) / candidates.length) : 0;

  const s = {
    wrap: { padding: "1.25rem", maxWidth: 980, margin: "0 auto", fontFamily: "sans-serif", fontSize: 14 },
    h1: { fontSize: 20, fontWeight: 700, color: "#111", margin: 0 },
    h2: { fontSize: 15, fontWeight: 600, color: "#111", margin: "0 0 12px" },
    card: { background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 },
    row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    btn: (active) => ({ padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", background: active ? "#111" : "#fff", color: active ? "#fff" : "#333", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400 }),
    select: { padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, background: "#fff", color: "#333" },
    input: { padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, background: "#fff", color: "#333", width: 180 },
    stat: { textAlign: "center", padding: "12px 20px", background: "#f9f9f9", borderRadius: 10, flex: 1, minWidth: 100 },
  };

  if (!auth) return (
    <div style={{ ...s.wrap, maxWidth: 360, paddingTop: "5rem" }}>
      <div style={s.card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
          <div style={s.h1}>HR-панель</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Введите пароль для доступа</div>
        </div>
        <input type="password" value={pass}
          onChange={e => { setPass(e.target.value); setPassErr(false); }}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="Пароль..."
          style={{ ...s.input, width: "100%", boxSizing: "border-box", marginBottom: 8, padding: "10px 14px", fontSize: 15, border: passErr ? "1.5px solid #c0392b" : "1px solid #ddd" }} />
        {passErr && <div style={{ color: "#c0392b", fontSize: 12, marginBottom: 8 }}>Неверный пароль</div>}
        <button style={{ ...s.btn(true), width: "100%", padding: "10px", fontSize: 15 }} onClick={login}>Войти</button>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={s.h1}>HR-панель</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{candidates.length} кандидатов загружено</div>
        </div>
        <div style={s.row}>
          {["list", "card", "stats"].map(v => (
            <button key={v} style={s.btn(view === v && !selected)} onClick={() => { setView(v); setSelected(null); }}>
              {v === "list" ? "Список" : v === "card" ? "Карточки" : "Статистика"}
            </button>
          ))}
          <button style={{ ...s.btn(false), background: "#f0f0f0" }} onClick={loadData}>↻ Обновить</button>
        </div>
      </div>

      <div style={{ ...s.card, padding: "0.75rem 1.25rem" }}>
        <div style={{ ...s.row, gap: 12 }}>
          <input style={s.input} placeholder="Поиск по имени..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={s.select} value={filterRank} onChange={e => setFilterRank(e.target.value)}>
            <option value="all">Все ранги</option>
            {ranks.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select style={s.select} value={filterDisc} onChange={e => setFilterDisc(e.target.value)}>
            <option value="all">Все DISC</option>
            {discs.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={s.select} value={filterBelbin} onChange={e => setFilterBelbin(e.target.value)}>
            <option value="all">Все роли Белбин</option>
            {belbins.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {(filterRank !== "all" || filterDisc !== "all" || filterBelbin !== "all" || search) && (
            <button style={s.btn(false)} onClick={() => { setFilterRank("all"); setFilterDisc("all"); setFilterBelbin("all"); setSearch(""); }}>Сбросить</button>
          )}
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Загрузка...</div>}
      {error && <div style={{ color: "#c0392b", padding: "1rem", textAlign: "center" }}>{error}</div>}

      {/* STATS */}
      {view === "stats" && !loading && !selected && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              { val: candidates.length, label: "Всего", color: "#111" },
              { val: avgScore + "%", label: "Средний балл", color: "#2980b9" },
              { val: candidates.filter(c => c["Ранг"] === "A — Высокий потенциал").length, label: "Ранг A", color: "#27ae60" },
              { val: candidates.filter(c => c["Ранг"] === "B — Выше среднего").length, label: "Ранг B", color: "#2980b9" },
              { val: candidates.filter(c => c["Ранг"] === "C — Средний уровень").length, label: "Ранг C", color: "#e67e22" },
              { val: candidates.filter(c => c["Ранг"] === "D — Ниже ожиданий").length, label: "Ранг D", color: "#c0392b" },
            ].map((item, i) => (
              <div key={i} style={s.stat}>
                <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.val}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ ...s.card, flex: 1, minWidth: 280 }}>
              <div style={s.h2}>Средний балл по секциям</div>
              {SECTIONS.map(sec => {
                const vals = candidates.map(c => Number(c[sec.key]) || 0).filter(v => v > 0);
                const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
                return (
                  <div key={sec.key} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{sec.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{avg}/{sec.max}</span>
                    </div>
                    <Bar val={avg} max={sec.max} />
                  </div>
                );
              })}
            </div>
            <div style={{ ...s.card, flex: 1, minWidth: 280 }}>
              <div style={s.h2}>DISC — распределение</div>
              {Object.keys(DISC_DATA).map(d => {
                const cnt = candidates.filter(c => c["DISC осн."] === d).length;
                return (
                  <div key={d} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{d}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{cnt}</span>
                    </div>
                    <Bar val={cnt} max={Math.max(1, candidates.length)} color={DISC_COLOR[d]} />
                  </div>
                );
              })}
            </div>
            <div style={{ ...s.card, flex: 1, minWidth: 280 }}>
              <div style={s.h2}>Белбин — топ ролей</div>
              {Object.entries(
                candidates.reduce((acc, c) => {
                  const r = c["Белбин осн."];
                  if (r) acc[r] = (acc[r] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([role, cnt]) => (
                <div key={role} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{role}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{cnt}</span>
                  </div>
                  <Bar val={cnt} max={Math.max(1, candidates.length)} color="#6c5ce7" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      {view === "list" && !loading && !selected && (
        <div>
          {compare.length > 0 && (
            <div style={{ ...s.card, background: "#f0f7ff", border: "1px solid #2980b9" }}>
              <div style={{ ...s.row, justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, color: "#2980b9", fontWeight: 600 }}>Выбрано: {compare.map(c => c["Имя"]).join(" vs ")}</div>
                <div style={s.row}>
                  {compare.length === 2 && <button style={s.btn(true)} onClick={() => setView("compare")}>Сравнить</button>}
                  <button style={s.btn(false)} onClick={() => setCompare([])}>Сбросить</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Найдено: {filtered.length}</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #eee" }}>
                {["", "Имя", "Дата", "Балл", "Ранг", "DISC", "Белбин", ""].map((h, i) => (
                  <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const score = Number(c["Балл % (макс 100)"]) || 0;
                const rankColor = RANK_COLOR[c["Ранг"]] || "#888";
                const inCompare = compare.some(x => x["Имя"] === c["Имя"] && x["Дата"] === c["Дата"]);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: inCompare ? "#f0f7ff" : "white" }}>
                    <td style={{ padding: "8px 12px" }}>
                      <input type="checkbox" checked={inCompare} onChange={() => {
                        if (inCompare) setCompare(prev => prev.filter(x => !(x["Имя"] === c["Имя"] && x["Дата"] === c["Дата"])));
                        else if (compare.length < 2) setCompare(prev => [...prev, c]);
                      }} />
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{c["Имя"]}</td>
                    <td style={{ padding: "8px 12px", color: "#888", fontSize: 12 }}>{String(c["Дата"]).slice(0, 10)}</td>
                    <td style={{ padding: "8px 12px" }}><span style={{ fontWeight: 700, color: rankColor }}>{score}%</span></td>
                    <td style={{ padding: "8px 12px" }}><Tag label={(c["Ранг"] || "-").split(" — ")[0]} color={rankColor} /></td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#555" }}>{c["DISC осн."] || "-"}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#555" }}>{c["Белбин осн."] || "-"}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={s.row}>
                        <button style={{ ...s.btn(false), padding: "4px 10px", fontSize: 12 }} onClick={() => setSelected(c)}>Открыть</button>
                        <button style={{ ...s.btn(false), padding: "4px 10px", fontSize: 12, color: "#c0392b", borderColor: "#c0392b" }} onClick={() => deleteCandidate(c)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Нет кандидатов</div>}
        </div>
      )}

      {/* CARD LIST */}
      {view === "card" && !loading && !selected && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {filtered.map((c, i) => {
            const score = Number(c["Балл % (макс 100)"]) || 0;
            const rankColor = RANK_COLOR[c["Ранг"]] || "#888";
            return (
              <div key={i} style={{ ...s.card, width: 240, cursor: "pointer" }} onClick={() => setSelected(c)}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{c["Имя"]}</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{String(c["Дата"]).slice(0, 10)}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: rankColor }}>{score}%</span>
                  <Tag label={(c["Ранг"] || "-").split(" — ")[0]} color={rankColor} />
                </div>
                <Bar val={score} max={100} color={rankColor} height={4} />
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Tag label={c["DISC осн."] || "-"} color={DISC_COLOR[c["DISC осн."]] || "#888"} />
                  <Tag label={c["Белбин осн."] || "-"} color="#6c5ce7" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANDIDATE DETAIL */}
      {selected && (
        <div>
          <button style={{ ...s.btn(false), marginBottom: 16 }} onClick={() => setSelected(null)}>← Назад</button>
          <div style={{ ...s.row, justifyContent: "flex-end", marginBottom: 12 }}>
            <button style={{ ...s.btn(false), color: "#c0392b", borderColor: "#c0392b", fontSize: 13 }} onClick={() => deleteCandidate(selected)}>
              🗑 Удалить запись
            </button>
          </div>
          <div style={s.card}>
            <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{selected["Имя"]}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{String(selected["Дата"]).slice(0, 16)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: RANK_COLOR[selected["Ранг"]] || "#888" }}>{selected["Балл % (макс 100)"]}%</div>
                <Tag label={selected["Ранг"] || "-"} color={RANK_COLOR[selected["Ранг"]]} />
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#555", background: "#f9f9f9", borderRadius: 8, padding: "10px 14px" }}>
              {RANK_DESC[selected["Ранг"]] || ""}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.h2}>Результаты по секциям</div>
            {SECTIONS.map(sec => {
              const val = Number(selected[sec.key]) || 0;
              const p = Math.round((val / sec.max) * 100);
              return (
                <div key={sec.key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{sec.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{val}/{sec.max} ({p}%)</span>
                  </div>
                  <Bar val={val} max={sec.max} />
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ ...s.card, flex: 1, minWidth: 280 }}>
              <div style={s.h2}>DISC-профиль</div>
              <div style={{ marginBottom: 6 }}>
                <Tag label={selected["DISC осн."] || "-"} color={DISC_COLOR[selected["DISC осн."]] || "#888"} />
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>основной</span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <Tag label={selected["DISC втор."] || "-"} color={DISC_COLOR[selected["DISC втор."]] || "#888"} />
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>вторичный</span>
              </div>
              {DISC_DATA[selected["DISC осн."]] && (
                <>
                  <RiskBlock title="Сильные стороны" items={DISC_DATA[selected["DISC осн."]].strengths} color="#27ae60" icon="✓" />
                  <RiskBlock title="Зоны риска" items={DISC_DATA[selected["DISC осн."]].risks} color="#e67e22" icon="⚠" />
                  <RiskBlock title="Не подходит для" items={DISC_DATA[selected["DISC осн."]].not_for} color="#c0392b" icon="✕" />
                </>
              )}
            </div>
            <div style={{ ...s.card, flex: 1, minWidth: 280 }}>
              <div style={s.h2}>Командная роль (Белбин)</div>
              <div style={{ marginBottom: 6 }}>
                <Tag label={selected["Белбин осн."] || "-"} color="#6c5ce7" />
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>основная</span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <Tag label={selected["Белбин втор."] || "-"} color="#a29bfe" />
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>вторичная</span>
              </div>
              {BELBIN_DATA[selected["Белбин осн."]] && (
                <>
                  <RiskBlock title="Сильные стороны" items={BELBIN_DATA[selected["Белбин осн."]].strengths} color="#27ae60" icon="✓" />
                  <RiskBlock title="Зоны риска" items={BELBIN_DATA[selected["Белбин осн."]].risks} color="#e67e22" icon="⚠" />
                  <RiskBlock title="Не подходит для" items={BELBIN_DATA[selected["Белбин осн."]].not_for} color="#c0392b" icon="✕" />
                </>
              )}
            </div>
          </div>

          <div style={{ ...s.card, background: "#fafafa" }}>
            <div style={s.h2}>✦ AI-анализ кандидата</div>
            <AIInsight candidate={selected} />
          </div>
        </div>
      )}

      {/* COMPARE */}
      {view === "compare" && compare.length === 2 && !selected && (
        <div>
          <button style={{ ...s.btn(false), marginBottom: 16 }} onClick={() => setView("list")}>← Назад</button>
          <div style={{ display: "flex", gap: 12 }}>
            {compare.map((c, ci) => {
              const score = Number(c["Балл % (макс 100)"]) || 0;
              const rankColor = RANK_COLOR[c["Ранг"]] || "#888";
              return (
                <div key={ci} style={{ ...s.card, flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{c["Имя"]}</div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{String(c["Дата"]).slice(0, 10)}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: rankColor, marginBottom: 4 }}>{score}%</div>
                  <Tag label={c["Ранг"] || "-"} color={rankColor} />
                  <div style={{ marginTop: 16 }}>
                    {SECTIONS.map(sec => {
                      const val = Number(c[sec.key]) || 0;
                      return (
                        <div key={sec.key} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 12 }}>{sec.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{val}/{sec.max}</span>
                          </div>
                          <Bar val={val} max={sec.max} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>DISC</div>
                    <Tag label={c["DISC осн."] || "-"} color={DISC_COLOR[c["DISC осн."]] || "#888"} />
                    <div style={{ fontSize: 12, color: "#888", margin: "8px 0 6px" }}>Белбин</div>
                    <Tag label={c["Белбин осн."] || "-"} color="#6c5ce7" />
                    {DISC_DATA[c["DISC осн."]] && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, color: "#c0392b", fontWeight: 600, marginBottom: 6 }}>Не подходит для</div>
                        {DISC_DATA[c["DISC осн."]].not_for.map((item, i) => (
                          <div key={i} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "#c0392b11", color: "#333", marginBottom: 4 }}>{item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}