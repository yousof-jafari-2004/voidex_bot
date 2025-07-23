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
      service: 'free',
      vpn_server: "this is a test config",
      isPlanExpired: false,
      planStartedDate: null,
      planExpiredDate: null,
      recievedGift: false,
      isAdmin: false,
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
      [Markup.button.callback('📋 تمامی پلن ها', 'plans')],
      [Markup.button.callback('ℹ️ راهنمای کامل', 'about')],
      [Markup.button.callback('📞 پشتیبانی و سوالات', 'contact')],
      [Markup.button.callback('💰 دریافت لینک دعوت', 'friend')],
      [Markup.button.callback('📦 اطلاعات پلن من', 'myPlan')],
    ])
  );
});

bot.action('contact', ctx => {
  ctx.reply();
});

bot.action('plans', (ctx) => {
  ctx.reply(`🔰 پلن اقتصادی | 🌱 Basic

💠 کیفیت: خوب
📶 سرعت: متوسط
🌍 قابل اتصال به ۴ کشور مختلف
👥 تعداد کاربران روی سرور: تا 1 نفر
📡 پینگ: معمولی
📦 حجم: ۱۳۰ گیگابایت
💵 قیمت: 68 هزار تومان / ماه
🎯 مناسب برای: تلگرام، یوتیوب، وب‌گردی، اینستاگرام
_____________________

🚀 پلن پیشرفته | ⚡ Pro

💠 کیفیت: بالا
📶 سرعت: بالا
🌍 قابل اتصال به ۲۰ کشور مختلف
👥 تعداد کاربران روی سرور: تا 2 نفر
📡 پینگ: پایین
📦 حجم: ۲۵۰ گیگابایت
💵 قیمت: ۹۸ هزار تومان / ماه

🎯 مناسب برای: تماس تصویری، یوتیوب HD، اینستاگرام روان, دانلود سنگین
_____________________

👑 پلن ویژه | 🦅 VIP

💠 کیفیت: خیلی بالا
📶 سرعت: عالی
👥 تعداد کاربران روی سرور: تا 3 نفر
🌍 قابل اتصال به ۴۰+ کشور مختلف
📍 آی‌پی اختصاصی و ثابت (Static)
🔒 بدون تغییر، فقط برای شما
📈 مناسب برای صرافی‌هایی مثل:
Binance – Kucoin – Bybit – OKX – MEXC و ...
📡 پینگ: بسیار پایین
📦 حجم: نامحدود
💵 قیمت: ۱۳۸ هزار تومان / ماه

🎯 مناسب برای: گیم آنلاین، استریم 4K، استفاده حرفه‌ای و بدون قطعی

(شما میتوانید با ارتباط با پشتیبانی بسته خود را شخصی سازی کنید)

لطفا از منوی زیر انتخاب کنید
`,

  Markup.inlineKeyboard([
    [Markup.button.callback('🔰 پلن اقتصادی | 🌱 Basic', 'basic')],
    [Markup.button.callback('🚀 پلن پیشرفته | ⚡ Pro', 'pro')],
    [Markup.button.callback('👑 پلن ویژه | 🦅 VIP', 'vip')],
  ])
);

})

let price = 0;

// choose the service
bot.action('basic', (ctx) => {
  ctx.reply(`سرویس مورد نظر را انتخاب کنید
    شما میتوانید با ارتباط با پشتیبانی حجم بسته خود را افزایش دهید`,
    Markup.inlineKeyboard([
      [Markup.button.callback('سرویس یک ماهه | ۶۸ هزار تومان', '1_mounth_b')],
      [Markup.button.callback('سرویس سه ماهه | ۱۷۸ هزار تومان', '3_mounth_b')],
      [Markup.button.callback('سرویس شش ماهه | ۳۵۶ هزار تومان', '6_mounth_b')],
    ])
  );
});
bot.action('pro', (ctx) => {
  ctx.reply(`سرویس مورد نظر را انتخاب کنید`,
    Markup.inlineKeyboard([
      [Markup.button.callback('سرویس یک ماهه | ۹۸ هزار تومان', '1_mounth_p')],
      [Markup.button.callback('سرویس سه ماهه | ۲۶۸ هزار تومان', '3_mounth_p')],
      [Markup.button.callback('سرویس شش ماهه | ۵۳۶ هزار تومان', '6_mounth_p')],
    ])
  );
});
bot.action('vip', (ctx) => {
  ctx.reply(`سرویس مورد نظر را انتخاب کنید`,
    Markup.inlineKeyboard([
      [Markup.button.callback('سرویس یک ماهه | ۱۳۸ هزار تومان', '1_mounth_v')],
      [Markup.button.callback('سرویس سه ماهه | ۳۸۸ هزار تومان', '3_mounth_v')],
      [Markup.button.callback('سرویس شش ماهه | ۷۷۶ هزار تومان', '6_mounth_v')],
    ])
  );
});

const payDetailsMessage = botFuncs => {
  botFuncs.reply(`
    لطفا مبلغ ${price} تومان را به شماره کارت زیر انتقال داده و تصویر رسید را ارسال کنید
    سرویس مورد نظر تا ۱ ساعت بعد از ارسال تصویر به صورت خودکار فعال سازی میشود و توسط همین بات تلگرام به شما اطلاع داده میشود
    ___________________
    شماره کارت:
    5892-1014-5434-6582
    حسین جعفری
    ___________________
    پس از فعال سازی شما میتوانید با دستور /currentService اطلاعات بسته خود را لحظه به لحظه بررسی کنید
  `)
}

// basic plan
bot.action('1_mounth_b', (ctx) => {
  price = 68;
  payDetailsMessage(ctx);
});
bot.action('3_mounth_b', (ctx) => {
  price = 178;
  payDetailsMessage(ctx);
});
bot.action('6_mounth_b', (ctx) => {
  price = 356;
  payDetailsMessage(ctx);
});

// pro plan
bot.action('1_mounth_p', (ctx) => {
  price = 98;
  payDetailsMessage(ctx);
});
bot.action('3_mounth_p', (ctx) => {
  price = 268;
  payDetailsMessage(ctx);
});
bot.action('6_mounth_p', (ctx) => {
  price = 536;
  payDetailsMessage(ctx);
});

// vip plan
bot.action('1_mounth_v', (ctx) => {
  price = 138;
  payDetailsMessage(ctx);
});
bot.action('3_mounth_v', (ctx) => {
  price = 388;
  payDetailsMessage(ctx);
});
bot.action('6_mounth_v', (ctx) => {
  price = 776;
  payDetailsMessage(ctx);
});

// my plan description
bot.action('myPlan', async ctx => {
  let userData = await User.findOne({telegramId:ctx.from.id});

  let planType;

  if(userData.plan == 'basic'){
    planType = '🔰 پلن اقتصادی ';
  } else if(userData.plan == 'pro'){
    planType = '🚀 پلن پیشرفته ';
  } else if(userData.plan == 'vip'){
    planType = '👑 پلن ویژه' 
  }else {
    planType = '🎁 هدیه یک روزه';
  }

  await ctx.reply(`
    اطلاعات بسته فعلی شما:
    ــــــــــــــــــــــ
    نام بسته: ${ planType } 
    وضعیت بسته : ${ (userData.isPlanExpired) ? 'غیر فعال' : 'فعال' }
    مدت اعتبار بسته: ۳۹ روز مانده
    حجم مصرفی شما: ۳۹ گیگ مصرف کرده اید
    حجم باقی مانده: ۷۸ گیگ باقی مانده
    آی پی ثابت : ندارد
    سرور شما : آلمان (قابل تغییر)
  `);
});


// ثبت‌نام - مرحله اول: دریافت نام
bot.action('register', async (ctx) => {
  let currentUser = await User.findOne(String(ctx.from.id));

  ctx.reply(`your name: ${currentUser.telegramId}`);

  // if user already claimed his gift don't give it again
  if(currentUser.recievedGift)
  {
    return ctx.reply('شما قبلا هدیه خود را دریافت کرده اید');
  }else {
    ctx.answerCbQuery();
    waitingForName.add(ctx.from.id);
    ctx.reply('لطفا نام خود را وارد کنید');
  }
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
      { recievedGift: true }
    );

    const theUser = await User.findOne({ telegramId: String(userId) });

    await ctx.reply(`✅ شماره شما ذخیره شد: ${text}`);
    await ctx.reply(`🎁 این هم کانفیگ تست رایگان شما`);
    await ctx.reply(`${theUser.vpn_server}`);
    return await ctx.reply(`توجه کنید که این کانفیگ فقط تا ۲۴ ساعت آینده فعال هست و بعد از اون غیر فعال میشه`);
  }

  // اگر کاربر در روند ثبت‌نام نبود
  ctx.reply('برای شروع دستور /start رو بفرست و روی دکمه "ثبت‌نام" بزن.');
});

// اجرای بات
bot.launch();
console.log("voidex activated");