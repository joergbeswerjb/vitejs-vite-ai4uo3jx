import { useState, useEffect, useRef, useMemo } from "react";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwxZKU5KNXZDWpESG1NinBrWhInlAQ1Cqp0g71WZbuRF3XcPhmb_JEtf6cXykVb5d-m/exec";

const BRAND = {
  blue: "#003D7C",
  green: "#C8D400",
  lightBlue: "#0069B4",
  gray: "#F4F4F4",
  darkGray: "#333333",
  border: "#E0E0E0",
};

const LOGO_B64 = "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";

const Logo = () => (
  <img src="/stadler-logo.png" alt="Stadler" style={{ height: 22, filter: "brightness(0) invert(1)", display: "block" }} />
);

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
  { type: "numeric", q: "Поставщик даёт скидку 15% на партию за €12 000. Финальная цена?", options: ["€10 200", "€10 800", "€9 800", "€11 200"], ans: 0 },
  { type: "numeric", q: "Бюджет закупки €50 000. Потрачено 68%. Остаток?", options: ["€16 000", "€34 000", "€15 000", "€18 000"], ans: 0 },
  { type: "numeric", q: "Партия 1 000 ед. по €88/ед. с доставкой €2 500. Альтернатива — 800 ед. по €92 с бесплатной доставкой. Какая опция выгоднее по цене единицы с учётом доставки?", options: ["Первая (€90,5/ед)", "Вторая (€92/ед)", "Одинаково", "Зависит от потребности"], ans: 0 },
  { type: "numeric", q: "Поставщик выполнил 340 из 400 заказов вовремя. On-time delivery %?", options: ["85%", "80%", "90%", "75%"], ans: 0 },
  { type: "numeric", q: "Цена выросла на 12%, затем ещё на 8%. Общий рост?", options: ["20,96%", "20%", "21,5%", "19,8%"], ans: 0 },
  { type: "numeric", q: "Срок поставки 45 календарных дней. Заказ размещён 1 марта. Ожидаемая дата получения?", options: ["15 апреля", "14 апреля", "16 апреля", "30 марта"], ans: 0 },
  { type: "numeric", q: "Контракт подписан по курсу €1 = $1,05. К оплате курс стал €1 = $1,12. Контракт на €200 000. Насколько выросли затраты в долларах?", options: ["$14 000", "$7 000", "$21 000", "$10 000"], ans: 0 },
  { type: "numeric", q: "Поставщик предлагает скидку 2% при оплате за 10 дней вместо 30. Стоимость капитала 18% годовых. Стоит ли воспользоваться?", options: ["Да — скидка эквивалентна ~36% годовых", "Нет — лучше сохранить деньги 20 дней", "Зависит от объёма", "Нейтрально"], ans: 0 },
  { type: "verbal", q: "Что означает термин «P2P процесс»?", options: ["От заявки до оплаты поставщику", "От производства до продажи", "От планирования до поставки", "От тендера до контракта"], ans: 0 },
  { type: "verbal", q: "Найдите лишнее: оферта, акцепт, рекламация, индоссамент, тендер", options: ["Оферта", "Акцепт", "Индоссамент", "Тендер"], ans: 2 },
  { type: "verbal", q: "«Lead time» в закупках — это:", options: ["Время от размещения заказа до получения товара", "Время согласования контракта", "Срок хранения товара", "Время поиска поставщика"], ans: 0 },
  { type: "verbal", q: "Что такое «single source» риск?", options: ["Зависимость от единственного поставщика", "Риск единственного склада", "Риск одной валюты контракта", "Риск одного менеджера по закупкам"], ans: 0 },
  { type: "verbal", q: "KPI «Fill Rate» измеряет:", options: ["Долю заказов выполненных полностью", "Скорость заполнения склада", "Процент загрузки поставщика", "Уровень брака в поставке"], ans: 0 },
  { type: "verbal", q: "Что такое «maverick buying»?", options: ["Закупки в обход утверждённых процедур", "Закупки у новых поставщиков", "Срочные незапланированные закупки", "Закупки по спотовым ценам"], ans: 0 },
  { type: "verbal", q: "Найдите лишнее: DAP, EXW, DDP, FOB, EBITDA", options: ["DAP", "EXW", "EBITDA", "FOB"], ans: 2 },
  { type: "verbal", q: "Разница между «прямыми» и «непрямыми» закупками:", options: ["Прямые — сырьё и компоненты для производства, непрямые — товары и услуги для деятельности компании", "Прямые — у местных поставщиков, непрямые — у иностранных", "Прямые — без тендера, непрямые — через тендер", "Прямые — крупные суммы, непрямые — мелкие"], ans: 0 },
  { type: "situational", q: "Единственный поставщик повышает цену на 25% за неделю до поставки. Ваши действия:", options: ["Оцениваю срочность и веду переговоры о поэтапном повышении цены", "Выставляю претензию и требую соблюдения условий контракта", "Соглашаюсь на новую цену и корректирую бюджет закупки", "Передаю ситуацию руководству и жду их решения по поставщику"], ans: 0 },
  { type: "situational", q: "В SAP ошибка в банковском счёте поставщика, оплата через 2 дня. Что делаете?", options: ["Блокирую платёж и инициирую исправление мастер-данных немедленно", "Информирую поставщика и жду его подтверждения правильных реквизитов", "Провожу оплату по имеющимся данным и разбираюсь с ошибкой позже", "Прошу финансовый отдел самостоятельно проверить реквизиты поставщика"], ans: 0 },
  { type: "situational", q: "Получена партия на 10% меньше заказанного, производство ждёт. Действия:", options: ["Оцениваю критичность нехватки и ищу альтернативный источник для gap", "Выставляю штраф поставщику и жду полной отгрузки в новые сроки", "Принимаю поставку и информирую производство о задержке остатка", "Возвращаю партию и требую полную отгрузку в течение 48 часов"], ans: 0 },
  { type: "situational", q: "Два тендерных предложения одинаковые по цене но разные по срокам. Как выбрать?", options: ["Анализирую репутацию поставщиков, риски задержки и условия гарантии", "Выбираю поставщика с более коротким сроком поставки автоматически", "Прошу обоих поставщиков пересмотреть сроки и снизить цену", "Запрашиваю дополнительные референсы и откладываю решение на неделю"], ans: 0 },
  { type: "situational", q: "Руководитель просит обойти тендерные процедуры для нужного поставщика. Ваши действия:", options: ["Объясняю риски для компании и предлагаю законные способы ускорения", "Выполняю указание руководителя и провожу закупку без тендера", "Отказываюсь выполнять и фиксирую отказ письменно на всякий случай", "Сообщаю в службу комплаенс и жду официального решения по ситуации"], ans: 0 },
  { type: "situational", q: "Поставщик регулярно нарушает сроки но качество отличное, альтернатив нет. Что делаете долгосрочно?", options: ["Фиксирую нарушения в контракте и параллельно развиваю альтернативного поставщика", "Увеличиваю страховой запас чтобы компенсировать регулярные задержки поставщика", "Регулярно эскалирую ситуацию руководству и требую смены поставщика", "Принимаю ситуацию как норму и учитываю задержки в планировании"], ans: 0 },
  { type: "situational", q: "Коллега создал дублирующую номенклатуру в ERP. Как поступите?", options: ["Сообщаю коллеге и совместно инициируем процедуру очистки дублей", "Самостоятельно удаляю дублирующие позиции из системы без согласования", "Оставляю как есть — система сама выявит дубли при следующей проверке", "Сообщаю руководителю и прошу его разобраться с ситуацией лично"], ans: 0 },
  { type: "situational", q: "Срочная закупка вне бюджета — производство встанет через 48 часов. Действия:", options: ["Готовлю обоснование и получаю срочное одобрение параллельно с поиском поставщика", "Жду официального согласования бюджета сколько бы это ни заняло времени", "Закупаю самостоятельно и оформляю все документы задним числом потом", "Информирую производство о невозможности закупки без утверждённого бюджета"], ans: 0 },
  { type: "situational", q: "Поставщик из Китая предлагает цену на 30% ниже рынка. Как оцениваете риски?", options: ["Проверяю качество, сертификаты и финансовую стабильность перед решением", "Размещаю тестовый заказ и оцениваю качество по факту первой поставки", "Отказываюсь — демпинговая цена всегда означает проблемы с качеством", "Использую предложение как рычаг в переговорах с текущими поставщиками"], ans: 0 },
  { type: "situational", q: "В спецификации противоречие между техническим отделом и закупками. Что делаете?", options: ["Организую встречу обеих сторон для согласования единой интерпретации", "Следую версии технического отдела как профильного эксперта по продукту", "Размещаю заказ по своему пониманию и уточняю детали при получении", "Запрашиваю письменное решение у руководителя обоих отделов одновременно"], ans: 0 },
  { type: "situational", q: "Контракт истекает через 3 месяца, альтернативных поставщиков нет. Когда начинаете переговоры?", options: ["Начинаю немедленно — 3 месяца минимум для нормального процесса", "Начинаю за месяц — этого обычно достаточно для продления контракта", "Жду инициативы от поставщика — он заинтересован в продлении не меньше нас", "Параллельно ищу альтернативных поставщиков и затягиваю переговоры намеренно"], ans: 0 },
  { type: "situational", q: "Поставщик требует 100% предоплату, политика компании — максимум 30%. Ваши действия:", options: ["Объясняю политику и предлагаю компромисс через аккредитив или поэтапную оплату", "Соглашаюсь на 100% предоплату и оформляю исключение через финансовый отдел", "Отказываюсь от поставщика и начинаю срочный поиск альтернативы на рынке", "Плачу 30% согласно политике и жду реакции поставщика на частичную оплату"], ans: 0 },
  { type: "nonstandard", q: "3 поставщика одного материала с одинаковой ценой. Как снизить риск не увеличивая затраты?", options: ["Распределяю объём 60/30/10 между основным, резервным и развиваемым поставщиком", "Выбираю одного лучшего и концентрирую весь объём для получения скидки", "Делю объём поровну между всеми тремя для максимальной диверсификации", "Провожу ежеквартальный тендер и каждый раз выбираю лучшее предложение"], ans: 0 },
  { type: "nonstandard", q: "Категория закупается у 12 разных поставщиков. Что это говорит о процессе?", options: ["Отсутствие консолидации — потеря переговорной силы и рост административных затрат", "Хорошая диверсификация рисков — зависимость от одного поставщика опасна", "Признак высокой конкуренции на рынке и активной работы закупщика", "Нормальная ситуация для сложной технической категории с узкими специалистами"], ans: 0 },
  { type: "nonstandard", q: "Стоимость обработки заказа €150, заказ на €80. Что делать с такими заказами?", options: ["Консолидировать с другими заказами или перевести на рамочные договоры", "Обрабатывать как обычно — отказывать внутренним заказчикам нельзя", "Автоматизировать процесс обработки чтобы снизить стоимость транзакции", "Установить минимальный порог заказа и отказывать в мелких закупках"], ans: 0 },
  { type: "nonstandard", q: "Поставщик всегда опаздывает ровно на 3 дня. Как решить системно не меняя поставщика?", options: ["Корректирую lead time в системе и фиксирую штрафные санкции в контракте", "Каждый раз звоню поставщику за 3 дня и напоминаю о дедлайне поставки", "Увеличиваю страховой запас на 3 дня чтобы компенсировать регулярную задержку", "Провожу переговоры с поставщиком и требую объяснений причин задержки"], ans: 0 },
  { type: "nonstandard", q: "Два отдела хотят один материал но у разных поставщиков. Ваши действия?", options: ["Анализирую суммарный объём и провожу объединённый тендер для лучшей цены", "Каждый отдел закупает у своего поставщика — у них разные требования", "Выбираю поставщика с более низкой ценой и обязываю оба отдела работать с ним", "Прошу оба отдела провести совместное совещание и самостоятельно договориться"], ans: 0 },
  { type: "nonstandard", q: "Бюджет урезали на 20% в середине года. Как расставить приоритеты?", options: ["Классифицирую закупки по критичности и сокращаю наименее важные категории", "Сокращаю все категории пропорционально на 20% для справедливого распределения", "Откладываю все несрочные закупки на следующий год без анализа последствий", "Готовлю обоснование и прошу руководство пересмотреть решение о сокращении"], ans: 0 },
  { type: "nonstandard", q: "Какие категории требуют тендера а какие можно закупать напрямую?", options: ["По матрице риска и стоимости: стратегические и крупные — тендер, стандартные — прямые", "Все закупки свыше установленного порогового значения идут через тендер", "Тендер только для новых поставщиков, с проверенными работаем напрямую", "Все категории через тендер — это обеспечивает максимальную прозрачность процесса"], ans: 0 },
  { type: "nonstandard", q: "Закупщик получает низкие цены но заказчики жалуются на задержки и неполные поставки. Как интерпретировать?", options: ["Закупщик оптимизирует цену в ущерб общей эффективности цепочки поставок", "Проблема на стороне поставщиков — закупщик выбирает лучшую цену правильно", "Закупщик работает хорошо — экономия важнее сроков в текущей ситуации", "Нужно усилить контроль качества на входе и ввести штрафы для поставщиков"], ans: 0 },
  { type: "speed", q: "Заказ на 200 единиц по €45. Общая сумма?", options: ["€9 000", "€8 500", "€9 500", "€10 000"], ans: 0 },
  { type: "speed", q: "Скидка 7% от €3 500. Финальная цена?", options: ["€3 255", "€3 150", "€3 300", "€3 200"], ans: 0 },
  { type: "speed", q: "Поставщик выполнил 85 из 100 заказов вовремя. On-time delivery %?", options: ["85%", "80%", "90%", "75%"], ans: 0 },
  { type: "speed", q: "Контракт на €10 000. Курс 1,08 USD/EUR. Сумма в долларах?", options: ["$10 800", "$9 259", "$11 000", "$10 000"], ans: 0 },
  { type: "speed", q: "Lead time 3 недели, страховой запас 1 неделя, остаток на 4 недели. Когда размещать заказ?", options: ["Немедленно", "Через неделю", "Через 2 недели", "Когда закончится запас"], ans: 0 },
  { type: "speed", q: "3 предложения: €1 200, €1 350, €980. Средняя цена?", options: ["€1 176,67", "€1 200", "€1 150", "€1 100"], ans: 0 },
  { type: "speed", q: "Бюджет €100 000. Потрачено €73 500. Остаток в процентах?", options: ["26,5%", "73,5%", "25%", "28%"], ans: 0 },
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

const IQ_SECTIONS = [
  { key: "numeric", label: "Числовая логика", max: 8 },
  { key: "verbal", label: "Вербальное мышление", max: 8 },
  { key: "situational", label: "Ситуативные задачи", max: 12 },
  { key: "nonstandard", label: "Нестандартное мышление", max: 8 },
  { key: "speed", label: "Скорость решений", max: 7 },
];

const SPEED_TIME = 15;
const DISC_TIME = 15;

const Header = ({ subtitle }) => (
  <div style={{ background: BRAND.blue, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <Logo />
    {subtitle && <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, letterSpacing: "0.3px" }}>{subtitle}</span>}
  </div>
);

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
    let c = { PL: 0, RI: 0, CO: 0, SH: 0, ME: 0, TW: 0, IMP: 0, CF: 0, SP: 0 };
    Object.values(belbinAnswers).forEach(r => { if (c[r] !== undefined) c[r]++; });
    const sorted = Object.entries(c).sort((a, b) => b[1] - a[1]);
    return { counts: c, primary: sorted[0][0], secondary: sorted[1][0] };
  };

  const DISC_NAMES = { D: "Доминирование (D)", I: "Влияние (I)", S: "Стабильность (S)", C: "Соответствие (C)" };
  const BELBIN_NAMES = { PL: "Генератор идей", RI: "Исследователь ресурсов", CO: "Координатор", SH: "Мотиватор", ME: "Аналитик-стратег", TW: "Командный игрок", IMP: "Реализатор", CF: "Контролёр качества", SP: "Специалист" };

  const getRank = (pct) => {
    if (pct >= 85) return { label: "A — Высокий потенциал", color: "#27ae60" };
    if (pct >= 65) return { label: "B — Выше среднего", color: BRAND.blue };
    if (pct >= 45) return { label: "C — Средний уровень", color: "#e67e22" };
    return { label: "D — Ниже ожиданий", color: "#c0392b" };
  };

  useEffect(() => {
    if (screen === "iq") {
      const isSpeed = SPEED_IDS.includes(currentQ);
      if (isSpeed && !(currentQ in iqAnswers) && !timedOut[currentQ]) {
        setTimeLeft(SPEED_TIME);
        timerRef.current = setInterval(() => setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setIqAnswers(prev => ({ ...prev, [currentQ]: -1 })); setTimedOut(prev => ({ ...prev, [currentQ]: true })); setTimeout(() => goNext("iq"), 600); return 0; }
          return t - 1;
        }), 1000);
      } else setTimeLeft(null);
      return () => clearInterval(timerRef.current);
    }
    if (screen === "disc" && !(currentQ in discAnswers)) {
      setTimeLeft(DISC_TIME);
      timerRef.current = setInterval(() => setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); const opts = DISC_Q[currentQ].options; setDiscAnswers(prev => ({ ...prev, [currentQ]: opts[Math.floor(Math.random() * opts.length)].d })); setTimeout(() => goNext("disc"), 400); return 0; }
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
      sendToSheets({ date: new Date().toLocaleString("ru-RU"), name: candidateName, score: pct, rank: getRank(pct).label, disc_primary: DISC_NAMES[dp], disc_secondary: DISC_NAMES[ds], belbin_primary: BELBIN_NAMES[bp], belbin_secondary: BELBIN_NAMES[bs], numeric: scores.numeric, verbal: scores.verbal, situational: scores.situational, nonstandard: scores.nonstandard, speed: scores.speed });
    }
  }, [screen]);

  const goNext = (mode) => {
    clearInterval(timerRef.current); setTimeLeft(null);
    if (mode === "iq") { currentQ < totalIQ - 1 ? setCurrentQ(q => q + 1) : (setCurrentQ(0), setScreen("disc")); }
    else if (mode === "disc") { currentQ < totalDISC - 1 ? setCurrentQ(q => q + 1) : (setCurrentQ(0), setScreen("belbin")); }
    else { currentQ < totalBelbin - 1 ? setCurrentQ(q => q + 1) : setScreen("done"); }
  };

  const answerIQ = (idx) => { if (currentQ in iqAnswers || timedOut[currentQ]) return; clearInterval(timerRef.current); setIqAnswers(prev => ({ ...prev, [currentQ]: idx })); setTimeout(() => goNext("iq"), 500); };
  const answerDISC = (d) => { if (currentQ in discAnswers) return; clearInterval(timerRef.current); setDiscAnswers(prev => ({ ...prev, [currentQ]: d })); setTimeout(() => goNext("disc"), 400); };
  const answerBelbin = (r) => { if (currentQ in belbinAnswers) return; setBelbinAnswers(prev => ({ ...prev, [currentQ]: r })); setTimeout(() => goNext("belbin"), 400); };
  const resetAll = () => { setScreen("intro"); setIqAnswers({}); setDiscAnswers({}); setBelbinAnswers({}); setCurrentQ(0); setTimedOut({}); setCandidateName(""); sentRef.current = false; };

  const wrap = { fontFamily: "Arial, sans-serif", background: "#fff", minHeight: "100vh" };
  const content = { padding: "2rem 1.5rem", maxWidth: 680, margin: "0 auto" };
  const btn = { display: "block", width: "100%", padding: "12px 16px", marginBottom: 10, background: BRAND.gray, border: `1px solid ${BRAND.border}`, borderRadius: 4, fontSize: 14, color: BRAND.darkGray, cursor: "pointer", textAlign: "left", lineHeight: 1.5 };
  const btnPrimary = { padding: "12px 32px", background: BRAND.blue, border: "none", borderRadius: 4, fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", marginTop: "1.5rem", display: "inline-block" };
  const progress = { height: 4, background: BRAND.border, margin: "0.75rem 0 1.25rem" };
  const fill = (p, c) => ({ height: "100%", width: p + "%", background: c || BRAND.blue, transition: "width 0.3s" });
  const divider = { borderTop: `1px solid ${BRAND.border}`, margin: "1.25rem 0" };
  const accentCard = { background: BRAND.gray, borderLeft: `4px solid ${BRAND.green}`, padding: "1rem 1.25rem", marginBottom: 12 };
  const qCard = (color) => ({ background: "#fff", border: `1px solid ${BRAND.border}`, borderLeft: `4px solid ${color || BRAND.blue}`, padding: "1rem 1.25rem", marginBottom: "1.25rem" });

  if (screen === "intro") return (
    <div style={wrap}>
      <Header subtitle="Оценка кандидатов · Отдел закупок и снабжения" />
      <div style={content}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: BRAND.blue, margin: "0 0 0.5rem" }}>Оценочный тест кандидата</h1>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>Добро пожаловать. Этот тест помогает нам лучше понять ваш стиль мышления и работы в команде.</p>
        <div style={divider} />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: BRAND.blue, borderBottom: `2px solid ${BRAND.green}`, paddingBottom: 8, margin: "0 0 1rem" }}>Структура теста</h2>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}><b>Блок 1 — Логика и мышление</b> (43 вопроса, ~25 мин)<br/>Задачи на числовую логику, вербальное мышление, ситуативные и нестандартные задачи.</p>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}><b>Блок 2 — Стиль работы</b> (20 вопросов, ~10 мин)<br/>Вопросы о том как вы обычно действуете в рабочих ситуациях. Таймер 15 секунд.</p>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}><b>Блок 3 — Командная роль</b> (18 вопросов, ~10 мин)<br/>Вопросы о вашей роли в командной работе.</p>
        <div style={divider} />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: BRAND.blue, borderBottom: `2px solid ${BRAND.green}`, paddingBottom: 8, margin: "0 0 1rem" }}>Важно знать</h2>
        <div style={accentCard}>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>
            • В блоках 2 и 3 нет правильных и неправильных ответов — только честные<br/>
            • Результаты видит только HR — вам они не отображаются<br/>
            • Отвечайте быстро и интуитивно — первый ответ обычно точнее<br/>
            • Общее время: около 45 минут
          </p>
        </div>
        <div style={divider} />
        <label style={{ fontSize: 14, fontWeight: 700, color: BRAND.blue, display: "block", marginBottom: 8 }}>Ваше имя</label>
        <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Введите имя и фамилию..." style={{ width: "100%", padding: "11px 14px", fontSize: 15, borderRadius: 4, border: `1px solid ${BRAND.border}`, background: BRAND.gray, color: BRAND.darkGray, boxSizing: "border-box" }} />
        <button style={btnPrimary} onClick={() => { if (candidateName.trim()) { sentRef.current = false; setScreen("iq"); } }}>Начать тест →</button>
      </div>
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
      <div style={wrap}>
        <Header subtitle={`Блок 1 · ${label}`} />
        <div style={content}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 4 }}>
            <span>Вопрос {currentQ + 1} из {totalIQ}</span>
            {isSpeed && timeLeft !== null && !answered && <span style={{ fontWeight: 700, color: timeLeft <= 4 ? "#c0392b" : BRAND.green }}>⏱ {timeLeft} сек</span>}
          </div>
          <div style={progress}><div style={fill(prog)} /></div>
          {to && <div style={{ fontSize: 13, color: "#c0392b", marginBottom: 10, fontWeight: 600 }}>⏱ Время вышло</div>}
          <div style={qCard(BRAND.blue)}><p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: BRAND.darkGray }}>{q.q}</p></div>
          {q.options.map((opt, i) => {
            let border = `1px solid ${BRAND.border}`, bg = BRAND.gray;
            if (answered || to) {
              if (i === q.ans) { border = `2px solid #27ae60`; bg = "#27ae6011"; }
              else if (iqAnswers[currentQ] === i) { border = `2px solid #c0392b`; bg = "#c0392b11"; }
            }
            return <button key={i} style={{ ...btn, border, background: bg }} onClick={() => answerIQ(i)}>{opt}</button>;
          })}
          {(answered || to) && <button style={btnPrimary} onClick={() => goNext("iq")}>{currentQ < totalIQ - 1 ? "Следующий вопрос →" : "Перейти к блоку 2 →"}</button>}
        </div>
      </div>
    );
  }

  if (screen === "disc") {
    const q = DISC_Q[currentQ];
    const answered = currentQ in discAnswers;
    const prog = Math.round(((currentQ + 1) / totalDISC) * 100);
    return (
      <div style={wrap}>
        <Header subtitle="Блок 2 · Стиль работы" />
        <div style={content}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 4 }}>
            <span>Вопрос {currentQ + 1} из {totalDISC}</span>
            {timeLeft !== null && !answered && <span style={{ fontWeight: 700, color: timeLeft <= 5 ? "#c0392b" : BRAND.green }}>⏱ {timeLeft} сек</span>}
          </div>
          <div style={progress}><div style={fill(prog, BRAND.green)} /></div>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Выберите вариант который <b>точнее всего</b> описывает вас:</p>
          <div style={qCard(BRAND.green)}><p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: BRAND.darkGray }}>{q.q}</p></div>
          {q.options.map((opt, i) => {
            const chosen = discAnswers[currentQ] === opt.d;
            return <button key={i} style={{ ...btn, border: chosen ? `2px solid ${BRAND.blue}` : `1px solid ${BRAND.border}`, background: chosen ? BRAND.blue + "11" : BRAND.gray }} onClick={() => answerDISC(opt.d)}>{opt.text}</button>;
          })}
          {answered && <button style={btnPrimary} onClick={() => goNext("disc")}>{currentQ < totalDISC - 1 ? "Следующий →" : "Перейти к блоку 3 →"}</button>}
        </div>
      </div>
    );
  }

  if (screen === "belbin") {
    const q = BELBIN_Q[currentQ];
    const answered = currentQ in belbinAnswers;
    const prog = Math.round(((currentQ + 1) / totalBelbin) * 100);
    return (
      <div style={wrap}>
        <Header subtitle="Блок 3 · Командная роль" />
        <div style={content}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 4 }}>
            <span>Вопрос {currentQ + 1} из {totalBelbin}</span>
          </div>
          <div style={progress}><div style={fill(prog, BRAND.lightBlue)} /></div>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Выберите вариант который <b>точнее всего</b> описывает вас в команде:</p>
          <div style={qCard(BRAND.lightBlue)}><p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: BRAND.darkGray }}>{q.q}</p></div>
          {q.options.map((opt, i) => {
            const chosen = belbinAnswers[currentQ] === opt.r;
            return <button key={i} style={{ ...btn, border: chosen ? `2px solid ${BRAND.lightBlue}` : `1px solid ${BRAND.border}`, background: chosen ? BRAND.lightBlue + "11" : BRAND.gray }} onClick={() => answerBelbin(opt.r)}>{opt.text}</button>;
          })}
          {answered && <button style={btnPrimary} onClick={() => goNext("belbin")}>{currentQ < totalBelbin - 1 ? "Следующий →" : "Завершить тест →"}</button>}
        </div>
      </div>
    );
  }

  if (screen === "done") return (
    <div style={wrap}>
      <Header subtitle="Оценка кандидатов" />
      <div style={{ ...content, textAlign: "center", paddingTop: "4rem" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: BRAND.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28, color: BRAND.blue, fontWeight: 700 }}>✓</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: BRAND.blue }}>Тест завершён</h1>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginTop: 12 }}>
          Спасибо, <b>{candidateName}</b>!<br/><br/>
          Ваши результаты переданы HR-менеджеру.<br/>
          Мы свяжемся с вами в ближайшее время.
        </p>
        <button style={{ ...btnPrimary, background: BRAND.gray, color: BRAND.blue, border: `1px solid ${BRAND.blue}`, marginTop: 32 }} onClick={resetAll}>← Пройти снова</button>
      </div>
    </div>
  );

  return null;
}