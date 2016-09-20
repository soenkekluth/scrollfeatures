'use strict';

var regex = /(auto|scroll)/;

var hasOverflow = function hasOverflow(element) {
  var style = window.getComputedStyle(element, null);
  return regex.test(style.getPropertyValue('overflow') + style.getPropertyValue('overflow-y') + style.getPropertyValue('overflow-x'));
};
module.exports = hasOverflow;