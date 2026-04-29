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
  { type: "numeric", q: "Ряд: 1, 2, 6, 24, 120, ?", options: ["240", "720", "600", "360"], ans: 1 },
  { type: "numeric", q: "Если за 5 дней 5 станков производят 5 деталей, сколько деталей произведут 100 станков за 100 дней?", options: ["100", "500", "1000", "2000"], ans: 3 },
  { type: "numeric", q: "Водоросль удваивается каждый день и полностью покрывает пруд за 48 дней. За сколько дней она покроет половину пруда?", options: ["24", "47", "36", "32"], ans: 1 },
  { type: "numeric", q: "Верёвка делит площадь круга пополам. Сколько максимум частей можно получить из круга двумя верёвками?", options: ["3", "4", "5", "6"], ans: 1 },
  { type: "numeric", q: "Батарейка теряет 20% заряда каждый час. Через сколько часов останется менее 50%?", options: ["2", "3", "4", "5"], ans: 1 },
  { type: "numeric", q: "Ряд: 2, 3, 5, 8, 13, 21, ?", options: ["29", "32", "34", "36"], ans: 2 },
  { type: "numeric", q: "Компания выросла на 50%, затем упала на 50%. Итог относительно старта:", options: ["–25%", "0%", "+25%", "–50%"], ans: 0 },
  { type: "numeric", q: "Сумма углов выпуклого многоугольника с 7 сторонами:", options: ["720°", "900°", "1080°", "540°"], ans: 1 },
  { type: "verbal", q: "Найдите лишнее: индукция, дедукция, абдукция, интуиция, редукция", options: ["Индукция", "Дедукция", "Интуиция", "Редукция"], ans: 2 },
  { type: "verbal", q: "«Консенсус» означает:", options: ["Большинство голосов", "Единогласное согласие всех сторон", "Компромисс с уступками", "Решение руководителя"], ans: 1 },
  { type: "verbal", q: "«Имплицитный» — противоположность слова:", options: ["Явный", "Сложный", "Двусмысленный", "Скрытый"], ans: 0 },
  { type: "verbal", q: "Библиотека : книга = портфель : ?", options: ["Офис", "Документ", "Менеджер", "Папка"], ans: 1 },
  { type: "verbal", q: "Найдите лишнее: рентабельность, ликвидность, амортизация, харизма, маржа", options: ["Рентабельность", "Ликвидность", "Амортизация", "Харизма"], ans: 3 },
  { type: "verbal", q: "«Когнитивное искажение» — это:", options: ["Ошибка памяти из-за усталости", "Систематическая ошибка мышления влияющая на суждения", "Намеренное введение в заблуждение", "Расстройство внимания"], ans: 1 },
  { type: "verbal", q: "Выберите пару с той же логикой что у «хирург : скальпель»:", options: ["Повар : кухня", "Программист : алгоритм", "Дирижёр : палочка", "Архитектор : здание"], ans: 2 },
  { type: "verbal", q: "«Эфемерный» означает:", options: ["Загадочный и непонятный", "Кратковременный и мимолётный", "Тёмный и мрачный", "Чрезмерно сложный"], ans: 1 },
  { type: "situational", q: "Клиент просит срочную доработку вне контракта. Отказать значит испортить отношения. Ваш ход:", options: ["Сделаю бесплатно — отношения важнее", "Откажу — не входит в контракт", "Выясню объём, предложу сделать за доп. оплату или включить в следующий этап", "Пообещаю рассмотреть и затяну ответ"], ans: 2 },
  { type: "situational", q: "Вы узнали что коллега берёт откат от поставщика. Доказательств нет. Ваши действия:", options: ["Промолчу — нет доказательств", "Публично обвиню коллегу", "Сообщу руководителю о своих наблюдениях без обвинений", "Поговорю с коллегой напрямую"], ans: 2 },
  { type: "situational", q: "Вас просят подписать отчёт с которым вы не согласны, дедлайн через час:", options: ["Подпишу — нет времени", "Откажусь подписывать", "Зафиксирую возражения письменно и подпишу с оговоркой", "Попрошу перенести дедлайн"], ans: 2 },
  { type: "situational", q: "Проект провалится через месяц но руководство этого не видит. Ваши действия:", options: ["Молчу — меня не спрашивали", "Подниму тревогу на общем совещании", "Подготовлю краткий анализ рисков и передам руководителю лично", "Начну искать другую работу"], ans: 2 },
  { type: "situational", q: "Лучший сотрудник просит повышение которое вы не можете одобрить сейчас:", options: ["Скажу просто «нет»", "Пообещаю чтобы удержать", "Объясню причины, дам план и назову срок", "Переведу разговор на другую тему"], ans: 2 },
  { type: "situational", q: "Задача выполнена в срок но качество ниже ожидаемого. Команда устала:", options: ["Сдаю — срок важнее", "Доделаю сам не говоря команде", "Покажу заказчику что есть, объясню и согласую приоритет", "Скрою недостатки в презентации"], ans: 2 },
  { type: "situational", q: "Два топ-менеджера дают противоречивые указания. Оба уверены что правы:", options: ["Выполню указание того кто старше", "Сделаю то что считаю правильным сам", "Сведу обоих вместе чтобы они дали единое решение", "Проигнорирую обоих до прояснения"], ans: 2 },
  { type: "situational", q: "Поставщик срывает дедлайн. Производство встанет через 2 дня. Первый шаг:", options: ["Жду — может сам исправится", "Сразу расторгну контракт", "Свяжусь с поставщиком, параллельно активирую резервного", "Сообщу руководству и жду решения"], ans: 2 },
  { type: "situational", q: "Новый коллега некомпетентен но нанят по протекции. Мешает команде:", options: ["Работаю вокруг него молча", "Открыто скажу что он некомпетентен", "Документирую конкретные случаи и обсужу с руководителем", "Настрою команду против него"], ans: 2 },
  { type: "situational", q: "Клиент хочет скидку 30% угрожая уйти. Вы знаете что конкурент хуже:", options: ["Сразу дам скидку", "Откажу — у нас лучше", "Уточню потребности, обосную ценность и предложу альтернативу скидке", "Скажу что конкурент плохой"], ans: 2 },
  { type: "situational", q: "Процесс занимает 3 часа но можно автоматизировать за 1 день работы:", options: ["Продолжаю вручную — не моя зона", "Автоматизирую без согласования", "Оцениваю эффект, предлагаю руководителю с обоснованием", "Жду пока кто-то другой это сделает"], ans: 2 },
  { type: "situational", q: "Вы провалили важные переговоры. Руководитель ждёт отчёт:", options: ["Напишу что причины внешние", "Признаю ошибки, опишу что пошло не так и что сделаю иначе", "Минимизирую провал в отчёте", "Попрошу коллегу написать за меня"], ans: 1 },
  { type: "nonstandard", q: "Сколько пианистов в Астане? Выберите наиболее логичный подход:", options: ["Невозможно оценить без данных", "Население ÷ размер класса × долю занимающихся музыкой", "Поискать в интернете", "Спросить в музыкальной школе"], ans: 1 },
  { type: "nonstandard", q: "Компания теряет клиентов. Данных почти нет. С чего начать диагностику?", options: ["Запустить рекламу чтобы привлечь новых", "Поговорить с 5–10 ушедшими клиентами напрямую", "Снизить цены", "Нанять консультанта"], ans: 1 },
  { type: "nonstandard", q: "Если удвоить скорость работы но делать не то что нужно — результат:", options: ["Лучше — больше сделано", "Хуже — быстрее движение в неверном направлении", "Нейтральный", "Зависит от ситуации"], ans: 1 },
  { type: "nonstandard", q: "Мост выдерживает 10 тонн. Грузовик весит 10 тонн. Водитель везёт 100 кг сверху. Как переехать?", options: ["Невозможно — превышение веса", "Разгрузить 100 кг и перевезти отдельно", "Открыть все окна", "Проехать очень быстро"], ans: 1 },
  { type: "nonstandard", q: "Нужно измерить 4 литра имея кувшины 3 и 5 литров. Сколько шагов минимум?", options: ["2", "3", "4", "Невозможно"], ans: 2 },
  { type: "nonstandard", q: "Продукт продаётся плохо. Что проверить в первую очередь?", options: ["Цену — снизить", "Рекламу — усилить", "Кто покупает сейчас и почему — найти паттерн", "Добавить новые функции"], ans: 2 },
  { type: "nonstandard", q: "Три лампочки в соседней комнате, три выключателя здесь. Зайти можно один раз. Как определить какой выключатель от какой лампы?", options: ["Невозможно за один заход", "Включить один, войти, потрогать — горячая = тот что был включён дольше", "Взять помощника", "Включить все"], ans: 1 },
  { type: "nonstandard", q: "Вас просят оценить количество теннисных мячей в автобусе. Ваш подход:", options: ["Откажусь — невозможно точно", "Уточню размеры и вычислю приближённо", "Назову случайное число", "Скажу что вопрос некорректный"], ans: 1 },
  { type: "nonstandard", q: "Что тяжелее: килограмм железа или килограмм ваты?", options: ["Железо", "Вата", "Одинаково", "Зависит от условий"], ans: 2 },
  { type: "speed", q: "Если A = 2B и B = 3C, то A/C = ?", options: ["5", "6", "8", "9"], ans: 1 },
  { type: "speed", q: "Цена выросла с 80 до 100. Рост в процентах:", options: ["20%", "25%", "80%", "125%"], ans: 1 },
  { type: "speed", q: "Поезд A едет 60 км/ч, поезд B — 90 км/ч навстречу. Расстояние 300 км. Через сколько минут встретятся?", options: ["100", "120", "150", "200"], ans: 1 },
  { type: "speed", q: "2^10 = ?", options: ["512", "1024", "2048", "256"], ans: 1 },
  { type: "speed", q: "Если x² = 49, то x может быть:", options: ["Только 7", "Только –7", "7 или –7", "Нет решений"], ans: 2 },
  { type: "speed", q: "Вероятность выпадения орла дважды подряд:", options: ["1/2", "1/3", "1/4", "1/8"], ans: 2 },
  { type: "speed", q: "Треугольник со сторонами 3, 4, 5 — какой угол напротив стороны 5?", options: ["60°", "90°", "45°", "120°"], ans: 1 },
];

const DISC_QUESTIONS = [
  { q: "На совещании команда долго обсуждает. Как вы обычно себя ведёте?", options: [{ text: "Направляю разговор к решению — время дорого", d: "D" }, { text: "Слежу за тем чтобы все были услышаны", d: "S" }, { text: "Предлагаю идеи и вовлекаю других в обсуждение", d: "I" }, { text: "Анализирую аргументы и ищу логические противоречия", d: "C" }] },
  { q: "Вам дали новый сложный проект. Ваш первый шаг:", options: [{ text: "Определяю цель и сразу начинаю действовать", d: "D" }, { text: "Изучаю все детали и требования перед стартом", d: "C" }, { text: "Обсуждаю с командой и выясняю кто что будет делать", d: "S" }, { text: "Нахожу людей с нужными знаниями и подключаю их", d: "I" }] },
  { q: "Коллега сделал работу не так как вы ожидали. Ваша реакция:", options: [{ text: "Чётко говорю что не так и как должно быть", d: "D" }, { text: "Помогаю разобраться в чём была сложность", d: "S" }, { text: "Выясняю как он думал и почему сделал именно так", d: "I" }, { text: "Показываю конкретные ошибки с примерами", d: "C" }] },
  { q: "Что вас больше всего мотивирует в работе?", options: [{ text: "Видимый результат и достижение целей", d: "D" }, { text: "Точность и высокое качество того что я делаю", d: "C" }, { text: "Хорошая атмосфера и доверие в команде", d: "S" }, { text: "Общение, новые знакомства и признание", d: "I" }] },
  { q: "Когда нужно принять важное решение быстро, вы:", options: [{ text: "Принимаю решение сразу — медлить хуже", d: "D" }, { text: "Собираю минимум данных и затем действую", d: "C" }, { text: "Советуюсь с теми кого это касается", d: "S" }, { text: "Доверяю интуиции и опыту общения с людьми", d: "I" }] },
  { q: "Как вы предпочитаете получать обратную связь?", options: [{ text: "Прямо и конкретно — без обиняков", d: "D" }, { text: "С примерами и объяснением что именно не так", d: "C" }, { text: "В спокойной обстановке один на один", d: "S" }, { text: "Позитивно — сначала что хорошо, потом что улучшить", d: "I" }] },
  { q: "В конфликтной ситуации внутри команды вы:", options: [{ text: "Обозначаю позицию чётко и жду решения", d: "D" }, { text: "Стараюсь снизить напряжение и сохранить отношения", d: "S" }, { text: "Анализирую кто прав по фактам", d: "C" }, { text: "Выслушиваю всех и ищу компромисс", d: "I" }] },
  { q: "Какой стиль работы вам ближе?", options: [{ text: "Самостоятельно, с чёткой ответственностью", d: "D" }, { text: "По проверенному процессу, шаг за шагом", d: "C" }, { text: "В команде, где есть взаимная поддержка", d: "S" }, { text: "В динамичной среде с частым общением", d: "I" }] },
  { q: "Когда план меняется в последний момент, вы:", options: [{ text: "Быстро адаптируюсь и перестраиваю приоритеты", d: "D" }, { text: "Расстраиваюсь но стараюсь не показывать", d: "S" }, { text: "Выясняю причины и оцениваю риски нового плана", d: "C" }, { text: "Воспринимаю как новую возможность и вовлекаю команду", d: "I" }] },
  { q: "На что вы обращаете внимание в первую очередь при оценке результата?", options: [{ text: "Достигнута ли цель и в какие сроки", d: "D" }, { text: "Все ли детали проверены и нет ли ошибок", d: "C" }, { text: "Как команда себя чувствует после выполнения", d: "S" }, { text: "Как результат воспринимается окружающими", d: "I" }] },
  { q: "Как вы обычно готовитесь к важной встрече?", options: [{ text: "Определяю цель встречи и желаемый исход", d: "D" }, { text: "Изучаю всю доступную информацию заранее", d: "C" }, { text: "Думаю о том кто будет и как выстроить контакт", d: "I" }, { text: "Убеждаюсь что все участники готовы и комфортны", d: "S" }] },
  { q: "Что вас раздражает больше всего в работе?", options: [{ text: "Медлительность и нерешительность", d: "D" }, { text: "Ошибки из-за невнимательности", d: "C" }, { text: "Конфликты и напряжённая атмосфера", d: "S" }, { text: "Рутина без общения и новых контактов", d: "I" }] },
  { q: "Коллега просит помощи с задачей. Вы:", options: [{ text: "Быстро показываю решение и иду дальше", d: "D" }, { text: "Объясняю методично шаг за шагом", d: "C" }, { text: "Сажусь рядом и разбираем вместе столько сколько нужно", d: "S" }, { text: "Вовлекаю других кто может помочь эффективнее", d: "I" }] },
  { q: "Как вы относитесь к правилам и процедурам?", options: [{ text: "Следую им если они помогают результату", d: "D" }, { text: "Считаю что правила существуют по причине — им нужно следовать", d: "C" }, { text: "Ценю их как основу стабильной работы команды", d: "S" }, { text: "Отношусь гибко — главное отношения а не буква правил", d: "I" }] },
  { q: "Когда вы берётесь за незнакомую задачу:", options: [{ text: "Начинаю делать и разбираюсь по ходу", d: "D" }, { text: "Изучаю тему досконально прежде чем начать", d: "C" }, { text: "Ищу кто уже это делал и прошу поделиться опытом", d: "I" }, { text: "Уточняю у команды как лучше подойти", d: "S" }] },
  { q: "Как вы реагируете на критику своей работы?", options: [{ text: "Слушаю по существу — если аргументировано, принимаю", d: "D" }, { text: "Анализирую детально — хочу понять конкретно что не так", d: "C" }, { text: "Воспринимаю спокойно если сказано с уважением", d: "S" }, { text: "Легче переношу когда критикует тот кому я доверяю", d: "I" }] },
  { q: "Что для вас важнее в командной работе?", options: [{ text: "Чёткое разделение ответственности и результат", d: "D" }, { text: "Высокий стандарт качества у каждого члена команды", d: "C" }, { text: "Доверие и взаимная поддержка", d: "S" }, { text: "Энергия, вовлечённость и общий энтузиазм", d: "I" }] },
  { q: "Когда вы ведёте переговоры:", options: [{ text: "Чётко обозначаю позицию и добиваюсь результата", d: "D" }, { text: "Опираюсь на данные и логику", d: "C" }, { text: "Ищу решение которое устроит обе стороны", d: "S" }, { text: "Выстраиваю контакт и ищу точки соприкосновения", d: "I" }] },
  { q: "Как вы предпочитаете завершать рабочий день?", options: [{ text: "Проверяю выполнены ли задачи дня", d: "D" }, { text: "Убеждаюсь что всё оформлено и задокументировано", d: "C" }, { text: "Убеждаюсь что в команде всё в порядке", d: "S" }, { text: "Кратко общаюсь с коллегами — как прошёл день", d: "I" }] },
  { q: "Если бы вас описали коллеги одним словом, это скорее всего было бы:", options: [{ text: "Результативный", d: "D" }, { text: "Надёжный", d: "S" }, { text: "Точный", d: "C" }, { text: "Энергичный", d: "I" }] },
];

const BELBIN_ROLES = {
  PL: { name: "Генератор идей", desc: "Креативный, нестандартно мыслит, генерирует оригинальные решения.", team: "Незаменим на этапе поиска новых подходов." },
  RI: { name: "Исследователь ресурсов", desc: "Коммуникабельный, легко находит внешние ресурсы и контакты.", team: "Силён в нетворкинге и поиске партнёров." },
  CO: { name: "Координатор", desc: "Умеет организовать работу группы и направить людей к цели.", team: "Лучший в роли координатора команды." },
  SH: { name: "Мотиватор", desc: "Динамичный, не боится препятствий, добивается результата.", team: "Эффективен когда команде нужен толчок." },
  ME: { name: "Аналитик-стратег", desc: "Взвешенный, аналитичный, трезво оценивает варианты.", team: "Незаменим при стратегических решениях." },
  TW: { name: "Командный игрок", desc: "Дипломатичный, чуткий, поддерживает атмосферу в команде.", team: "Ключевой для здоровья команды." },
  IMP: { name: "Реализатор", desc: "Дисциплинированный, надёжный, превращает идеи в конкретные действия.", team: "Силён в исполнении и организации процессов." },
  CF: { name: "Контролёр качества", desc: "Педантичный, внимателен к деталям, доводит до совершенства.", team: "Незаменим на финальных этапах проекта." },
  SP: { name: "Специалист", desc: "Глубокая экспертиза в узкой области.", team: "Ценен когда нужна конкретная компетенция." },
};

const BELBIN_QUESTIONS = [
  { q: "Когда команда застряла на проблеме, я чаще всего:", options: [{ text: "Предлагаю неочевидный подход который другие не рассматривали", r: "PL" }, { text: "Звоню знакомому у которого был похожий опыт", r: "RI" }, { text: "Организую мозговой штурм и распределяю роли", r: "CO" }, { text: "Говорю: хватит обсуждать — нужно действовать", r: "SH" }] },
  { q: "Мой вклад в командный проект обычно состоит в том что я:", options: [{ text: "Нахожу логические слабости в плане до старта", r: "ME" }, { text: "Слежу чтобы никто не чувствовал себя лишним", r: "TW" }, { text: "Перевожу план в конкретный список задач и делаю их", r: "IMP" }, { text: "Проверяю финальный результат на ошибки", r: "CF" }] },
  { q: "Коллеги обращаются ко мне чаще всего когда:", options: [{ text: "Нужна свежая идея или нестандартное решение", r: "PL" }, { text: "Нужен контакт или ресурс которого нет внутри", r: "RI" }, { text: "Нужно разобраться кто за что отвечает", r: "CO" }, { text: "Нужна глубокая экспертиза в конкретной теме", r: "SP" }] },
  { q: "На совещании я чаще всего:", options: [{ text: "Бросаю вызов устоявшимся взглядам", r: "SH" }, { text: "Взвешиваю все аргументы прежде чем высказаться", r: "ME" }, { text: "Слежу чтобы разговор оставался конструктивным", r: "TW" }, { text: "Фиксирую договорённости и слежу за их выполнением", r: "IMP" }] },
  { q: "Мне нравится когда в проекте:", options: [{ text: "Есть пространство для экспериментов и новых идей", r: "PL" }, { text: "Можно познакомиться с новыми людьми и партнёрами", r: "RI" }, { text: "Я отвечаю за узкую область в которой я сильнее всех", r: "SP" }, { text: "Есть чёткая структура и понятные роли", r: "CO" }] },
  { q: "Когда дедлайн горит я:", options: [{ text: "Мобилизуюсь и давлю на команду чтобы успеть", r: "SH" }, { text: "Спокойно расставляю приоритеты и делаю самое важное", r: "IMP" }, { text: "Поддерживаю команду морально", r: "TW" }, { text: "Перепроверяю что ничего критического не пропущено", r: "CF" }] },
  { q: "При оценке нового предложения я в первую очередь:", options: [{ text: "Ищу в чём уникальность и нестандартность идеи", r: "PL" }, { text: "Смотрю насколько это реализуемо с нашими ресурсами", r: "ME" }, { text: "Думаю как это повлияет на команду и отношения", r: "TW" }, { text: "Проверяю детали — расчёты, допущения, риски", r: "CF" }] },
  { q: "В долгосрочном проекте моя роль обычно:", options: [{ text: "Генерировать новые направления когда проект теряет импульс", r: "PL" }, { text: "Поддерживать связи с внешними партнёрами", r: "RI" }, { text: "Следить за тем чтобы процессы работали как часы", r: "IMP" }, { text: "Финальная проверка перед каждым ключевым этапом", r: "CF" }] },
  { q: "Когда команда не может принять решение я:", options: [{ text: "Беру инициативу и предлагаю конкретный вариант", r: "SH" }, { text: "Помогаю команде взвесить все за и против", r: "ME" }, { text: "Предлагаю решение учитывающее интересы всех сторон", r: "TW" }, { text: "Структурирую варианты и показываю разницу", r: "CO" }] },
  { q: "Мои коллеги скажут что я:", options: [{ text: "Придумываю то чего раньше никто не предлагал", r: "PL" }, { text: "Всегда знаю к кому обратиться", r: "RI" }, { text: "Добиваюсь результата несмотря на препятствия", r: "SH" }, { text: "Эксперт которому доверяют в его области", r: "SP" }] },
  { q: "Когда проект идёт не по плану я:", options: [{ text: "Быстро нахожу нестандартный выход", r: "PL" }, { text: "Анализирую что пошло не так и как это предотвратить", r: "ME" }, { text: "Реорганизую задачи и перераспределяю нагрузку", r: "CO" }, { text: "Углубляюсь в детали чтобы найти источник проблемы", r: "CF" }] },
  { q: "Что вам важнее всего в командной работе?", options: [{ text: "Чтобы у каждого была чёткая роль и ответственность", r: "CO" }, { text: "Чтобы атмосфера была доверительной и поддерживающей", r: "TW" }, { text: "Чтобы работа делалась качественно и в срок", r: "IMP" }, { text: "Чтобы я мог глубоко погрузиться в свою тему", r: "SP" }] },
  { q: "При запуске нового проекта я лучше всего справляюсь с:", options: [{ text: "Генерацией концепции и видения", r: "PL" }, { text: "Поиском внешних ресурсов и партнёров", r: "RI" }, { text: "Разработкой структуры и плана выполнения", r: "IMP" }, { text: "Созданием стандартов качества и критериев успеха", r: "CF" }] },
  { q: "Когда другие теряют мотивацию я:", options: [{ text: "Предлагаю новый угол зрения который вдохновляет", r: "PL" }, { text: "Подключаю внешние ресурсы чтобы сдвинуть с места", r: "RI" }, { text: "Давлю на результат — нужно двигаться вперёд", r: "SH" }, { text: "Поддерживаю лично каждого члена команды", r: "TW" }] },
  { q: "Мой самый ценный навык это:", options: [{ text: "Видеть решения там где другие видят тупик", r: "PL" }, { text: "Трезво оценивать идеи без эмоций", r: "ME" }, { text: "Доводить задачи до конца несмотря ни на что", r: "IMP" }, { text: "Глубокое знание своей профессиональной области", r: "SP" }] },
  { q: "На финальном этапе проекта я:", options: [{ text: "Проверяю всё ещё раз — каждую деталь", r: "CF" }, { text: "Убеждаюсь что команда довольна результатом", r: "TW" }, { text: "Анализирую что можно улучшить в следующий раз", r: "ME" }, { text: "Уже думаю о следующем проекте", r: "SH" }] },
  { q: "Когда нужно принять стратегическое решение я:", options: [{ text: "Предлагаю смелый нестандартный вариант", r: "PL" }, { text: "Оцениваю все варианты хладнокровно", r: "ME" }, { text: "Смотрю как решение повлияет на людей в команде", r: "TW" }, { text: "Опираюсь на глубокую экспертизу в своей области", r: "SP" }] },
  { q: "Что лучше всего описывает вашу роль в команде?", options: [{ text: "Я тот кто объединяет людей и направляет к цели", r: "CO" }, { text: "Я тот кто делает работу качественно и в срок", r: "IMP" }, { text: "Я тот кто не даёт команде останавливаться", r: "SH" }, { text: "Я тот кто замечает то что остальные пропускают", r: "CF" }] },
];

const DISC_PROFILES = {
  D: { name: "Доминирование (D)", color: "#c0392b", desc: "Ориентирован на результат, решителен, берёт инициативу.", team: "Лучший в роли лидера задачи или антикризисного менеджера." },
  I: { name: "Влияние (I)", color: "#e67e22", desc: "Коммуникабелен, умеет вдохновлять и вовлекать людей.", team: "Силён в продажах, переговорах, командном взаимодействии." },
  S: { name: "Стабильность (S)", color: "#27ae60", desc: "Надёжен, терпелив, лоялен. Ценит предсказуемость.", team: "Незаменим как опора команды и хранитель процессов." },
  C: { name: "Соответствие (C)", color: "#2980b9", desc: "Аналитичен, точен, следует стандартам.", team: "Ценен в ролях требующих точности: аналитика, контроль." },
};

const IQ_SECTIONS = [
  { key: "numeric", label: "Числовая логика", max: 8 },
  { key: "verbal", label: "Вербальное мышление", max: 8 },
  { key: "situational", label: "Ситуативные задачи", max: 12 },
  { key: "nonstandard", label: "Нестандартное мышление", max: 8 },
  { key: "speed", label: "Скорость решений", max: 7 },
];

const SPEED_TIME = 12;
const DISC_TIME = 15;

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [iqAnswers, setIqAnswers] = useState({});
  const [discAnswers, setDiscAnswers] = useState({});
  const [belbinAnswers, setBelbinAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timedOut, setTimedOut] = useState({});
  const timerRef = useRef(null);
  const [candidateName, setCandidateName] = useState("");
  const sentRef = useRef(false);

  const QUESTIONS = useMemo(() => RAW_QUESTIONS.map(q => {
    const indexed = q.options.map((opt, i) => ({ opt, correct: i === q.ans }));
    const sh = shuffle(indexed);
    return { ...q, options: sh.map(o => o.opt), ans: sh.findIndex(o => o.correct) };
  }), []);

  const DISC_Q = useMemo(() => DISC_QUESTIONS.map(q => ({ ...q, options: shuffle(q.options) })), []);
  const BELBIN_Q = useMemo(() => BELBIN_QUESTIONS.map(q => ({ ...q, options: shuffle(q.options) })), []);

  const SPEED_IDS = useMemo(() => QUESTIONS.map((q, i) => q.type === "speed" ? i : -1).filter(i => i >= 0), [QUESTIONS]);
  const totalIQ = QUESTIONS.length;
  const totalDISC = DISC_Q.length;
  const totalBelbin = BELBIN_Q.length;

  const calcIQ = () => {
    let s = { numeric: 0, verbal: 0, situational: 0, nonstandard: 0, speed: 0 };
    QUESTIONS.forEach((q, i) => { if (iqAnswers[i] === q.ans) s[q.type]++; });
    const raw = Object.values(s).reduce((a, b) => a + b, 0);
    return { scores: s, raw, pct: Math.round((raw / totalIQ) * 100) };
  };

  const calcDISC = () => {
    let c = { D: 0, I: 0, S: 0, C: 0 };
    Object.values(discAnswers).forEach(d => c[d]++);
    const sorted = Object.entries(c).sort((a, b) => b[1] - a[1]);
    return { counts: c, primary: sorted[0][0], secondary: sorted[1][0] };
  };

  const calcBelbin = () => {
    let c = {};
    Object.keys(BELBIN_ROLES).forEach(r => c[r] = 0);
    Object.values(belbinAnswers).forEach(r => { if (c[r] !== undefined) c[r]++; });
    const sorted = Object.entries(c).sort((a, b) => b[1] - a[1]);
    return { counts: c, primary: sorted[0][0], secondary: sorted[1][0] };
  };

  const getRank = (pct) => {
    if (pct >= 85) return { label: "A — Высокий потенциал", color: "#27ae60" };
    if (pct >= 65) return { label: "B — Выше среднего", color: "#2980b9" };
    if (pct >= 45) return { label: "C — Средний уровень", color: "#e67e22" };
    return { label: "D — Ниже ожиданий", color: "#c0392b" };
  };

  useEffect(() => {
    if (screen === "iq") {
      const isSpeed = SPEED_IDS.includes(currentQ);
      if (isSpeed && !(currentQ in iqAnswers) && !timedOut[currentQ]) {
        setTimeLeft(SPEED_TIME);
        timerRef.current = setInterval(() => setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setIqAnswers(prev => ({ ...prev, [currentQ]: -1 }));
            setTimedOut(prev => ({ ...prev, [currentQ]: true }));
            setTimeout(() => goNext("iq"), 600);
            return 0;
          }
          return t - 1;
        }), 1000);
      } else setTimeLeft(null);
      return () => clearInterval(timerRef.current);
    }
    if (screen === "disc" && !(currentQ in discAnswers)) {
      setTimeLeft(DISC_TIME);
      timerRef.current = setInterval(() => setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          const opts = DISC_Q[currentQ].options;
          setDiscAnswers(prev => ({ ...prev, [currentQ]: opts[Math.floor(Math.random() * opts.length)].d }));
          setTimeout(() => goNext("disc"), 400);
          return 0;
        }
        return t - 1;
      }), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [currentQ, screen]);

  useEffect(() => {
    if (screen === "done" && !sentRef.current) {
      sentRef.current = true;
      const { scores, pct } = calcIQ();
      const { primary: dp, secondary: ds } = calcDISC();
      const { primary: bp, secondary: bs } = calcBelbin();
      sendToSheets({
        date: new Date().toLocaleString("ru-RU"),
        name: candidateName,
        score: pct,
        rank: getRank(pct).label,
        disc_primary: DISC_PROFILES[dp].name,
        disc_secondary: DISC_PROFILES[ds].name,
        belbin_primary: BELBIN_ROLES[bp].name,
        belbin_secondary: BELBIN_ROLES[bs].name,
        numeric: scores.numeric,
        verbal: scores.verbal,
        situational: scores.situational,
        nonstandard: scores.nonstandard,
        speed: scores.speed,
      });
    }
  }, [screen]);

  const goNext = (mode) => {
    clearInterval(timerRef.current); setTimeLeft(null);
    if (mode === "iq") { currentQ < totalIQ - 1 ? setCurrentQ(q => q + 1) : (setCurrentQ(0), setScreen("disc")); }
    else if (mode === "disc") { currentQ < totalDISC - 1 ? setCurrentQ(q => q + 1) : (setCurrentQ(0), setScreen("belbin")); }
    else { currentQ < totalBelbin - 1 ? setCurrentQ(q => q + 1) : setScreen("done"); }
  };

  const answerIQ = (idx) => {
    if (currentQ in iqAnswers || timedOut[currentQ]) return;
    clearInterval(timerRef.current);
    setIqAnswers(prev => ({ ...prev, [currentQ]: idx }));
    setTimeout(() => goNext("iq"), 500);
  };

  const answerDISC = (d) => {
    if (currentQ in discAnswers) return;
    clearInterval(timerRef.current);
    setDiscAnswers(prev => ({ ...prev, [currentQ]: d }));
    setTimeout(() => goNext("disc"), 400);
  };

  const answerBelbin = (r) => {
    if (currentQ in belbinAnswers) return;
    setBelbinAnswers(prev => ({ ...prev, [currentQ]: r }));
    setTimeout(() => goNext("belbin"), 400);
  };

  const resetAll = () => {
    setScreen("intro"); setIqAnswers({}); setDiscAnswers({}); setBelbinAnswers({});
    setCurrentQ(0); setTimedOut({}); setCandidateName(""); sentRef.current = false;
  };

  const s = {
    wrap: { padding: "1.5rem 1rem", maxWidth: 640, margin: "0 auto", fontFamily: "sans-serif" },
    h1: { fontSize: 22, fontWeight: 600, color: "#111", margin: "0 0 0.5rem" },
    h2: { fontSize: 16, fontWeight: 600, color: "#111", margin: "1.25rem 0 0.5rem" },
    muted: { fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 0.5rem" },
    small: { fontSize: 13, color: "#888" },
    btn: { display: "block", width: "100%", padding: "12px 16px", marginBottom: 10, background: "#f7f7f7", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 14, color: "#111", cursor: "pointer", textAlign: "left", lineHeight: 1.5 },
    btnPrimary: { padding: "12px 28px", background: "#111", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, color: "#fff", cursor: "pointer", marginTop: "1.5rem", display: "inline-block" },
    progress: { height: 4, background: "#eee", borderRadius: 2, margin: "0.75rem 0 1.25rem" },
    fill: (p, c) => ({ height: "100%", width: `${p}%`, background: c || "#111", borderRadius: 2, transition: "width 0.3s" }),
    card: { background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem" },
    rule: { borderTop: "1px solid #eee", margin: "1rem 0" },
  };

  if (screen === "intro") return (
    <div style={s.wrap}>
      <h1 style={s.h1}>Оценочный тест кандидата</h1>
      <p style={s.muted}>Добро пожаловать. Этот тест помогает нам лучше понять ваш стиль мышления и работы в команде.</p>
      <div style={s.rule} />
      <h2 style={{ ...s.h2, marginTop: 0 }}>Структура теста</h2>
      <p style={s.muted}><b>Блок 1 — Логика и мышление</b> (43 вопроса, ~25 мин)<br/>Задачи на числовую логику, вербальное мышление, ситуативные и нестандартные задачи. Часть вопросов имеет таймер.</p>
      <p style={s.muted}><b>Блок 2 — Стиль работы</b> (20 вопросов, ~10 мин)<br/>Вопросы о том как вы обычно действуете в рабочих ситуациях. Таймер 15 секунд на вопрос.</p>
      <p style={s.muted}><b>Блок 3 — Командная роль</b> (18 вопросов, ~10 мин)<br/>Вопросы о вашей роли в командной работе.</p>
      <div style={s.rule} />
      <h2 style={{ ...s.h2, marginTop: 0 }}>Важно знать</h2>
      <p style={s.muted}>• В блоках 2 и 3 нет правильных и неправильных ответов — только честные<br/>• Результаты видит только HR — вам они не отображаются<br/>• Отвечайте быстро и интуитивно — первый ответ обычно точнее<br/>• Общее время: около 45 минут</p>
      <div style={s.rule} />
      <label style={{ ...s.muted, display: "block", marginBottom: 8, fontWeight: 600 }}>Ваше имя</label>
      <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Введите имя и фамилию..." style={{ width: "100%", padding: "11px 14px", fontSize: 15, borderRadius: 10, border: "1px solid #ddd", background: "#fafafa", color: "#111", boxSizing: "border-box" }} />
      <button style={s.btnPrimary} onClick={() => { if (candidateName.trim()) { sentRef.current = false; setScreen("iq"); } }}>Начать тест →</button>
    </div>
  );

  if (screen === "iq") {
    const q = QUESTIONS[currentQ];
    const answered = currentQ in iqAnswers;
    const to = timedOut[currentQ];
    const isSpeed = SPEED_IDS.includes(currentQ);
    const label = IQ_SECTIONS.find(s => s.key === q.type)?.label || "";
    const prog = Math.round(((currentQ + 1) / totalIQ) * 100);
    return (
      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={s.small}>Блок 1 · {label}</span>
          <span style={s.small}>{currentQ + 1} / {totalIQ}</span>
        </div>
        <div style={s.progress}><div style={s.fill(prog)} /></div>
        {isSpeed && timeLeft !== null && !answered && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: timeLeft <= 4 ? "#c0392b" : "#e67e22" }}>⏱ {timeLeft} сек</div>}
        {to && <div style={{ fontSize: 13, color: "#c0392b", marginBottom: 10 }}>⏱ Время вышло</div>}
        <div style={s.card}><p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{q.q}</p></div>
        {q.options.map((opt, i) => {
          let border = "1px solid #e0e0e0", bg = "#f7f7f7";
          if (answered || to) {
            if (i === q.ans) { border = "1.5px solid #27ae60"; bg = "#27ae6011"; }
            else if (iqAnswers[currentQ] === i) { border = "1.5px solid #c0392b"; bg = "#c0392b11"; }
          }
          return <button key={i} style={{ ...s.btn, border, background: bg }} onClick={() => answerIQ(i)}>{opt}</button>;
        })}
        {(answered || to) && <button style={s.btnPrimary} onClick={() => goNext("iq")}>{currentQ < totalIQ - 1 ? "Следующий →" : "Перейти к блоку 2 →"}</button>}
      </div>
    );
  }

  if (screen === "disc") {
    const q = DISC_Q[currentQ];
    const answered = currentQ in discAnswers;
    const prog = Math.round(((currentQ + 1) / totalDISC) * 100);
    return (
      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={s.small}>Блок 2 · Стиль работы</span>
          <span style={s.small}>{currentQ + 1} / {totalDISC}</span>
        </div>
        <div style={s.progress}><div style={s.fill(prog, "#e67e22")} /></div>
        {timeLeft !== null && !answered && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: timeLeft <= 5 ? "#c0392b" : "#e67e22" }}>⏱ {timeLeft} сек</div>}
        <p style={{ ...s.small, marginBottom: 8 }}>Выберите вариант который <b>точнее всего</b> описывает вас:</p>
        <div style={s.card}><p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{q.q}</p></div>
        {q.options.map((opt, i) => {
          const chosen = discAnswers[currentQ] === opt.d;
          return <button key={i} style={{ ...s.btn, border: chosen ? "1.5px solid #e67e22" : "1px solid #e0e0e0", background: chosen ? "#e67e2211" : "#f7f7f7" }} onClick={() => answerDISC(opt.d)}>{opt.text}</button>;
        })}
        {answered && <button style={s.btnPrimary} onClick={() => goNext("disc")}>{currentQ < totalDISC - 1 ? "Следующий →" : "Перейти к блоку 3 →"}</button>}
      </div>
    );
  }

  if (screen === "belbin") {
    const q = BELBIN_Q[currentQ];
    const answered = currentQ in belbinAnswers;
    const prog = Math.round(((currentQ + 1) / totalBelbin) * 100);
    return (
      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={s.small}>Блок 3 · Командная роль</span>
          <span style={s.small}>{currentQ + 1} / {totalBelbin}</span>
        </div>
        <div style={s.progress}><div style={s.fill(prog, "#2980b9")} /></div>
        <p style={{ ...s.small, marginBottom: 8 }}>Выберите вариант который <b>точнее всего</b> описывает вас в команде:</p>
        <div style={s.card}><p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{q.q}</p></div>
        {q.options.map((opt, i) => {
          const chosen = belbinAnswers[currentQ] === opt.r;
          return <button key={i} style={{ ...s.btn, border: chosen ? "1.5px solid #2980b9" : "1px solid #e0e0e0", background: chosen ? "#2980b911" : "#f7f7f7" }} onClick={() => answerBelbin(opt.r)}>{opt.text}</button>;
        })}
        {answered && <button style={s.btnPrimary} onClick={() => goNext("belbin")}>{currentQ < totalBelbin - 1 ? "Следующий →" : "Завершить тест →"}</button>}
      </div>
    );
  }

  if (screen === "done") return (
    <div style={{ ...s.wrap, textAlign: "center", paddingTop: "4rem" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>
      <h1 style={{ ...s.h1, textAlign: "center" }}>Тест завершён</h1>
      <p style={{ ...s.muted, textAlign: "center", marginTop: 12 }}>
        Спасибо, <b>{candidateName}</b>!<br/><br/>
        Ваши результаты переданы HR-менеджеру.<br/>
        Мы свяжемся с вами в ближайшее время.
      </p>
      <button style={{ ...s.btnPrimary, background: "#eee", color: "#333", marginTop: 32 }} onClick={resetAll}>← Пройти снова</button>
    </div>
  );

  return null;
}