/*global exports*/
(function(exports) {

  /** @namespace */
  World = (function() {
    
    /**
     * Creates a new World.
     *
     * @contructor
     */
    function World(opt_options) {

      var me = this, options = opt_options || {};
      
      this.c = options.c || this.c;
      this.gravity = options.gravity || this.gravity;
      this.wind =  options.wind || this.wind;
      this.location = options.location || this.location;
      this.showStats = options.showStats || this.showStats;

      this.width = $(window).width();
      this.height = $(window).height();
      this.mouseX = this.width/2;
      this.mouseY = this.height/2;
      this.isTopDown = true;
      this.compassHeading = 0;
      this.compassAccuracy = 0;
      this.isDeviceMotion = false;
      
      if (this.showStats) {
        this.createStats();
      }

      $(document).mousemove(function(e) {
        me.mouseX = e.pageX;
        me.mouseY = e.pageY;        
      });
      
      if (window.addEventListener && this.isDeviceMotion) {
        window.addEventListener("devicemotion", function(e) { // listens for device motion events
          me.devicemotion.call(me, e);
        }, false);
      }

      if (window.addEventListener && this.isDeviceOrientation) {
        window.addEventListener("deviceorientation", function(e) { // listens for device orientation events
          me.deviceorientation.call(me, e);
        }, false);
      }

      $(window).bind("resize", function (e) { // listens for window resize
        me.resize.call(me);
      });
      
    };
    
    /**
     * Configures a new World.
     */
    World.prototype.configure = function() { // should be called after doc ready()
      this.el = document.body;
      this.el.style.width = this.width + "px";
      this.el.style.height = this.height + "px";
    };

    /**
     * Updates a world instance with passed arguments.
     * Typically called to change the window's default size or
     * change the world's style.
     *
     * @param {Object} props A hash of properties to update.
     */   
    World.prototype.update = function(props) {
      var i, key, props = Interface.getDataType(props) === "object" ? props : {}; 
      for (key in props) {
        if (props.hasOwnProperty(key)) {
          this[key] = props[key];
        }
      }

      if (props.el) { // if updating the element; update the width and height
        this.width = parseInt(this.el.style.width.replace("px", ""));
        this.height = parseInt(this.el.style.height.replace("px", ""));
      }

      if (props.style) {
        for (i in props.style) {
          if (props.style.hasOwnProperty(i)) {
            this.el.style[i] = props.style[i];
          }
        }
      }
      if (props.showStats) {
        this.createStats();
      }
    };
    
    /**
     * Called from a window resize event, resize() repositions all Flora elements relative
     * to the new window size. Also, if the world is the document.body, resets the body's
     * width and height attributes. 
     */ 
    World.prototype.resize = function() {

      var i, max, elementLoc, controlCamera,
        windowWidth = $(window).width(),
        windowHeight = $(window).height();
      
      // check of any elements control the camera
      for (i = 0, max = Flora.elements.length; i < max; i += 1) {
        if (Flora.elements[i].controlCamera) {
          controlCamera = true;
          break;
        }
      }

      // loop thru elements
      if (!controlCamera) {
        for (i = 0, max = Flora.elements.length; i < max; i += 1) {
          
          elementLoc = Flora.elements[i].location; // recalculate location
          
          elementLoc.x = windowWidth * (elementLoc.x/this.width);
          elementLoc.y = windowHeight * (elementLoc.y/this.height);
          
        }

        if (this.el === document.body) {
          this.width = windowWidth;
          this.height = windowHeight;
        }
      }
    };
    
    /**
     * Called from a window devicemotion event, updates the world's gravity
     * relative to the accelerometer's values.
     */ 
    World.prototype.devicemotion = function() {
      var e = arguments[0];
      if (window.orientation === 0) {
        if (this.isTopDown) {
          this.gravity = PVector.create(e.accelerationIncludingGravity.x, e.accelerationIncludingGravity.y * -1); // portrait
        } else {
          this.gravity = PVector.create(e.accelerationIncludingGravity.x, (e.accelerationIncludingGravity.z + 7.5) * 2); // portrait 45 degree angle
        }
      } else if (window.orientation === -90) {
        this.gravity = PVector.create(e.accelerationIncludingGravity.y, e.accelerationIncludingGravity.x );
      } else {
        this.gravity = PVector.create(e.accelerationIncludingGravity.y * -1, e.accelerationIncludingGravity.x * -1);
      }

      /*if (World.showDeviceOrientation) {
        $(".console").val("orientation: " + window.orientation + " x: " + e.accelerationIncludingGravity.x.toFixed(2) + " y: " + e.accelerationIncludingGravity.y.toFixed(2) + " z: " + e.accelerationIncludingGravity.z.toFixed(2));
      }*/
    };
    
    /**
     * Called from a window deviceorientation event, updates the world's compass values.
     *
     * @param {Object} e An event object passed from the event listener.
     */ 
    World.prototype.deviceorientation = function(e) {
      var compassHeading = e.webkitCompassHeading,
        compassAccuracy = e.webkitCompassAccuracy;
    
      this.compassAccuracy = compassAccuracy;
      this.compassHeading = compassHeading;
    
      if (this.showCompassHeading) {
        $(".console").val("heading: " + compassHeading.toFixed(2) + " accuracy: +/- " + compassAccuracy);
      }
    };
    
    /**
     * Creates a new instance of mr doob's stats monitor.
     */ 
    World.prototype.createStats = function() {
      
      stats = new Stats();

      stats.getDomElement().style.position = 'absolute'; // Align top-left
      stats.getDomElement().style.left = '0px';
      stats.getDomElement().style.top = '0px';
      stats.getDomElement().id = 'stats';

      document.body.appendChild(stats.getDomElement());
    
      this.statsInterval = setInterval(function() {
          stats.update();
      }, 1000 / 60);
    };

    /**
     * Destroys an instance of mr doob's stats monitor.
     */     
    World.prototype.destroyStats = function() {
      clearInterval(this.statsInterval);
      document.body.removeChild(document.getElementById('stats'));
    }

    /**
     * Called every frame, step() updates the world's properties.
     */ 
    World.prototype.step = function() {};
    
    /**
     * Called every frame, draw() renders the world.
     */ 
    World.prototype.draw = function() {
      var x = this.location.x,
        y = this.location.y,
        s = 1,
        a = 0,
        o = 1,
        w = this.width,
        h = this.height,
        style = this.el.style;

      if (Modernizr.csstransforms3d) { //  && Modernizr.touch 
        style.webkitTransform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0) rotate(' + a + 'deg) scaleX(' + s + ') scaleY(' + s + ')';
        style.MozTransform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0) rotate(' + a + 'deg) scaleX(' + s + ') scaleY(' + s + ')';  
        style.OTransform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0) rotate(' + a + 'deg) scaleX(' + s + ') scaleY(' + s + ')';        
        style.opacity = o;
        style.width = w + 'px';
        style.height = h + 'px';
      } else if (Modernizr.csstransforms) {
        style.webkitTransform = 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + a + 'deg) scaleX(' + s + ') scaleY(' + s + ')';
        style.MozTransform = 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + a + 'deg) scaleX(' + s + ') scaleY(' + s + ')';  
        style.OTransform = 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + a + 'deg) scaleX(' + s + ') scaleY(' + s + ')';        
        style.opacity = o;
        style.width = w + 'px';
        style.height = h + 'px';
      } else {
        $(this.el).css({
          'position': 'absolute',
          'left': x + 'px',
          'top': y + 'px',
          'width': w + 'px',
          'height': h + 'px',
          'opacity': o
        });
      }
    };
    
    /**
     * Set to true to render mr doob stats on startup. default: false
     */ 
    World.prototype.showStats = false;

    /**
     * Holds a reference to the interval used by mr doob's stats monitor. default: 0
     */
    World.prototype.statsInterval = 0;

    /**
     * Increments each frame. default: 0
     */   
    World.prototype.clock = 0;

    /**
     * Coefficient of friction. default: 0.01
     */ 
    World.prototype.c = 0.01;

    /**
     * Gravity. default: {x: 0, y: 1}
     */     
    World.prototype.gravity = PVector.create(0, 1);

    /**
     * Wind. default: {x: 0, y: 0}
     */ 
    World.prototype.wind = PVector.create(0, 0);

    /**
     * Initial location. default: {x: 0, y: 0}
     */
    World.prototype.location = PVector.create(0, 0);
    
    return World;
    
  }());
  exports.World = World;
}(exports));