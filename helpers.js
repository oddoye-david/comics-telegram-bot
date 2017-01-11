/**
 * Helper functions
 * @author David Oddoye <oddoyedavid@gmail.com>
 */
'use strict'

module.exports = {
  /**
   * Create a helper method to strip ',' from amount and return number to 2 decimals
   * @param {String} invalidNumber
   * @return String
   */
  stripCommas(invalidNumber) {
    return parseFloat(invalidNumber.replace(',', '').trim()).toFixed(2)
  },

  /**
   * Capitalizes first letter of string and returns string
   * @param {String} text
   * @return String
   */
  capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1)
  },

  /**
   * `pluralize` is a poor man's pluralize. Without any inflectors it just
   * assumes that adding `s` to the end of the string is the correct plural.
   * If that doesn't apply to the word you want to pluralize, please avoid
   * at all cost
   *
   * @param {Number} count
   * @param {String} word
   * @return {String}
   */
  pluralize(count, word) {
    Math.abs(count) === 1 ? String(word) : String(word) + 's'
  }
}
