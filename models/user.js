const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    first_name: String,
    vpn_server: String,
    phoneNumber: String,
    plan: String,
    service: String,
    isPlanExpired: Boolean,
    isAdmin: Boolean,
    recievedGift: Boolean,
    planStartedDate: { type:Date },
    planExpiredDate: {type:Date},
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);