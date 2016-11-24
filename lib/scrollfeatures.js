'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventdispatcher = require('eventdispatcher');

var _eventdispatcher2 = _interopRequireDefault(_eventdispatcher);

var _scrollParent = require('./scroll-parent');

var _scrollParent2 = _interopRequireDefault(_scrollParent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var unprefixAnimationFrame = function unprefixAnimationFrame() {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
  }
};

var ScrollFeatures = function (_EventDispatcher) {
  _inherits(ScrollFeatures, _EventDispatcher);

  ScrollFeatures.getInstance = function getInstance(scrollTarget, options) {
    if (!scrollTarget.scrollFeatures) {
      return new ScrollFeatures(scrollTarget, options);
    }
    return scrollTarget.scrollFeatures;
  };

  ScrollFeatures.hasInstance = function hasInstance(scrollTarget) {
    return typeof scrollTarget.scrollFeatures !== 'undefined';
  };

  ScrollFeatures.getScrollParent = function getScrollParent(element) {
    return (0, _scrollParent2.default)(element);
  };

  _createClass(ScrollFeatures, null, [{
    key: 'windowY',
    get: function get() {
      return window.pageYOffset || window.scrollY || 0;
    }
  }, {
    key: 'windowX',
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
    var scrollTarget = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ScrollFeatures);

    if (ScrollFeatures.hasInstance(scrollTarget)) {
      var _ret;

      return _ret = ScrollFeatures.getInstance(scrollTarget), _possibleConstructorReturn(_this, _ret);
    }

    var _this = _possibleConstructorReturn(this, _EventDispatcher.call(this, { target: scrollTarget }));

    _this._scrollTarget = null;
    _this._y = 0;
    _this._x = 0;
    _this._speedY = 0;
    _this._speedX = 0;
    _this._lastSpeed = 0;
    _this._lastDirectionY = ScrollFeatures.direction.none;
    _this._lastDirectionX = ScrollFeatures.direction.none;
    _this._stopFrames = 3;
    _this._currentStopFrames = 0;
    _this._firstRender = true;
    _this._directionY = ScrollFeatures.direction.none;
    _this._directionX = ScrollFeatures.direction.none;
    _this._scrolling = false;
    _this._canScrollY = false;
    _this._canScrollX = false;


    scrollTarget.scrollFeatures = _this;
    _this._scrollTarget = scrollTarget;
    _this.options = options;

    if (Can.animationFrame) {
      unprefixAnimationFrame();
    }

    _this.init();
    return _this;
  }

  ScrollFeatures.prototype.init = function init() {
    var _this2 = this;

    this.getScrollPosition = this._scrollTarget === window ? function () {
      return { y: ScrollFeatures.windowY, x: ScrollFeatures.windowX };
    }.bind(this) : function () {
      return { y: this._scrollTarget.scrollTop, x: this._scrollTarget.scrollLeft };
    }.bind(this);

    this.onResize = function () {
      _this2.trigger(ScrollFeatures.events.SCROLL_RESIZE);
    };
    this.onScroll = this.onScroll.bind(this);
    this.onNextFrame = this.onNextFrame.bind(this);

    this.updateScrollPosition();

    if (this._scrollTarget !== window) {
      var regex = /(auto|scroll)/;
      var style = window.getComputedStyle(this._scrollTarget, null);
      this._canScrollY = regex.test(style.getPropertyValue('overflow-y'));
      this._canScrollX = regex.test(style.getPropertyValue('overflow-x'));
    } else {
      this._canScrollY = this.clientHeight < this.scrollHeight;
      this._canScrollX = this.clientWidth < this.scrollWidth;
    }

    if (this._scrollTarget.addEventListener) {
      this._scrollTarget.addEventListener('scroll', this.onScroll, false);
      this._scrollTarget.addEventListener('resize', this.onResize, false);
    } else if (this._scrollTarget.attachEvent) {
      this._scrollTarget.attachEvent('scroll', this.onScroll);
      this._scrollTarget.attachEvent('resize', this.onResize);
    }
  };

  ScrollFeatures.prototype.destroy = function destroy() {

    this._cancelNextFrame();

    _EventDispatcher.prototype.destroy.call(this);

    if (this._scrollTarget) {
      if (this._scrollTarget.addEventListener) {
        this._scrollTarget.removeEventListener('scroll', this.onScroll);
        this._scrollTarget.removeEventListener('resize', this.onResize);
      } else if (this._scrollTarget.attachEvent) {
        this._scrollTarget.detachEvent('scroll', this.onScroll);
        this._scrollTarget.detachEvent('resize', this.onResize);
      }
    }

    this.onResize = null;
    this.onScroll = null;
    this.getScrollPosition = null;
    this.onNextFrame = null;
    delete this._scrollTarget.scrollFeatures;
    this._scrollTarget = null;
  };

  ScrollFeatures.prototype.updateScrollPosition = function updateScrollPosition() {
    this._y = this.y;
    this._x = this.x;
  };

  ScrollFeatures.prototype.onScroll = function onScroll() {
    this._currentStopFrames = 0;
    if (this._firstRender) {
      this._firstRender = false;
      if (this.y > 1 || this.x > 1) {
        this.updateScrollPosition();
        this.trigger(ScrollFeatures.events.SCROLL_PROGRESS);
        return;
      }
    }

    if (!this._scrolling) {
      this._scrolling = true;
      this._lastDirectionY = ScrollFeatures.direction.none;
      this._lastDirectionX = ScrollFeatures.direction.none;
      this.trigger(ScrollFeatures.events.SCROLL_START);
      if (Can.animationFrame) {
        this.nextFrameID = window.requestAnimationFrame(this.onNextFrame);
      } else {
        this.onNextFrame();
      }
    }
  };

  ScrollFeatures.prototype.onNextFrame = function onNextFrame() {
    var _this3 = this;

    this._speedY = this._y - this.y;
    this._speedX = this._x - this.x;

    var speed = +this.speedY + +this.speedX;
    if (this._scrolling && speed === 0 && this._currentStopFrames++ > this._stopFrames) {
      this.onScrollStop();
      return;
    }

    this.updateScrollPosition();

    if (this._lastDirectionY !== this.directionY) {
      this.trigger('scroll:' + (this.directionY === ScrollFeatures.direction.down ? 'down' : 'up'));
    }
    if (this._lastDirectionX !== this.directionX) {
      this.trigger('scroll:' + (this.directionX === ScrollFeatures.direction.right ? 'right' : 'left'));
    }

    this._lastDirectionY = this.directionY;
    this._lastDirectionX = this.directionX;

    this.trigger(ScrollFeatures.events.SCROLL_PROGRESS);

    if (Can.animationFrame) {
      this.nextFrameID = window.requestAnimationFrame(this.onNextFrame);
    } else {
      this._nextTimeout = setTimeout(function () {
        _this3.onNextFrame();
      }, 1000 / 60);
    }
  };

  ScrollFeatures.prototype.onScrollStop = function onScrollStop() {

    this._scrolling = false;
    this.updateScrollPosition();

    this.trigger(ScrollFeatures.events.SCROLL_STOP);

    if (this._canScrollY) {
      if (this.y <= 0) {
        this.trigger(ScrollFeatures.events.SCROLL_MIN);
      } else if (this.y + this.clientHeight >= this.scrollHeight) {
        this.trigger(ScrollFeatures.events.SCROLL_MAX);
      }
    }

    if (this._canScrollX) {
      if (this.x <= 0) {
        this.trigger(ScrollFeatures.events.SCROLL_MIN);
      } else if (this.x + this.clientWidth >= this.scrollWidth) {
        this.trigger(ScrollFeatures.events.SCROLL_MAX);
      }
    }

    this._cancelNextFrame();
  };

  ScrollFeatures.prototype._cancelNextFrame = function _cancelNextFrame() {
    this._currentStopFrames = 0;
    if (Can.animationFrame) {
      window.cancelAnimationFrame(this.nextFrameID);
      this.nextFrameID = -1;
    } else {
      clearTimeout(this._nextTimeout);
    }
  };

  _createClass(ScrollFeatures, [{
    key: 'scrollPosition',
    get: function get() {
      return this.getScrollPosition();
    }
  }, {
    key: 'directionY',
    get: function get() {
      if (!this._canScrollY || this.speedY === 0 && !this._scrolling) {
        this._directionY = ScrollFeatures.direction.none;
      } else {
        if (this.speedY > 0) {
          this._directionY = ScrollFeatures.direction.up;
        } else if (this.speedY < 0) {
          this._directionY = ScrollFeatures.direction.down;
        }
      }
      return this._directionY;
    }
  }, {
    key: 'directionX',
    get: function get() {
      if (!this._canScrollX || this.speedX === 0 && !this._scrolling) {
        this._directionX = ScrollFeatures.direction.none;
      } else {
        if (this.speedX > 0) {
          this._directionX = ScrollFeatures.direction.left;
        } else if (this.speedX < 0) {
          this._directionX = ScrollFeatures.direction.right;
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
    key: 'y',
    get: function get() {
      return this.scrollPosition.y;
    }
  }, {
    key: 'x',
    get: function get() {
      return this.scrollPosition.x;
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

ScrollFeatures.direction = {
  up: -1,
  down: 1,
  none: 0,
  right: 2,
  left: -2
};
ScrollFeatures.events = {
  SCROLL_PROGRESS: 'scroll:progress',
  SCROLL_START: 'scroll:start',
  SCROLL_STOP: 'scroll:stop',
  SCROLL_DOWN: 'scroll:down',
  SCROLL_UP: 'scroll:up',
  SCROLL_MIN: 'scroll:min',
  SCROLL_MAX: 'scroll:max',
  SCROLL_RESIZE: 'scroll:resize'
};
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