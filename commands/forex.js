/**
 * Convert GBP to GHS
 * @author David Oddoye <oddoyedavid@gmail.com>
 */
'use strict'

const request = require('request')
const random_ua = require('random-ua')
const cheerio = require('cheerio')
const {
  stripCommas
} = require('../helpers')
const config = require('../config')

/**
 * A method to scrape forex from www.xe.com
 * @param  String amount
 * @param  String base
 * @return String
 */
function convertForex(amount, base) {
  return new Promise((resolve, reject) => {
    request(`${config.XE_WEB_URL}/?Amount=${amount}&From=${base}&To=GHS`, {
      headers: {
        'User-Agent': random_ua.generate()
      }
    }, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        // Parse HTML with cheerio
        let $ = cheerio.load(html)
        // jQuery style selector
        let result = $('span.uccResultAmount').text().replace(",", "").replace("GHS", "").replace(/\s\s*$/, '')
        // resolve promise if successful
        resolve({
          amount: `GH¢ ${parseFloat(result).toLocaleString("en-GB", {style: "currency", currency: "GHS", minimumFractionDigits: 2})}`,
          exchangeRate: (stripCommas(result) / amount).toFixed(2)
        })
      } else {
        // reject if an error, false for if there was no error but status code wasn't 200
        reject(error || false)
      }
    })
  })
}

module.exports = {
    convertForex
}
