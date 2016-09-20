import delegate from 'delegatejs';
import EventDispatcher from 'eventdispatcher';
import scrollParent from './scroll-parent';

export default class ScrollFeatures extends EventDispatcher {

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

  static get windowScrollY() {
    return (window.pageYOffset || window.scrollY || 0);
  }

  static get windowScrollX() {
    return (window.pageXOffset || window.scrollX || 0);
  }

  static get documentHeight() {
    return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
  }

  static get documentWidth() {
    return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
  }

  static unprefixAnimationFrame() {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
      window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    }
  }

  static UP = -1;
  static DOWN = 1;
  static NONE = 0;
  static RIGHT = 2;
  static LEFT = -2;

  static EVENT_SCROLL_PROGRESS = 'scroll:progress';
  static EVENT_SCROLL_START = 'scroll:start';
  static EVENT_SCROLL_STOP = 'scroll:stop';
  static EVENT_SCROLL_DOWN = 'scroll:down';
  static EVENT_SCROLL_UP = 'scroll:up';
  static EVENT_SCROLL_MIN = 'scroll:min';
  static EVENT_SCROLL_MAX = 'scroll:max';
  static EVENT_SCROLL_RESIZE = 'scroll:resize';


  static directionToString(direction) {
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

  constructor(scrollTarget = window, options = {}) {

    if (ScrollFeatures.hasInstance(scrollTarget)) {
      return ScrollFeatures.getInstance(scrollTarget);
    }

    super({ target: scrollTarget });

    scrollTarget.scrollFeatures = this;
    this._scrollTarget = scrollTarget;
    this.options = options;

    if (Can.animationFrame) {
      ScrollFeatures.unprefixAnimationFrame();
    }

    this.init();
  }

  init() {

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

    this.getScrollPosition = delegate(this, (this._scrollTarget === window ? this._getWindowScrollPosition : this._getElementScrollPosition));

    this.onResize = delegate(this, () => this.trigger(ScrollFeatures.EVENT_SCROLL_RESIZE));
    this.onScroll = delegate(this, this.onScroll);
    this.onNextFrame = delegate(this, this.onNextFrame);

    this.updateScrollPosition();

    if (this._scrollTarget !== window) {
      const regex = /(auto|scroll)/;
      const style = window.getComputedStyle(this._scrollTarget, null);
      this._canScrollY = regex.test(style.getPropertyValue('overflow-y'));
      this._canScrollX = regex.test(style.getPropertyValue('overflow-x'));
    }else{
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

  get destroyed() {
    return this._destroyed;
  }

  destroy() {
    if (!this._destroyed) {
      this._cancelNextFrame();

      super.destroy();

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
      delete this._scrollTarget.scrollFeatures;
      this._scrollTarget = null;
      this._destroyed = true;
    }
  }


  updateScrollPosition() {
    this._scrollY = this.scrollY;
    this._scrollX = this.scrollX;
  }


  get scrollPosition() {
    return this.getScrollPosition();
  }


  get directionY() {
    if (!this._canScrollY || (this.speedY === 0 && !this._scrolling)) {
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

  get directionX() {
    if (!this._canScrollX || (this.speedX === 0 && !this._scrolling)) {
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

  get scrollTarget() {
    return this._scrollTarget;
  }

  get delta() {
    return this.directionY;
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

  get scrollY() {
    return this.scrollPosition.y;
  }

  get y() {
    return this.scrollY;
  }

  get scrollX() {
    return this.scrollPosition.x;
  }

  get x() {
    return this.scrollX;
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

  _getWindowScrollPosition() {
    return {
      y: ScrollFeatures.windowScrollY,
      x: ScrollFeatures.windowScrollX
    };
  }

  _getElementScrollPosition() {
    return {
      y: this._scrollTarget.scrollTop,
      x: this._scrollTarget.scrollLeft
    };
  }


  onScroll() {
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

  onNextFrame() {
    this._speedY = this._scrollY - this.scrollY;
    this._speedX = this._scrollX - this.scrollX;

    var speed = (+this.speedY) + (+this.speedX);
    if (this._scrolling && (speed === 0 && (this._currentStopFrames++ > this._stopFrames))) {
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
      this._nextTimeout = setTimeout(() => {
        this.onNextFrame();
      }, 1000 / 60);
    }
  }

  onScrollStop() {

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

  _cancelNextFrame() {
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
