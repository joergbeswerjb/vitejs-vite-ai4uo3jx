export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
    try {
      const { candidate } = req.body;
      const score = Number(candidate["Балл % (макс 100)"]) || 0;
  
      const prompt = `Ты — HR-эксперт в области закупок и снабжения. Проанализируй профиль кандидата и дай развёрнутую индивидуальную интерпретацию на русском языке.
  
  Данные кандидата:
  - Имя: ${candidate["Имя"]}
  - Балл сообразительности: ${score}% (${candidate["Ранг"]})
  - Числовая логика: ${candidate["Числовая логика (макс 8)"]}/8
  - Вербальное мышление: ${candidate["Вербальное мышление (макс 8)"]}/8
  - Ситуативные задачи: ${candidate["Ситуативные задачи (макс 12)"]}/12
  - Нестандартное мышление: ${candidate["Нестандартное мышление (макс 8)"]}/8
  - Скорость решений: ${candidate["Скорость решений (макс 7)"]}/7
  - DISC профиль (основной): ${candidate["DISC осн."]}
  - DISC профиль (вторичный): ${candidate["DISC втор."]}
  - Командная роль по Белбину (основная): ${candidate["Белбин осн."]}
  - Командная роль по Белбину (вторичная): ${candidate["Белбин втор."]}
  
  Контекст: отдел закупок и снабжения крупной компании. Группы: управление мастер-данными ERP, снабжение (indirect purchasing), проектные закупки (direct purchasing), качество поставщиков и рекламации, системные компоненты.
  
  Напиши анализ из 4 абзацев:
  1. Общий портрет кандидата — как его профиль проявляется в закупочной среде
  2. Сильные стороны — конкретно для работы в закупках/снабжении
  3. Зоны риска и слепые пятна — что может мешать в работе
  4. Рекомендация — для какой группы и роли из перечисленных подходит лучше всего и почему
  
  Пиши конкретно, без общих фраз. Используй профессиональный но живой язык.`;
  
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
  
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "Не удалось получить анализ.";
      res.status(200).json({ result: text });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }