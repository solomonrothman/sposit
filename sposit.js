/**
 * Sposit v0.1
 *
 *The Sposit positioning library for creating/displaying dynamic responsive columns. It's highly opinionated and built on jQuery and CSS 3
 *
 * @file Main js file for the Sposit library
 * @version 0.1
 * @author Solomon Rothman [solomonrothman@gmail.com]
 * @type {sposit}
 * @license
 * Copyright (c) 2015 City of Los Angeles.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Create an immediately invoked functional expression to wrap our code
(function () {
  "use strict";
  /**
   * Sposit Class for creating multi-column responsive layouts
   * @namespace Sposit
   * @constructor
   */
  window.Sposit = function () {
    /**
     *
     * @type {{minColumnWidth: number, wrapperElement: string, containerElement: string, maxColumnNum: string, gap: string, respondOnResize: string, columnOffset: number}}
     */
    var defaults = {
      minColumnWidth: 240,
      wrapperElement: '.sposit-column-wrapper',
      containerElement: '.sposit-container',
      maxColumnNum: 'dynamic',
      gap: 'balance',
      respondOnResize: 'true',
      columnOffset: 10
    };

    // Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] == "object") {
      this.options = extendDefaults(defaults, arguments[0]);
    }
    else {
      this.options = defaults;
    }

    this.dynamicColumns(this.options.wrapperElement, this.options.maxColumnNum); // Call calculate dynamic columns with wrapper element and minColumnWidth
    initializeEvents(this);
  };

  // Public Methods
  /**
   * This returns the current set of options (user entered or defaults)
   * @memberOf Sposit
   * @public
   * @function getOptions
   * @returns {*} an array of options
   */
  Sposit.prototype.getOptions = function () {
    return this.options;
  };

  /**
   * calculates the maximum number of columns that fit inside the wrapper and sets them inline
   * @memberOf Sposit
   * @public
   * @function dynamicColumns
   * @param wrapperElement What element to sposit
   * @param maxColumnNum Maximum number of columns in the wrapperElement. Note: this is strictly a maximum and the actual column number will be adjusted based on space
   */
  Sposit.prototype.dynamicColumns = function (wrapperElement, maxColumnNum) {
    var wrapperElements = document.querySelectorAll(wrapperElement);
    var myThis = this;
    Array.prototype.forEach.call(wrapperElements, function (el) {

      if (maxColumnNum == 'dynamic') {
        //get maxColumn number based on the position of the end column element and the minimum column width
        maxColumnNum = possibleColumns(el, myThis.options);
      }

      if (el.querySelectorAll(myThis.options.containerElement).length < maxColumnNum) {
        maxColumnNum = el.querySelectorAll(myThis.options.containerElement).length;
      }

      var columnCountProp = getsupportedprop(['ColumnCount', 'column-count', 'MozColumnCount', 'WebkitColumnCount']);
      el.style[columnCountProp] = maxColumnNum; // set maximum number of columns inline

    });
  };

  // Private methods
  /**
   * Determines the current number of columns that could possible fit in wrapper with respect to max column limit. This is a helper function for dynamically setting column count.
   * @memberOf Sposit
   * @private
   * @function possibleColumns
   * @param wrapperElement
   * @param options
   * @returns {number|*} number of columns.
   */
  function possibleColumns(wrapperElement, options) {
    var currentColumnNumber = Math.floor(wrapperElement.offsetWidth / (options.minColumnWidth + options.columnOffset));
    if (currentColumnNumber > options.maxColumnNum && options.maxColumnNum !== 'dynamic') {
      currentColumnNumber = options.maxColumnNum;
    }
    removePrefixClasses(wrapperElement, 'sposit-colmn-num-');
    var columnClass = 'sposit-colmn-num-' + currentColumnNumber;

    if (wrapperElement.classList) {
      wrapperElement.classList.add(columnClass);
    }
    else {
      wrapperElement.className += ' ' + columnClass;
    }
    return currentColumnNumber;
  }

  /**
   * Method to setup event listeners
   * @memberOf Sposit
   * @private
   * @function initializeEvents
   * @param that object to initialize events on
   */
  function initializeEvents(that) {
    window.onresize = function (event) {
      that.dynamicColumns(that.options.wrapperElement, that.options.maxColumnNum);
    }
  }

  /**
   * Utility method to extend defaults with user options
   * @private
   * @memberOf Sposit
   * @function extendDefaults
   * @param source
   * @param properties
   * @returns {*}
   */
  function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }

  /**
   * Utility method for getting supported CSS 3 properties
   * @memberOf Sposit
   * @private
   * @function getsupportprop
   * @param proparray An array of properties to check the current browser for support
   * @returns {*}
   */
  function getsupportedprop(proparray) {
    var root = document.documentElement; //reference root element of document
    for (var i = 0; i < proparray.length; i++) { //loop through possible properties
      if (proparray[i] in root.style) { //if property exists on element (value will be string, empty string if not set)
        return proparray[i]; //return that string
      }
    }
  }

  /**
   * Helper function to remove prefixed classes from element.
   * @memberOf Sposit
   * @function removePrefixClasses
   * @private
   * @param el element to remove prefix classes from
   * @param prefix string which to match against class names
   */
  function removePrefixClasses(el, prefix) {
    if (el.classList) { // Check to make sure there are classes on the element
      var classList = el.className.split(' ');
      [].forEach.call(classList, function (elementClass, i) {
        if (elementClass.includes(prefix)) {
          el.classList.remove(elementClass);
        }
      });
    }
  }

  /**
   * .includes javascript function Polyfill since .includes lacks widespread support. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
   * @memberOf Sposit
   * @private
   * @function includes
   */
  if (!String.prototype.includes) {
    String.prototype.includes = function () {
      'use strict';
      return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
  }

}());
