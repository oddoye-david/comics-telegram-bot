'use strict'

const TelegramBot = require('node-telegram-bot-api')
const forex = require('./commands/forex')

// Create a bot that uses 'polling' to fetch new updates 
const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
})

// Matches "/ping" 
bot.onText(/\/ping/, function (msg, match) {
    // 'msg' is the received Message from Telegram 
    // 'match' is the result of executing the regexp above on the text content 
    // of the message 

    const chatId = msg.chat.id
    const resp = match[1] // the captured "whatever" 

    // send back the matched "whatever" to the chat 
    bot.sendMessage(chatId, 'Pong from David.')
})

// Matches "/usd [amount]" 
bot.onText(/^\/usd (\d+|\d{1,3}(,\d{3})*)(\.\d+)?$/, function (msg, match) {

    const chatId = msg.chat.id
    const resp = match[1] // the captured amount
        // console.log(msg);

    // check if number
    if (!parseFloat(resp)) {
        bot.sendMessage(chatId, `@${msg.from.username} <b>${resp}</b> is not a valid nummber. Does not compute.`, {
            parse_mode: 'HTML'
        });
    } else {
        bot.sendChatAction(chatId, 'typing')
            .then(() => {
                forex.convertForex(resp, 'USD')
                    .then((res) => {
                        bot.sendMessage(chatId, `@${msg.from.username} $${resp} is equivalent to <b>${res.amount}</b> at an exchange rate of _${res.exchangeRate}_`, {
                            parse_mode: 'HTML'
                        });
                    });
            })
            .catch((err) => {
                bot.sendMessage(chatId, `Oh my, my circuits seem to have been fried...paging @theRealBraZee`, {
                    parse_mode: 'HTML'
                });
            });
    }
})

// Matches "/gbp [amount]" 
bot.onText(/^\/gbp (\d+|\d{1,3}(,\d{3})*)(\.\d+)?$/, function (msg, match) {

    const chatId = msg.chat.id
    const resp = match[1] // the captured amount
        // console.log(msg);

    // check if number
    if (!parseFloat(resp)) {
        bot.sendMessage(chatId, `@${msg.from.username} <b>${resp}</b> is not a valid nummber. Does not compute.`, {
            parse_mode: 'HTML'
        });
    } else {
        bot.sendChatAction(chatId, 'typing')
            .then(() => {
                forex.convertForex(resp, 'GBP')
                    .then((res) => {
                        bot.sendMessage(chatId, `@${msg.from.username} £${resp} is equivalent to <b>${res.amount}</b> at an exchange rate of _${res.exchangeRate}_`, {
                            parse_mode: 'HTML'
                        });
                    });
            })
            .catch((err) => {
                bot.sendMessage(chatId, `Oh my, my circuits seem to have been fried...paging @theRealBraZee`, {
                    parse_mode: 'HTML'
                });
            });
    }
})

// Matches "/eur [amount]" 
bot.onText(/^\/eur (\d+|\d{1,3}(,\d{3})*)(\.\d+)?$/, function (msg, match) {

    const chatId = msg.chat.id
    const resp = match[1] // the captured amount
        // console.log(msg);

    // check if number
    if (!parseFloat(resp)) {
        bot.sendMessage(chatId, `@${msg.from.username} <b>${resp}</b> is not a valid nummber. Does not compute.`, {
            parse_mode: 'HTML'
        });
    } else {
        bot.sendChatAction(chatId, 'typing')
            .then(() => {
                forex.convertForex(resp, 'EUR')
                    .then((res) => {
                        bot.sendMessage(chatId, `@${msg.from.username} €${resp} is equivalent to <b>${res.amount}</b> at an exchange rate of _${res.exchangeRate}_`, {
                            parse_mode: 'HTML'
                        });
                    });
            })
            .catch((err) => {
                bot.sendMessage(chatId, `Oh my, my circuits seem to have been fried...paging @theRealBraZee`, {
                    parse_mode: 'HTML'
                });
            });
    }
})