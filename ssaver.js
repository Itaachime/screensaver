// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

window.onload = function () {
	function Matrix(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
		if (m11 == null) {
			this.m11 = this.m22 = this.m33 = this.m44 = 1;
			this.m12 = this.m13 = this.m14 = this.m21 = this.m23 = this.m24 = this.m31 = this.m32 = this.m34 = this.m41 = this.m42 = this.m43 = 0;
		} else {
			this.m11 = m11;
			this.m12 = m12;
			this.m13 = m13;
			this.m14 = m14;
			this.m21 = m21;
			this.m22 = m22;
			this.m23 = m23;
			this.m24 = m24;
			this.m31 = m31;
			this.m32 = m32;
			this.m33 = m33;
			this.m34 = m34;
			this.m41 = m41;
			this.m42 = m42;
			this.m43 = m43;
			this.m44 = m44;
		}
	}
	(function (matrixproto) {
		matrixproto.toJSON = function () {
			var m = this;
			return [[m.m11, m.m21, m.m31, m.m41], [m.m12, m.m22, m.m32, m.m42], [m.m13, m.m23, m.m33, m.m43], [m.m14, m.m24, m.m34, m.m44]];
		};
		matrixproto.toString = function () {
			return "matrix3d(" + [this.m11, this.m12, this.m13, this.m14, this.m21, this.m22, this.m23, this.m24, this.m31, this.m32, this.m33, this.m34, this.m41, this.m42, this.m43, this.m44] + ")";
		};
        matrixproto.add = function (m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
            var out = [[], [], [], []],
                m = this.toJSON(),
                matrix = [[m11, m21, m31, m41], [m12, m22, m32, m42], [m13, m23, m33, m43], [m14, m24, m34, m44]],
                x, y, z, res;

            if (m11 && m11 instanceof Matrix) {
                matrix = m11.toJSON();
            }

            for (x = 0; x < 4; x++) {
                for (y = 0; y < 4; y++) {
                    res = 0;
                    for (z = 0; z < 4; z++) {
                        res += m[x][z] * matrix[z][y];
                    }
					this["m" + (y + 1) + (x + 1)] = res;
                }
            }
        };
		matrixproto.translate = function (tx, ty, tz) {
			this.add(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1);
		};
		matrixproto.scale = function (sx, sy, sz) {
			this.add(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
		};
		matrixproto.rotate = function (x, y, z, a) {
			a = a * Math.PI / 180 / 2;
			var sc = Math.sin(a) * Math.cos(a),
				sq = Math.sin(a) * Math.sin(a);
			this.add(
				1 - 2 * (y * y + z * z) * sq,
				2 * (x * y * sq + z * sc),
				2 * (x * z * sq - y * sc),
				0, 2 * (x * y * sq - z * sc),
				1 - 2 * (x * x + z * z) * sq,
				2 * (y * z * sq + x * sc),
				0,
				2 * (x * z * sq + y * sc),
				2 * (y * z * sq - x * sc),
				1 - 2 * (x * x + y * y) * sq,
				0, 0, 0, 0, 1);
		};
		matrixproto.apply = function (el) {
			var m = this.toString();
			el.style.WebkitTransform = m;
			el.style.MozTransform = m;
			el.style.transform = m;
		};
	}(Matrix.prototype));
	function toggleFullScreen(el) {
		el = el || document.documentElement;
		if ((document.fullScreenElement && document.fullScreenElement != null) ||    // alternative standard method
		   (!document.mozFullScreenElement && !document.webkitFullScreenElement)) {  // current working methods
			if (el.requestFullScreen) {
				el.requestFullScreen();
			} else if (el.mozRequestFullScreen) {
				el.mozRequestFullScreen();
			} else if (el.webkitRequestFullScreen) {
				el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		} else {
			// (document.cancelFullScreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || function () {})();
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		}
	}
	function transform(i) {
		var it = items[i],
			bottom = it.el.getBoundingClientRect().bottom,
			m = new Matrix;
		m.translate(Math.round(it.x), Math.round(it.y), Math.round(it.z));
		it.rx && m.rotate(1, 0, 0, it.rx);
		it.ry && m.rotate(0, 1, 0, it.ry);
		it.rz && m.rotate(0, 0, 1, it.rz);
		it.el.style.zIndex = Math.round(it.z) + 2001;
		m.apply(it.el);
		!i && console.log("transform", m.toString());
		if (!pole.spinning) {
			if (bottom < -10) {
				items.splice(i, 1);
				screen.removeChild(it.el.parentNode);
				transform(i);
			} else if (!it.next && bottom < height / 3) {
				preload(getURL());
				it.next = 1;
			}
		}
	}
    function rot(x, y, rad, cx, cy) {
		x -= cx;
		y -= cy;
		rad = rad / 180 * Math.PI;
        var X = cx + x * Math.cos(rad) - y * Math.sin(rad),
            Y = cy + x * Math.sin(rad) + y * Math.cos(rad);
        return {x: X, y: Y};
    }
	eve.once("prerun", function () {
		loading = 1;
		for (var i = 0, ii = 18; i < ii; i++) {
			preload(getURL());
		}
	});
	function spin(axis, dir) {
		axis = axis || "y";
		dir = dir || 0;
		if (pole.spinning) {
			return;
		}
		var axes = {
			x: ["y", height / 2, 1],
			y: ["x", width / 2, -1]
		}[axis];
		dir = dir ? [0, 359] : [360, 0];
		var cz = -1000;
		for (var i = 0; i < items.length; i++) {
			items[i]._[axes[0]] = items[i][axes[0]];
			items[i]._.z = items[i]._.z2 = items[i].z; 	
		}
		mina(0, -2000, 1.5, function (val) {
			for (var i = 0; i < items.length; i++) {
				var it = items[i];
				it._.z = it._.z2 + val;
			}
			cz = val - 1000;
		}, function () {
			mina(-2000, 0, 1.5, function (val) {
				for (var i = 0; i < items.length; i++) {
					var it = items[i];
					it._.z = it._.z2 + val;
				}
				cz = val - 1000;
			}, function () {
				for (var i = 0; i < items.length; i++) {
					var it = items[i];
					it.z = it._.z2;
				}
			}).easing = mina.easeout;
		}).easing = mina.easein;
		pole.spinning = axis;
		mina(dir[0], dir[1], 3, function (val) {
			for (var i = 0; i < items.length; i++) {
				var it = items[i],
					xy = rot(it._[axes[0]], it._.z, val, axes[1], cz);
				it[axes[0]] = xy.x;
				it.z = xy.y;
				it["r" + axis] = val * axes[2];
			}
		}, function () {
			pole.spinning = "";
			it["r" + axis] = 0;
		}).easing = mina.easeinout;
		return true;
	}
	function run() {
		mina(0, -4 * height, 40, function (val) {
			for (var i = 0; i < items.length; i++) {
				items[i].y--;
				transform(i);
			}
		}).iterations = Infinity;
		setInterval(spin, 3e4);
	}
	function preload(url) {
		var img = document.createElement("img"),
			a = document.createElement("a"),
			as = a.style;
		img.onerror = function () {
			if (loading) {
				loaded++;
				document.getElementById("g" + loaded).style.display = "inline";
				if (loaded > 17) {
					var menu = document.getElementById("menu");
					document.getElementById("button").style.display = "inline";
					mina(1, 0, .5, function (val) {
						menu.style.opacity = val;
					}, function () {
						menu.style.display = "none";
						menu.style.opacity = 1;
						document.getElementById("menus").style.display = "inline";
						document.getElementById("go").style.display = "inline";
						document.getElementById("gear").style.display = "none";
						document.getElementById("small-gear-animation").setAttribute("end", 0);
						document.getElementById("gear").setAttribute("end", 0);
					});
					loading = 0;
					run();
				}
			}
		};
		img.onload = function () {
			this.onerror();
			var z = -Math.round(Math.random() * 2000),
				mul = 2000 / (2000 - z),
				y = 2 * height * Math.random() + height + (height / 2 - height / 2 * mul) / mul,
				w = this.offsetWidth,
				h = this.offsetHeight;
			cur = ++cur * (cur * step <= width);
			if (!firstY && Math.random() < .5) {
				y = height + (height / 2 - height / 2 * mul) / mul;
				firstY = 1;
			}
			if (w < h && w > step) {
				h = h * step / w;
				w = step;
			}
			if (w > h && h > step) {
				w = w * step / h;
				h = step;
			}
			this.height = h;
			this.width = w;
			as.height = h + "px";
			as.width = w + "px";
			as.background = "url(" + this.src + ")";
			screen.appendChild(a);
			var dx = (middle - middle * mul) / mul;
			var it = {
				el: a,
				x: (cur * step + (cur / ~~(width / step - 1) - 1) * dx),
				y: y,
				z: z,
				rx: 0,
				ry: 0,
				rz: 0,
				_: {
					y: y
				}
			};
			items.push(it);
			transform(items.length - 1);
		};
		img.src = url[0];
		a.href = url[1];
		test.appendChild(img);
	}
	function jsonp(url, name, f) {
		var script = document.createElement("script");
		script.src = url;
		window[name] = function (json) {
			f(json);
			delete window[name];
			document.body.removeChild(script);
		};
		document.body.appendChild(script);
	}
	eve.once("go", function goHandler() {
		if (!(services.flickr.active || services.instagram.active || services.dribbble.active || services["500px"].active)) {
			eve.once("go", goHandler);
			return;
		}
		document.getElementById("menus").style.display = "none";
		document.getElementById("go").style.display = "none";
		document.getElementById("gear").style.display = "inline";
		document.getElementById("small-gear-animation").setAttribute("begin", 0);
		// urls = ["i/001.jpg", "i/002.jpg", "i/003.jpg", "i/004.jpg", "i/005.jpg", "i/006.jpg", "i/007.jpg", "i/008.jpg", "i/009.jpg", "i/010.jpg", "i/011.jpg", "i/012.jpg", "i/013.jpg", "i/014.jpg", "i/015.jpg", "i/016.jpg"];
		// eve("prerun");
		// toggleFullScreen();
		// return;
		services.dribbble.active && load(services.dribbble);
		services.flickr.active && load(services.flickr);
		services["500px"].active && load(services["500px"]);
		services.instagram.active && load(services.instagram);
	});
	eve.on("menu.*", function () {
		var id = eve.nt().split(".")[1];
		services[id].active = !services[id].active;
		document.getElementById(id).setAttribute("class", services[id].active ? "menu-item selected" : "menu-item");
		if (services.flickr.active || services.instagram.active || services.dribbble.active || services["500px"].active) {
			document.getElementById("go").setAttribute("class", "ready");
		} else {
			document.getElementById("go").setAttribute("class", "not-ready");
		}
	});
	eve.on("button", function () {
		document.getElementById("button").style.display = "none";
		document.getElementById("menu").style.display = "block";
		eve.once("go", function goHandler() {
			if (!(services.flickr.active || services.instagram.active || services.dribbble.active || services["500px"].active)) {
				eve.once("go", goHandler);
				return;
			}
			document.getElementById("button").style.display = "block";
			document.getElementById("menu").style.display = "none";
		});
	});
	eve.on("keyup", function (e) {
		var key = {
			"37": ["y", 1], // ←
			"38": ["x", 1], // ↑
			"39": ["y"], // →
			"40": ["x"] // ↓
		}[e.which];
		if (key) {
			spin.apply(0, key);
			e.preventDefault();
		}
		if (e.which == 32) {
			toggleFullScreen();
			e.preventDefault();
		}
	});
	function load(service, page) {
		page = +page || 1;
		if (service.loading) {
			return;
		}
		service.loading = true;
		var url = service.url(page);
		if (url) {
			jsonp(url, "json" + service.name + "Api", function (j) {
				service.loading = false;
				service.total = service.getTotal(j);
				service.page = page;
				var items = service.getItems(j);
				for (var i = 0; i < items.length; i++) {
					urls.push(service.getURL(items[i]));
					links.push(service.getLink(items[i]));
				}
				setTimeout(eve.f("prerun"));
			});
		} else {
			// for instagram
			service.page = 1;
		}
	}
	
	function getURL() {
		getURL.id = getURL.id + 1 || 0;
		if (getURL.id > urls.length - 9) {
			services.dribbble.active && load(services.dribbble, (services.dribbble.page || 0) + 1);
			services.flickr.active && load(services.flickr, (services.flickr.page || 0) + 1);
			services["500px"].active && load(services["500px"], (services["500px"].page || 0) + 1);
			// Instagram doesn’t have paging for popular
			services.instagram.active && load(services.instagram, (services.instagram.page || 0) + 1);
		}
		return [urls[getURL.id % urls.length], links[getURL.id % urls.length]];
	}
	function getID() {
		var id = getID.id || 0;
		if (id > 1e6) {
			id = 0;
		}
		getID.id = ++id;
		return getID.id;
	}
	var items = [],
		urls = [],
		links = [],
		width = window.innerWidth,
		middle = width / 2,
		height = window.innerHeight,
		screen = document.getElementById("screen"),
		test = document.getElementById("test"),
		step = Math.max(Math.round(width / 5), 480),
		cur = 0,
		pole = {
			spinning: ""
		},
		firstY,
		loading,
		loaded = 0,
		services = {
			flickr: {
				name: "Flickr",
				url: function (page) {
					return "http://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=4f73acde456cd5a1bd100098c84cef3f&format=json&per_page=18&page=" + page;
				},
				getItems: function (json) {
					return json.photos.photo;
				},
				getTotal: function (json) {
					return json.photos.pages;
				},
				getURL: function (item) {
					return "http://farm" + item.farm + ".staticflickr.com/" + item.server + "/" + item.id + "_" + item.secret + "_c.jpg";
				},
				getLink: function (item) {
					return "http://www.flickr.com/photos/" + item.owner + "/" + item.id;
				}
			},
			"500px": {
				name: "500px",
				url: function (page) {
					return "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22https%3A%2F%2Fapi.500px.com%2Fv1%2Fphotos%3Ffeature%3Dpopular%26consumer_key%3DBiyx6wgzr4QJMRixtUIF4FFmX7YlhRGJqMcDXHko%26image_size%3D4%26rpp%3D18%26page%3D" + page + "%22&format=json&callback=json500pxApi";
				},
				getItems: function (json) {
					return json.query.results.json.photos;
				},
				getTotal: function (json) {
					return json.query.results.json.total_pages;
				},
				getURL: function (item) {
					return item.image_url;
				},
				getLink: function (item) {
					return "http://500px.com/photo/" + item.id;
				}
			},
			instagram: {
				name: "Instagram",
				url: function (page) {
					if (page == 1) {
						return "https://api.instagram.com/v1/media/popular?client_id=724dea07af4240e7ab0fb1d1cf81e4a1&callback=jsonInstagramApi";
					}
				},
				getItems: function (json) {
					return json.data;
				},
				getTotal: function (json) {
					return 0;
				},
				getURL: function (item) {
					return item.images.standard_resolution.url;
				},
				getLink: function (item) {
					return item.link;
				}
			},
			dribbble: {
				name: "Dribbble",
				url: function (page) {
					page = +page || 1;
					return "http://api.dribbble.com/shots/popular?callback=jsonDribbbleApi&per_page=18&page=" + page;
				},
				getItems: function (json) {
					return json.shots;
				},
				getTotal: function (json) {
					return json.pages;
				},
				getURL: function (item) {
					return item.image_url;
				},
				getLink: function (item) {
					return item.url;
				}
			}
		},
		z, mul;
	document.getElementById("dribbble").onclick = eve.f("menu.dribbble");
	document.getElementById("500px").onclick = eve.f("menu.500px");
	document.getElementById("flickr").onclick = eve.f("menu.flickr");
	document.getElementById("instagram").onclick = eve.f("menu.instagram");
	document.getElementById("go").onclick = eve.f("go");
	document.getElementById("button").onclick = eve.f("button");
	document.onkeydown = eve.f("keyup");
};