'use strict';

var hasOverflow = require('./has-overflow');

var scrollParent = function scrollParent(element) {

  if (!(element instanceof HTMLElement)) {
    return window;
  }

  while (element.parentNode) {
    if (element.parentNode === document.body) {
      return window;
    }

    if (hasOverflow(element.parentNode)) {
      return element.parentNode;
    }
    element = element.parentNode;
  }
  return window;
};

module.exports = scrollParent;