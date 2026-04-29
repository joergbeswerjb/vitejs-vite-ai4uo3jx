import { useState, useEffect, useMemo } from "react";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwxZKU5KNXZDWpESG1NinBrWhInlAQ1Cqp0g71WZbuRF3XcPhmb_JEtf6cXykVb5d-m/exec";
const HR_PASSWORD = "hr2024";

const RANK_COLOR = { "A — Высокий потенциал": "#27ae60", "B — Выше среднего": "#2980b9", "C — Средний уровень": "#e67e22", "D — Ниже ожиданий": "#c0392b" };
const DISC_COLOR = { "Доминирование (D)": "#c0392b", "Влияние (I)": "#e67e22", "Стабильность (S)": "#27ae60", "Соответствие (C)": "#2980b9" };

const RANK_DESC = {
  "A — Высокий потенциал": "Исключительный результат. Сильное аналитическое мышление, быстрая обработка информации, высокое качество решений под давлением.",
  "B — Выше среднего": "Хороший результат. Справляется со сложными задачами, мыслит системно. Рекомендуется для позиций требующих самостоятельности.",
  "C — Средний уровень": "Базовый уровень. Справляется со стандартными задачами. Рекомендуется для структурированных ролей с чётким руководством.",
  "D — Ниже ожиданий": "Результат ниже минимального порога. Рекомендуется дополнительное собеседование.",
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
  return <div style={{ height, background: "#eee", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${p}%`, background: c, borderRadius: 3, transition: "width 0.4s" }} /></div>;
};

const Tag = ({ label, color }) => (
  <span style={{ display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 20, background: (color || "#666") + "22", color: color || "#666", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
);

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
  const [view, setView] = useState("list"); // list | card | compare | stats

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
    wrap: { padding: "1.25rem", maxWidth: 960, margin: "0 auto", fontFamily: "sans-serif", fontSize: 14 },
    h1: { fontSize: 20, fontWeight: 700, color: "#111", margin: 0 },
    h2: { fontSize: 15, fontWeight: 600, color: "#111", margin: "0 0 12px" },
    card: { background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 },
    row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    btn: (active) => ({ padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", background: active ? "#111" : "#fff", color: active ? "#fff" : "#333", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400 }),
    select: { padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, background: "#fff", color: "#333" },
    input: { padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, background: "#fff", color: "#333", width: 180 },
    label: { fontSize: 12, color: "#888", marginBottom: 4, display: "block" },
    stat: { textAlign: "center", padding: "12px 20px", background: "#f9f9f9", borderRadius: 10, flex: 1, minWidth: 100 },
  };

  // LOGIN
  if (!auth) return (
    <div style={{ ...s.wrap, maxWidth: 360, paddingTop: "5rem" }}>
      <div style={s.card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
          <div style={s.h1}>HR-панель</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Введите пароль для доступа</div>
        </div>
        <input type="password" value={pass} onChange={e => { setPass(e.target.value); setPassErr(false); }}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="Пароль..."
          style={{ ...s.input, width: "100%", boxSizing: "border-box", marginBottom: 8, padding: "10px 14px", fontSize: 15, border: passErr ? "1.5px solid #c0392b" : "1px solid #ddd" }} />
        {passErr && <div style={{ color: "#c0392b", fontSize: 12, marginBottom: 8 }}>Неверный пароль</div>}
        <button style={{ ...s.btn(true), width: "100%", padding: "10px", fontSize: 15 }} onClick={login}>Войти</button>
      </div>
    </div>
  );

  // MAIN
  return (
    <div style={s.wrap}>
      {/* HEADER */}
      <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={s.h1}>HR-панель</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{candidates.length} кандидатов загружено</div>
        </div>
        <div style={s.row}>
          {["list", "card", "stats"].map(v => (
            <button key={v} style={s.btn(view === v)} onClick={() => setView(v)}>
              {v === "list" ? "Список" : v === "card" ? "Карточки" : "Статистика"}
            </button>
          ))}
          <button style={{ ...s.btn(false), background: "#f0f0f0" }} onClick={loadData}>↻ Обновить</button>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ ...s.card, padding: "0.75rem 1.25rem" }}>
        <div style={{ ...s.row, gap: 12 }}>
          <input style={s.input} placeholder="🔍 Поиск по имени..." value={search} onChange={e => setSearch(e.target.value)} />
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
            <button style={s.btn(false)} onClick={() => { setFilterRank("all"); setFilterDisc("all"); setFilterBelbin("all"); setSearch(""); }}>✕ Сбросить</button>
          )}
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Загрузка данных...</div>}
      {error && <div style={{ color: "#c0392b", padding: "1rem", textAlign: "center" }}>{error}</div>}

      {/* STATS VIEW */}
      {view === "stats" && !loading && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={s.stat}><div style={{ fontSize: 28, fontWeight: 700, color: "#111" }}>{candidates.length}</div><div style={{ fontSize: 12, color: "#888" }}>Всего кандидатов</div></div>
            <div style={s.stat}><div style={{ fontSize: 28, fontWeight: 700, color: "#2980b9" }}>{avgScore}%</div><div style={{ fontSize: 12, color: "#888" }}>Средний балл</div></div>
            <div style={s.stat}><div style={{ fontSize: 28, fontWeight: 700, color: "#27ae60" }}>{candidates.filter(c => c["Ранг"] === "A — Высокий потенциал").length}</div><div style={{ fontSize: 12, color: "#888" }}>Ранг A</div></div>
            <div style={s.stat}><div style={{ fontSize: 28, fontWeight: 700, color: "#2980b9" }}>{candidates.filter(c => c["Ранг"] === "B — Выше среднего").length}</div><div style={{ fontSize: 12, color: "#888" }}>Ранг B</div></div>
            <div style={s.stat}><div style={{ fontSize: 28, fontWeight: 700, color: "#e67e22" }}>{candidates.filter(c => c["Ранг"] === "C — Средний уровень").length}</div><div style={{ fontSize: 12, color: "#888" }}>Ранг C</div></div>
            <div style={s.stat}><div style={{ fontSize: 28, fontWeight: 700, color: "#c0392b" }}>{candidates.filter(c => c["Ранг"] === "D — Ниже ожиданий").length}</div><div style={{ fontSize: 12, color: "#888" }}>Ранг D</div></div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ ...s.card, flex: 1, minWidth: 280 }}>
              <div style={s.h2}>Средний балл по секциям</div>
              {SECTIONS.map(sec => {
                const vals = candidates.map(c => Number(c[sec.key]) || 0).filter(v => v > 0);
                const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
                const p = Math.round((avg / sec.max) * 100);
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
              {["Доминирование (D)", "Влияние (I)", "Стабильность (S)", "Соответствие (C)"].map(d => {
                const cnt = candidates.filter(c => c["DISC осн."] === d).length;
                const p = candidates.length ? Math.round((cnt / candidates.length) * 100) : 0;
                return (
                  <div key={d} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{d}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{cnt} ({p}%)</span>
                    </div>
                    <Bar val={cnt} max={Math.max(1, candidates.length)} color={DISC_COLOR[d]} />
                  </div>
                );
              })}
            </div>

            <div style={{ ...s.card, flex: 1, minWidth: 280 }}>
              <div style={s.h2}>Белбин — топ ролей</div>
              {Object.entries(
                candidates.reduce((acc, c) => { const r = c["Белбин осн."]; if (r) acc[r] = (acc[r] || 0) + 1; return acc; }, {})
              ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([role, cnt]) => {
                return (
                  <div key={role} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{role}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{cnt}</span>
                    </div>
                    <Bar val={cnt} max={Math.max(1, candidates.length)} color="#6c5ce7" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && !loading && (
        <div>
          {compare.length > 0 && (
            <div style={{ ...s.card, background: "#f0f7ff", border: "1px solid #2980b9" }}>
              <div style={{ ...s.row, justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, color: "#2980b9", fontWeight: 600 }}>
                  Выбрано для сравнения: {compare.map(c => c["Имя"]).join(" vs ")}
                </div>
                <div style={s.row}>
                  {compare.length === 2 && <button style={s.btn(true)} onClick={() => setView("compare")}>Сравнить →</button>}
                  <button style={s.btn(false)} onClick={() => setCompare([])}>✕ Сбросить</button>
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
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "#111" }}>{c["Имя"]}</td>
                    <td style={{ padding: "8px 12px", color: "#888", fontSize: 12 }}>{String(c["Дата"]).slice(0, 10)}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontWeight: 700, color: rankColor }}>{score}%</span>
                    </td>
                    <td style={{ padding: "8px 12px" }}><Tag label={c["Ранг"]?.split(" — ")[0] || "-"} color={rankColor} /></td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#555" }}>{c["DISC осн."] || "-"}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#555" }}>{c["Белбин осн."] || "-"}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <button style={{ ...s.btn(false), padding: "4px 10px", fontSize: 12 }} onClick={() => { setSelected(c); setView("card"); }}>Открыть</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Нет кандидатов по заданным фильтрам</div>}
        </div>
      )}

      {/* CARD VIEW */}
      {view === "card" && selected && (
        <div>
          <button style={{ ...s.btn(false), marginBottom: 16 }} onClick={() => { setView("list"); setSelected(null); }}>← Назад к списку</button>
          <div style={s.card}>
            <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{selected["Имя"]}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Прошёл тест: {String(selected["Дата"]).slice(0, 16)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: RANK_COLOR[selected["Ранг"]] || "#888" }}>{selected["Балл % (макс 100)"]}%</div>
                <Tag label={selected["Ранг"] || "-"} color={RANK_COLOR[selected["Ранг"]]} />
              </div>
            </div>

            <div style={{ fontSize: 13, color: "#555", background: "#f9f9f9", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              {RANK_DESC[selected["Ранг"]] || ""}
            </div>

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
            <div style={{ ...s.card, flex: 1, minWidth: 260 }}>
              <div style={s.h2}>DISC-профиль</div>
              <div style={{ marginBottom: 8 }}>
                <Tag label={selected["DISC осн."] || "-"} color={DISC_COLOR[selected["DISC осн."]] || "#888"} />
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>основной</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Tag label={selected["DISC втор."] || "-"} color={DISC_COLOR[selected["DISC втор."]] || "#888"} />
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>вторичный</span>
              </div>
              <div style={{ fontSize: 13, color: "#555", background: "#f9f9f9", borderRadius: 8, padding: "10px 14px" }}>
                {selected["DISC осн."] === "Доминирование (D)" && "Ориентирован на результат, решителен, берёт инициативу. Лучший в роли лидера задачи или антикризисного менеджера."}
                {selected["DISC осн."] === "Влияние (I)" && "Коммуникабелен, умеет вдохновлять и вовлекать людей. Силён в продажах, переговорах, командном взаимодействии."}
                {selected["DISC осн."] === "Стабильность (S)" && "Надёжен, терпелив, лоялен. Незаменим как опора команды и хранитель процессов."}
                {selected["DISC осн."] === "Соответствие (C)" && "Аналитичен, точен, следует стандартам. Ценен в ролях требующих точности: аналитика, контроль."}
              </div>
            </div>

            <div style={{ ...s.card, flex: 1, minWidth: 260 }}>
              <div style={s.h2}>Командная роль (Белбин)</div>
              <div style={{ marginBottom: 8 }}>
                <Tag label={selected["Белбин осн."] || "-"} color="#6c5ce7" />
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>основная</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Tag label={selected["Белбин втор."] || "-"} color="#a29bfe" />
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>вторичная</span>
              </div>
              <div style={{ fontSize: 13, color: "#555", background: "#f9f9f9", borderRadius: 8, padding: "10px 14px" }}>
                {selected["Белбин осн."] === "Генератор идей" && "Креативный, нестандартно мыслит. Незаменим на этапе поиска новых подходов и инноваций."}
                {selected["Белбин осн."] === "Исследователь ресурсов" && "Коммуникабельный, легко находит внешние ресурсы. Силён в нетворкинге и поиске партнёров."}
                {selected["Белбин осн."] === "Координатор" && "Умеет организовать работу группы и направить людей к цели. Лучший в роли координатора."}
                {selected["Белбин осн."] === "Мотиватор" && "Динамичный, не боится препятствий. Эффективен когда команде нужен толчок к действию."}
                {selected["Белбин осн."] === "Аналитик-стратег" && "Взвешенный, аналитичный. Незаменим при принятии стратегических решений."}
                {selected["Белбин осн."] === "Командный игрок" && "Дипломатичный, чуткий. Ключевой для поддержания здоровья и атмосферы в команде."}
                {selected["Белбин осн."] === "Реализатор" && "Дисциплинированный, надёжный. Силён в исполнении и организации процессов."}
                {selected["Белбин осн."] === "Контролёр качества" && "Педантичный, внимателен к деталям. Незаменим на финальных этапах проекта."}
                {selected["Белбин осн."] === "Специалист" && "Глубокая экспертиза в узкой области. Ценен когда нужна конкретная компетенция."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARD VIEW — no selected */}
      {view === "card" && !selected && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {filtered.map((c, i) => {
            const score = Number(c["Балл % (макс 100)"]) || 0;
            const rankColor = RANK_COLOR[c["Ранг"]] || "#888";
            return (
              <div key={i} style={{ ...s.card, width: 260, cursor: "pointer", transition: "box-shadow 0.2s" }}
                onClick={() => setSelected(c)}>
                <div style={{ fontWeight: 700, color: "#111", marginBottom: 4 }}>{c["Имя"]}</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{String(c["Дата"]).slice(0, 10)}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: rankColor }}>{score}%</span>
                  <Tag label={c["Ранг"]?.split(" — ")[0] || "-"} color={rankColor} />
                </div>
                <Bar val={score} max={100} color={rankColor} height={4} />
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Tag label={c["DISC осн."]?.replace(" (D)", "").replace(" (I)", "").replace(" (S)", "").replace(" (C)", "") || "-"} color={DISC_COLOR[c["DISC осн."]] || "#888"} />
                  <Tag label={c["Белбин осн."] || "-"} color="#6c5ce7" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPARE VIEW */}
      {view === "compare" && compare.length === 2 && (
        <div>
          <button style={{ ...s.btn(false), marginBottom: 16 }} onClick={() => setView("list")}>← Назад к списку</button>
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
                      const p = Math.round((val / sec.max) * 100);
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
                    <div style={{ fontSize: 12, color: "#888", margin: "10px 0 6px" }}>Белбин</div>
                    <Tag label={c["Белбин осн."] || "-"} color="#6c5ce7" />
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