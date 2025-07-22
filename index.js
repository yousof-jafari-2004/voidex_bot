require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/user');


// connect to mongoose server
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB وصل شد'))
  .catch((err) => console.error('❌ MongoDB ارور:', err));
  

const bot = new Telegraf(process.env.BOT_TOKEN);

// server variables
const waitingForName = new Set();

// when user /start the bot
bot.start(async (ctx) => {
  const user = ctx.from;

  await User.create({
    telegramId: String(user.id),
    username: user.username,
    vpn_server: "this is a test config",
    first_name: user.first_name,
  });

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

// when user clicked on register button
bot.action('register', (ctx) => {
  ctx.answerCbQuery(); // to remove loading on button click
  waitingForName.add(ctx.from.id); // mark that this user should send name next
  ctx.reply('لطفا نام خود را وارد کنید');
});

// Listen to text messages
bot.on('text', async (ctx) => {
  if (waitingForName.has(ctx.from.id)) {
    const userName = ctx.message.text;
    waitingForName.delete(ctx.from.id);

    try {
      const updatedUser = await User.findOneAndUpdate(
        { first_name: userName },
        { new: true }
      );

      if (updatedUser) {
        await ctx.reply(`✅ شما با موفقیت ثبت‌نام شدید`);
        await ctx.reply(`🎁 کانفیگ رایگان یک‌روزه شما:`);
        await ctx.reply(updatedUser.vpn_server); // از updatedUser استفاده کن
      } else {
        await ctx.reply('❌ کاربر یافت نشد. لطفاً اول /start رو بزنید.');
      }
    } catch (err) {
      console.error('خطا در آپدیت:', err);
      ctx.reply('🚫 خطایی رخ داد، لطفاً بعداً تلاش کنید.');
    }

  } else {
    ctx.reply('❗ لطفاً ابتدا /start را ارسال کرده و دکمه ثبت‌نام را بزنید.');
  }
});


// bot.action('about', (ctx) => ctx.reply('ما یک تیم نرم‌افزاری هستیم...'));
// bot.action('contact', (ctx) => ctx.reply('برای تماس با ما به این شماره پیام دهید...'));
// bot.action('services', (ctx) => ctx.reply('لیست خدمات ما: ...'));

bot.launch();
console.log("ربات اجرا شد. ها ها ها ها");
