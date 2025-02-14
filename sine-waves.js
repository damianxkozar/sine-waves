/*!
 _______ _____ __   _ _______      _  _  _ _______ _    _ _______ _______
 |______   |   | \  | |______      |  |  | |_____|  \  /  |______ |______
 ______| __|__ |  \_| |______      |__|__| |     |   \/   |______ ______|

 sine-waves v0.3.0 <https://github.com/isuttell/sine-waves>
 Contributor(s): Isaac Suttell <isaac@isaacsuttell.com>
 Last Build: 2015-08-12
 Do not edit this file. It is created from the src/ folder.
*/
(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && typeof define.amd === 'object') {
    define([], function() {
      return factory(root);
    });
  } else {
    root.SineWaves = factory(root);
  }
})(this, function() {
  'use strict';

  /************************************************
   * @file  Polyfills for older browsers
   * @author  Isaac Suttell
   ************************************************/

  /**
   * Bind polyfill
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
   */
  /* istanbul ignore next */
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1);
      var fToBind = this;
      var fNOP = function() {};
      var fBound = function() {
        return fToBind.apply(this instanceof fNOP &&
            oThis ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP(); // jshint ignore:line

      return fBound;
    };
  }

  /**
   * Request Animation Polyfill
   * https://gist.github.com/paulirish/1579671
   *
   * @type {Array}
   */
  /* istanbul ignore next */
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  /* istanbul ignore next */
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
        window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  /* istanbul ignore next */
  if (!window.requestAnimationFrame) {
    var lastFrameTime = 0;
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastFrameTime));
      var id = window.setTimeout(function() {
            callback(currTime + timeToCall);
          },
          timeToCall);
      lastFrameTime = currTime + timeToCall;
      return id;
    };
  }

  /* istanbul ignore next */
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

  /************************************************
   * @file  Constants
   * @author  Isaac Suttell
   ************************************************/

  /**
   * For radian conversion
   *
   * @constant
   * @type    {Number}
   */
  var PI180 = Math.PI / 180;

  /**
   * Twice of PI
   *
   * @constant
   * @type {Number}
   */
  var PI2 = Math.PI * 2;

  /**
   * Half of PI
   *
   * @constant
   * @type {Number}
   */
  var HALFPI = Math.PI / 2;

  /************************************************
   * @file  General utility functions
   * @author  Isaac Suttell
   ************************************************/

  /**
   * Utilities wrapper
   *
   * @type    {Object}
   */
  var Utilities = {};

  /**
   * Checks to see if a var is a speficied type
   *
   * @param  {Mixed}  obj  var to check
   *
   * @return {Boolean}
   */
  var isType = Utilities.isType = function(obj, type) {
    var result = {}.toString.call(obj).toLowerCase();
    return result === '[object ' + type.toLowerCase() + ']';
  };

  /**
   * Checks to see if a var is a function
   *
   * @alias  isType
   * @param  {Mixed}  fn  var to check
   *
   * @return {Boolean}
   */
  var isFunction = Utilities.isFunction = function(fn) {
    return isType(fn, 'function');
  };

  /**
   * Checks to see if a var is a string
   *
   * @alias  isType
   * @param  {Mixed}  str  var to check
   *
   * @return {Boolean}
   */
  var isString = Utilities.isString = function(str) {
    return isType(str, 'string');
  };

  /**
   * Checks to see if a var is a number
   *
   * @alias  isType
   * @param  {Mixed}  num  var to check
   *
   * @return {Boolean}
   */
  var isNumber = Utilities.isNumber = function(num) {
    return isType(num, 'number');
  };

  /**
   * Create a clone of an object
   *
   * @param  {Object} src Object to clone
   *
   * @return {Object}
   */
  var shallowClone = Utilities.shallowClone = function(src) {
    var dest = {};
    for (var i in src) {
      if (src.hasOwnProperty(i)) {
        dest[i] = src[i];
      }
    }
    return dest;
  };

  /**
   * Basic Extend Function
   *
   * @param     {Object}    dest   object to fill
   * @param     {Object}    src    object to copy
   *
   * @return    {Object}
   */
  var defaults = Utilities.defaults = function(dest, src) {
    if (!isType(src, 'object')) { src = {}; }
    var clone = shallowClone(dest);
    for (var i in src) {
      if (src.hasOwnProperty(i)) {
        clone[i] = src[i];
      }
    }
    return clone;
  };

  /**
   * Convert degress to radians for rotation function
   *
   * @param     {Number}    degrees
   *
   * @return    {Number}
   */
  var degreesToRadians = Utilities.degreesToRadians = function(degrees) {
    if (!isType(degrees, 'number')) {
      throw new TypeError('Degrees is not a number');
    }
    return degrees * PI180;
  };

  /**
   * You can either directly specify a easing function, use a built in function
   * or default to the basic SineInOut
   *
   * @param     {Object}   obj     Object to search in
   * @param     {Mixed}    name    String || Function
   * @param     {String}   def     Default funciton
   *
   * @return    {Function}
   */
  var getFn = Utilities.getFn = function(obj, name, def) {
    if (isFunction(name)) {
      return name;
    } else if (isString(name) && isFunction(obj[name.toLowerCase()])) {
      return obj[name.toLowerCase()];
    } else {
      return obj[def];
    }
  };

  /************************************************
   * @file  Left to right easing functions
   * @author Isaac Suttell
   ************************************************/

  /**
   * This holds all of the easing objects and can be added to by the user
   *
   * @type    {Object}
   */
  var Ease = {};

  /**
   * Do not apply any easing
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  Ease.linear = function(percent, amplitude) {
    return amplitude;
  };

  /**
   * Easing function to control how string each wave is from
   * left to right
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  Ease.sinein = function(percent, amplitude) {
    return amplitude * (Math.sin(percent * Math.PI - HALFPI) + 1) * 0.5;
  };

  /**
   * Easing function to control how string each wave is from
   * left to right
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  Ease.sineout = function(percent, amplitude) {
    return amplitude * (Math.sin(percent * Math.PI + HALFPI) + 1) * 0.5;
  };

  /**
   * Easing function to control how string each wave is from
   * left to right
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  Ease.sineinout = function(percent, amplitude) {
    return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.5;
  };

  /************************************************
   * @file  Sine Wave functions
   * @author Isaac Suttell
   ************************************************/

  /**
   * Holds the different types of waves
   *
   * @type    {Object}
   */
  var Waves = {};

  /**
   * Default Sine Waves
   *
   * @param    {Number}    x
   */
  Waves.sine = function(x) {
    return Math.sin(x);
  };

  /**
   * Alias for Sine
   *
   * @alias
   * @type    {Function}
   */
  Waves.sin = Waves.sine;

  /**
   * Sign polyfill
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
   *
   * @param     {Number}    x
   *
   * @return    {Number}
   */
  Waves.sign = function(x) {
    x = +x; // convert to a number
    if (x === 0 || isNaN(x)) {
      return x;
    }
    return x > 0 ? 1 : -1;
  };

  /**
   * Square Waves
   *
   * @param    {Number}    x
   */
  Waves.square = function(x) {
    return Waves.sign(Math.sin(x * PI2));
  };

  /**
   * Sawtooth Waves
   *
   * @param    {Number}    x
   */
  Waves.sawtooth = function(x) {
    return (x - Math.floor(x + 0.5)) * 2;
  };

  /**
   * Triangle Waves
   *
   * @param    {Number}    x
   */
  Waves.triangle = function(x) {
    return Math.abs(Waves.sawtooth(x));
  };

  /************************************************
   * @file  Constructor and animation controller
   * @author  Isaac Suttell
   ************************************************/

  /**
   * Generates multiple customizable animated sines waves
   * using a canvas element. Supports retina displays and
   * limited mobile support
   */
  function SineWaves(options) {
    // Save a reference
    this.options = Utilities.defaults(this.options, options);

    // Make sure we have a cancas
    this.el = this.options.el;
    delete this.options.el;
    if (!this.el) {
      throw 'No Canvas Selected';
    }

    // Setup the context for reference
    this.ctx = this.el.getContext('2d');

    // Do we have any waves
    this.waves = this.options.waves;
    delete this.options.waves;
    if (!this.waves || !this.waves.length) {
      throw 'No waves specified';
    }

    // DPI
    this.dpr = window.devicePixelRatio || 1;

    // Setup canvas width/heights
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));

    // If the user supplied a resize event or init call it
    this.setupUserFunctions();

    // Setup Easing
    this.easeFn = Utilities.getFn(Ease, this.options.ease, 'linear');

    // Set the canvas rotation
    this.rotation = Utilities.degreesToRadians(this.options.rotate);

    // Should we start running?
    if (Utilities.isType(this.options.running, 'boolean')) {
      this.running = this.options.running;
    }

    // Assign wave functions
    this.setupWaveFns();

    // Start the magic
    this.loop();
  }

  /**
   * Default Options
   *
   * @type {Object}
   */
  SineWaves.prototype.options = {
    speed: 10,
    rotate: 0,
    ease: 'Linear',
    wavesWidth: '95%'
  };

  /**
   * Get the user wave function or one of the built in functions
   */
  SineWaves.prototype.setupWaveFns = function() {
    var index = -1;
    var length = this.waves.length;
    while (++index < length) {
      this.waves[index].waveFn = Utilities.getFn(Waves, this.waves[index].type, 'sine');
    }
  };

  /**
   * Sets up the user resize event and the initialize event
   */
  SineWaves.prototype.setupUserFunctions = function() {
    // User Resize Function
    if (Utilities.isFunction(this.options.resizeEvent)) {
      this.options.resizeEvent.call(this);
      window.addEventListener('resize', this.options.resizeEvent.bind(this));
    }

    // User initialize
    if (Utilities.isFunction(this.options.initialize)) {
      this.options.initialize.call(this);
    }
  };

  /**
   * Takes either pixels or percents and calculates how wide the sine
   * waves should be
   *
   * @param     {Mixed}    value    0, '10px', '90%'
   * @param     {Number}   width    Width for percentages
   *
   * @return    {Number}
   */
  function getWaveWidth(value, width) {
    if (Utilities.isType(value, 'number')) {
      return value;
    }

    value = value.toString();
    if (value.indexOf('%') > -1) {
      value = parseFloat(value);
      if (value > 1) {
        value /= 100;
      }
      return width * value;
    } else if (value.indexOf('px') > -1) {
      return parseInt(value, 10);
    }
  }

  /**
   * Get the height or width from a number, function or fallback
   * to the default client dimension
   *
   * @param    {Mixed}   dimension   This can be a function or number
   *
   * @return   {Number}
   */
  SineWaves.prototype.getDimension = function(dimension) {
    if (Utilities.isNumber(this.options[dimension])) {
      return this.options[dimension];
    } else if (Utilities.isFunction(this.options[dimension])) {
      return this.options[dimension].call(this, this.el);
    } else if (dimension === 'width') {
      return this.el.clientWidth;
    } else if (dimension === 'height') {
      return this.el.clientHeight;
    }
  };

  /**
   * Internal resize event to make the canvas fill the screen
   */
  SineWaves.prototype.updateDimensions = function() {
    // Dimensions
    var width = this.getDimension('width');
    var height = this.getDimension('height');

    // Apply DPR for retina devices
    this.width = this.el.width = width * this.dpr;
    this.height = this.el.height = height * this.dpr;

    // Scale down
    this.el.style.width = width + 'px';
    this.el.style.height = height + 'px';

    // Padding
    this.waveWidth = getWaveWidth(this.options.wavesWidth, this.width);

    // Center it
    this.waveLeft = (this.width - this.waveWidth) / 2;

    // Vertical center
    this.yAxis = this.height / 2;
  };

  /**
   * Clear the canvas so we can redraw
   */
  SineWaves.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  /**
   * Starting time.
   *
   * @type {Number}
   */
  SineWaves.prototype.time = 0;

  /**
   * This updates each of the lines each loop we're running
   *
   * @param  {Number} time (optional) this can be called to
   *                       manually render lines at a certian
   *                       time.
   */
  SineWaves.prototype.update = function(time) {
    this.time = this.time - 0.007;
    if (typeof time === 'undefined') {
      time = this.time;
    }

    var index = -1;
    var length = this.waves.length;

    // Clear Canvas
    this.clear();

    this.ctx.save();

    if (this.rotation > 0) {
      this.ctx.translate(this.width / 2, this.height / 2);
      this.ctx.rotate(this.rotation);
      this.ctx.translate(-this.width / 2, -this.height / 2);
    }

    // Draw each line
    while (++index < length) {
      var timeModifier = this.waves[index].timeModifier || 1;
      this.drawWave(time * timeModifier, this.waves[index]);
    }
    this.ctx.restore();

    index = void 0;
    length = void 0;
  };

  /**
   * Calculate the x, y coordinates of a point in a sine wave
   *
   * @param  {Number} time     Internal time index
   * @param  {Number} position Pixels x poistion
   * @param  {Object} options  Wave options
   *
   * @return {Object}          {x, y}
   */
  SineWaves.prototype.getPoint = function(time, position, options) {
    var x = (time * this.options.speed) + (-options.yAxis + position) / options.wavelength;
    var y = options.waveFn.call(this, x, Waves);

    // Left and Right Sine Easing
    var amplitude = this.easeFn.call(this, position / this.waveWidth, options.amplitude);

    x = position + this.waveLeft;
    y = amplitude * y + options.yAxis;

    return {
      x: x,
      y: y
    };
  };

  /**
   * Draws one line on the canvas
   *
   * @param  {Number} time    current internal clock time
   * @param  {Object} options wave options
   */
  SineWaves.prototype.drawWave = function(time, options) {
    var defaultWave = {
      timeModifier: 1,
      amplitude: 50,
      wavelength: 50,
      segmentLength: 10,
      lineWidth: 1,
      strokeStyle: 'rgba(255, 255, 255, 0.2)',
      type: 'Sine',
      yAxis: this.yAxis
    };

    // Setup defaults
    options = Utilities.defaults(defaultWave, options);

    // Styles
    this.ctx.lineWidth = options.lineWidth * this.dpr;
    this.ctx.strokeStyle = options.strokeStyle;
    this.ctx.lineCap = 'butt';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();

    // Starting Line
    this.ctx.moveTo(0, options.yAxis);
    this.ctx.lineTo(this.waveLeft, options.yAxis);

    var i;
    var point;

    for (i = 0; i < this.waveWidth; i += options.segmentLength) {
      // Calculate where the next point is
      point = this.getPoint(time, i, options);

      // Draw to it
      this.ctx.lineTo(point.x, point.y);

      // Clean up
      point = void 0;
    }

    // Ending Line
    this.ctx.lineTo(this.width, options.yAxis);

    // Clean  up
    i = void 0;
    options = void 0;

    // Stroke it
    this.ctx.stroke();
  };

  /**
   * Animation Status
   *
   * @type {Boolean}
   */
  SineWaves.prototype.running = true;

  /**
   * Animation Loop Controller
   */
  SineWaves.prototype.loop = function() {
    if (this.running === true) {
      this.update();
    }

    window.requestAnimationFrame(this.loop.bind(this));
  };

  /**
   * Make the Wave functions available
   *
   * @type    {Object}
   */
  SineWaves.prototype.Waves = Waves;

  /**
   * Make the Ease functions available
   *
   * @type    {Object}
   */
  SineWaves.prototype.Ease = Ease;
  return SineWaves;
});
