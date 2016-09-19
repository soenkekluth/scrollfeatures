'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _delegatejs = require('delegatejs');

var _delegatejs2 = _interopRequireDefault(_delegatejs);

var _eventdispatcher = require('eventdispatcher');

var _eventdispatcher2 = _interopRequireDefault(_eventdispatcher);

var _scrollParent = require('./scroll-parent');

var _scrollParent2 = _interopRequireDefault(_scrollParent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScrollFeatures = function (_EventDispatcher) {
  _inherits(ScrollFeatures, _EventDispatcher);

  _createClass(ScrollFeatures, null, [{
    key: 'getInstance',
    value: function getInstance(scrollTarget, options) {
      if (!scrollTarget.scrollFeatures) {
        return new ScrollFeatures(scrollTarget, options);
      }
      return scrollTarget.scrollFeatures;
    }
  }, {
    key: 'hasInstance',
    value: function hasInstance(scrollTarget) {
      return typeof scrollTarget.scrollFeatures !== 'undefined';
    }
  }, {
    key: 'getScrollParent',
    value: function getScrollParent(element) {
      return (0, _scrollParent2.default)(element);
    }
  }, {
    key: 'unprefixAnimationFrame',
    value: function unprefixAnimationFrame() {
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
      }
    }
  }, {
    key: 'directionToString',
    value: function directionToString(direction) {
      switch (direction) {
        case ScrollFeatures.UP:
          return 'up';
        case ScrollFeatures.DOWN:
          return 'down';
        case ScrollFeatures.NONE:
          return 'none';
        case ScrollFeatures.LEFT:
          return 'left';
        case ScrollFeatures.RIGHT:
          return 'right';
      }
    }
  }, {
    key: 'windowScrollY',
    get: function get() {
      return window.pageYOffset || window.scrollY || 0;
    }
  }, {
    key: 'windowScrollX',
    get: function get() {
      return window.pageXOffset || window.scrollX || 0;
    }
  }, {
    key: 'documentHeight',
    get: function get() {
      return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
    }
  }, {
    key: 'documentWidth',
    get: function get() {
      return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
    }
  }]);

  function ScrollFeatures() {
    var scrollTarget = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, ScrollFeatures);

    if (ScrollFeatures.hasInstance(scrollTarget)) {
      var _ret;

      return _ret = ScrollFeatures.getInstance(scrollTarget), _possibleConstructorReturn(_this, _ret);
    }

    var _this = _possibleConstructorReturn(this, (ScrollFeatures.__proto__ || Object.getPrototypeOf(ScrollFeatures)).call(this, { target: scrollTarget }));

    scrollTarget.scrollFeatures = _this;
    _this._scrollTarget = scrollTarget;
    _this.options = options;

    if (Can.animationFrame) {
      ScrollFeatures.unprefixAnimationFrame();
    }

    _this.init();
    return _this;
  }

  _createClass(ScrollFeatures, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      this._destroyed = false;
      this._scrollY = 0;
      this._scrollX = 0;
      this._speedY = 0;
      this._speedX = 0;
      this._lastSpeed = 0;
      this._lastDirectionY = ScrollFeatures.NONE;
      this._lastDirectionX = ScrollFeatures.NONE;
      this._stopFrames = 3;
      this._currentStopFrames = 0;
      this._firstRender = true;
      this._directionY = ScrollFeatures.NONE;
      this._directionX = ScrollFeatures.NONE;
      this._scrolling = false;
      this._canScrollY = false;
      this._canScrollX = false;

      this.getScrollPosition = (0, _delegatejs2.default)(this, this._scrollTarget === window ? this._getWindowScrollPosition : this._getElementScrollPosition);

      this.onResize = (0, _delegatejs2.default)(this, function () {
        return _this2.trigger(ScrollFeatures.EVENT_SCROLL_RESIZE);
      });
      this.onScroll = (0, _delegatejs2.default)(this, this.onScroll);
      this.onNextFrame = (0, _delegatejs2.default)(this, this.onNextFrame);

      this.updateScrollPosition();

      this._canScrollY = this.clientHeight < this.scrollHeight;
      this._canScrollX = this.clientWidth < this.scrollWidth;

      if (this._scrollTarget !== window) {
        var style = window.getComputedStyle(this._scrollTarget);
        this._canScrollY = style['overflow-y'] !== 'hidden';
        this._canScrollX = style['overflow-x'] !== 'hidden';
      }

      if (this._scrollTarget.addEventListener) {
        this._scrollTarget.addEventListener('scroll', this.onScroll, false);
        this._scrollTarget.addEventListener('resize', this.onResize, false);
      } else if (this._scrollTarget.attachEvent) {
        this._scrollTarget.attachEvent('scroll', this.onScroll);
        this._scrollTarget.attachEvent('resize', this.onResize);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (!this._destroyed) {
        this._cancelNextFrame();

        _get(ScrollFeatures.prototype.__proto__ || Object.getPrototypeOf(ScrollFeatures.prototype), 'destroy', this).call(this);

        if (this._scrollTarget.addEventListener) {
          this._scrollTarget.removeEventListener('scroll', this.onScroll);
          this._scrollTarget.removeEventListener('resize', this.onResize);
        } else if (this._scrollTarget.attachEvent) {
          this._scrollTarget.detachEvent('scroll', this.onScroll);
          this._scrollTarget.detachEvent('resize', this.onResize);
        }

        this.onResize = null;
        this.onScroll = null;
        this.getScrollPosition = null;
        this.onNextFrame = null;
        this._scrollTarget = null;
        this._destroyed = true;
      }
    }
  }, {
    key: 'updateScrollPosition',
    value: function updateScrollPosition() {
      this._scrollY = this.scrollY;
      this._scrollX = this.scrollX;
    }
  }, {
    key: '_getWindowScrollPosition',
    value: function _getWindowScrollPosition() {
      return {
        y: ScrollFeatures.windowScrollY,
        x: ScrollFeatures.windowScrollX
      };
    }
  }, {
    key: '_getElementScrollPosition',
    value: function _getElementScrollPosition() {
      return {
        y: this._scrollTarget.scrollTop,
        x: this._scrollTarget.scrollLeft
      };
    }
  }, {
    key: 'onScroll',
    value: function onScroll() {
      this._currentStopFrames = 0;
      if (this._firstRender) {
        this._firstRender = false;
        if (this.y > 1 || this.x > 1) {
          this.updateScrollPosition();
          this.trigger(ScrollFeatures.EVENT_SCROLL_PROGRESS);
          return;
        }
      }

      if (!this._scrolling) {
        this._scrolling = true;
        this._lastDirectionY = ScrollFeatures.NONE;
        this._lastDirectionX = ScrollFeatures.NONE;
        this.trigger(ScrollFeatures.EVENT_SCROLL_START);
        if (Can.animationFrame) {
          this.nextFrameID = window.requestAnimationFrame(this.onNextFrame);
        } else {
          this.onNextFrame();
        }
      }
    }
  }, {
    key: 'onNextFrame',
    value: function onNextFrame() {
      var _this3 = this;

      // this._lastSpeed = this.speedY;
      this._speedY = this._scrollY - this.scrollY;
      this._speedX = this._scrollX - this.scrollX;

      var speed = +this.speedY + +this.speedX;
      if (this._scrolling && speed === 0 && this._currentStopFrames++ > this._stopFrames) {
        this.onScrollStop();
        return;
      }

      this.updateScrollPosition();

      if (this._lastDirectionY !== this.directionY) {
        this.trigger('scroll:' + ScrollFeatures.directionToString(this.directionY));
      }
      if (this._lastDirectionX !== this.directionX) {
        this.trigger('scroll:' + ScrollFeatures.directionToString(this.directionX));
      }

      this._lastDirectionY = this.directionY;
      this._lastDirectionX = this.directionX;

      this.trigger(ScrollFeatures.EVENT_SCROLL_PROGRESS);

      if (Can.animationFrame) {
        this.nextFrameID = window.requestAnimationFrame(this.onNextFrame);
      } else {
        this._nextTimeout = setTimeout(function () {
          _this3.onNextFrame();
        }, 1000 / 60);
      }
    }
  }, {
    key: 'onScrollStop',
    value: function onScrollStop() {

      this._scrolling = false;
      this.updateScrollPosition();

      this.trigger(ScrollFeatures.EVENT_SCROLL_STOP);

      if (this._canScrollY) {
        if (this.y <= 0) {
          this.trigger(ScrollFeatures.EVENT_SCROLL_MIN);
        } else if (this.y + this.clientHeight >= this.scrollHeight) {
          this.trigger(ScrollFeatures.EVENT_SCROLL_MAX);
        }
      }

      if (this._canScrollX) {
        if (this.x <= 0) {
          this.trigger(ScrollFeatures.EVENT_SCROLL_MIN);
        } else if (this.x + this.clientWidth >= this.scrollWidth) {
          this.trigger(ScrollFeatures.EVENT_SCROLL_MAX);
        }
      }

      this._currentStopFrames = 0;
      this._cancelNextFrame();
    }
  }, {
    key: '_cancelNextFrame',
    value: function _cancelNextFrame() {
      if (Can.animationFrame) {
        window.cancelAnimationFrame(this.nextFrameID);
        this.nextFrameID = -1;
      } else {
        clearTimeout(this._nextTimeout);
      }
    }
  }, {
    key: 'destroyed',
    get: function get() {
      return this._destroyed;
    }
  }, {
    key: 'scrollPosition',
    get: function get() {
      return this.getScrollPosition();
    }
  }, {
    key: 'directionY',
    get: function get() {
      if (!this._canScrollY || this.speedY === 0 && !this._scrolling) {
        this._directionY = ScrollFeatures.NONE;
      } else {
        if (this.speedY > 0) {
          this._directionY = ScrollFeatures.UP;
        } else if (this.speedY < 0) {
          this._directionY = ScrollFeatures.DOWN;
        }
      }
      return this._directionY;
    }
  }, {
    key: 'directionX',
    get: function get() {
      if (!this._canScrollX || this.speedX === 0 && !this._scrolling) {
        this._directionX = ScrollFeatures.NONE;
      } else {
        if (this.speedX > 0) {
          this._directionX = ScrollFeatures.LEFT;
        } else if (this.speedX < 0) {
          this._directionX = ScrollFeatures.RIGHT;
        }
      }
      return this._directionX;
    }
  }, {
    key: 'scrollTarget',
    get: function get() {
      return this._scrollTarget;
    }
  }, {
    key: 'delta',
    get: function get() {
      return this.directionY;
    }
  }, {
    key: 'scrolling',
    get: function get() {
      return this._scrolling;
    }
  }, {
    key: 'speedY',
    get: function get() {
      return this._speedY;
    }
  }, {
    key: 'speedX',
    get: function get() {
      return this._speedX;
    }
  }, {
    key: 'canScrollY',
    get: function get() {
      return this._canScrollY;
    }
  }, {
    key: 'canScrollX',
    get: function get() {
      return this._canScrollX;
    }
  }, {
    key: 'scrollY',
    get: function get() {
      return this.scrollPosition.y;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.scrollY;
    }
  }, {
    key: 'scrollX',
    get: function get() {
      return this.scrollPosition.x;
    }
  }, {
    key: 'x',
    get: function get() {
      return this.scrollX;
    }
  }, {
    key: 'clientHeight',
    get: function get() {
      return this._scrollTarget === window ? window.innerHeight : this._scrollTarget.clientHeight;
    }
  }, {
    key: 'clientWidth',
    get: function get() {
      return this._scrollTarget === window ? window.innerWidth : this._scrollTarget.clientWidth;
    }
  }, {
    key: 'scrollHeight',
    get: function get() {
      return this._scrollTarget === window ? ScrollFeatures.documentHeight : this._scrollTarget.scrollHeight;
    }
  }, {
    key: 'scrollWidth',
    get: function get() {
      return this._scrollTarget === window ? ScrollFeatures.documentWidth : this._scrollTarget.scrollWidth;
    }
  }]);

  return ScrollFeatures;
}(_eventdispatcher2.default);

ScrollFeatures.UP = -1;
ScrollFeatures.DOWN = 1;
ScrollFeatures.NONE = 0;
ScrollFeatures.RIGHT = 2;
ScrollFeatures.LEFT = -2;
ScrollFeatures.EVENT_SCROLL_PROGRESS = 'scroll:progress';
ScrollFeatures.EVENT_SCROLL_START = 'scroll:start';
ScrollFeatures.EVENT_SCROLL_STOP = 'scroll:stop';
ScrollFeatures.EVENT_SCROLL_DOWN = 'scroll:down';
ScrollFeatures.EVENT_SCROLL_UP = 'scroll:up';
ScrollFeatures.EVENT_SCROLL_MIN = 'scroll:min';
ScrollFeatures.EVENT_SCROLL_MAX = 'scroll:max';
ScrollFeatures.EVENT_SCROLL_RESIZE = 'scroll:resize';
exports.default = ScrollFeatures;


var _animationFrame = null;

var Can = function () {
  function Can() {
    _classCallCheck(this, Can);
  }

  _createClass(Can, null, [{
    key: 'animationFrame',
    get: function get() {
      if (_animationFrame === null) {
        _animationFrame = !!(window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame);
      }
      return _animationFrame;
    }
  }]);

  return Can;
}();

module.exports = exports['default'];