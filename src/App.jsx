import React, { useState, useEffect } from 'react';
import { Trophy, User, X, Check, HelpCircle, RotateCcw, Users, Clock, Sparkles, ChevronRight, AlertTriangle, Flame, Zap, Moon, Sun } from 'lucide-react';

// --- AUDIO SYSTEM (Web Audio API) ---
const initAudio = () => {
  if (typeof window !== 'undefined' && !window.audioCtx) {
    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (window.audioCtx?.state === 'suspended') {
    window.audioCtx.resume();
  }
};

const playSound = (type) => {
  if (!window.audioCtx) return;
  const ctx = window.audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  
  if (type === 'tick') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'correct') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554.37, now + 0.1);
    osc.frequency.setValueAtTime(659.25, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'dailyDouble') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.5);
    osc.frequency.linearRampToValueAtTime(1200, now + 1.0);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 1.5);
    osc.start(now);
    osc.stop(now + 1.5);
  } else if (type === 'mandatory') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(150, now + 0.2);
    osc.frequency.setValueAtTime(200, now + 0.4);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    osc.start(now);
    osc.stop(now + 0.8);
  }
};

const CATEGORIES = [
  {
    id: 'world_history',
    title: 'تاریخ جهان',
    questions: [
      { id: 'wh1', value: 100, q: 'تمدن باستانی «مایا» بیشتر در کدام منطقه جغرافیایی امروزی تمرکز داشت؟', a: 'آمریکای مرکزی', options: ['آمریکای جنوبی', 'آمریکای مرکزی', 'آفریقای شمالی', 'آسیای شرقی'] },
      { id: 'wh2', value: 200, q: 'نام پادشاهی که در نبرد واترلو از ائتلاف هفتم شکست خورد و تبعید شد؟', a: 'ناپلئون بناپارت', options: ['لویی شانزدهم', 'ناپلئون بناپارت', 'پتر کبیر', 'شارلمانی'] },
      { id: 'wh3', value: 300, q: 'طولانی‌ترین جنگ تاریخ بین کدام دو کشور رخ داد که ۳۳۵ سال طول کشید اما هیچ کشته‌ای نداشت؟', a: 'هلند و جزایر سیلی', options: ['انگلستان و فرانسه', 'هلند و جزایر سیلی', 'اسپانیا و پرتغال', 'چین و ژاپن'] },
      { id: 'wh4', value: 400, q: 'معاهده مشهور «وستفالی» که به جنگ‌های خونین سی‌ساله در اروپا پایان داد در چه سالی امضا شد؟', a: '۱۶۴۸', options: ['۱۴۹۲', '۱۶۴۸', '۱۷۸۹', '۱۸۱۵'] },
      { id: 'wh5', value: 500, q: 'نام آخرین امپراتور امپراتوری بیزانس (روم شرقی) که در جریان سقوط قسطنطنیه شمشیر به دست کشته شد؟', a: 'کنستانتین یازدهم', options: ['ژوستینیان یکم', 'کنستانتین یازدهم', 'تئودوسیوس دوم', 'باسیل دوم'] },
    ]
  },
  {
    id: 'advanced_science',
    title: 'علوم و نجوم',
    questions: [
      { id: 'as1', value: 100, q: 'کدام سیاره در منظومه شمسی کوتاه‌ترین روز (حدود ۱۰ ساعت) را دارد؟', a: 'مشتری', options: ['عطارد', 'مریخ', 'مشتری', 'زحل'] },
      { id: 'as2', value: 200, q: 'غده پینه‌آل (صنوبری) در مغز انسان وظیفه ترشح کدام هورمون خواب‌آور را بر عهده دارد؟', a: 'ملاتونین', options: ['سروتونین', 'دوپامین', 'ملاتونین', 'کورتیزول'] },
      { id: 'as3', value: 300, q: 'نام ثابت فیزیکی که رابطه بین انرژی یک فوتون و فرکانس موج آن را تعیین می‌کند؟', a: 'ثابت پلانک', options: ['ثابت بولتزمن', 'ثابت آووگادرو', 'ثابت هابل', 'ثابت پلانک'] },
      { id: 'as4', value: 400, q: 'در مدل استاندارد فیزیک ذرات بنیادی، کدام ذره حامل "نیروی هسته‌ای قوی" است؟', a: 'گلوئون', options: ['فوتون', 'بوزون دابلیو', 'گلوئون', 'گراویتون'] },
      { id: 'as5', value: 500, q: 'اولین تپ‌اختر (Pulsar) در سال ۱۹۶۷ توسط کدام اخترفیزیکدان زن کشف شد؟', a: 'جوسلین بل بورنل', options: ['ماری کوری', 'ورا روبین', 'جوسلین بل بورنل', 'سالی راید'] },
    ]
  },
  {
    id: 'world_lit',
    title: 'ادبیات و فلسفه',
    questions: [
      { id: 'wl1', value: 100, q: 'مفهوم «ابرانسان» (Übermensch) اولین بار در کدام اثر فریدریش نیچه مطرح شد؟', a: 'چنین گفت زرتشت', options: ['فراسوی نیک و بد', 'تبارشناسی اخلاق', 'چنین گفت زرتشت', 'غروب بت‌ها'] },
      { id: 'wl2', value: 200, q: 'رمان «اولیس» اثر شاهکار جیمز جویس، داستان وقایع چه شهری را در یک روز روایت می‌کند؟', a: 'دوبلین', options: ['لندن', 'پاریس', 'دوبلین', 'ادینبرو'] },
      { id: 'wl3', value: 300, q: 'کدام نمایشنامه‌نویس یونان باستان به عنوان «پدر تراژدی» شناخته می‌شود و اثر «ایرانیان» متعلق به اوست؟', a: 'آیسخولوس (اشیل)', options: ['سوفوکل', 'اوریپید', 'آریستوفان', 'آیسخولوس (اشیل)'] },
      { id: 'wl4', value: 400, q: 'سیاست‌مداری که در سال ۱۹۵۳ برنده جایزه «نوبل ادبیات» شد کیست؟', a: 'وینستون چرچیل', options: ['تئودور روزولت', 'ژان پل سارتر', 'شارل دوگل', 'وینستون چرچیل'] },
      { id: 'wl5', value: 500, q: 'در رمان «۱۹۸۴» اثر جورج اورول، نام اتاقی که در آن افراد با بزرگترین ترس خود روبرو می‌شوند چیست؟', a: 'اتاق ۱۰۱', options: ['اتاق ۲۳۷', 'اتاق ۱۰۱', 'بخش ۴۲', 'سلول صفر'] },
    ]
  },
  {
    id: 'hard_geo',
    title: 'جغرافیای پیشرفته',
    questions: [
      { id: 'hg1', value: 100, q: 'عمیق‌ترین نقطه شناخته شده در تمام اقیانوس‌های جهان چه نام دارد؟', a: 'درازگودال ماریانا', options: ['درازگودال پورتوریکو', 'درازگودال ماریانا', 'گودال تونگا', 'گودال جاوه'] },
      { id: 'hg2', value: 200, q: 'کدام کشور آفریقایی به طور کامل در دل یک کشور دیگر (آفریقای جنوبی) محصور شده است؟', a: 'لسوتو', options: ['اسواتینی', 'بوتسوانا', 'نامیبیا', 'لسوتو'] },
      { id: 'hg3', value: 300, q: 'پایتخت کشوری که کوه مشهور «کلیمانجارو» در آن قرار دارد چیست؟', a: 'دودوما (تانزانیا)', options: ['نایروبی', 'دودوما (تانزانیا)', 'کامپالا', 'کیگالی'] },
      { id: 'hg4', value: 400, q: 'تنگه «باس» (Bass Strait) کدام جزیره را از سرزمین اصلی استرالیا جدا می‌کند؟', a: 'تاسمانی', options: ['نیوزیلند', 'گینه نو', 'تاسمانی', 'کالدونیای جدید'] },
      { id: 'hg5', value: 500, q: 'دریاچه «وُستوک» که بزرگترین دریاچه کشف‌شده در زیر لایه‌های یخی است، در کدام قاره قرار دارد؟', a: 'جنوبگان (قطب جنوب)', options: ['آمریکای شمالی', 'آسیا', 'اروپا', 'جنوبگان (قطب جنوب)'] },
    ]
  },
  {
    id: 'arts_music',
    title: 'هنر و موسیقی',
    questions: [
      { id: 'am1', value: 100, q: 'کدام آهنگساز کلاسیک در دهه سوم زندگی‌اش شنوایی خود را از دست داد اما شاهکارهایی خلق کرد؟', a: 'لودویگ فان بتهوون', options: ['یوهان سباستیان باخ', 'ولفگانگ آمادئوس موتسارت', 'لودویگ فان بتهوون', 'فردریک شوپن'] },
      { id: 'am2', value: 200, q: 'کدام جنبش هنری در اوایل قرن بیستم با هنرمندانی چون دالی و ماگریت و تمرکز بر ضمیر ناخودآگاه شکل گرفت؟', a: 'سوررئالیسم', options: ['امپرسیونیسم', 'کوبیسم', 'دادائیسم', 'سوررئالیسم'] },
      { id: 'am3', value: 300, q: 'مجسمه مرمرین «دیوید» (داوود) که از شاهکارهای رنسانس در فلورانس است، اثر کیست؟', a: 'میکل‌آنژ', options: ['لئوناردو داوینچی', 'میکل‌آنژ', 'دوناتلو', 'رافائل'] },
      { id: 'am4', value: 400, q: 'اپرای عظیم «حلقه نیبلونگ» که اجرای کامل چهار بخش آن حدود ۱۵ ساعت طول می‌کشد، اثر کیست؟', a: 'ریشارد واگنر', options: ['جوزپه وردی', 'ریشارد واگنر', 'جاکومو پوچینی', 'پیوتر ایلیچ چایکوفسکی'] },
      { id: 'am5', value: 500, q: 'تکنیک نقاشی «کُیاروسکورو» (Chiaroscuro) که توسط کاراواجو به اوج رسید به چه معناست؟', a: 'تضاد شدید نور و سایه', options: ['نقاشی با نقطه', 'تضاد شدید نور و سایه', 'ترکیب رنگ‌های مکمل', 'خراشیدن رنگ از روی بوم'] },
    ]
  },
  {
    id: 'trivia_enigmas',
    title: 'معماها و دانستنی‌ها',
    questions: [
      { id: 'te1', value: 100, q: 'سخت‌ترین ماده طبیعی شناخته شده در کره زمین که از کربن خالص تشکیل شده چیست؟', a: 'الماس', options: ['گرافن', 'تیتانیوم', 'الماس', 'کوارتز'] },
      { id: 'te2', value: 200, q: 'تنها حرفی از الفبای انگلیسی که در نام هیچ‌یک از ۵۰ ایالت آمریکا وجود ندارد چیست؟', a: 'Q', options: ['X', 'Z', 'J', 'Q'] },
      { id: 'te3', value: 300, q: 'در روان‌شناسی، «سندرم استاندال» در چه مواقعی به افراد دست می‌دهد و باعث تپش قلب و سرگیجه می‌شود؟', a: 'مواجهه با آثار هنری بسیار زیبا', options: ['ترس از ارتفاع', 'مواجهه با آثار هنری بسیار زیبا', 'قرار گرفتن در تاریکی مطلق', 'شنیدن صداهای خاص'] },
      { id: 'te4', value: 400, q: 'در نظریه بازی‌ها، کدام معمای مشهور نشان می‌دهد چرا دو نفر ممکن است حتی به نفعشان باشد همکاری نکنند؟', a: 'معمای زندانی', options: ['پارادوکس مونتی هال', 'معمای زندانی', 'بازی اولتیماتوم', 'تراژدی منابع مشترک'] },
      { id: 'te5', value: 500, q: 'زبانی فراساخته که با داشتن تنها حدود ۱۲۰ تا ۱۳۷ کلمه، یکی از کوچک‌ترین زبان‌های جهان است؟', a: 'توکی پونا', options: ['اسپرانتو', 'کلینگان', 'توکی پونا', 'اینترلینگوا'] },
    ]
  }
];

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [gameState, setGameState] = useState('setup');
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState(Array(6).fill(''));
  const [players, setPlayers] = useState([]);
  const [dailyDoubles, setDailyDoubles] = useState([]);
  const [mandatoryQuestions, setMandatoryQuestions] = useState([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnsweringIndex, setCurrentAnsweringIndex] = useState(0);
  const [attemptedPlayers, setAttemptedPlayers] = useState([]);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [questionStatus, setQuestionStatus] = useState('unanswered');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showDDSplash, setShowDDSplash] = useState(false);
  const [showMandatorySplash, setShowMandatorySplash] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);
  const [answerDetails, setAnswerDetails] = useState(null);

  const startGame = () => {
    initAudio();
    const newPlayers = Array.from({ length: playerCount }).map((_, i) => ({
      id: i + 1,
      name: playerNames[i].trim() || `بازیکن ${i + 1}`,
      score: 0,
      streak: 0
    }));
    setPlayers(newPlayers);

    const dds = [];
    const mqs = [];

    CATEGORIES.forEach(cat => {
      const qIds = cat.questions.map(q => q.id);
      const ddIndex = Math.floor(Math.random() * qIds.length);
      dds.push(qIds[ddIndex]);
      
      const remainingIds = qIds.filter((_, i) => i !== ddIndex);
      const mqIndex = Math.floor(Math.random() * remainingIds.length);
      mqs.push(remainingIds[mqIndex]);
    });
    
    setDailyDoubles(dds);
    setMandatoryQuestions(mqs);
    setGameState('playing');
    setActivePlayerIndex(0);
    setAnsweredQuestions([]);
  };

  useEffect(() => {
    if (currentQuestion && !showAnswer && !showDDSplash && !showMandatorySplash && timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (currentQuestion && !showAnswer && !showDDSplash && !showMandatorySplash && timeLeft === 0) {
      handleTimeoutOrPass();
    }
  }, [currentQuestion, showAnswer, showDDSplash, showMandatorySplash, timeLeft]);

  useEffect(() => {
    if (currentQuestion && !showAnswer && !showDDSplash && !showMandatorySplash && timeLeft <= 10 && timeLeft > 0) {
      playSound('tick');
    }
  }, [timeLeft, currentQuestion, showAnswer, showDDSplash, showMandatorySplash]);

  const handleQuestionClick = (categoryTitle, question) => {
    if (answeredQuestions.includes(question.id)) return;
    
    const isDD = dailyDoubles.includes(question.id);
    const isMandatory = mandatoryQuestions.includes(question.id);
    const effectiveValue = isDD ? question.value * 2 : question.value;

    setCurrentQuestion({ ...question, category: categoryTitle, isDD, isMandatory, effectiveValue });
    setShowAnswer(false);
    setCurrentAnsweringIndex(activePlayerIndex);
    setAttemptedPlayers([]);
    setEliminatedOptions([]);
    setQuestionStatus('unanswered');
    setAnswerDetails(null);
    setTimeLeft(40);

    if (isDD) {
      playSound('dailyDouble');
      setShowDDSplash(true);
      setTimeout(() => setShowDDSplash(false), 2500);
    } else if (isMandatory) {
      playSound('mandatory');
      setShowMandatorySplash(true);
      setTimeout(() => setShowMandatorySplash(false), 4000);
    }
  };

  const handlePenalty = (isPass) => {
    const isMainPlayer = currentAnsweringIndex === activePlayerIndex;
    let penalty = 0;

    if (isPass) {
      if (currentQuestion.isMandatory && isMainPlayer) {
        penalty = currentQuestion.effectiveValue / 2;
      } else {
        penalty = 0;
      }
    } else {
      penalty = currentQuestion.effectiveValue / 2;
    }

    const newPlayers = [...players];
    newPlayers[currentAnsweringIndex].streak = 0; 
    
    if (penalty > 0) {
      newPlayers[currentAnsweringIndex].score -= penalty;
    }
    setPlayers(newPlayers);
  };

  const proceedToNextPlayer = () => {
    const newAttempted = [...attemptedPlayers, currentAnsweringIndex];
    setAttemptedPlayers(newAttempted);

    if (newAttempted.length >= players.length) {
      setQuestionStatus('failed');
      setShowAnswer(true);
    } else {
      setCurrentAnsweringIndex((currentAnsweringIndex + 1) % players.length);
      setTimeLeft(40);
    }
  };

  const handleTimeoutOrPass = () => {
    playSound('wrong');
    handlePenalty(true);
    proceedToNextPlayer();
  };

  const handleOptionClick = (option) => {
    if (option === currentQuestion.a) {
      playSound('correct');
      const newPlayers = [...players];
      const p = newPlayers[currentAnsweringIndex];
      
      p.streak += 1;
      const isStreakActive = p.streak >= 3;
      
      const hasSpeedBonus = timeLeft >= 30;
      const speedBonus = hasSpeedBonus ? Math.floor(currentQuestion.effectiveValue * 0.2) : 0;
      
      const baseEarned = currentQuestion.effectiveValue + speedBonus;
      const totalEarned = isStreakActive ? Math.floor(baseEarned * 1.5) : baseEarned;
      
      p.score += totalEarned;
      setPlayers(newPlayers);
      
      setQuestionStatus('correct');
      setAnswerDetails({
        speedBonus,
        isStreakActive,
        totalEarned
      });
      setShowAnswer(true);
    } else {
      playSound('wrong');
      handlePenalty(false);
      setEliminatedOptions(prev => [...prev, option]);
      proceedToNextPlayer();
    }
  };

  const finishQuestion = () => {
    setAnsweredQuestions([...answeredQuestions, currentQuestion.id]);
    setCurrentQuestion(null);
    setShowAnswer(false);
    
    setActivePlayerIndex((activePlayerIndex + 1) % players.length);

    if (answeredQuestions.length + 1 === CATEGORIES.length * 5) {
      setGameState('gameover');
    }
  };

  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const resetToSetup = () => {
    setGameState('setup');
    setPlayerNames(Array(6).fill(''));
    setPlayerCount(4);
  };

  // --- Render Wrapper with Theme Context ---
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 md:p-8 font-sans select-none transition-colors duration-300">
        
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed top-4 left-4 z-[100] p-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-md border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all focus:outline-none"
          title={isDarkMode ? "حالت روشن" : "حالت تاریک"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {gameState === 'setup' ? (
          <div className="flex items-center justify-center min-h-[90vh]">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-none relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/30 blur-3xl rounded-full -mr-32 -mt-32 opacity-70"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/30 blur-3xl rounded-full -ml-32 -mb-32 opacity-70"></div>
              
              <div className="text-center mb-12 relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 dark:bg-indigo-900/50 rounded-2xl mb-6 shadow-sm">
                  <Trophy className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                  جئوپاردی پیشرفته
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">تنظیمات بازی جدید</p>
              </div>

              <div className="mb-10 relative z-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Users className="text-indigo-500 dark:text-indigo-400" size={18} />
                    تعداد بازیکنان
                  </label>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/50 px-4 py-1 rounded-full">{playerCount} نفر</span>
                </div>
                <input
                  type="range"
                  min="2" max="6"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 relative z-10">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <User className="text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder={`نام بازیکن ${i + 1}`}
                      value={playerNames[i]}
                      onChange={(e) => handleNameChange(i, e.target.value)}
                      className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pr-12 pl-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none shadow-sm"
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={startGame} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex justify-center items-center gap-2 relative z-10"
              >
                شروع رقابت
                <ChevronRight size={20} className="stroke-[3]"/>
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className="max-w-7xl mx-auto mb-10 pt-4 md:pt-0">
              <div className="flex flex-col xl:flex-row justify-between items-center gap-8 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl">
                    <Trophy className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      جئوپاردی فارسی
                    </h1>
                    <div className="flex items-center gap-2 mt-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full w-fit border border-indigo-100 dark:border-indigo-800/50">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></div>
                      <p className="text-indigo-700 dark:text-indigo-300 font-semibold text-sm flex items-center gap-1">
                        نوبت انتخاب: <span className="text-indigo-900 dark:text-indigo-100">{players[activePlayerIndex]?.name}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full xl:w-auto">
                  {players.map((p, idx) => (
                    <div 
                      key={p.id} 
                      className={`px-5 py-3.5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center min-w-[110px] relative ${
                        activePlayerIndex === idx 
                        ? 'bg-white dark:bg-slate-700 border-indigo-300 dark:border-indigo-500 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.2)] scale-105 z-10' 
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {p.streak >= 3 && (
                        <div title="دور بُرد! (ضریب ۱.۵ برای امتیازات)" className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 p-1.5 rounded-full border border-orange-200 dark:border-orange-500/50 shadow-sm">
                           <Flame className="text-orange-500 animate-pulse w-4 h-4" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <User size={14} className={activePlayerIndex === idx ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
                        <span className={`font-semibold text-sm truncate max-w-[80px] ${activePlayerIndex === idx ? 'text-slate-900 dark:text-white' : ''}`}>{p.name}</span>
                      </div>
                      <div className={`text-xl font-bold tracking-tight ${p.score < 0 ? 'text-red-500 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {p.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="flex flex-col gap-3">
                  <div className="bg-slate-800 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-700 dark:border-slate-600 text-center flex items-center justify-center h-20 shadow-sm">
                    <h2 className="font-bold text-sm md:text-base text-white dark:text-indigo-100 leading-snug">{cat.title}</h2>
                  </div>
                  {cat.questions.map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionClick(cat.title, q)}
                      disabled={answeredQuestions.includes(q.id)}
                      className={`h-24 rounded-2xl text-2xl font-black transition-all transform flex items-center justify-center ${
                        answeredQuestions.includes(q.id)
                        ? 'bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-600 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:-translate-y-1 active:translate-y-0 active:bg-indigo-50 dark:active:bg-slate-700'
                      }`}
                    >
                      {answeredQuestions.includes(q.id) ? '' : q.value}
                    </button>
                  ))}
                </div>
              ))}
            </main>

            <footer className="max-w-7xl mx-auto mt-12 flex flex-col md:flex-row justify-between items-center text-slate-500 dark:text-slate-400 text-sm gap-4">
              <div className="flex items-center gap-6 bg-white dark:bg-slate-800 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                <p className="flex items-center gap-2 font-medium"><Zap size={16} className="text-yellow-500 dark:text-yellow-400"/> پاسخ زیر ۱۰ ثانیه = ۲۰٪ امتیاز بیشتر</p>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <p className="flex items-center gap-2 font-medium"><Flame size={16} className="text-orange-500 dark:text-orange-400"/> ۳ پاسخ متوالی = ضریب ۱.۵ برابر</p>
              </div>
            </footer>

            {currentQuestion && (
              <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-6 z-50">
                <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] md:max-h-[90vh]">
                  
                  <div className={`px-5 py-3 md:px-6 md:py-4 flex flex-wrap justify-between items-center gap-2 ${currentQuestion.isMandatory ? 'bg-red-50 dark:bg-red-900/40 border-b border-red-100 dark:border-red-900/50' : currentQuestion.isDD ? 'bg-orange-50 dark:bg-orange-900/40 border-b border-orange-100 dark:border-orange-900/50' : 'bg-indigo-50 dark:bg-indigo-900/40 border-b border-indigo-100 dark:border-indigo-900/50'}`}>
                    <span className={`font-bold tracking-wide ${currentQuestion.isMandatory ? 'text-red-800 dark:text-red-300' : currentQuestion.isDD ? 'text-orange-800 dark:text-orange-300' : 'text-indigo-800 dark:text-indigo-300'}`}>{currentQuestion.category}</span>
                    <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full font-bold flex items-center gap-1.5 text-xs md:text-sm ${currentQuestion.isMandatory ? 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200' : currentQuestion.isDD ? 'bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-200' : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-200'}`}>
                      {currentQuestion.isMandatory && <AlertTriangle size={14} className="stroke-[2.5]" />}
                      {currentQuestion.isDD && <Sparkles size={14} className="stroke-[2.5]" />}
                      {currentQuestion.effectiveValue} امتیاز
                    </span>
                  </div>
                  
                  {!showAnswer && !showDDSplash && !showMandatorySplash && (
                    <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-5 py-2.5 flex justify-between items-center shadow-sm z-10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/50 rounded-full flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                            <User className="text-indigo-600 dark:text-indigo-400" size={14} />
                          </div>
                          {players[currentAnsweringIndex]?.streak >= 3 && (
                            <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm">
                              <Flame className="text-orange-500 dark:text-orange-400 w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white text-sm md:text-base">{players[currentAnsweringIndex]?.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 w-1/2 max-w-[200px]">
                        <Clock className={timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'} size={16} />
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-red-500' : (timeLeft >= 30 ? 'bg-emerald-500' : 'bg-indigo-500')}`}
                            style={{ width: `${(timeLeft / 40) * 100}%` }}
                          />
                        </div>
                        <span className={`font-mono font-bold text-sm min-w-[24px] text-left ${timeLeft <= 10 ? 'text-red-600 dark:text-red-400' : timeLeft >= 30 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {timeLeft}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-5 md:p-8 flex-1 overflow-y-auto flex flex-col relative bg-slate-50/50 dark:bg-slate-900/50">
                    
                    {showDDSplash ? (
                      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-300 py-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mb-6">
                          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-orange-500 dark:text-orange-400 animate-pulse" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 text-center tracking-tight">سوال جایزه‌دار!</h2>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 text-center font-medium">امتیاز این سوال دو برابر محاسبه می‌شود</p>
                      </div>
                    ) : showMandatorySplash ? (
                       <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-300 py-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-6">
                          <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-red-500 dark:text-red-400 animate-pulse" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 text-center tracking-tight">سوال اجباری!</h2>
                        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 text-center max-w-lg leading-relaxed font-medium">
                          بازیکن اصلی نمی‌تواند این سوال را پاس بدهد. در صورت <span className="font-bold text-slate-900 dark:text-white">پاسخ اشتباه</span> یا <span className="font-bold text-slate-900 dark:text-white">اتمام زمان</span>، <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">{currentQuestion.effectiveValue / 2} امتیاز</span> جریمه خواهد شد!
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col justify-center text-center">
                          {!showAnswer ? (
                            <>
                              <div className="mb-5 flex justify-center">
                                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border shadow-sm
                                    ${currentQuestion.isMandatory && currentAnsweringIndex === activePlayerIndex 
                                      ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50' 
                                      : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'}`}>
                                    <AlertTriangle size={14} className="stroke-[2.5]" />
                                    {currentQuestion.isMandatory && currentAnsweringIndex === activePlayerIndex
                                      ? `اجباری: خطا یا اتمام زمان = ${currentQuestion.effectiveValue / 2}- امتیاز`
                                      : `توجه: پاسخ اشتباه = ${currentQuestion.effectiveValue / 2}- امتیاز`}
                                  </span>
                              </div>
                              
                              <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug mb-8 tracking-tight max-w-3xl mx-auto">
                                {currentQuestion.q}
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto w-full max-w-3xl mx-auto">
                                {currentQuestion.options.map((opt, i) => {
                                  const isEliminated = eliminatedOptions.includes(opt);
                                  return (
                                    <button
                                      key={i}
                                      onClick={() => handleOptionClick(opt)}
                                      disabled={isEliminated}
                                      className={`p-4 rounded-xl font-bold text-base md:text-lg transition-all border-2 flex items-center justify-center
                                        ${isEliminated
                                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through cursor-not-allowed'
                                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0'
                                        }`}
                                    >
                                      {opt}
                                    </button>
                                  )
                                })}
                              </div>
                            </>
                          ) : (
                            <div className="animate-in slide-in-from-bottom-4 duration-300 flex flex-col items-center py-4">
                              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm mb-6 border ${questionStatus === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50'}`}>
                                {questionStatus === 'correct' ? <Check size={16} className="stroke-[3]"/> : <X size={16} className="stroke-[3]"/>}
                                {questionStatus === 'correct' ? `پاسخ صحیح توسط ${players[currentAnsweringIndex].name}` : 'کسی پاسخ صحیح نداد!'}
                              </div>
                              
                              <p className="text-slate-500 dark:text-slate-400 mb-2 text-xs font-semibold uppercase tracking-widest">پاسخ صحیح</p>
                              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8 tracking-tight">
                                {currentQuestion.a}
                              </h3>

                              {questionStatus === 'correct' && answerDetails && (
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl w-full max-w-sm shadow-sm text-right">
                                  <p className="text-slate-900 dark:text-white font-extrabold mb-3 pb-2 border-b border-slate-100 dark:border-slate-700 text-sm">جزئیات امتیاز</p>
                                  <div className="space-y-2 text-sm font-medium">
                                     <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                       <span>امتیاز پایه:</span>
                                       <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">+{currentQuestion.effectiveValue}</span>
                                     </div>
                                     {answerDetails.speedBonus > 0 && (
                                       <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                                         <span className="flex items-center gap-1.5"><Zap size={14} /> پاداش سرعت:</span>
                                         <span className="font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">+{answerDetails.speedBonus}</span>
                                       </div>
                                     )}
                                     {answerDetails.isStreakActive && (
                                       <div className="flex justify-between items-center text-orange-600 dark:text-orange-400">
                                         <span className="flex items-center gap-1.5"><Flame size={14} /> ضریب دور بُرد:</span>
                                         <span className="font-bold bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">x۱.۵</span>
                                       </div>
                                     )}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-base text-indigo-600 dark:text-indigo-400 font-black">
                                     <span>مجموع دریافتی:</span>
                                     <span>+{answerDetails.totalEarned}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {!showDDSplash && !showMandatorySplash && (
                    <div className="p-4 md:p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-center">
                      {!showAnswer ? (
                        currentQuestion.isMandatory && currentAnsweringIndex === activePlayerIndex ? (
                          <button 
                            disabled
                            className="px-6 py-3 bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 rounded-xl font-bold w-full sm:w-auto flex justify-center items-center text-sm md:text-base cursor-not-allowed opacity-70"
                          >
                            پاس دادن مجاز نیست (باید پاسخ دهید)
                          </button>
                        ) : (
                          <button 
                            onClick={handleTimeoutOrPass}
                            className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all w-full sm:w-auto flex justify-center items-center text-sm md:text-base"
                          >
                            نمی‌داند (پاس دادن بدون جریمه)
                          </button>
                        )
                      ) : (
                        <button 
                          onClick={finishQuestion}
                          className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-sm md:text-base w-full sm:w-auto shadow-md shadow-indigo-200 dark:shadow-none"
                        >
                          ادامه بازی
                          <ChevronRight size={18} className="stroke-[3]"/>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-[60]">
                <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 text-center animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
                  <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner dark:shadow-none">
                    <Trophy className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-10 tracking-tight">پایان رقابت!</h2>
                  
                  <div className="grid gap-4 mb-10">
                    {players.sort((a,b) => b.score - a.score).map((p, i) => (
                      <div key={p.id} className={`p-5 rounded-2xl border-2 flex justify-between items-center transition-all ${i === 0 ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-500/50 scale-105 shadow-md dark:shadow-none' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                         <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                              {i+1}
                            </span>
                            <span className={`text-xl font-bold ${i === 0 ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{p.name}</span>
                         </div>
                        <span className={`text-2xl font-black ${p.score < 0 ? 'text-red-500 dark:text-red-400' : i === 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{p.score}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={resetToSetup}
                    className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg dark:shadow-none"
                  >
                    <RotateCcw size={20} className="stroke-[3]"/>
                    شروع یک بازی جدید
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;