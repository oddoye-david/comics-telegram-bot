'use strict'

const TelegramBot = require('node-telegram-bot-api')
const forex = require('./commands/forex')
const config = require('./config');

var apiai = require('apiai');
var api_ai = apiai(process.env.API_AI_TOKEN);

const currencies = {
    euros: 'EUR',
    dollars: 'USD',
    pounds: 'GBP'
}

const currencySymbols = {
    euros: '€',
    dollars: '$',
    pounds: '£'
}

const groupID = process.env.COMICS_GROUP_ID

// Create a bot that uses 'polling' to fetch new updates 
const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
})

function generateRandomSessionId() {
  return Math.floor((Math.random() * 9999) + 1).toString();
}

function isObject(key) {
    return key && typeof key === 'object';
}

function runNLPResponse(api_ai, bot, message, chatId) {
    const request = api_ai.textRequest(message.text, {
        sessionId: generateRandomSessionId()
    });

    request.on('response', response => {
        if (!response.result.actionIncomplete) {
            switch (response.result.metadata.intentName) {

                case config.NLP_INTENTS.WORD_DEFINITION:
                    definitionCommand(bot, message, response.result.parameters['any']);
                    break;

                case config.NLP_INTENTS.GHS_CONVERSION: // eslint-disable-line no-case-declarations
                    if (isObject(response.result.parameters['unit-currency'])) {
                        const amount = response.result.parameters['unit-currency'].amount; // the captured amount
                        const currency = response.result.parameters['unit-currency'].currency;
                        bot.sendChatAction(chatId, 'typing')
                            .then(() => {
                                forex.convertForex(amount, currency, 'GHS')
                                    .then((res) => {
                                        bot.sendMessage(chatId, `@${message.from.username} ${amount} ${currency} is equivalent to <b>${res.amount}</b> at an exchange rate of <i>${res.exchangeRate}</i>`, {
                                            parse_mode: 'HTML'
                                        });
                                    });
                            })
                            .catch((err) => {
                                bot.sendMessage(chatId, `Oh my, my circuits seem to have been fried...paging @theRealBraZee`, {
                                    parse_mode: 'HTML'
                                });
                            });
                    } else {
                        bot.sendMessage(chatId, 'Sorry, your query should be in the form `Convert 50 usd`, with the 3 character currency code.', {
                            parse_mode: 'HTML'
                        });
                    }

                    break;

                case config.NLP_INTENTS.CONVERT_FROM_X_TO_Y: // eslint-disable-line no-case-declarations
                    if (isObject(response.result.parameters['unit-currency'])) {
                        const inputAmount = response.result.parameters['unit-currency'].amount; // the captured amount
                        const inputCurrency = response.result.parameters['unit-currency'].currency;
                        const resultCurrency = response.result.parameters['currency-name'];
                        bot.sendChatAction(chatId, 'typing')
                            .then(() => {
                                forex.convertForex(inputAmount, inputCurrency, resultCurrency)
                                    .then((res) => {
                                        bot.sendMessage(chatId, `@${message.from.username} ${inputAmount} ${inputCurrency} is equivalent to <b>${res.amount}</b> at an exchange rate of <i>${res.exchangeRate}</i>`, {
                                            parse_mode: 'HTML'
                                        });
                                    });
                            })
                            .catch((err) => {
                                bot.sendMessage(chatId, `Oh my, my circuits seem to have been fried...paging @theRealBraZee`, {
                                    parse_mode: 'HTML'
                                });
                            });
                    } else {
                        bot.sendMessage(chatId, 'Sorry, your query should be in the form `Convert 50 usd to ngn`, with the 3 character currency codes.', {
                            parse_mode: 'HTML'
                        });
                    }
                    break;

                default:
                    break;
            }
        } else {
            bot.sendMessage(chatId, 'Sorry, your query seems incomplete. Please refer to the docs for usage rules', {
                parse_mode: 'HTML'
            });
        }
    });

    request.on('error', () => {
        bot.sendMessage(chatId, 'Oh my...something embarassing happened. Try again.', {
            parse_mode: 'HTML'
        });
    });

    request.end();
}

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
                        bot.sendMessage(chatId, `@${msg.from.username} $${resp} is equivalent to <b>${res.amount}</b> at an exchange rate of <i>${res.exchangeRate}</i>`, {
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
                        bot.sendMessage(chatId, `@${msg.from.username} £${resp} is equivalent to <b>${res.amount}</b> at an exchange rate of <i>${res.exchangeRate}</i>`, {
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
                        bot.sendMessage(chatId, `@${msg.from.username} €${resp} is equivalent to <b>${res.amount}</b> at an exchange rate of <i>${res.exchangeRate}</i>`, {
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

bot.on('message', function (msg) {

    if ((msg.chat.id == groupID && msg.text.includes('alfred_comics_bot') || msg.chat.type == 'private') && msg.text.toLowerCase().includes('convert')) {

        // var request = app.textRequest(msg.text, {
        //     sessionId: '1'
        // });

        // request.on('response', function (response) {
        //     if (response.result.metadata.intentName === 'convert-to-ghana-cedis') {
        //         const chatId = msg.chat.id
        //         const resp = response.result.parameters['input-money'] // the captured amount
        //         const currency = response.result.parameters['input-currency']
        //         // console.log(msg);

        //         // check if number
        //         if (!parseFloat(resp)) {
        //             bot.sendMessage(chatId, `@${msg.from.username} <b>${resp}</b> is not a valid nummber. Does not compute.`, {
        //                 parse_mode: 'HTML'
        //             });
        //         } else {
        //             bot.sendChatAction(chatId, 'typing')
        //                 .then(() => {
        //                     forex.convertForex(resp, currencies[currency] || 'USD')
        //                         .then((res) => {
        //                             bot.sendMessage(chatId, `@${msg.from.username} ${currencySymbols[currency] || '$'}${resp} is equivalent to <b>${res.amount}</b> at an exchange rate of <i>${res.exchangeRate}</i>`, {
        //                                 parse_mode: 'HTML'
        //                             });
        //                         });
        //                 })
        //                 .catch((err) => {
        //                     bot.sendMessage(chatId, `Oh my, my circuits seem to have been fried...paging @theRealBraZee`, {
        //                         parse_mode: 'HTML'
        //                     });
        //                 });
        //         }
        //     }
        // });

        // request.on('error', function (error) {
        //     bot.sendMessage(chatId, `Oh my, my circuits seem to have been fried...paging @theRealBraZee`, {
        //         parse_mode: 'HTML'
        //     });
        // });

        // request.end();

        // send a message to the chat acknowledging receipt of their message
        // bot.sendMessage(chatId, "Received your message");

        runNLPResponse(api_ai, bot, msg,  msg.chat.id);
    }
});