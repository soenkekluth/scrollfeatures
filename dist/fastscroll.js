(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FastScroll = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Sönke Kluth
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/

(function(exports) {

    'use strict';

    var delegate = function(target, handler) {
        // Get any extra arguments for handler
        var args = [].slice.call(arguments, 2);

        // Create delegate function
        var fn = function() {

            // Call handler with arguments
            return handler.apply(target, args);
        };

        // Return the delegate function.
        return fn;
    };


    (typeof module != "undefined" && module.exports) ? (module.exports = delegate) : (typeof define != "undefined" ? (define(function() {
        return delegate;
    })) : (exports.delegate = delegate));

})(this);

},{}],2:[function(require,module,exports){
 'use strict';

 function isEmpty(obj) {
   for (var prop in obj) {
     if (obj.hasOwnProperty(prop)){
       return false;
     }
   }
   return true;
 }

var _instanceMap = {};

 var EventDispatcher = function() {
   this._eventMap = {};
   this._destroyed = false;
 };

 EventDispatcher.getInstance = function(key){
  if(!key){
    throw new Error('key must be');
  }
  return _instanceMap[key] || (_instanceMap[key] =  new EventDispatcher());
 };


 EventDispatcher.prototype.addListener = function(event, listener) {
   var listeners = this.getListener(event);
   if (!listeners) {
     this._eventMap[event] = [listener];
     return true;
   }

   if (listeners.indexOf(listener) === -1) {
     listeners.push(listener);
     return true;
   }
   return false;
 };

 EventDispatcher.prototype.addListenerOnce = function(event, listener) {
   var s = this;
   var f2 = function() {
     s.removeListener(event, f2);
     return listener.apply(this, arguments);
   };
   return this.addListener(event, f2);
 };

 EventDispatcher.prototype.removeListener = function(event, listener) {

  if(typeof listener === 'undefined'){
    return this.removeAllListener(event);
  }

   var listeners = this.getListener(event);
   if (listeners) {
     var i = listeners.indexOf(listener);
     if (i > -1) {
       listeners = listeners.splice(i, 1);
       if (!listeners.length) {
         delete(this._eventMap[event]);
       }
       return true;
     }
   }
   return false;
 };

 EventDispatcher.prototype.removeAllListener = function(event) {
   var listeners = this.getListener(event);
   if (listeners) {
     this._eventMap[event].length = 0;
     delete(this._eventMap[event]);
    return true;
   }
   return false;
 };

 EventDispatcher.prototype.hasListener = function(event) {
   return this.getListener(event) !== null;
 };

 EventDispatcher.prototype.hasListeners = function() {
   return (this._eventMap !== null && this._eventMap !== undefined && !isEmpty(this._eventMap));
 };

 EventDispatcher.prototype.dispatch = function(eventType, eventObject) {
   var listeners = this.getListener(eventType);

   if (listeners) {
     eventObject = eventObject || {};
     eventObject.type = eventType;
     eventObject.target = eventObject.target || this;

     var i = -1;
     while (++i < listeners.length) {
       listeners[i](eventObject);
     }
     return true;
   }
   return false;
 };

 EventDispatcher.prototype.getListener = function(event) {
   var result = this._eventMap ? this._eventMap[event] : null;
   return (result || null);
 };

 EventDispatcher.prototype.destroy = function() {
   if (this._eventMap) {
     for (var i in this._eventMap) {
       this.removeAllListener(i);
     }
     this._eventMap = null;
   }
   this._destroyed = true;
 };


 //Method Map
 EventDispatcher.prototype.on = EventDispatcher.prototype.bind = EventDispatcher.prototype.addEventListener = EventDispatcher.prototype.addListener;
 EventDispatcher.prototype.off = EventDispatcher.prototype.unbind = EventDispatcher.prototype.removeEventListener = EventDispatcher.prototype.removeListener;
 EventDispatcher.prototype.once = EventDispatcher.prototype.one = EventDispatcher.prototype.addListenerOnce;
 EventDispatcher.prototype.trigger = EventDispatcher.prototype.dispatchEvent = EventDispatcher.prototype.dispatch;

 module.exports = EventDispatcher;

},{}],3:[function(require,module,exports){
'use strict';

/*
 * FastScroll
 * https://github.com/soenkekluth/fastscroll
 *
 * Copyright (c) 2014 Sönke Kluth
 * Licensed under the MIT license.
 */

var delegate = require('delegatejs');
var EventDispatcher = require('eventdispatcher');
var _instanceMap = {};

var FastScroll = function(scrollTarget, options) {
  scrollTarget = scrollTarget || window;
  this.options = options || { animationFrame: true };
  this.scrollTarget = scrollTarget;
  this.init();
};

FastScroll.___instanceMap = _instanceMap;

FastScroll.getInstance = function(scrollTarget, options) {
  scrollTarget = scrollTarget || window;
  return _instanceMap[scrollTarget] || (_instanceMap[scrollTarget] = new FastScroll(scrollTarget, options));
};

FastScroll.hasInstance = function(scrollTarget) {
  return _instanceMap[scrollTarget] !== undefined;
};


FastScroll.hasScrollTarget = FastScroll.hasInstance;

FastScroll.clearInstance = function(scrollTarget) {
  scrollTarget = scrollTarget || window;
  if (FastScroll.hasInstance(scrollTarget)) {
    FastScroll.getInstance(scrollTarget).destroy();
    delete(_instanceMap[scrollTarget]);
  }
};

FastScroll.UP = 'up';
FastScroll.DOWN = 'down';
FastScroll.NONE = 'none';
FastScroll.LEFT = 'left';
FastScroll.RIGHT = 'right';

FastScroll.prototype = {

  destroyed: false,
  scrollY: 0,
  scrollX: 0,
  lastScrollY: 0,
  lastScrollX: 0,
  timeout: 0,
  speedY: 0,
  speedX: 0,
  stopFrames: 5,
  currentStopFrames: 0,
  firstRender: true,
  animationFrame: true,
  lastEvent: {
    type: null,
    scrollY: 0,
    scrollX: 0
  },

  scrolling: false,

  init: function() {
    console.log('init');
    this.dispatcher = new EventDispatcher();
    this.animationFrame = this.options.animationFrame;
    this.updateScrollPosition = (this.scrollTarget === window /*|| this.scrollTarget === document.body*/ ) ? delegate(this, this.updateWindowScrollPosition) : delegate(this, this.updateElementScrollPosition);
    this.updateScrollPosition();
    this.trigger = this.dispatchEvent;
    this.lastEvent.scrollY = this.scrollY;
    this.lastEvent.scrollX = this.scrollX;
    this.onScroll = delegate(this, this.onScroll);
    this.onNextFrame = delegate(this, this.onNextFrame);
    this.scrollTarget.addEventListener('scroll', this.onScroll, false);
  },

  destroy: function() {
    if (!this.destroyed) {
      this.cancelNextFrame();
      this.scrollTarget.removeEventListener('scroll', this.onScroll);
      this.dispatcher.off();
      this.dispatcher = null;
      this.onScroll = null;
      this.updateScrollPosition = null;
      this.onNextFrame = null;
      this.scrollTarget = null;
      this.destroyed = true;
    }
  },

  getAttributes: function() {
    return {
      scrollY: this.scrollY,
      scrollX: this.scrollX,
      speedY: this.speedY,
      speedX: this.speedX,
      angle: 0,
      directionY: this.speedY === 0 ? FastScroll.NONE : ((this.speedY > 0) ? FastScroll.UP : FastScroll.DOWN),
      directionX: this.speedX === 0 ? FastScroll.NONE : ((this.speedX > 0) ? FastScroll.RIGHT : FastScroll.LEFT)
    };
  },

  updateWindowScrollPosition: function() {
    this.scrollY = window.scrollY || window.pageYOffset || 0;
    this.scrollX = window.scrollX || window.pageXOffset || 0;
  },

  updateElementScrollPosition: function() {
    this.scrollY = this.scrollTarget.scrollTop;
    this.scrollX = this.scrollTarget.scrollLeft;
  },

  onScroll: function() {
    this.currentStopFrames = 0;
    if (this.firstRender) {
      this.firstRender = false;
      if (this.scrollY > 1) {
        this.updateScrollPosition();
        this.dispatchEvent('scroll:progress');
        return;
      }
    }

    if (!this.scrolling) {
      this.scrolling = true;
      this.dispatchEvent('scroll:start');
      if (this.animationFrame) {
        this.nextFrameID = requestAnimationFrame(this.onNextFrame);
      }
    }
    if (!this.animationFrame) {
      clearTimeout(this.timeout);
      this.onNextFrame();
      var self = this;
      this.timeout = setTimeout(function() {
        self.onScrollStop();
      }, 100);
    }
  },

  onNextFrame: function() {
    this.updateScrollPosition();

    this.speedY = this.lastScrollY - this.scrollY;
    this.speedX = this.lastScrollX - this.scrollX;

    this.lastScrollY = this.scrollY;
    this.lastScrollX = this.scrollX;

    if (this.animationFrame && this.scrolling && this.speedY === 0 && (this.currentStopFrames++ > this.stopFrames)) {
      this.onScrollStop();
      return;
    }

    this.dispatchEvent('scroll:progress');

    if (this.animationFrame) {
      this.nextFrameID = requestAnimationFrame(this.onNextFrame);
    }
  },

  onScrollStop: function() {
    this.scrolling = false;
    if (this.animationFrame) {
      this.cancelNextFrame();
      this.currentStopFrames = 0;
    }
    this.dispatchEvent('scroll:stop');
  },

  cancelNextFrame: function() {
    cancelAnimationFrame(this.nextFrameID);
  },

  dispatchEvent: function(type, eventObject) {
    eventObject = eventObject || this.getAttributes();

    // if (this.lastEvent.type === type && this.lastEvent.scrollY === eventObject.scrollY && this.lastEvent.scrollX === eventObject.scrollX) {
    //   return;
    // }

    // this.lastEvent = {
    //   type: type,
    //   scrollY: eventObject.scrollY,
    //   scrollX: eventObject.scrollX
    // };

    // eventObject.fastScroll = this;
    eventObject.target = this.scrollTarget;
    this.dispatcher.dispatch(type, eventObject);
  },

  on: function(event, listener) {
    return this.dispatcher.addListener(event, listener);
  },

  off: function(event, listener) {
    return this.dispatcher.removeListener(event, listener);
  }
};

module.exports = FastScroll;

},{"delegatejs":1,"eventdispatcher":2}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGVsZWdhdGVqcy9kZWxlZ2F0ZS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGRpc3BhdGNoZXIvc3JjL2luZGV4LmpzIiwic3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgU8O2bmtlIEtsdXRoXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZlxuICogdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpblxuICogdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0b1xuICogdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2ZcbiAqIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbiAqIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTU1xuICogRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SXG4gKiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVJcbiAqIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOXG4gKiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICoqL1xuXG4oZnVuY3Rpb24oZXhwb3J0cykge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGRlbGVnYXRlID0gZnVuY3Rpb24odGFyZ2V0LCBoYW5kbGVyKSB7XG4gICAgICAgIC8vIEdldCBhbnkgZXh0cmEgYXJndW1lbnRzIGZvciBoYW5kbGVyXG4gICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBkZWxlZ2F0ZSBmdW5jdGlvblxuICAgICAgICB2YXIgZm4gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gQ2FsbCBoYW5kbGVyIHdpdGggYXJndW1lbnRzXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlci5hcHBseSh0YXJnZXQsIGFyZ3MpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJldHVybiB0aGUgZGVsZWdhdGUgZnVuY3Rpb24uXG4gICAgICAgIHJldHVybiBmbjtcbiAgICB9O1xuXG5cbiAgICAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSA/IChtb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlKSA6ICh0eXBlb2YgZGVmaW5lICE9IFwidW5kZWZpbmVkXCIgPyAoZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGVsZWdhdGU7XG4gICAgfSkpIDogKGV4cG9ydHMuZGVsZWdhdGUgPSBkZWxlZ2F0ZSkpO1xuXG59KSh0aGlzKTtcbiIsIiAndXNlIHN0cmljdCc7XG5cbiBmdW5jdGlvbiBpc0VtcHR5KG9iaikge1xuICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSl7XG4gICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9XG4gICB9XG4gICByZXR1cm4gdHJ1ZTtcbiB9XG5cbnZhciBfaW5zdGFuY2VNYXAgPSB7fTtcblxuIHZhciBFdmVudERpc3BhdGNoZXIgPSBmdW5jdGlvbigpIHtcbiAgIHRoaXMuX2V2ZW50TWFwID0ge307XG4gICB0aGlzLl9kZXN0cm95ZWQgPSBmYWxzZTtcbiB9O1xuXG4gRXZlbnREaXNwYXRjaGVyLmdldEluc3RhbmNlID0gZnVuY3Rpb24oa2V5KXtcbiAgaWYoIWtleSl7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdrZXkgbXVzdCBiZScpO1xuICB9XG4gIHJldHVybiBfaW5zdGFuY2VNYXBba2V5XSB8fCAoX2luc3RhbmNlTWFwW2tleV0gPSAgbmV3IEV2ZW50RGlzcGF0Y2hlcigpKTtcbiB9O1xuXG5cbiBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGxpc3RlbmVyKSB7XG4gICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcihldmVudCk7XG4gICBpZiAoIWxpc3RlbmVycykge1xuICAgICB0aGlzLl9ldmVudE1hcFtldmVudF0gPSBbbGlzdGVuZXJdO1xuICAgICByZXR1cm4gdHJ1ZTtcbiAgIH1cblxuICAgaWYgKGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgICByZXR1cm4gdHJ1ZTtcbiAgIH1cbiAgIHJldHVybiBmYWxzZTtcbiB9O1xuXG4gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lck9uY2UgPSBmdW5jdGlvbihldmVudCwgbGlzdGVuZXIpIHtcbiAgIHZhciBzID0gdGhpcztcbiAgIHZhciBmMiA9IGZ1bmN0aW9uKCkge1xuICAgICBzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmMik7XG4gICAgIHJldHVybiBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgfTtcbiAgIHJldHVybiB0aGlzLmFkZExpc3RlbmVyKGV2ZW50LCBmMik7XG4gfTtcblxuIEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgbGlzdGVuZXIpIHtcblxuICBpZih0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcihldmVudCk7XG4gIH1cblxuICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuZ2V0TGlzdGVuZXIoZXZlbnQpO1xuICAgaWYgKGxpc3RlbmVycykge1xuICAgICB2YXIgaSA9IGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgaWYgKCFsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICBkZWxldGUodGhpcy5fZXZlbnRNYXBbZXZlbnRdKTtcbiAgICAgICB9XG4gICAgICAgcmV0dXJuIHRydWU7XG4gICAgIH1cbiAgIH1cbiAgIHJldHVybiBmYWxzZTtcbiB9O1xuXG4gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcihldmVudCk7XG4gICBpZiAobGlzdGVuZXJzKSB7XG4gICAgIHRoaXMuX2V2ZW50TWFwW2V2ZW50XS5sZW5ndGggPSAwO1xuICAgICBkZWxldGUodGhpcy5fZXZlbnRNYXBbZXZlbnRdKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgIH1cbiAgIHJldHVybiBmYWxzZTtcbiB9O1xuXG4gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICByZXR1cm4gdGhpcy5nZXRMaXN0ZW5lcihldmVudCkgIT09IG51bGw7XG4gfTtcblxuIEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICByZXR1cm4gKHRoaXMuX2V2ZW50TWFwICE9PSBudWxsICYmIHRoaXMuX2V2ZW50TWFwICE9PSB1bmRlZmluZWQgJiYgIWlzRW1wdHkodGhpcy5fZXZlbnRNYXApKTtcbiB9O1xuXG4gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgZXZlbnRPYmplY3QpIHtcbiAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVyKGV2ZW50VHlwZSk7XG5cbiAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgZXZlbnRPYmplY3QgPSBldmVudE9iamVjdCB8fCB7fTtcbiAgICAgZXZlbnRPYmplY3QudHlwZSA9IGV2ZW50VHlwZTtcbiAgICAgZXZlbnRPYmplY3QudGFyZ2V0ID0gZXZlbnRPYmplY3QudGFyZ2V0IHx8IHRoaXM7XG5cbiAgICAgdmFyIGkgPSAtMTtcbiAgICAgd2hpbGUgKCsraSA8IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICBsaXN0ZW5lcnNbaV0oZXZlbnRPYmplY3QpO1xuICAgICB9XG4gICAgIHJldHVybiB0cnVlO1xuICAgfVxuICAgcmV0dXJuIGZhbHNlO1xuIH07XG5cbiBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLmdldExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgIHZhciByZXN1bHQgPSB0aGlzLl9ldmVudE1hcCA/IHRoaXMuX2V2ZW50TWFwW2V2ZW50XSA6IG51bGw7XG4gICByZXR1cm4gKHJlc3VsdCB8fCBudWxsKTtcbiB9O1xuXG4gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICBpZiAodGhpcy5fZXZlbnRNYXApIHtcbiAgICAgZm9yICh2YXIgaSBpbiB0aGlzLl9ldmVudE1hcCkge1xuICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXIoaSk7XG4gICAgIH1cbiAgICAgdGhpcy5fZXZlbnRNYXAgPSBudWxsO1xuICAgfVxuICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiB9O1xuXG5cbiAvL01ldGhvZCBNYXBcbiBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9uID0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5iaW5kID0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcbiBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUudW5iaW5kID0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbiBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9uY2UgPSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9uZSA9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYWRkTGlzdGVuZXJPbmNlO1xuIEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUudHJpZ2dlciA9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudCA9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2g7XG5cbiBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RGlzcGF0Y2hlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAqIEZhc3RTY3JvbGxcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2Vua2VrbHV0aC9mYXN0c2Nyb2xsXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0IFPDtm5rZSBLbHV0aFxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2RlbGVnYXRlanMnKTtcbnZhciBFdmVudERpc3BhdGNoZXIgPSByZXF1aXJlKCdldmVudGRpc3BhdGNoZXInKTtcbnZhciBfaW5zdGFuY2VNYXAgPSB7fTtcblxudmFyIEZhc3RTY3JvbGwgPSBmdW5jdGlvbihzY3JvbGxUYXJnZXQsIG9wdGlvbnMpIHtcbiAgc2Nyb2xsVGFyZ2V0ID0gc2Nyb2xsVGFyZ2V0IHx8IHdpbmRvdztcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7IGFuaW1hdGlvbkZyYW1lOiB0cnVlIH07XG4gIHRoaXMuc2Nyb2xsVGFyZ2V0ID0gc2Nyb2xsVGFyZ2V0O1xuICB0aGlzLmluaXQoKTtcbn07XG5cbkZhc3RTY3JvbGwuX19faW5zdGFuY2VNYXAgPSBfaW5zdGFuY2VNYXA7XG5cbkZhc3RTY3JvbGwuZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbihzY3JvbGxUYXJnZXQsIG9wdGlvbnMpIHtcbiAgc2Nyb2xsVGFyZ2V0ID0gc2Nyb2xsVGFyZ2V0IHx8IHdpbmRvdztcbiAgcmV0dXJuIF9pbnN0YW5jZU1hcFtzY3JvbGxUYXJnZXRdIHx8IChfaW5zdGFuY2VNYXBbc2Nyb2xsVGFyZ2V0XSA9IG5ldyBGYXN0U2Nyb2xsKHNjcm9sbFRhcmdldCwgb3B0aW9ucykpO1xufTtcblxuRmFzdFNjcm9sbC5oYXNJbnN0YW5jZSA9IGZ1bmN0aW9uKHNjcm9sbFRhcmdldCkge1xuICByZXR1cm4gX2luc3RhbmNlTWFwW3Njcm9sbFRhcmdldF0gIT09IHVuZGVmaW5lZDtcbn07XG5cblxuRmFzdFNjcm9sbC5oYXNTY3JvbGxUYXJnZXQgPSBGYXN0U2Nyb2xsLmhhc0luc3RhbmNlO1xuXG5GYXN0U2Nyb2xsLmNsZWFySW5zdGFuY2UgPSBmdW5jdGlvbihzY3JvbGxUYXJnZXQpIHtcbiAgc2Nyb2xsVGFyZ2V0ID0gc2Nyb2xsVGFyZ2V0IHx8IHdpbmRvdztcbiAgaWYgKEZhc3RTY3JvbGwuaGFzSW5zdGFuY2Uoc2Nyb2xsVGFyZ2V0KSkge1xuICAgIEZhc3RTY3JvbGwuZ2V0SW5zdGFuY2Uoc2Nyb2xsVGFyZ2V0KS5kZXN0cm95KCk7XG4gICAgZGVsZXRlKF9pbnN0YW5jZU1hcFtzY3JvbGxUYXJnZXRdKTtcbiAgfVxufTtcblxuRmFzdFNjcm9sbC5VUCA9ICd1cCc7XG5GYXN0U2Nyb2xsLkRPV04gPSAnZG93bic7XG5GYXN0U2Nyb2xsLk5PTkUgPSAnbm9uZSc7XG5GYXN0U2Nyb2xsLkxFRlQgPSAnbGVmdCc7XG5GYXN0U2Nyb2xsLlJJR0hUID0gJ3JpZ2h0JztcblxuRmFzdFNjcm9sbC5wcm90b3R5cGUgPSB7XG5cbiAgZGVzdHJveWVkOiBmYWxzZSxcbiAgc2Nyb2xsWTogMCxcbiAgc2Nyb2xsWDogMCxcbiAgbGFzdFNjcm9sbFk6IDAsXG4gIGxhc3RTY3JvbGxYOiAwLFxuICB0aW1lb3V0OiAwLFxuICBzcGVlZFk6IDAsXG4gIHNwZWVkWDogMCxcbiAgc3RvcEZyYW1lczogNSxcbiAgY3VycmVudFN0b3BGcmFtZXM6IDAsXG4gIGZpcnN0UmVuZGVyOiB0cnVlLFxuICBhbmltYXRpb25GcmFtZTogdHJ1ZSxcbiAgbGFzdEV2ZW50OiB7XG4gICAgdHlwZTogbnVsbCxcbiAgICBzY3JvbGxZOiAwLFxuICAgIHNjcm9sbFg6IDBcbiAgfSxcblxuICBzY3JvbGxpbmc6IGZhbHNlLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdpbml0Jyk7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IEV2ZW50RGlzcGF0Y2hlcigpO1xuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uRnJhbWU7XG4gICAgdGhpcy51cGRhdGVTY3JvbGxQb3NpdGlvbiA9ICh0aGlzLnNjcm9sbFRhcmdldCA9PT0gd2luZG93IC8qfHwgdGhpcy5zY3JvbGxUYXJnZXQgPT09IGRvY3VtZW50LmJvZHkqLyApID8gZGVsZWdhdGUodGhpcywgdGhpcy51cGRhdGVXaW5kb3dTY3JvbGxQb3NpdGlvbikgOiBkZWxlZ2F0ZSh0aGlzLCB0aGlzLnVwZGF0ZUVsZW1lbnRTY3JvbGxQb3NpdGlvbik7XG4gICAgdGhpcy51cGRhdGVTY3JvbGxQb3NpdGlvbigpO1xuICAgIHRoaXMudHJpZ2dlciA9IHRoaXMuZGlzcGF0Y2hFdmVudDtcbiAgICB0aGlzLmxhc3RFdmVudC5zY3JvbGxZID0gdGhpcy5zY3JvbGxZO1xuICAgIHRoaXMubGFzdEV2ZW50LnNjcm9sbFggPSB0aGlzLnNjcm9sbFg7XG4gICAgdGhpcy5vblNjcm9sbCA9IGRlbGVnYXRlKHRoaXMsIHRoaXMub25TY3JvbGwpO1xuICAgIHRoaXMub25OZXh0RnJhbWUgPSBkZWxlZ2F0ZSh0aGlzLCB0aGlzLm9uTmV4dEZyYW1lKTtcbiAgICB0aGlzLnNjcm9sbFRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsLCBmYWxzZSk7XG4gIH0sXG5cbiAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgdGhpcy5jYW5jZWxOZXh0RnJhbWUoKTtcbiAgICAgIHRoaXMuc2Nyb2xsVGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGwpO1xuICAgICAgdGhpcy5kaXNwYXRjaGVyLm9mZigpO1xuICAgICAgdGhpcy5kaXNwYXRjaGVyID0gbnVsbDtcbiAgICAgIHRoaXMub25TY3JvbGwgPSBudWxsO1xuICAgICAgdGhpcy51cGRhdGVTY3JvbGxQb3NpdGlvbiA9IG51bGw7XG4gICAgICB0aGlzLm9uTmV4dEZyYW1lID0gbnVsbDtcbiAgICAgIHRoaXMuc2Nyb2xsVGFyZ2V0ID0gbnVsbDtcbiAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0QXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjcm9sbFk6IHRoaXMuc2Nyb2xsWSxcbiAgICAgIHNjcm9sbFg6IHRoaXMuc2Nyb2xsWCxcbiAgICAgIHNwZWVkWTogdGhpcy5zcGVlZFksXG4gICAgICBzcGVlZFg6IHRoaXMuc3BlZWRYLFxuICAgICAgYW5nbGU6IDAsXG4gICAgICBkaXJlY3Rpb25ZOiB0aGlzLnNwZWVkWSA9PT0gMCA/IEZhc3RTY3JvbGwuTk9ORSA6ICgodGhpcy5zcGVlZFkgPiAwKSA/IEZhc3RTY3JvbGwuVVAgOiBGYXN0U2Nyb2xsLkRPV04pLFxuICAgICAgZGlyZWN0aW9uWDogdGhpcy5zcGVlZFggPT09IDAgPyBGYXN0U2Nyb2xsLk5PTkUgOiAoKHRoaXMuc3BlZWRYID4gMCkgPyBGYXN0U2Nyb2xsLlJJR0hUIDogRmFzdFNjcm9sbC5MRUZUKVxuICAgIH07XG4gIH0sXG5cbiAgdXBkYXRlV2luZG93U2Nyb2xsUG9zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZIHx8IHdpbmRvdy5wYWdlWU9mZnNldCB8fCAwO1xuICAgIHRoaXMuc2Nyb2xsWCA9IHdpbmRvdy5zY3JvbGxYIHx8IHdpbmRvdy5wYWdlWE9mZnNldCB8fCAwO1xuICB9LFxuXG4gIHVwZGF0ZUVsZW1lbnRTY3JvbGxQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zY3JvbGxZID0gdGhpcy5zY3JvbGxUYXJnZXQuc2Nyb2xsVG9wO1xuICAgIHRoaXMuc2Nyb2xsWCA9IHRoaXMuc2Nyb2xsVGFyZ2V0LnNjcm9sbExlZnQ7XG4gIH0sXG5cbiAgb25TY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3VycmVudFN0b3BGcmFtZXMgPSAwO1xuICAgIGlmICh0aGlzLmZpcnN0UmVuZGVyKSB7XG4gICAgICB0aGlzLmZpcnN0UmVuZGVyID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5zY3JvbGxZID4gMSkge1xuICAgICAgICB0aGlzLnVwZGF0ZVNjcm9sbFBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgnc2Nyb2xsOnByb2dyZXNzJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc2Nyb2xsaW5nKSB7XG4gICAgICB0aGlzLnNjcm9sbGluZyA9IHRydWU7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoJ3Njcm9sbDpzdGFydCcpO1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgdGhpcy5uZXh0RnJhbWVJRCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uTmV4dEZyYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgIHRoaXMub25OZXh0RnJhbWUoKTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYub25TY3JvbGxTdG9wKCk7XG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfSxcblxuICBvbk5leHRGcmFtZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy51cGRhdGVTY3JvbGxQb3NpdGlvbigpO1xuXG4gICAgdGhpcy5zcGVlZFkgPSB0aGlzLmxhc3RTY3JvbGxZIC0gdGhpcy5zY3JvbGxZO1xuICAgIHRoaXMuc3BlZWRYID0gdGhpcy5sYXN0U2Nyb2xsWCAtIHRoaXMuc2Nyb2xsWDtcblxuICAgIHRoaXMubGFzdFNjcm9sbFkgPSB0aGlzLnNjcm9sbFk7XG4gICAgdGhpcy5sYXN0U2Nyb2xsWCA9IHRoaXMuc2Nyb2xsWDtcblxuICAgIGlmICh0aGlzLmFuaW1hdGlvbkZyYW1lICYmIHRoaXMuc2Nyb2xsaW5nICYmIHRoaXMuc3BlZWRZID09PSAwICYmICh0aGlzLmN1cnJlbnRTdG9wRnJhbWVzKysgPiB0aGlzLnN0b3BGcmFtZXMpKSB7XG4gICAgICB0aGlzLm9uU2Nyb2xsU3RvcCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgnc2Nyb2xsOnByb2dyZXNzJyk7XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb25GcmFtZSkge1xuICAgICAgdGhpcy5uZXh0RnJhbWVJRCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uTmV4dEZyYW1lKTtcbiAgICB9XG4gIH0sXG5cbiAgb25TY3JvbGxTdG9wOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjcm9sbGluZyA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICB0aGlzLmNhbmNlbE5leHRGcmFtZSgpO1xuICAgICAgdGhpcy5jdXJyZW50U3RvcEZyYW1lcyA9IDA7XG4gICAgfVxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgnc2Nyb2xsOnN0b3AnKTtcbiAgfSxcblxuICBjYW5jZWxOZXh0RnJhbWU6IGZ1bmN0aW9uKCkge1xuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMubmV4dEZyYW1lSUQpO1xuICB9LFxuXG4gIGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uKHR5cGUsIGV2ZW50T2JqZWN0KSB7XG4gICAgZXZlbnRPYmplY3QgPSBldmVudE9iamVjdCB8fCB0aGlzLmdldEF0dHJpYnV0ZXMoKTtcblxuICAgIC8vIGlmICh0aGlzLmxhc3RFdmVudC50eXBlID09PSB0eXBlICYmIHRoaXMubGFzdEV2ZW50LnNjcm9sbFkgPT09IGV2ZW50T2JqZWN0LnNjcm9sbFkgJiYgdGhpcy5sYXN0RXZlbnQuc2Nyb2xsWCA9PT0gZXZlbnRPYmplY3Quc2Nyb2xsWCkge1xuICAgIC8vICAgcmV0dXJuO1xuICAgIC8vIH1cblxuICAgIC8vIHRoaXMubGFzdEV2ZW50ID0ge1xuICAgIC8vICAgdHlwZTogdHlwZSxcbiAgICAvLyAgIHNjcm9sbFk6IGV2ZW50T2JqZWN0LnNjcm9sbFksXG4gICAgLy8gICBzY3JvbGxYOiBldmVudE9iamVjdC5zY3JvbGxYXG4gICAgLy8gfTtcblxuICAgIC8vIGV2ZW50T2JqZWN0LmZhc3RTY3JvbGwgPSB0aGlzO1xuICAgIGV2ZW50T2JqZWN0LnRhcmdldCA9IHRoaXMuc2Nyb2xsVGFyZ2V0O1xuICAgIHRoaXMuZGlzcGF0Y2hlci5kaXNwYXRjaCh0eXBlLCBldmVudE9iamVjdCk7XG4gIH0sXG5cbiAgb246IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoZXIuYWRkTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgfSxcblxuICBvZmY6IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoZXIucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGYXN0U2Nyb2xsO1xuIl19
