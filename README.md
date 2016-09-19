# ScrollFeatures
### performant custom scroll events and custom scroll propertys

ScrollFeatures gives you custom scroll events like scroll:start, scroll:progress and scroll:end for better event / action handling
the events are triggered only in animation frames for the most performant way of default DOM manipulation.

further more it adds special propertys to the scroll state :
```
y
x
speedY
speedX
directionY
directionX
```

ScrollFeatures will only be instanciated once for the same scroll target to save memory and optimize the performance.


### Dependencies
none!

### Browser support
IE >= 9, *

### install
```
npm install scrollfeatures
```
### demo (will be updated soon)
https://rawgit.com/soenkekluth/scrollfeatures/master/demo/index.html
please see the console.logs for now

### js
```javascript
var ScrollFeatures = require('scrollfeatures');
var scrollFeatures = new ScrollFeatures(); // takes window as scroll target
// or
new ScrollFeatures(document.querySelector('yourElement'))


scrollFeatures.on('scroll:down', function(event) {
  console.log('========== scroll:down =============');
});

scrollFeatures.on('scroll:up', function(event) {
  console.log('========== scroll:up =============');
});

scrollFeatures.on('scroll:max', function(event) {
  console.log('========== scroll:max =============');
});

scrollFeatures.on('scroll:min', function(event) {
  console.log('========== scroll:min =============');
});

scrollFeatures.on('scroll:start', function(event) {
  console.log('scroll:start     y:' + scrollFeatures.y + '  direction: ' + scrollFeatures.directionY+' ('+ ScrollFeatures.directionToString(scrollFeatures.directionY)+')')
});

scrollFeatures.on('scroll:progress', function(event) {
  console.log('scroll:progress  y:' + scrollFeatures.y + '  direction: ' + scrollFeatures.directionY+' ('+ ScrollFeatures.directionToString(scrollFeatures.directionY)+')')
});

scrollFeatures.on('scroll:stop', function(event) {
  console.log('scroll:stop      y:' + scrollFeatures.y + '  direction: ' + scrollFeatures.directionY+' ('+ ScrollFeatures.directionToString(scrollFeatures.directionY)+')')
});

```
