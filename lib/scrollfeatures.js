'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _eventdispatcher = require('eventdispatcher');

var _eventdispatcher2 = _interopRequireDefault(_eventdispatcher);

var _scrollParent = require('./scroll-parent');

var _scrollParent2 = _interopRequireDefault(_scrollParent);

var _nextframe = require('nextframe');

var _nextframe2 = _interopRequireDefault(_nextframe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ScrollFeatures = function (_EventDispatcher) {
  (0, _inherits3.default)(ScrollFeatures, _EventDispatcher);

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

  (0, _createClass3.default)(ScrollFeatures, null, [{
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
    (0, _classCallCheck3.default)(this, ScrollFeatures);


    if (ScrollFeatures.hasInstance(scrollTarget)) {
      var _ret;

      return _ret = ScrollFeatures.getInstance(scrollTarget), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    var _this = (0, _possibleConstructorReturn3.default)(this, _EventDispatcher.call(this, { target: scrollTarget }));

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
      this.cancelFrame = (0, _nextframe.nextFrames)(this.onNextFrame);
    }
  };

  ScrollFeatures.prototype.onNextFrame = function onNextFrame() {
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
    if (this.cancelFrame) {
      this.cancelFrame();
      this.cancelFrame = null;
    }
  };

  (0, _createClass3.default)(ScrollFeatures, [{
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
module.exports = exports['default'];