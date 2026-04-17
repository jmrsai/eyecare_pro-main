
const admin = require('firebase-admin');
admin.initializeApp();

const chatbot = require('./chatbot');
const audit = require('./audit');

exports.chat = chatbot.chat;
exports.logTestResult = audit.logTestResult;
