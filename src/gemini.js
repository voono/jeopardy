// --- GEMINI QUESTION GENERATOR ---
// Generates Persian Jeopardy categories on the fly using the Gemini API.

const MODEL = 'gemini-3.1-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const VALUES = [100, 200, 300, 400, 500];

// Schema that mirrors the shape App.jsx expects for each category.
const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      questions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            value: { type: 'INTEGER' },
            q: { type: 'STRING' },
            a: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['value', 'q', 'a', 'options'],
        },
      },
    },
    required: ['title', 'questions'],
  },
};

const buildPrompt = (theme) => {
  const themeLine = theme && theme.trim()
    ? `همهٔ دسته‌ها باید حول محور موضوع کلی «${theme.trim()}» باشند.`
    : 'دسته‌ها را از موضوعات متنوع (تاریخ، علم، جغرافیا، هنر، ورزش، فرهنگ عامه و…) انتخاب کن.';

  return `تو سازندهٔ یک بازی «جئوپاردی» فارسی برای بزرگسالانِ باسواد و اهل مطالعه هستی. دقیقاً ۶ دستهٔ متفاوت بساز.
${themeLine}

برای هر دسته دقیقاً ۵ سوال بساز، هر کدام با یکی از ارزش‌های ${VALUES.join('، ')} (هر ارزش دقیقاً یک بار).

سطح دشواری کلی بازی باید بالا باشد؛ حتی سوال ۱۰۰ امتیازی نباید بدیهی یا عمومی خیلی ساده باشد. برای هر سطح ارزش دقیقاً به این معیار پایبند باش:

- ۱۰۰: دانش عمومی محکم — چیزی که فقط افراد مطلع و پیگیر اخبار/کتاب می‌دانند، نه اولین چیزی که به ذهن هرکسی می‌رسد.
- ۲۰۰: دانش تخصصی‌تر — نیازمند اطلاعات دقیق (تاریخ، نام، عدد) نه فقط تشخیص کلی موضوع.
- ۳۰۰: سخت — سوالی که اکثر بزرگسالان معمولی نمی‌توانند پاسخ دهند؛ جزئیات کمتر شناخته‌شده دربارهٔ یک موضوع نسبتاً معروف.
- ۴۰۰: بسیار سخت — سطح علاقه‌مندان/متخصصان آن حوزه؛ شامل جزئیات دقیق، تاریخ‌های خاص، یا ارتباطات کمتر بدیهی بین مفاهیم.
- ۵۰۰: دشوارترین — سوالی در حد کارشناسان واقعی همان رشته؛ اطلاعات کمیاب یا نکات فرعی دقیق که فقط با تسلط عمیق بر موضوع قابل پاسخ است.

هیچ‌کدام از سوالات نباید با حذف ساده گزینه‌های آشکارا نامربوط قابل حدس زدن باشند؛ همهٔ ۴ گزینه باید در همان حوزهٔ موضوعی و قابل‌قبول به نظر برسند، طوری‌که فقط کسی که واقعاً پاسخ را می‌داند بتواند گزینهٔ درست را تشخیص دهد.

برای هر سوال:
- «q» متن سوال به فارسی روان.
- «options» دقیقاً ۴ گزینه به فارسی؛ یکی از آن‌ها پاسخ درست است و سه گزینهٔ دیگر باورپذیر، هم‌رده و فریبنده (نه بی‌ربط یا مسخره).
- «a» باید عیناً برابر با گزینهٔ درست داخل «options» باشد.
- «title» عنوان کوتاه و جذاب دسته به فارسی.

اطلاعات باید دقیق و واقعی باشند. سوال‌ها را تکراری نساز.`;
};

// Basic shape validation + normalization so the game board never breaks.
const normalize = (data) => {
  if (!Array.isArray(data) || data.length < 6) {
    throw new Error('پاسخ Gemini باید حداقل ۶ دسته داشته باشد');
  }

  return data.slice(0, 6).map((cat, ci) => {
    const questions = Array.isArray(cat.questions) ? cat.questions : [];
    // Keep only the first valid question per value so every board cell has one.
    const byValue = {};
    for (const q of questions) {
      if (!q || !VALUES.includes(q.value)) continue;
      if (byValue[q.value]) continue;
      if (!q.q || !q.a || !Array.isArray(q.options) || q.options.length < 2) continue;
      if (!q.options.includes(q.a)) q.options = [q.a, ...q.options].slice(0, 4);
      byValue[q.value] = { ...q, id: `c${ci}-v${q.value}` };
    }

    const missing = VALUES.filter((v) => !byValue[v]);
    if (missing.length) {
      throw new Error(`دستهٔ «${cat.title || ci + 1}» سوال کامل ندارد`);
    }

    return {
      id: `gen-cat-${ci}`,
      title: cat.title || `دسته ${ci + 1}`,
      questions: VALUES.map((v) => byValue[v]),
    };
  });
};

export const generateCategories = async (theme = '') => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('کلید Gemini تنظیم نشده است (VITE_GEMINI_API_KEY را در فایل .env قرار دهید)');
  }

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(theme) }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 1.1,
      },
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err?.error?.message || '';
    } catch { /* ignore */ }
    throw new Error(`خطای Gemini (${res.status})${detail ? `: ${detail}` : ''}`);
  }

  const payload = await res.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('پاسخ خالی از Gemini دریافت شد');

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('پاسخ Gemini قابل خواندن نبود');
  }

  return normalize(data);
};
