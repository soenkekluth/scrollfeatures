import EventDispatcher from 'eventdispatcher';
import scrollParent from './scroll-parent';

const unprefixAnimationFrame = () => {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
  }
}

export default class ScrollFeatures extends EventDispatcher {

  _scrollTarget = null;
  _y = 0;
  _x = 0;
  _speedY = 0;
  _speedX = 0;
  _lastSpeed = 0;
  _lastDirectionY = ScrollFeatures.direction.none;
  _lastDirectionX = ScrollFeatures.direction.none;
  _stopFrames = 3;
  _currentStopFrames = 0;
  _firstRender = true;
  _directionY = ScrollFeatures.direction.none;
  _directionX = ScrollFeatures.direction.none;
  _scrolling = false;
  _canScrollY = false;
  _canScrollX = false;

  static getInstance(scrollTarget, options) {
    if (!scrollTarget.scrollFeatures) {
      return new ScrollFeatures(scrollTarget, options);
    }
    return scrollTarget.scrollFeatures;
  }

  static hasInstance(scrollTarget) {
    return (typeof scrollTarget.scrollFeatures !== 'undefined');
  }

  static getScrollParent(element) {
    return scrollParent(element);
  }

  static get windowY() {
    return (window.pageYOffset || window.scrollY || 0);
  }

  static get windowX() {
    return (window.pageXOffset || window.scrollX || 0);
  }

  static get documentHeight() {
    return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
  }

  static get documentWidth() {
    return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
  }

  static direction = {
    up: -1,
    down: 1,
    none: 0,
    right: 2,
    left: -2
  };

  static events = {
    SCROLL_PROGRESS: 'scroll:progress',
    SCROLL_START: 'scroll:start',
    SCROLL_STOP: 'scroll:stop',
    SCROLL_DOWN: 'scroll:down',
    SCROLL_UP: 'scroll:up',
    SCROLL_MIN: 'scroll:min',
    SCROLL_MAX: 'scroll:max',
    SCROLL_RESIZE: 'scroll:resize'
  };


  constructor(scrollTarget = window, options = {}) {

    if (ScrollFeatures.hasInstance(scrollTarget)) {
      return ScrollFeatures.getInstance(scrollTarget);
    }

    super({ target: scrollTarget });

    scrollTarget.scrollFeatures = this;
    this._scrollTarget = scrollTarget;
    this.options = options;

    if (Can.animationFrame) {
      unprefixAnimationFrame();
    }

    this.init();
  }

  init() {

    this.getScrollPosition = (this._scrollTarget === window ? (function() {
      return { y: ScrollFeatures.windowY, x: ScrollFeatures.windowX } }.bind(this)) : (function() {
      return { y: this._scrollTarget.scrollTop, x: this._scrollTarget.scrollLeft }
    }.bind(this)));

    this.onResize = () => {
      this.trigger(ScrollFeatures.events.SCROLL_RESIZE);
    }
    this.onScroll = this.onScroll.bind(this);
    this.onNextFrame = this.onNextFrame.bind(this);

    this.updateScrollPosition();

    if (this._scrollTarget !== window) {
      const regex = /(auto|scroll)/;
      const style = window.getComputedStyle(this._scrollTarget, null);
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
  }


  destroy() {

    this._cancelNextFrame();

    super.destroy();

    if(this._scrollTarget){
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
  }


  updateScrollPosition() {
    this._y = this.y;
    this._x = this.x;
  }

  get scrollPosition() {
    return this.getScrollPosition();
  }

  get directionY() {
    if (!this._canScrollY || (this.speedY === 0 && !this._scrolling)) {
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

  get directionX() {
    if (!this._canScrollX || (this.speedX === 0 && !this._scrolling)) {
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

  get scrollTarget() {
    return this._scrollTarget;
  }

  get scrolling() {
    return this._scrolling;
  }

  get speedY() {
    return this._speedY;
  }

  get speedX() {
    return this._speedX;
  }

  get canScrollY() {
    return this._canScrollY;
  }

  get canScrollX() {
    return this._canScrollX;
  }

  get y() {
    return this.scrollPosition.y;
  }

  get x() {
    return this.scrollPosition.x;
  }

  get clientHeight() {
    return (this._scrollTarget === window ? window.innerHeight : this._scrollTarget.clientHeight);
  }

  get clientWidth() {
    return (this._scrollTarget === window ? window.innerWidth : this._scrollTarget.clientWidth);
  }

  get scrollHeight() {
    return (this._scrollTarget === window ? ScrollFeatures.documentHeight : this._scrollTarget.scrollHeight);
  }

  get scrollWidth() {
    return (this._scrollTarget === window ? ScrollFeatures.documentWidth : this._scrollTarget.scrollWidth);
  }




  onScroll() {
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
  }

  onNextFrame() {
    this._speedY = this._y - this.y;
    this._speedX = this._x - this.x;

    var speed = (+this.speedY) + (+this.speedX);
    if (this._scrolling && (speed === 0 && (this._currentStopFrames++ > this._stopFrames))) {
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
      this._nextTimeout = setTimeout(() => {
        this.onNextFrame();
      }, 1000 / 60);
    }
  }

  onScrollStop() {

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
  }

  _cancelNextFrame() {
    this._currentStopFrames = 0;
    if (Can.animationFrame) {
      window.cancelAnimationFrame(this.nextFrameID);
      this.nextFrameID = -1;
    } else {
      clearTimeout(this._nextTimeout);
    }
  }

}

var _animationFrame = null;

class Can {
  static get animationFrame() {
    if (_animationFrame === null) {
      _animationFrame = !!(window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame);
    }
    return _animationFrame;
  }
}
