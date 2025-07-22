require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const User = require('./models/user');

// اتصال به MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB وصل شد'))
  .catch((err) => console.error('❌ MongoDB ارور:', err));

// راه‌اندازی بات
const bot = new Telegraf(process.env.BOT_TOKEN);

// وضعیت کاربران در مراحل مختلف
const waitingForName = new Set();
const waitingForPhone = new Set();

// شروع بات
bot.start(async (ctx) => {
  const { id, username, first_name } = ctx.from;

  const existingUser = await User.findOne({ telegramId: String(id) });

  if (!existingUser) {
    await User.create({
      telegramId: String(id),
      username,
      first_name,
      phoneNumber: '',
      plan: 'free',
      vpn_server: "this is a test config",
      isPlanExpired: false,
    });
  }

  await ctx.reply(
    `
{name: ${id}; first name: ${first_name} , user name: ${username} }
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

// ثبت‌نام - مرحله اول: دریافت نام
bot.action('register', (ctx) => {
  ctx.answerCbQuery();
  waitingForName.add(ctx.from.id);
  ctx.reply('لطفا نام خود را وارد کنید');
});

// دریافت پیام متنی از کاربر
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  // مرحله ۱: ذخیره نام
  if (waitingForName.has(userId)) {
    waitingForName.delete(userId);
    waitingForPhone.add(userId);

    await User.findOneAndUpdate(
      { telegramId: String(userId) },
      { first_name: text },
      { new: true }
    );

    return ctx.reply('✅ نام ذخیره شد. حالا لطفاً شماره تماس خود را وارد کنید:');
  }

  // مرحله ۲: ذخیره شماره تماس
  if (waitingForPhone.has(userId)) {
    waitingForPhone.delete(userId);

    await User.findOneAndUpdate(
      { telegramId: String(userId) },
      { phoneNumber: text },
      { new: true }
    );

    const theUser = await User.findOne({ telegramId: String(userId) });

    await ctx.reply(`✅ شماره شما ذخیره شد: ${text}`);
    await ctx.reply(`🎁 ین هم کانفیگ تست رایگان شما`);
    return ctx.reply(`${theUser.vpn_server}`);
  }

  // اگر کاربر در روند ثبت‌نام نبود
  ctx.reply('برای شروع دستور /start رو بفرست و روی دکمه "ثبت‌نام" بزن.');
});

// اجرای بات
bot.launch();
console.log("ربات اجرا شد. ها ها ها ها");