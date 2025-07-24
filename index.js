require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const User = require('./models/user');

// admin telegram id
let isAdmin = false;
const ADMIN_ID = '6956422313';
// is user registered
let AUTH = false;
// what is the current user plan
let userPlanRequest;

// اتصال به MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB وصل شد'))
  .catch((err) => console.error('❌ MongoDB ارور:', err));

// راه‌اندازی بات
const bot = new Telegraf(process.env.BOT_TOKEN);

// وضعیت کاربران در مراحل مختلف
const waitingForName = new Set();
const waitingForPhone = new Set();

// منوی دائمی برای نمایش پایین چت
const mainMenu = Markup.keyboard([
  ['📝 ثبت‌نام (دریافت هدیه)', '📋 تمامی پلن ها'],
  ['📦 اطلاعات پلن من', 'ℹ️ راهنمای کامل'],
  ['📞 پشتیبانی و سوالات', '💰 دریافت لینک دعوت']
]).resize().oneTime(false);

// تنظیم منوی چسبان
const setupPersistentMenu = () => {
  if(!isAdmin)
  {
    // if the user was not admin
    bot.telegram.setMyCommands([
      { command: 'start', description: 'شروع مجدد ربات' },
      { command: 'register', description: 'ثبت‌نام (دریافت هدیه)' },
      { command: 'plans', description: 'تمامی پلن ها' },
      { command: 'myplan', description: 'اطلاعات پلن من' },
      { command: 'about', description: 'راهنمای کامل' },
      { command: 'contact', description: 'پشتیبانی و سوالات' },
      { command: 'invite', description: 'دریافت لینک دعوت' }
    ]);
  }else {

    // if the user was admin
    bot.telegram.setMyCommands([
      { command: 'start', description: 'شروع مجدد ربات' },
      { command: 'register', description: 'ثبت‌نام' },
      { command: 'messages', description: 'پیام ها' },
      { command: 'change_user_plan', description: 'ویرایش پلن کاربر' },
      { command: 'send_message', description: 'فرستادن پیام به کاربر' },
      { command: 'users_count', description: 'تعداد کاربران' },
      { command: 'users_list', description: 'لیست کاربران' }
    ]);
  }
};


// fetch users count
const getUserStats = async btt => {
  try {
    const totalUsers = await User.countDocuments();
    return totalUsers;
  } catch (err) {
    btt.reply('ارور هنگام دریافت تعداد کاربران');
  }
}

// fetch users details
const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    btt.reply('ارور هنگام دریافت کاربران');
  }
}

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
  } else {
    AUTH = existingUser.phoneNumber == '' ? false : true;
  }

  // check if the user is admin or not
  if(ADMIN_ID == ctx.from.id)
  {
    isAdmin = true
  }else {
    isAdmin = false;
  }

  // تنظیم منوی چسبان
  setupPersistentMenu();

  await ctx.reply(
    `
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
    mainMenu
  );
});

// my plan description
bot.hears(['📦 اطلاعات پلن من', 'myPlan'], async ctx => {
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



// دستورات منو
bot.hears(['📞 پشتیبانی و سوالات', '/contact'], ctx => {
  ctx.reply(`
🆘 سوالات متداول و راهنمای سریع

❓ چطور ثبت‌نام کنم؟
✅ از منوی اصلی روی "🎉 ثبت‌نام و دریافت هدیه" بزن، اسمت و شماره‌ت رو وارد کن تا ثبت‌نامت کامل بشه.

❓ بعد از خرید، چی کار کنم؟
✅ فقط یه عکس از رسید پرداختت رو برای ربات بفرست. ربات خودش رسید رو بررسی می‌کنه و بسته‌ت رو فعال می‌کنه.

❓ چه نوع بسته‌هایی موجوده؟
✅ از منوی "📦 تمامی پلن‌ها" همه‌ی پلن‌ها قابل مشاهده‌ن. بسته‌ها بر اساس سرعت، مدت و قیمت دسته‌بندی شدن.

❓ فعال‌سازی چقدر طول می‌کشه؟
✅ معمولاً کمتر از ۳۰ دقیقه بعد از ارسال رسید، بسته فعال می‌شه. اگه بیشتر طول کشید، دوباره پیام بده.

❓ پروکسی یا VPN چجوری دریافت می‌کنم؟
✅ بعد از فعال‌سازی، ربات به‌صورت خودکار اطلاعات اتصال رو برات می‌فرسته.

❓ آیا می‌تونم با یه خرید، چند نفر استفاده کنن؟
✅ اگر بسته خریداری شده این قابلیت رو داشته باشه مشکلی نیست 

❓ پروکسی تلگرام چیه؟
✅ پروکسی یه راه سریع و امن برای دسترسی به تلگرامه. بعد از خرید، پروکسی اختصاصی هدیه می‌گیری.

❓ سرویس‌ها روی چه سیستم‌عامل‌هایی کار می‌کنن؟
✅ اندروید، iOS، ویندوز، مک و حتی لینوکس — بدون محدودیت!

❓ اگر مشکلم حل نشد چی کار کنم؟
🆘 نگران نباش. با زدن دستور /adminForce و بعد نوشتن پیامت میتونی پیامت رو به پشتیبانی ارسال کنه و در کمتر از ۱۰ دقیقه جواب شما پاسخ داده خواهد شد.
`);
});

bot.hears(['📝 ثبت‌نام (دریافت هدیه)', '/register'], async (ctx) => {
  let currentUser = await User.findOne({telegramId: String(ctx.from.id)});
  // if user already claimed his gift don't give it again
  if(currentUser.recievedGift)
  {
    return ctx.reply('شما قبلا هدیه خود را دریافت کرده اید');
  }else {
    waitingForName.add(ctx.from.id);
    ctx.reply('لطفا نام خود را وارد کنید');
  }
});


bot.hears(['📋 تمامی پلن ها', '/plans'], (ctx) => {
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
});

bot.hears(['ℹ️ راهنمای کامل', '/about'], ctx => {
  ctx.reply(`
🤖 راهنمای استفاده از ربات خرید و دریافت هدیه

به ربات رسمی ما خوش اومدی! 🌟
در اینجا می‌تونی به سادگی و در عرض چند دقیقه ثبت‌نام کنی، خریدت رو انجام بدی، و هدیه‌ات رو دریافت کنی!

✅ مراحل استفاده:

1. ثبت‌نام اولیه  
- روی دکمه 🎉 «ثبت‌نام و دریافت هدیه» کلیک کن.  
- اسمت رو وارد کن.  
- سپس شماره تلفنت رو از طریق دکمه ارسال کن.

2. انجام خرید  
- وارد گزینه «تمامی پلن‌ها» شو و بسته‌ی موردنظرت رو انتخاب کن.  
- بعد، مدت زمان بسته رو انتخاب کن.  
- پرداخت که انجام شد، یه رسید تصویری از خریدت می‌فرستی.

3. ارسال رسید  
📸 تنها کاری که باید انجام بدی اینه که یه عکس از رسیدت برای ربات بفرستی.  
نیازی نیست چیزی توضیح بدی یا کاری بکنی، ربات به‌صورت خودکار رسیدتو بررسی می‌کنه و اگر معتبر باشه بسته‌ت رو فعال می‌کنه! 🎁

💬 اگه سوال دیگه‌ای داری، می‌تونی از منوی اصلی گزینه «پشتیبانی و سوالات» رو انتخاب کنی.
  `);
});

bot.hears(['تعداد کاربران', '/users_count'], async ctx => {
  await ctx.reply(`تعداد کل کاربر های ثبت نام کرده ${getUserStats(ctx)}`);
});

bot.hears(['اطلاعات کل کاربر ها', '/users_list'], async ctx => {
  let allUsers = await getAllUsers(ctx);
  allUsers.forEach(theUser => {
    ctx.reply(`نام :${theUser.first_name}
      آی دی :${theUser.telegramId}
      شماره تماس :${theUser.telegramId}`);
  });
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
      { first_name: text, recievedGift: true },
      { new: true }
    );

    return ctx.reply('✅ نام ذخیره شد. حالا لطفاً شماره تماس خود را وارد کنید:');
  }

  // مرحله ۲: ذخیره شماره تماس
  if (waitingForPhone.has(userId)) {
    waitingForPhone.delete(userId);

    await User.findOneAndUpdate(
      { telegramId: String(userId) },
      { phoneNumber: text, recievedGift: true },
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
  userPlanRequest = '1_mounth_b';
  payDetailsMessage(ctx);
});
bot.action('3_mounth_b', (ctx) => {
  price = 178;
  userPlanRequest = '3_mounth_b';
  payDetailsMessage(ctx);
});
bot.action('6_mounth_b', (ctx) => {
  price = 356;
  userPlanRequest = '6_mounth_b';
  payDetailsMessage(ctx);
});

// pro plan
bot.action('1_mounth_p', (ctx) => {
  price = 98;
  userPlanRequest = '1_mounth_p';
  payDetailsMessage(ctx);
});
bot.action('3_mounth_p', (ctx) => {
  price = 268;
  userPlanRequest = '3_mounth_p';
  payDetailsMessage(ctx);
});
bot.action('6_mounth_p', (ctx) => {
  price = 536;
  userPlanRequest = '6_mounth_p';
  payDetailsMessage(ctx);
});

// vip plan
bot.action('1_mounth_v', (ctx) => {
  price = 138;
  userPlanRequest = '1_mounth_v';
  payDetailsMessage(ctx);
});
bot.action('3_mounth_v', (ctx) => {
  price = 388;
  userPlanRequest = '3_mounth_v';
  payDetailsMessage(ctx);
});
bot.action('6_mounth_v', (ctx) => {
  price = 776;
  userPlanRequest = '6_mounth_v';
  payDetailsMessage(ctx);
});

// recieve photo and send it to admin
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;

  const userData = await User.findOne({ telegramId: userId });

  // عکس‌ها به صورت آرایه‌ای از سایزهای مختلف میان، ما بزرگ‌ترین رو می‌گیریم:
  const largestPhoto = ctx.message.photo[ctx.message.photo.length - 1];

  const fileId = largestPhoto.file_id;

  try {
    // ارسال فایل به ادمین
    await ctx.telegram.sendPhoto(ADMIN_ID, fileId, {
      caption: `عکس از طرف کاربر: ${ctx.from.first_name} (@${ctx.from.username || 'بدون یوزرنیم'})
        آی دی کاربر : ${userData.telegramId}
        نام : ${userData.first_name || 'بدون اسم'}
        شماره تماس : ${ userData.phoneNumber || 'تعین نکرده' }
        پلن درخواستی کاربر : ${ userPlanRequest || 'تعین نکرده' }
        قیمت : ${ price || 'تعین نکرده' }
      `,
    });

    await ctx.reply("بسته شما تا ۱ ساعت آینده فعال سازی و توسط همین ربات به شما اطلاع داده میشود. ✅ عکس با موفقیت ارسال شد.");
  } catch (error) {
    console.error("خطا در ارسال عکس:", error);
    await ctx.reply("❌ مشکلی در ارسال عکس پیش آمد. لطفا دوباره تلاش کنید");
  }
});

// بقیه کدها دقیقاً مانند قبل باقی می‌مانند...
// [همه کدهای قبلی شما از اینجا به بعد بدون تغییر باقی می‌مانند]

// اجرای بات
bot.launch()
  .then(() => {
    console.log("voidex activated");
    // تنظیم منوی چسبان هنگام راه‌اندازی
    setupPersistentMenu();
  })
  .catch(err => console.error('خطا در راه‌اندازی بات:', err));