// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var WARP = {

	options: {
		circles: 10,
		radius: 50,
		rotationIncrement: 20,
		offsetCircles: 1,
		videoActive: false
	},

	animation: null,

	c: null,
	ctx: null,
	video: null,

	WIDTH: window.innerWidth,
	HEIGHT: window.innerHeight,

	mouse: { x: null, y: null, down: false },

	img: null,
	imageCounter: 0,
	images: [
		{url: '1.jpg', flickr: 'http://www.flickr.com/photos/ianlucero/7076979089/'},
		{url: '2.jpg', flickr: 'http://www.flickr.com/photos/asterix611/5284089469/'},
		{url: '3.jpg', flickr: 'http://www.flickr.com/photos/felstone/7058947189/'},
		{url: '4.jpg', flickr: 'http://www.flickr.com/photos/chrisschoenbohm/6288866486/'},
		{url: '5.jpg', flickr: 'http://www.flickr.com/photos/clio1789/6932622015/'},
		{url: '6.jpg', flickr: 'http://www.flickr.com/photos/davic/2848707301/'},
		{url: '7.jpg', flickr: 'http://www.flickr.com/photos/luciosantos/7960223222/'},
		{url: '8.jpg', flickr: 'http://www.flickr.com/photos/yannickgar/5486890633/'},
		{url: '9.jpg', flickr: 'http://www.flickr.com/photos/mattharvey1/7486855830/'},
		{url: '10.jpg', flickr: 'http://www.flickr.com/photos/mattharvey1/7486825158/'},
		{url: '11.jpg', flickr: 'http://www.flickr.com/photos/sabeth718/6802988236/'},
		{url: '12.jpg', flickr: 'http://www.flickr.com/photos/lynt/5784300047/'}
	],

	imgURL: function() {
		return this.images[this.imageCounter].url;
	},

	imgWidth: null,
	imgHeight: null,
	imgOffsetX: null,
	imgOffsetY: null,

	rotationCounter: 1,
	activeCircles: 0,

	init: function () {
		this.c = document.getElementById( 'canvas' );
		this.ctx = this.c.getContext( '2d' );
		this.c.width = this.WIDTH;
		this.c.height = this.HEIGHT;

		this.c.addEventListener('mousemove', this.mouseMove, false);
		this.c.addEventListener('mousedown', this.mouseDown, false);
		this.c.addEventListener('mouseup', this.mouseUp, false);
		this.c.addEventListener('mouseout', this.mouseOut, false);

		this.c.addEventListener('touchstart', this.mouseDown, false);
		this.c.addEventListener('touchmove', this.mouseMove, false);
		this.c.addEventListener('touchend', this.mouseUp, false);

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		if (!navigator.getUserMedia) {
			var GUMBtn = document.getElementById('gum');
			GUMBtn.style.display = 'none';
		}

		this.loadImage();

		window.onresize = function () {
			WARP.WIDTH = window.innerWidth;
			WARP.HEIGHT = window.innerHeight;
			WARP.c.width = WARP.WIDTH;
			WARP.c.height = WARP.HEIGHT;

			WARP.reset();
		};
	},

	loadImage: function(url) {
		this.img = new Image();
		this.img.src = this.imgURL();
		this.img.onload = function() {
			
			WARP.drawImage();
		};

		var attributionHolder = document.getElementById('attribution');
		attributionHolder.innerHTML = 'This photo is from <a href="' + this.images[this.imageCounter].flickr + '" target="_blank">Flickr</a>';
	},

	drawImage: function() {
		var c = this.c,
			i = this.img,
			iw = i.width,
			ih = i.height;
		

		this.imgWidth = iw <= this.WIDTH ? iw : this.WIDTH;
		this.imgHeight = ih * (this.imgWidth / iw);

		this.imgOffsetX = this.imgWidth >= this.WIDTH ? 0 : ((this.WIDTH - this.imgWidth) / 2);
		this.imgOffsetY = this.imgHeight >= this.HEIGHT ? 0 : ((this.HEIGHT - this.imgHeight) / 2);

		c.width = this.imgWidth;
		c.height = this.imgHeight;
		c.style.marginLeft = -(this.imgWidth / 2) + 'px';
		c.style.marginTop = -(this.imgHeight / 2) + 'px';

		this.ctx.drawImage(i, 0, 0, this.imgWidth, this.imgHeight);

		window.cancelAnimationFrame(this.animation);
		this.animation = null;

		WARP.draw();
	},

	draw: function () {
		this.animation = requestAnimationFrame( function(){ WARP.draw(); } );

		this.warp();
	},

	warp: function() {
		if (!this.mouse.down && !this.options.videoActive) {
			return;
		}
		var ctx = this.ctx,
			o = this.options,
			maxRadius = o.circles * o.radius,
			rotation = (o.rotationIncrement / 100) * this.rotationCounter,
			HALF_WIDTH = this.imgWidth / 2,
			HALF_HEIGHT = this.imgHeight / 2,
			localRadius,
			xOffset = 0,
			yOffset = 0;

		this.ctx.drawImage(this.img, 0, 0, this.imgWidth, this.imgHeight);

		for (var i = 0; i < this.activeCircles; i++) {
			localRadius = maxRadius - (o.radius * i);

			// if (o.offsetCircles === 1) {
				xOffset = ((this.mouse.x - HALF_WIDTH) / HALF_WIDTH) * o.offsetCircles;
				xOffset = xOffset * localRadius;
				yOffset = ((this.mouse.y - HALF_HEIGHT) / HALF_HEIGHT) * o.offsetCircles;
				yOffset = yOffset * localRadius;
			// }

			ctx.save();
			ctx.beginPath();
			ctx.arc((this.mouse.x - xOffset), (this.mouse.y - yOffset), localRadius, 0, (Math.PI * 2), true);
			ctx.clip();

			// this.clear();
			ctx.translate(this.mouse.x, this.mouse.y);
			ctx.rotate((rotation * i) * Math.PI / 180);

			ctx.drawImage(this.img, -(this.mouse.x), -(this.mouse.y), this.imgWidth, this.imgHeight);

			ctx.restore();
		}

		if (this.mouse.down) {
			this.rotationCounter += 1;

			if (this.activeCircles !== this.options.circles) {
				this.activeCircles += 1;
			}
		}
	},

	getVideo: function () {
		window.URL = window.URL || window.webkitURL;

		navigator.getUserMedia({video: true}, function(localMediaStream) {
			WARP.video = document.getElementById('video');
			WARP.video.autoplay = true;
			WARP.video.width = WARP.WIDTH;
			WARP.video.src = window.URL.createObjectURL(localMediaStream);

			WARP.HEIGHT = WARP.WIDTH * 0.75; // ratio
			WARP.video.height = WARP.HEIGHT;

			WARP.img = WARP.video;
			WARP.imgWidth = WARP.WIDTH;
			WARP.imgHeight = WARP.HEIGHT;

			WARP.options.videoActive = true;

			var attributionHolder = document.getElementById('attribution');
			attributionHolder.innerHTML = 'This is you';

		}, function(error) {
			console.log(error);
		});
	},

	clear: function() {
		this.ctx.clearRect(0, 0, this.c.width, this.c.height);
	},

	reset: function() {
		WARP.ctx.clearRect(0, 0, WARP.c.width, WARP.c.height);
		WARP.drawImage();

		if (WARP.options.videoActive) {
			WARP.rotationCounter = 1;
			WARP.activeCircles = 1;
		}
	},

	// spazzing out
	// save: function() {
	// 	var i = WARP.c.toDataURL('image/jpg');
	// 	window.location = i;
	// },

	mouseMove: function (e) {
		WARP.mouse.x = e.offsetX || (e.layerX - WARP.c.offsetLeft);
		WARP.mouse.y = e.offsetY || (e.layerY - WARP.c.offsetTop);
	},

	mouseDown: function () {
		WARP.clear();
		WARP.mouse.down = true;
	},

	mouseUp: function () {
		WARP.mouse.down = false;
		if (!WARP.options.videoActive) {
			WARP.rotationCounter = 1;
			WARP.activeCircles = 1;
		}
	},

	mouseOut: function () {
		WARP.mouse.down = false;
	}

};

function eventListenerz() {
	var inputs = document.getElementsByClassName('controller'),
		resetBtn = document.getElementById('reset-canvas'),
		// saveBtn = document.getElementById('save');
		changePhotoBtn = document.getElementById('change-photo'),
		GUMBtn = document.getElementById('gum');

	function onChange() {
		var name = this.name,
			value = this.value,
			max = this.getAttribute('max');

		value = +value;

		if (value > max) {
			value = max;
			this.value = max;
		}

		WARP.options[name] = value;

	}

	for (var i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener('change', onChange, false);
	}

	var controlToggles = document.getElementsByClassName('toggle-controls'),
		controls = document.getElementById('controls');

	function toggleControls(e) {
		e.preventDefault();
		controls.className = controls.className === 'closed' ? '' : 'closed';
	}

	for (var j = 0; j < 2; j++) {
		controlToggles[j].addEventListener('click', toggleControls, false);
	}

	resetBtn.addEventListener('click', WARP.reset, false);

	// saveBtn.addEventListener('click', WARP.save, false);

	changePhotoBtn.addEventListener('click', function() {
		WARP.clear();

		if (WARP.imageCounter === (WARP.images.length - 1)) {
			WARP.imageCounter = 0;
		}
		else {
			WARP.imageCounter++;
		}

		WARP.options.videoActive = false;
		WARP.loadImage();
	}, false);

	GUMBtn.addEventListener('click', WARP.getVideo, false);

}

window.onload = function() {

	WARP.init();

	eventListenerz();

};