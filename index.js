const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const bot = new Telegraf('8187800329:AAHpRr0ke2CHDSD6Y-EDN9hTgjPEFREgsyk');

// server variables
const hostName = "http://example.com/";
const waitingForName = new Set();


bot.start(async (ctx) => {
  const user = ctx.from;

  // ارسال اطلاعات کاربر به سرور PHP
  try {
    await axios.post(`${hostName}save_user.php`, {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username
    });
  } catch (err) {
    console.log("خطا در ارسال اطلاعات به PHP:", err.message);
  }

  // پیام خوش‌آمدگویی با ۴ دکمه
  await ctx.reply(`
    {name: ${user.id}; first name: ${user.first_name} , user name: ${user.username} }
    👋 به ربات VoidNet خوش آمدید!
    با ما اینترنتی امن، سریع و بدون محدودیت را تجربه کنید.
    🌟 امتحان رایگان:
    شما می‌توانید از یک سرور VPN رایگان به مدت ۱ روز استفاده کنید تا کیفیت خدمات ما را امتحان کنید.

    ✅ مناسب برای کاربردهای تخصصی:
    🔸 دسترسی بدون محدودیت به یوتیوب و اینستاگرام
    🔹 دانلود فایل‌های حجیم با سرعت بالا و بدون قطعی
    🎮 اجرای بازی‌های آنلاین بدون پینگ بالا و لگ
    💼 قابل استفاده برای ترید، بورس و صرافی‌های آنلاین
    🔐 دارای IP ثابت و اختصاصی برای شناسایی راحت‌تر در سایت‌ها

    ⚙️ ویژگی‌های فنی:
    🔹 آی‌پی استاتیک (ثابت) برای هر کاربر
    🔸 امنیت و رمزنگاری پیشرفته
    📶 اتصال پایدار و سرعت بالا
    🕒 مناسب استفاده طولانی‌مدت بدون افت کیفیت
    🌍 قابل استفاده در ویندوز، اندروید، iOS، لینوکس و مک

    💼 ما ۳ پلن متنوع برای نیازهای مختلف ارائه می‌دهیم:
    🔹 پلن پایه – مناسب برای استفاده عادی
    🔸 پلن حرفه‌ای – برای کاربران روزانه
    🔺 پلن VIP – سرعت و پایداری بالا با دسترسی اولویت‌دار

    📲 برای استفاده ثبت نام و استفاده از هدیه یک روزه لطفا از منوی پایین گزینه ثبت نام را وارد کنید
    `, 
    Markup.inlineKeyboard([
      [Markup.button.callback('📝 ثبت‌نام (دریافت هدیه)', 'register')],
      [Markup.button.callback('📋 تمامی پلن ها', 'services')],
      [Markup.button.callback('ℹ️ راهنمای کامل', 'about')],
      [Markup.button.callback('📞 پشتیبانی و سوالات', 'contact')],
      [Markup.button.callback('💰 دریافت لینک دعوت', 'friend')],
    ])
  );
});

// هندل کردن دکمه‌ها
bot.action('register', (ctx) => {
  ctx.answerCbQuery(); // to remove loading on button click
  waitingForName.add(ctx.from.id); // mark that this user should send name next
  ctx.reply('لطفا نام خود را وارد کنید');
});

// Listen to text messages
bot.on('text', (ctx) => {
  if (waitingForName.has(ctx.from.id)) {
    const userName = ctx.message.text;
    waitingForName.delete(ctx.from.id);

    // Save userName as you want (DB, in-memory, etc.)
    ctx.reply(`Thanks, ${userName}! Your name has been saved.`);
    // Example: save to some object or DB here

  } else {
    ctx.reply('Send /start and press Register to begin.');
  }
});


// bot.action('about', (ctx) => ctx.reply('ما یک تیم نرم‌افزاری هستیم...'));
// bot.action('contact', (ctx) => ctx.reply('برای تماس با ما به این شماره پیام دهید...'));
// bot.action('services', (ctx) => ctx.reply('لیست خدمات ما: ...'));

bot.launch();
console.log("ربات اجرا شد.");
