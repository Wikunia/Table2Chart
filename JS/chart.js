/*
 * Chart.js
 * http://chartjs.org/
 *
 * Copyright 2013 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 * 
 * Additional features:
 * Tooltips by Regaddi https://github.com/nnnick/Chart.js/pull/51
 * My own pulls https://github.com/Wikunia/Chart.js
 */

//Define the global Chart Variable as a class.
window.Chart = function(lang,context, options){
	var chart = this;
	//Easing functions adapted from Robert Penner's easing equations
	//http://www.robertpenner.com/easing/

	var animationOptions = {
		linear : function (t){
			return t;
		},
		easeInQuad: function (t) {
			return t*t;
		},
		easeOutQuad: function (t) {
			return -1 *t*(t-2);
		},
		easeInOutQuad: function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t;
			return -1/2 * ((--t)*(t-2) - 1);
		},
		easeInCubic: function (t) {
			return t*t*t;
		},
		easeOutCubic: function (t) {
			return 1*((t=t/1-1)*t*t + 1);
		},
		easeInOutCubic: function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t;
			return 1/2*((t-=2)*t*t + 2);
		},
		easeInQuart: function (t) {
			return t*t*t*t;
		},
		easeOutQuart: function (t) {
			return -1 * ((t=t/1-1)*t*t*t - 1);
		},
		easeInOutQuart: function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t*t;
			return -1/2 * ((t-=2)*t*t*t - 2);
		},
		easeInQuint: function (t) {
			return 1*(t/=1)*t*t*t*t;
		},
		easeOutQuint: function (t) {
			return 1*((t=t/1-1)*t*t*t*t + 1);
		},
		easeInOutQuint: function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t*t*t;
			return 1/2*((t-=2)*t*t*t*t + 2);
		},
		easeInSine: function (t) {
			return -1 * Math.cos(t/1 * (Math.PI/2)) + 1;
		},
		easeOutSine: function (t) {
			return 1 * Math.sin(t/1 * (Math.PI/2));
		},
		easeInOutSine: function (t) {
			return -1/2 * (Math.cos(Math.PI*t/1) - 1);
		},
		easeInExpo: function (t) {
			return (t==0) ? 1 : 1 * Math.pow(2, 10 * (t/1 - 1));
		},
		easeOutExpo: function (t) {
			return (t==1) ? 1 : 1 * (-Math.pow(2, -10 * t/1) + 1);
		},
		easeInOutExpo: function (t) {
			if (t==0) return 0;
			if (t==1) return 1;
			if ((t/=1/2) < 1) return 1/2 * Math.pow(2, 10 * (t - 1));
			return 1/2 * (-Math.pow(2, -10 * --t) + 2);
			},
		easeInCirc: function (t) {
			if (t>=1) return t;
			return -1 * (Math.sqrt(1 - (t/=1)*t) - 1);
		},
		easeOutCirc: function (t) {
			return 1 * Math.sqrt(1 - (t=t/1-1)*t);
		},
		easeInOutCirc: function (t) {
			if ((t/=1/2) < 1) return -1/2 * (Math.sqrt(1 - t*t) - 1);
			return 1/2 * (Math.sqrt(1 - (t-=2)*t) + 1);
		},
		easeInElastic: function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1)==1) return 1;  if (!p) p=1*.3;
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
		},
		easeOutElastic: function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1)==1) return 1;  if (!p) p=1*.3;
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*1-s)*(2*Math.PI)/p ) + 1;
		},
		easeInOutElastic: function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1/2)==2) return 1;  if (!p) p=1*(.3*1.5);
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p )*.5 + 1;
		},
		easeInBack: function (t) {
			var s = 1.70158;
			return 1*(t/=1)*t*((s+1)*t - s);
		},
		easeOutBack: function (t) {
			var s = 1.70158;
			return 1*((t=t/1-1)*t*((s+1)*t + s) + 1);
		},
		easeInOutBack: function (t) {
			var s = 1.70158; 
			if ((t/=1/2) < 1) return 1/2*(t*t*(((s*=(1.525))+1)*t - s));
			return 1/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
		},
		easeInBounce: function (t) {
			return 1 - animationOptions.easeOutBounce (1-t);
		},
		easeOutBounce: function (t) {
			if ((t/=1) < (1/2.75)) {
				return 1*(7.5625*t*t);
			} else if (t < (2/2.75)) {
				return 1*(7.5625*(t-=(1.5/2.75))*t + .75);
			} else if (t < (2.5/2.75)) {
				return 1*(7.5625*(t-=(2.25/2.75))*t + .9375);
			} else {
				return 1*(7.5625*(t-=(2.625/2.75))*t + .984375);
			}
		},
		easeInOutBounce: function (t) {
			if (t < 1/2) return animationOptions.easeInBounce (t*2) * .5;
			return animationOptions.easeOutBounce (t*2-1) * .5 + 1*.5;
		}
	};

	this.tooltips = [],
		defaults = {
			tooltips: {
				background: 'rgba(0,0,0,0.6)',
				fontFamily : "'Times New Roman'",
				fontStyle : "normal",
				fontColor: 'white',
				fontSize: '12px',
				labelTemplate: '<%=label%>: <%=value%>',
				padding: {
					top: 10,
					right: 10,
					bottom: 10,
					left: 10
				},
				offset: {
					left: 0,
					top: 0
				},
				border: {
					width: 0,
					color: '#000'
				},
				showHighlight: true,
				highlight: {
					stroke: {
						width: 1,
						color: 'rgba(230,230,230,0.25)'
					},
					fill: 'rgba(255,255,255,0.25)'
				}
			}
		},
		options = (options) ? mergeChartConfig(defaults, options) : defaults;

	function registerTooltip(ctx,areaObj,data,type) {
		chart.tooltips.push(new Tooltip(
			ctx,
			areaObj,
			data,
			type
		));
	}

	var Tooltip = function(ctx, areaObj, data, type) {

							
		this.ctx = ctx;
		this.areaObj = areaObj;
		this.data = data;
		data.value = thousand_separator(JSON.stringify(data.value));
		this.savedState = null;
		this.highlightState = null;
		this.x = null;
		this.y = null;

		this.inRange = function(x,y) {
			if(this.areaObj.type) {
				switch(this.areaObj.type) {
					case 'rect':
						return (x >= this.areaObj.x && x <= this.areaObj.x+this.areaObj.width) &&
						   (y >= this.areaObj.y && y <= this.areaObj.y+this.areaObj.height);
						   break;
					case 'circle':
						return ((Math.pow(x-this.areaObj.x, 2)+Math.pow(y-this.areaObj.y, 2)) < Math.pow(this.areaObj.r,2));
						break;
					case 'shape':
						var poly = this.areaObj.points;
						for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
							((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y))
							&& (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
							&& (c = !c);
						return c;
						break;
				}
			}
		}

		this.render = function(x,y) {
			if(this.savedState == null) {
				this.ctx.putImageData(chart.savedState,0,0);
				this.savedState = this.ctx.getImageData(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
			}
			this.ctx.putImageData(this.savedState,0,0);
			if(options.tooltips.showHighlight) {
				if(this.highlightState == null) {
					this.ctx.strokeStyle = options.tooltips.highlight.stroke.color;
					this.ctx.lineWidth = options.tooltips.highlight.stroke.width;
					this.ctx.fillStyle = options.tooltips.highlight.fill;
					switch(this.areaObj.type) {
						case 'rect':
							this.ctx.strokeRect(this.areaObj.x, this.areaObj.y, this.areaObj.width, this.areaObj.height);
							this.ctx.fillStyle = options.tooltips.highlight.fill;
							this.ctx.fillRect(this.areaObj.x, this.areaObj.y, this.areaObj.width, this.areaObj.height);
							break;
						case 'circle':
							this.ctx.beginPath();
							this.ctx.arc(this.areaObj.x, this.areaObj.y, this.areaObj.r, 0, 2*Math.PI, false);
							this.ctx.stroke();
							this.ctx.fill();
							break;
						case 'shape':
							this.ctx.beginPath();
							this.ctx.moveTo(this.areaObj.points[0].x, this.areaObj.points[0].y);
							for(var p in this.areaObj.points) {
								this.ctx.lineTo(this.areaObj.points[p].x, this.areaObj.points[p].y);
							}
							this.ctx.stroke();
							this.ctx.fill();
							break;
					}
					this.highlightState = this.ctx.getImageData(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
				} else {
					this.ctx.putImageData(this.highlightState,0,0);
				}
			}
			//if(this.x != x || this.y != y) {
				var posX = x+options.tooltips.offset.left,
					posY = y+options.tooltips.offset.top,
					tpl = tmpl(options.tooltips.labelTemplate, this.data),
					rectWidth = options.tooltips.padding.left+this.ctx.measureText(tpl).width+options.tooltips.padding.right;
				if(posX + rectWidth > ctx.canvas.width) {
					posX -= posX-rectWidth < 0 ? posX : rectWidth;
				}
				if(posY + 24 > ctx.canvas.height) {
					posY -= 24;
				}
				this.ctx.fillStyle = options.tooltips.background;
				this.ctx.fillRect(posX, posY, rectWidth, 24);
				if(options.tooltips.border.width > 0) {
					this.ctx.fillStyle = options.tooltips.order.color;
					this.ctx.lineWidth = options.tooltips.border.width;
					this.ctx.strokeRect(posX, posY, rectWidth, 24);
				}
				this.ctx.font = options.tooltips.fontStyle+ " "+options.tooltips.fontSize+" " + options.tooltips.fontFamily;
				this.ctx.fillStyle = options.tooltips.fontColor;
				this.ctx.textAlign = 'center';
				this.ctx.textBaseline = 'middle';
				this.ctx.fillText(tpl, posX+rectWidth/2, posY+12);
				this.x = x;
				this.y = y;
			//}
		}
	}

	//Variables global to the chart
	var width = context.canvas.width,
		height = context.canvas.height;

	this.savedState = null;

	function getPosition(e) {
		var xPosition = 0;
		var yPosition = 0;

		while(e) {
			xPosition += (e.offsetLeft + e.clientLeft);
			yPosition += (e.offsetTop + e.clientTop);
			e = e.offsetParent;
		}
		if(window.pageXOffset > 0 || window.pageYOffset > 0) {
			xPosition -= window.pageXOffset;
			yPosition -= window.pageYOffset;
		} else if(document.body.scrollLeft > 0 || document.body.scrollTop > 0) {
			xPosition -= document.body.scrollLeft;
			yPosition -= document.body.scrollTop;
		}
		return { x: xPosition, y: yPosition };
	}

	function tooltipEventHandler(e) {
		if(chart.tooltips.length > 0) {
			chart.savedState = chart.savedState == null ? context.getImageData(0,0,context.canvas.width,context.canvas.height) : chart.savedState;
			var rendered = 0;
			for(var i in chart.tooltips) {
				var position = getPosition(context.canvas),
					mx = (e.clientX)-position.x,
					my = (e.clientY)-position.y;
				if(chart.tooltips[i].inRange(mx,my)) {
					chart.tooltips[i].render(mx,my);
					rendered++;
				}
			}
			if(rendered == 0) {
				context.putImageData(chart.savedState,0,0);
			}
		}
		if (document.getElementsByClassName("additionalData").length > 0) {
		  var position = getPosition(context.canvas),
					mx = (e.clientX)-position.x;
			updateAdditionalData(mx);
		}
	}

	function updateAdditionalData(x) {
		if (!lockedAdditionalData && additionalData.length > 0) {
			if (additionalData[x]) {
				var additionalDataClass = document.getElementsByClassName("additionalData");
				if (document.getElementsByClassName("additionalData-Values").length > 0) {
					if (document.getElementsByClassName("additionalData-Label").length > 0) {
						var newInnerLabel = additionalData[x].label;
						document.getElementsByClassName("additionalData-Label")[0].innerHTML = newInnerLabel;
					}
					var newInnerValues = parseAdditionalData(additionalData[x].values,additionalData[x].tmpl);
					document.getElementsByClassName("additionalData-Values")[0].innerHTML = newInnerValues;
				}else {
					var newInnerHTML = '<b><u>'+additionalData[x].label+'</u></b>\
										<br>'+parseAdditionalData(additionalData[x].values,additionalData[x].tmpl);
					additionalDataClass[0].innerHTML = newInnerHTML;	
				}
			}
		}
	}

	function parseAdditionalData(values,tmpl) {
		var result = '', regexp='';
		for (var i = 0; i < values.length; i++) {
			var resultPart = tmpl;
			for (j = 0; j < values[i].length; j++) {
				regexp = new RegExp('%values\\['+j+'\\]%','g');
				resultPart = resultPart.replace(regexp,values[i][j]);	
			}	
			result += resultPart+'<br>';
		}
		return result;
	}
	
	var additionalData = [];
	var lockedAdditionalData = false;
	var lastFloor = 0;
	function registerAdditionalData(xPos,j,label,values,tmpl) {
		lastFloor = Math.round(xPos);
		additionalData[lastFloor] = {iteration: j, label: label, values: values, tmpl: tmpl}; 
	}
	
	function lockAdditionalData(e) {
		var position = getPosition(context.canvas),
			mx = (e.clientX)-position.x;
		lockedAdditionalData = lockedAdditionalData ? false : true; // toggle
		if (!lockAdditionalData) {
			updateAdditionalData(e);  
		}
	}
	
	
	 if (is_touch_device()) {
		context.canvas.ontouchstart = function(e) {
			e.clientX = e.targetTouches[0].clientX;
			e.clientY = e.targetTouches[0].clientY;
			tooltipEventHandler(e);
		}
		context.canvas.ontouchmove = function(e) {
			e.clientX = e.targetTouches[0].clientX;
			e.clientY = e.targetTouches[0].clientY;
			tooltipEventHandler(e);
		}
	} else {
		context.canvas.onmousemove = function(e) {
			tooltipEventHandler(e);
		}
		context.canvas.onclick = function(e) {
			lockAdditionalData(e);	
		}
	}
	
  function is_touch_device() {
		return !!('ontouchstart' in window) // works on most browsers 
        || !!('onmsgesturechange' in window); // works on ie10
  };   

	context.canvas.onmouseout = function(e) {
		if(chart.savedState != null) {
			context.putImageData(chart.savedState,0,0);
		}
	}


	//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
	if (window.devicePixelRatio) {
		context.canvas.style.width = width + "px";
		context.canvas.style.height = height + "px";
		context.canvas.height = height * window.devicePixelRatio;
		context.canvas.width = width * window.devicePixelRatio;
		context.scale(window.devicePixelRatio, window.devicePixelRatio);
	}

	this.PolarArea = function(data,options){

		chart.PolarArea.defaults = {
			scaleOverlay : true,
			scaleOverride : false,
			scaleSteps : null,
			scaleStepWidth : null,
			scaleStartValue : null,
			scaleShowLine : true,
			scaleLineColor : "rgba(0,0,0,.4)",
			scaleLineWidth : 1,
			scaleShowLabels : true,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Times New Roman'",
			scaleFontSize : 14,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowLabelBackdrop : true,
			scaleBackdropColor : "rgba(255,255,255,0.75)",
			scaleBackdropPaddingY : 2,
			scaleBackdropPaddingX : 2,
			segmentShowStroke : true,
			segmentStrokeColor : "#fff",
			segmentStrokeWidth : 2,
			animation : true,
			animationSteps : 100,
			animationEasing : "easeOutBounce",
			animateRotate : true,
			animateScale : false,
			onAnimationComplete : null,
			showTooltips : true
		};

		var config = $.extend({}, chart.PolarArea.defaults, options);

		return new PolarArea(data,config,context);
	};

	this.Radar = function(data,options){

		chart.Radar.defaults = {
			scaleOverlay : false,
			scaleOverride : false,
			scaleSteps : null,
			scaleStepWidth : null,
			scaleStartValue : null,
			scaleShowLine : true,
			scaleLineColor : "rgba(0,0,0,.4)",
			scaleLineWidth : 1,
			scaleShowLabels : false,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Times New Roman'",
			scaleFontSize : 14,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowLabelBackdrop : true,
			scaleBackdropColor : "rgba(255,255,255,0.75)",
			scaleBackdropPaddingY : 2,
			scaleBackdropPaddingX : 2,
			angleShowLineOut : true,
			angleLineColor : "rgba(0,0,0,.1)",
			angleLineWidth : 1,			
			pointLabelFontFamily : "'Times New Roman'",
			pointLabelFontStyle : "normal",
			pointLabelFontSize : 12,
			pointLabelFontColor : "#666",
			pointDot : true,
			pointDotRadius : 3,
			pointDotStrokeWidth : 1,
			datasetStroke : true,
			datasetStrokeWidth : 2,
			datasetFill : true,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			showTooltips : true
		};

		var config = $.extend({}, chart.Radar.defaults, options);

		return new Radar(data,config,context);
	};

	this.Pie = function(data,options){
		chart.Pie.defaults = {
			segmentShowStroke : true,
			segmentStrokeColor : "#fff",
			segmentStrokeWidth : 2,
			animation : true,
			animationSteps : 100,
			animationEasing : "easeOutBounce",
			animateRotate : true,
			animateScale : false,
			onAnimationComplete : null,
			labelFontFamily : "'Times New Roman'",
			labelFontStyle : "normal",
			labelFontSize : 12,
			labelFontColor : "#666",
			labelAlign : 'right',
			showTooltips : true
		};		

		var config = $.extend({}, chart.Pie.defaults, options);

		return new Pie(data,config,context);				
	};

	this.Doughnut = function(data,options){

		chart.Doughnut.defaults = {
			segmentShowStroke : true,
			segmentStrokeColor : "#fff",
			segmentStrokeWidth : 2,
			percentageInnerCutout : 50,
			animation : true,
			animationSteps : 100,
			animationEasing : "easeOutBounce",
			animateRotate : true,
			animateScale : false,
			onAnimationComplete : null,
			showTooltips : true
		};		

		var config = $.extend({}, chart.Doughnut.defaults, options);

		return new Doughnut(data,config,context);			

	};

	this.Line = function(data,options){

		chart.Line.defaults = {
			scaleOverlay : false,
			scaleOverride : false,
			scaleSteps : null,
			scaleStepWidth : null,
			scaleStartValue : null,
			scaleLineColor : "rgba(0,0,0,.4)",
			scaleLineWidth : 1,
			scaleShowLabels : true,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Times New Roman'",
			scaleFontSize : 14,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowGridLines : true,
			scaleGridLineColor : "rgba(0,0,0,.05)",
			scaleGridLineWidth : 1,
			bezierCurve : true,
			pointDot : 'fuzzy',
			pointDotRadius : 4,
			pointDotStrokeWidth : 2,
			datasetStroke : true,
			datasetStrokeWidth : 2,
			datasetFill : true,
			animation : true, 
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			showTooltips : true,
			logarithmic: false
		};		
		var config = $.extend({}, chart.Line.defaults, options);

		return new Line(data,config,context);
	}

	this.LineDoubleY = function(data,options){
	
		chart.LineDoubleY.defaults = {
			scaleOverlay : false,
			scaleLineColor : "rgba(0,0,0,.4)",
			scaleLineWidth : 1,
			Y1_scaleOverride: false,
			Y2_scaleOverride: false,
			Y1_scaleSteps: null,
			Y2_scaleSteps: null,
			Y1_scaleStepWidth : null,
			Y2_scaleStepWidth : null,
			Y1_scaleStartValue : null,
			Y2_scaleStartValue : null,
			scaleShowLabels : true,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Arial'",
			scaleFontSize : 12,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowGridLines : true,
			scaleGridLineColor : "rgba(0,0,0,.05)",
			scaleGridLineWidth : 1,
			pointDot : true,
			pointDotRadius : 4,
			pointDotStrokeWidth : 2,
			datasetStroke : true,
			datasetStrokeWidth : 2,
			datasetFill : true,
			animation :true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			showTooltips : true,
			climate: false
		};		
		
		var config = $.extend({}, chart.LineDoubleY.defaults, options);
		
		return new LineDoubleY(data,config,context);
	}
	
	this.StackedBar = function(data,options){
     chart.StackedBar.defaults = {
      scaleOverlay : false,
      scaleOverride : false,
      scaleSteps : null,
      scaleStepWidth : null,
      scaleStartValue : null,
      scaleLineColor : "rgba(0,0,0,.4)",
      scaleLineWidth : 1,
      scaleShowLabels : true,
      scaleLabel : "<%=value%>",
      scaleFontFamily : "'Times New Roman'",
      scaleFontSize : 14,
      scaleFontStyle : "normal",
      scaleFontColor : "#666",
      scaleShowGridLines : true,
      scaleGridLineColor : "rgba(0,0,0,.05)",
      scaleGridLineWidth : 1,
      barShowStroke : true,
      barStrokeWidth : 2,
      barValueSpacing : 5,
      barDatasetSpacing : 1,
      animation : false,
      animationSteps : 60,
      animationEasing : "easeOutQuart",
      onAnimationComplete : null,
	  showTooltips : true
    };    
    var config = $.extend({}, chart.StackedBar.defaults, options);
    return new StackedBar(data,config,context);
  }
	
	this.Bar = function(data,options){
		chart.Bar.defaults = {
			scaleOverlay : false,
			scaleOverride : false,
			scaleSteps : null,
			scaleStepWidth : null,
			scaleStartValue : null,
			scaleLineColor : "rgba(0,0,0,.4)",
			scaleLineWidth : 1,
			scaleShowLabels : true,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Times New Roman'",
			scaleFontSize : 14,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowGridLines : true,
			scaleGridLineColor : "rgba(0,0,0,.05)",
			scaleGridLineWidth : 1,
			barShowStroke : true,
			barStrokeWidth : 2,
			barValueSpacing : 5,
			barDatasetSpacing : 1,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			showTooltips : true,
			showAverageLine: true,
			AverageStrokeColor: "#000000",
			logarithmic: false
		};		
		
		
		var config = $.extend({}, chart.Bar.defaults, options);
		
		
		return new Bar(data,config,context);		
	}

	var clear = function(c){
		c.clearRect(0, 0, width, height);
	};

	var PolarArea = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString;		


		calculateDrawingSizes();

		valueBounds = getValueBounds(data,scaleHeight,labelHeight,"PolarArea");

		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : null;

		//Check and set the scale
		if (!config.scaleOverride){

			calculatedScale = calculateScale(config,scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			// important for the function populateLabels
			var graphMax = "undefined"; 
			config.logarithmic = false; // always for override
			populateLabels(config,labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,graphMax,config.scaleStepWidth);
		}

		scaleHop = maxSize/(calculatedScale.steps);

		//Wrap in an animation loop wrapper
		animationLoop(config,drawScale,drawAllSegments,ctx);

		function calculateDrawingSizes(){
			maxSize = (Min([width,height])/2);
			//Remove whatever is larger - the font size or line width.

			maxSize -= Max([config.scaleFontSize*0.5,config.scaleLineWidth*0.5]);

			labelHeight = config.scaleFontSize*2;
			//If we're drawing the backdrop - add the Y padding to the label height and remove from drawing region.
			if (config.scaleShowLabelBackdrop){
				labelHeight += (2 * config.scaleBackdropPaddingY);
				maxSize -= config.scaleBackdropPaddingY*1.5;
			}

			scaleHeight = maxSize;
			//If the label height is less than 5, set it to 5 so we don't have lines on top of each other.
			labelHeight = Default(labelHeight,5);
		}
		function drawScale() {
		
			for (var i=0; i<calculatedScale.steps; i++){
				//If the line object is there
				if (config.scaleShowLine){
					ctx.beginPath();
					ctx.arc(width/2, height/2, scaleHop * (i + 1), 0, (Math.PI * 2), true);
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineWidth = config.scaleLineWidth;
					ctx.stroke();
				}

				if (config.scaleShowLabels){
					ctx.textAlign = "center";
					ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
					 var label =  calculatedScale.labels[i];
					//If the backdrop object is within the font object
					if (config.scaleShowLabelBackdrop){
						var textWidth = ctx.measureText(label).width;
						ctx.fillStyle = config.scaleBackdropColor;
						ctx.beginPath();
						ctx.rect(
							Math.round(width/2 - textWidth/2 - config.scaleBackdropPaddingX),	 //X
							Math.round(height/2 - (scaleHop * (i + 1)) - config.scaleFontSize*0.5 - config.scaleBackdropPaddingY),//Y
							Math.round(textWidth + (config.scaleBackdropPaddingX*2)), //Width
							Math.round(config.scaleFontSize + (config.scaleBackdropPaddingY*2)) //Height
						);
						ctx.fill();
					}
					ctx.textBaseline = "middle";
					ctx.fillStyle = config.scaleFontColor;
					ctx.fillText(label,width/2,height/2 - (scaleHop * (i + 1)));
				}
			}
		}
		function drawAllSegments(animationDecimal){
			var startAngle = -Math.PI/2,
			angleStep = (Math.PI*2)/data.length,
			scaleAnimation = 1,
			rotateAnimation = 1;
			if (config.animation) {
				if (config.animateScale) {
					scaleAnimation = animationDecimal;
				}
				if (config.animateRotate){
					rotateAnimation = animationDecimal;
				}
			}

			for (var i=0; i<data.length; i++){

				ctx.beginPath();
				ctx.arc(width/2,height/2,scaleAnimation * calculateOffset(config,data[i].value,calculatedScale,scaleHop),startAngle, startAngle + rotateAnimation*angleStep, false);
				ctx.lineTo(width/2,height/2);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				if(animationDecimal >= 1 && config.showTooltips) {
					var points = [{x:width/2,y:height/2}],
						pAmount = 50,
						radius = calculateOffset(config,data[i].value,calculatedScale,scaleHop);
					points.push({x:width/2+radius*Math.cos(startAngle),y:height/2+radius*Math.sin(startAngle)});
					for(var p = 0; p <= pAmount; p++) {
						points.push({x:width/2+radius*Math.cos(startAngle+p/pAmount*rotateAnimation*angleStep),y:height/2+radius*Math.sin(startAngle+p/pAmount*rotateAnimation*angleStep)});
					}
					registerTooltip(ctx,{type:'shape',points:points},{label:data[i].label,value:data[i].value},'PolarArea');
				}

				if(config.segmentShowStroke){
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.stroke();
				}
				startAngle += rotateAnimation*angleStep;
			}
		}
	}

	var Radar = function (data,config,ctx) {
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString;	

		//If no labels are defined set to an empty array, so referencing length for looping doesn't blow up.
		if (!data.labels) data.labels = [];

		calculateDrawingSizes();

		valueBounds = getValueBounds(data,scaleHeight,labelHeight,"Radar");

		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : null;

		//Check and set the scale
		if (!config.scaleOverride){

			calculatedScale = calculateScale(config,scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			// important for the function populateLabels
			var graphMax = "undefined"; 
			config.logarithmic = false; // always for override
			populateLabels(config,labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,graphMax,config.scaleStepWidth);
		}

		scaleHop = maxSize/(calculatedScale.steps);

		animationLoop(config,drawScale,drawAllDataPoints,ctx);

		//Radar specific functions.
		function drawAllDataPoints(animationDecimal){
			var rotationDegree = (2*Math.PI)/data.datasets[0].data.length;

			ctx.save();
			//translate to the centre of the canvas.
			ctx.translate(width/2,height/2);
			//We accept multiple data sets for radar charts, so show loop through each set
			for (var i=0; i<data.datasets.length; i++){
				var offset = calculateOffset(config,data.datasets[i].data[0],calculatedScale,scaleHop);
				ctx.beginPath();
				ctx.moveTo(0,animationDecimal*(-1*offset));
				if(animationDecimal >= 1 && config.showTooltips) {
					var curX = width/2+offset*Math.cos(0-Math.PI/2),
						curY = height/2+offset*Math.sin(0-Math.PI/2),
						pointRadius = config.pointDot ? config.pointDotRadius+config.pointDotStrokeWidth : 10,
						ttData = data.labels[0].trim() != "" ? data.labels[0]+": "+data.datasets[i].data[0] : data.datasets[i].data[0];
					registerTooltip(ctx,{type:'circle',x:curX,y:curY,r:pointRadius},{label:data.labels[0],value:data.datasets[i].data[0]},'Radar');
				}
				for (var j=1; j<data.datasets[i].data.length; j++){
					offset = calculateOffset(config,data.datasets[i].data[j],calculatedScale,scaleHop);
					ctx.rotate(rotationDegree);
					ctx.lineTo(0,animationDecimal*(-1*offset));
					if(animationDecimal >= 1 && config.showTooltips) {
						var curX = width/2+offset*Math.cos(j*rotationDegree-Math.PI/2),
							curY = height/2+offset*Math.sin(j*rotationDegree-Math.PI/2),
							pointRadius = config.pointDot ? config.pointDotRadius+config.pointDotStrokeWidth : 10,
							ttData = data.labels[j].trim() != "" ? data.labels[j]+": "+data.datasets[i].data[j] : data.datasets[i].data[j];
						registerTooltip(ctx,{type:'circle',x:curX,y:curY,r:pointRadius},{label:data.labels[j],value:data.datasets[i].data[j]},'Radar');
					}
				}
				ctx.closePath();


				ctx.fillStyle = data.datasets[i].fillColor;
				ctx.strokeStyle = data.datasets[i].strokeColor;
				ctx.lineWidth = config.datasetStrokeWidth;
				ctx.fill();
				ctx.stroke();


				if (config.pointDot){
					ctx.fillStyle = data.datasets[i].pointColor;
					ctx.strokeStyle = data.datasets[i].pointStrokeColor;
					ctx.lineWidth = config.pointDotStrokeWidth;
					for (var k=0; k<data.datasets[i].data.length; k++){
						ctx.rotate(rotationDegree);
						ctx.beginPath();
						ctx.arc(0,animationDecimal*(-1*calculateOffset(config,data.datasets[i].data[k],calculatedScale,scaleHop)),config.pointDotRadius,2*Math.PI,false);
						ctx.fill();
						ctx.stroke();
					}					

				}
				ctx.rotate(rotationDegree);
			}
			ctx.restore();


		}
		function drawScale(){
			var rotationDegree = (2*Math.PI)/data.datasets[0].data.length;
			ctx.save();
			ctx.translate(width / 2, height / 2);	

			if (config.angleShowLineOut){
				ctx.strokeStyle = config.angleLineColor;					
				ctx.lineWidth = config.angleLineWidth;
				for (var h=0; h<data.datasets[0].data.length; h++){

					ctx.rotate(rotationDegree);
					ctx.beginPath();
					ctx.moveTo(0,0);
					ctx.lineTo(0,-maxSize);
					ctx.stroke();
				}
			}

			for (var i=0; i<calculatedScale.steps; i++){
				ctx.beginPath();

				if(config.scaleShowLine){
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineWidth = config.scaleLineWidth;
					ctx.moveTo(0,-scaleHop * (i+1));					
					for (var j=0; j<data.datasets[0].data.length; j++){
						ctx.rotate(rotationDegree);
						ctx.lineTo(0,-scaleHop * (i+1));
					}
					ctx.closePath();
					ctx.stroke();			

				}

				if (config.scaleShowLabels){				
					ctx.textAlign = 'center';
					ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily; 
					ctx.textBaseline = "middle";

					if (config.scaleShowLabelBackdrop){
						var textWidth = ctx.measureText(calculatedScale.labels[i]).width;
						ctx.fillStyle = config.scaleBackdropColor;
						ctx.beginPath();
						ctx.rect(
							Math.round(- textWidth/2 - config.scaleBackdropPaddingX),	 //X
							Math.round((-scaleHop * (i + 1)) - config.scaleFontSize*0.5 - config.scaleBackdropPaddingY),//Y
							Math.round(textWidth + (config.scaleBackdropPaddingX*2)), //Width
							Math.round(config.scaleFontSize + (config.scaleBackdropPaddingY*2)) //Height
						);
						ctx.fill();
					}						
					ctx.fillStyle = config.scaleFontColor;
					ctx.fillText(calculatedScale.labels[i],0,-scaleHop*(i+1));
				}

			}
			for (var k=0; k<data.labels.length; k++){				
			ctx.font = config.pointLabelFontStyle + " " + config.pointLabelFontSize+"px " + config.pointLabelFontFamily;
			ctx.fillStyle = config.pointLabelFontColor;
				var opposite = Math.sin(rotationDegree*k) * (maxSize + config.pointLabelFontSize);
				var adjacent = Math.cos(rotationDegree*k) * (maxSize + config.pointLabelFontSize);

				if(rotationDegree*k == Math.PI || rotationDegree*k == 0){
					ctx.textAlign = "center";
				}
				else if(rotationDegree*k > Math.PI){
					ctx.textAlign = "right";
				}
				else{
					ctx.textAlign = "left";
				}

				ctx.textBaseline = "middle";

				ctx.fillText(data.labels[k],opposite,-adjacent);

			}
			ctx.restore();
		};
		function calculateDrawingSizes(){
			maxSize = (Min([width,height])/2);

			labelHeight = config.scaleFontSize*2;

			var labelLength = 0;
			for (var i=0; i<data.labels.length; i++){
				ctx.font = config.pointLabelFontStyle + " " + config.pointLabelFontSize+"px " + config.pointLabelFontFamily;
				var textMeasurement = ctx.measureText(data.labels[i]).width;
				if(textMeasurement>labelLength) labelLength = textMeasurement;
			}

			//Figure out whats the largest - the height of the text or the width of what's there, and minus it from the maximum usable size.
			maxSize -= Max([labelLength,((config.pointLabelFontSize/2)*1.5)]);				

			maxSize -= config.pointLabelFontSize;
			maxSize = CapValue(maxSize, null, 0);
			scaleHeight = maxSize;
			//If the label height is less than 5, set it to 5 so we don't have lines on top of each other.
			labelHeight = Default(labelHeight,5);
		};
		
	}

	var Pie = function(data,config,ctx){
		
		var segmentTotal = 0;

		//In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.
		var pieRadius = Min([height/2,width/2]) - 5;

		for (var i=0; i<data.length; i++){
			segmentTotal += data[i].value;
		}
		ctx.fillStyle = 'black';
		ctx.textBaseline = 'base';

		animationLoop(config,null,drawPieSegments,ctx);

		function drawPieSegments (animationDecimal){
			var cumulativeAngle = -Math.PI/2,
			scaleAnimation = 1,
			rotateAnimation = 1;
			if (config.animation) {
				if (config.animateScale) {
					scaleAnimation = animationDecimal;
				}
				if (config.animateRotate){
					rotateAnimation = animationDecimal;
				}
			}

			for (var i=0; i<data.length; i++){
				var segmentAngle = rotateAnimation * ((data[i].value/segmentTotal) * (Math.PI*2));
				ctx.beginPath();
				ctx.arc(width/2,height/2,scaleAnimation * pieRadius,cumulativeAngle,cumulativeAngle + segmentAngle);
				ctx.lineTo(width/2,height/2);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				if(data[i].label && scaleAnimation*pieRadius*2*segmentAngle/(2*Math.PI) > config.labelFontSize) {
					function getPieLabelX(align, r) {
						switch(align) {
							case 'left':
								return -r+20;
								break;
							case 'center':
								return -r/2;
								break;
						}
						return -10;
					}

					function reversePieLabelAlign(align) {
						switch(align) {
							case 'left': return 'right'; break;
							case 'right': return 'left'; break;
							case 'center': return align; break;
						}
					}

					var fontSize = data[i].labelFontSize || config.labelFontSize+'px';

					if(fontSize.match(/^[0-9]+$/g) != null) {
						fontSize = fontSize+'px';
					}
					ctx.font = config.labelFontStyle+ " " +fontSize+" " + config.labelFontFamily;
					ctx.fillStyle = getFadeColor(animationDecimal, data[i].labelColor || 'black', data[i].color);
					ctx.textBaseline = 'middle';
					// rotate text, so it perfectly fits in segments
					var textRotation = -(cumulativeAngle + segmentAngle)+segmentAngle/2,
						tX = width/2+scaleAnimation*pieRadius*Math.cos(textRotation),
						tY = height/2-scaleAnimation*pieRadius*Math.sin(textRotation);
					ctx.textAlign = data[i].labelAlign || config.labelAlign;
					textX = getPieLabelX(ctx.textAlign, scaleAnimation*pieRadius);
					if(textRotation < -Math.PI/2) {
						textRotation -= Math.PI;
						ctx.textAlign = reversePieLabelAlign(ctx.textAlign);
						textX = -textX;
					}
					ctx.translate(tX, tY);
					ctx.rotate(-textRotation);
					ctx.fillText(data[i].label, textX, 0);
					ctx.rotate(textRotation);
					ctx.translate(-tX, -tY);
				}

				if(animationDecimal >= 1 && config.showTooltips) {
					var points = [{x:width/2,y:height/2}],
						pAmount = 50;
					points.push({x:width/2+pieRadius*Math.cos(cumulativeAngle),y:height/2+pieRadius*Math.sin(cumulativeAngle)});
					for(var p = 0; p <= pAmount; p++) {
						points.push({x:width/2+pieRadius*Math.cos(cumulativeAngle+p/pAmount*segmentAngle),y:height/2+pieRadius*Math.sin(cumulativeAngle+p/pAmount*segmentAngle)});
					}
					registerTooltip(ctx,{type:'shape',points:points},{label:data[i].label,value:data[i].value},'Pie');
				}

				if(config.segmentShowStroke){
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.stroke();
				}
				cumulativeAngle += segmentAngle;
			}			
		}		
	}

	var Doughnut = function(data,config,ctx){
		var segmentTotal = 0;

		//In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.
		var doughnutRadius = Min([height/2,width/2]) - 5;

		var cutoutRadius = doughnutRadius * (config.percentageInnerCutout/100);

		for (var i=0; i<data.length; i++){
			segmentTotal += data[i].value;
		}


		animationLoop(config,null,drawPieSegments,ctx);


		function drawPieSegments (animationDecimal){
			var cumulativeAngle = -Math.PI/2,
			scaleAnimation = 1,
			rotateAnimation = 1;
			if (config.animation) {
				if (config.animateScale) {
					scaleAnimation = animationDecimal;
				}
				if (config.animateRotate){
					rotateAnimation = animationDecimal;
				}
			}
			for (var i=0; i<data.length; i++){
				var segmentAngle = rotateAnimation * ((data[i].value/segmentTotal) * (Math.PI*2));
				ctx.beginPath();
				ctx.arc(width/2,height/2,scaleAnimation * doughnutRadius,cumulativeAngle,cumulativeAngle + segmentAngle,false);
				ctx.arc(width/2,height/2,scaleAnimation * cutoutRadius,cumulativeAngle + segmentAngle,cumulativeAngle,true);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				if(animationDecimal >= 1 && config.showTooltips) {
					var points = [],
						pAmount = 50;
					points.push({x:width/2+doughnutRadius*Math.cos(cumulativeAngle),y:height/2+doughnutRadius*Math.sin(cumulativeAngle)});
					for(var p = 0; p <= pAmount; p++) {
						points.push({x:width/2+doughnutRadius*Math.cos(cumulativeAngle+p/pAmount*segmentAngle),y:height/2+doughnutRadius*Math.sin(cumulativeAngle+p/pAmount*segmentAngle)});
					}
					points.push({x:width/2+cutoutRadius*Math.cos(cumulativeAngle+segmentAngle),y:height/2+cutoutRadius*Math.sin(cumulativeAngle+segmentAngle)});
					for(var p = pAmount; p >= 0; p--) {
						points.push({x:width/2+cutoutRadius*Math.cos(cumulativeAngle+p/pAmount*segmentAngle),y:height/2+cutoutRadius*Math.sin(cumulativeAngle+p/pAmount*segmentAngle)});
					}
					registerTooltip(ctx,{type:'shape',points:points},{label:data[i].label,value:data[i].value},'Doughnut');
				}

				if(config.segmentShowStroke){
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.stroke();
				}
				cumulativeAngle += segmentAngle;
			}			
		}			



	}

	var Line = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY, rotateLabels = 0;
		var xAxisLabel = new Array();
		var LabelIsDate = true;
		var monthArray = [];
		if (data.datasets.length*data.datasets[0].data.length > 100) {
			config.animation = false;	
		}
		
		calculateDrawingSizes();
		
		valueBounds = getValueBounds(data,scaleHeight,labelHeight,"Line");
		
		// true or fuzzy (error for negativ values (included 0))
		if (config.logarithmic !== false) {
			if (valueBounds.minValue <= 0) {
				config.logarithmic = false;
			}
		}
		
		
		 // Check if logarithmic is meaningful
		var OrderOfMagnitude = calculateOrderOfMagnitude(Math.abs(valueBounds.maxValue-valueBounds.minValue))+1;
	
		if ((config.logarithmic == 'fuzzy' && OrderOfMagnitude < 4) || config.scaleOverride) {
		  config.logarithmic = false;
		} else if (config.logarithmic == 'fuzzy') {
			config.logarithmic = true;
		}

		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";
		if (!config.scaleOverride){
			calculatedScale = calculateScale(
				config,scaleHeight,
				valueBounds.maxSteps,
				valueBounds.minSteps,
				valueBounds.maxValue,
				valueBounds.minValue,
				labelTemplateString
			);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			// important for the function populateLabels
			var graphMax = "undefined"; 
			config.logarithmic = false; // always for override
			populateLabels(
				config,
				labelTemplateString,
				calculatedScale.labels,
				calculatedScale.steps,
				config.scaleStartValue,
				graphMax,
				config.scaleStepWidth
			);
		}
		
		scaleHop = Math.floor(scaleHeight/calculatedScale.steps);
		calculateXAxisSize();
		
		if (config.pointDot == 'fuzzy' && data.labels.length/xAxisLength >= 0.25) {
			config.pointDot = false;
		}
	
		
		// YYYY in DD.MM.YYYY || MM.YYYY in DD.MM.YYYY
		if (data.labels[0].toString().match(/^((0?[1-9])|10|11|12)\.(1|2)[0-9]{3}$/)) {
			data.dateLabels = [];
			for (var i = 0; i < data.labels.length; i++) {
				data.dateLabels[i] = '01.'+data.labels[i];
			}
		} else {
			var currentYear = new Date().getFullYear();
			if (data.labels[0].toString().match(/^((0?[1-9])|[10-31])\.((0?[1-9])|10|11|12)(\.)?$/)) {
				data.dateLabels = [];
				for (var i = 0; i < data.labels.length; i++) {
					if (data.labels[i].charAt(data.labels[i].length-1) == '.') data.labels[i] = data.labels[i].substr(0,-1);
					if (currentYear != 2012 && (data.labels[i] == "29.1" || data.labels[i] == "29.01")) {
						currentYear = 2012;	
						i=0; 
					}
					data.dateLabels[i] = data.labels[i]+'.'+currentYear;
				}
			} else if (data.labels[0].toString().match(/^(1|2)[0-9]{3}$/)) {
				data.dateLabels = [];
				for (var i = 0; i < data.labels.length; i++) {
					data.dateLabels[i] = '01.01.'+data.labels[i];
				}
			}
		}
		
		// Test if all labels are dates
		if (data.dateLabels) {
			for (var i = 0; i < data.dateLabels.length; i++) {
				myDate=data.dateLabels[i].toString().split(".");
				var test_timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
				if (isNaN(test_timestamp)) {
					LabelIsDate = false;
					break;
				}
			}
		} else LabelIsDate = false;
		
		
		// difference max_date and min_date
		if (LabelIsDate === true) {
			myDate=data.dateLabels[0].split(".");
			var min_timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
			myDate=data.dateLabels[data.dateLabels.length-1].split(".");
			var max_timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
			
			var max_dif = max_timestamp-min_timestamp;
		}
		
		animationLoop(config,drawScale,drawLines,ctx);		

		function drawLines(animPc){	
			var cachedXPos = [];
			var cachedYPos = [];
			function drawLine() {
				for (var j=1; j<data.datasets[i].data.length; j++){
					if (config.bezierCurve){
						ctx.bezierCurveTo(xPos(j-0.5),yPos(i,j-1),xPos(j-0.5),yPos(i,j),xPos(j),yPos(i,j));
					}
					else{
						ctx.lineTo(xPos(j),yPos(i,j));
					}
				}				
			}
			
			function tooltipLine() {
				var showAdditional = false;
				if (document.getElementsByClassName("additionalData").length > 0) {
					showAdditional = true;	
				}
				var pointRadius = config.pointDot ? config.pointDotRadius+config.pointDotStrokeWidth : 10;
				if(animPc >= 1 && config.showTooltips) {
					for(var j = 0; j < data.datasets[i].data.length; j++) {	
							// register tooltips
							if (data.datasets[i].dot) {
								if (data.datasets[i].dot[j] == true) { 
									registerTooltip(ctx,{type:'circle',x:xPos(j),y:yPos(i,j),r:pointRadius},{label:data.labels[j],value:data.datasets[i].data[j]},'Line');
								}
							}
							else
							{
								registerTooltip(ctx,{type:'circle',x:xPos(j),y:yPos(i,j),r:pointRadius},{label:data.labels[j],value:data.datasets[i].data[j]},'Line');
							}
						}
				}
				if (animPc >=1 && showAdditional) {
					for(var j = 0; j < data.datasets[i].data.length; j++) {	
						if (data.datasets[i].additionalDataTmpl) {
							var addData = data.datasets[i].additionalData[j] ?  data.datasets[i].additionalData[j] : '';
							registerAdditionalData(xPos(j),j,data.labels[j],addData,data.datasets[i].additionalDataTmpl);
						}
					}	
				}
			}
			
			for (var i=0; i<data.datasets.length; i++){
				cachedYPos[i] = [];
				ctx.strokeStyle = data.datasets[i].strokeColor;
				ctx.lineWidth = config.datasetStrokeWidth;
				ctx.beginPath();
				ctx.moveTo(yAxisPosX, xAxisPosY - animPc*(calculateOffset(config,data.datasets[i].data[0],calculatedScale,scaleHop)))

				console.time('drawLine');
				drawLine();
				console.timeEnd('drawLine');
				
				console.time('tooltip');
				tooltipLine();
				console.timeEnd('tooltip');
				
				ctx.stroke();
				if (config.datasetFill){
					ctx.lineTo(xPos(data.datasets[i].data.length-1),xAxisPosY);
					ctx.lineTo(yAxisPosX,xAxisPosY);
					ctx.closePath();
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.fill();
				}
				else{
					ctx.closePath();
				}
				if(config.pointDot){
					ctx.fillStyle = data.datasets[i].pointColor;
					ctx.strokeStyle = data.datasets[i].pointStrokeColor;
					ctx.lineWidth = config.pointDotStrokeWidth;
					for (var k=0; k<data.datasets[i].data.length; k++){
						ctx.beginPath();
						ctx.arc(xPos(k),yPos(i,k),config.pointDotRadius,0,Math.PI*2,true);
						ctx.fill();
						ctx.stroke();
					}
				}
				 
			}
			
			function yPos(dataSet,iteration){
				if (cachedYPos[dataSet][iteration]) {
					return cachedYPos[dataSet][iteration];
				} 
				var result = xAxisPosY - animPc*(calculateOffset(config,data.datasets[dataSet].data[iteration],calculatedScale,scaleHop));	
				cachedYPos[dataSet][iteration] = result;
				return result;
			}
			function xPos(iteration){
				if (cachedXPos[iteration]) {
					return cachedXPos[iteration];
				} 
				
				var result;
				if (LabelIsDate === true) {
					if ((iteration != 0) && (iteration != -0.5)) {
						if (Math.round(iteration) != iteration) { // bezier-curve
							var myDate=data.dateLabels[iteration+0.5].split(".");				
							var timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
							var myDate=data.dateLabels[iteration-0.5].split(".");				
							var l_timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
							var dif_time = (timestamp - l_timestamp);
						
							var abs_x = (dif_time/max_dif)*xAxisLength;
							result = xPos(iteration-1) + abs_x;
						}
						else {
							var myDate=data.dateLabels[iteration].split(".");				
							var timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
							var myDate=data.dateLabels[iteration-1].split(".");				
							var l_timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
							var dif_time = timestamp - l_timestamp;
						
							var abs_x = (dif_time/max_dif)*xAxisLength;
							result = xPos(iteration-1) + abs_x;
						}
						
					}
					else
					{
						result = yAxisPosX;
					}
					
					if (iteration == -0.5) {
						var myDate=data.dateLabels[0].split(".");				
						var timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
						var myDate=data.dateLabels[iteration+1.5].split(".");				
						var l_timestamp = new Date(myDate[1]+"/"+myDate[0]+"/"+myDate[2]).getTime();
						var dif_time = (timestamp - l_timestamp);
					
						var abs_x = (dif_time/max_dif)*xAxisLength;
						result = yAxisPosX + abs_x;					
					}
					if (iteration % 1 == 0) {
						cachedXPos[iteration] = result;
					}
					return result;
				}
				else
				{
					cachedXPos[iteration] = yAxisPosX + (valueHop * iteration);
					return yAxisPosX + (valueHop * iteration);
				}
			}
		}
		function drawScale(){
			//X axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(width-widestXLabel/2+5,xAxisPosY);
			ctx.lineTo(width-(widestXLabel/2)-xAxisLength-5,xAxisPosY);
			ctx.stroke();
			
			if (LabelIsDate === true) {
				var count_years = Math.round(max_dif/31540000000); // millisec per year
				var dis_years;
				if (count_years == 1) {
					dis_years = 0;		
				} else 	if (count_years >= 1000) {
					dis_years = 200;		
				} else if (count_years >= 500) {
					dis_years = 100;		
				} else if (count_years >= 100) {
					dis_years = 20;		
				} else if (count_years >= 50) {
					dis_years = 10;		
				} else if (count_years >= 10) {
					dis_years = 2;		
				} else if (count_years >= 2) {
					dis_years = 1;		
				} 	
			}
			
			var xLabelDis = 0;
			xAxisLabel = new Array(); 
			if (LabelIsDate === true) {
				if (dis_years == 0) {
					var date_part = 1;
				} else var date_part = 2;
				var start_date = parseInt(data.dateLabels[0].toString().split(".")[date_part]);
				var end_date = parseInt(data.dateLabels[data.dateLabels.length-1].toString().split(".")[date_part]);
				
			
				for (var i = start_date; i <= end_date; i++) {
					if (dis_years == 0) {
						if (lang == "en") monthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
						else  monthArray = ["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
						xAxisLabel.push(monthArray[i-1]);
					} else if (i%dis_years == 0) {
						xAxisLabel.push(i);
					}
				}
			}
			else
			{
				is_like_rank = is_like_rank();
				if (is_like_rank !== false) {
					xLabelDisFactor = is_like_rank;
					is_like_rank = true;
				}
				
				if (is_like_rank) {
					if (data.labels.length >= 1) {
						xLabelDis = 1;		
					}
					if (data.labels.length >= 10) {
						xLabelDis = 2;		
					}
					if (data.labels.length >= 50) {
						xLabelDis = 10;		
					}
					if (data.labels.length >= 100) {
						xLabelDis = 20;		
					}
					if (data.labels.length >= 500) {
						xLabelDis = 100;		
					}
					if (data.labels.length >= 1000) {
						xLabelDis = 200;		
					}
					
					disLabelYAxis = -1;
				
					
					var round = get_round_dec(xLabelDisFactor);
					
					var mod = 0;
					while (xAxisLabel.length == 0) {
						for (var i=0; i<data.labels.length; i++){ 
							if ((data.labels[i]*Math.pow(10,round))%((xLabelDis*xLabelDisFactor)*Math.pow(10, round)) === mod) {
								xAxisLabel.push(data.labels[i]);
								if (disLabelYAxis == -1) {
									disLabelYAxis = i;
								}
							}
						}
						mod++; // if there is no normal 5,10,15 label but something like a 4,9,14 the while loop is needed.
					}
				}
				else {
					for (var i=0; i<data.labels.length; i++){ 
						xAxisLabel.push(data.labels[i]);
					}	
				}
			}
			
			if (config.pointDot == 'fuzzy') {
				config.point = true;
			}
			
			if (rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;
			for (var i=0; i<xAxisLabel.length; i++){
				ctx.save();
				if (rotateLabels > 0){
					if (LabelIsDate === true) {					
						ctx.translate(xLabel(xAxisLabel[i]),xAxisPosY + config.scaleFontSize);
						ctx.rotate(-(rotateLabels * (Math.PI/180)));
						ctx.fillText(xAxisLabel[i], 0,0);
						ctx.restore();
					} else {
						if (is_like_rank === true) {
							ctx.translate(yAxisPosX + disLabelYAxis*valueHop+xLabelDis*i*valueHop,xAxisPosY + config.scaleFontSize);
							ctx.rotate(-(rotateLabels * (Math.PI/180)));
							ctx.fillText(xAxisLabel[i], 0,0);
							ctx.restore();
						} else {
							ctx.translate(yAxisPosX + xLabelDis*valueHop,xAxisPosY + config.scaleFontSize);
							ctx.rotate(-(rotateLabels * (Math.PI/180)));
							ctx.fillText(xAxisLabel[i], 0,0);
							ctx.restore();
						}
					}
				}
				else{
					if (LabelIsDate === true) {					
						ctx.fillText(xAxisLabel[i],xLabel(xAxisLabel[i]),xAxisPosY + config.scaleFontSize+3);					
					} else {
						if (is_like_rank === true) {
							ctx.fillText(xAxisLabel[i], yAxisPosX +  disLabelYAxis*valueHop+xLabelDis*i*valueHop,xAxisPosY + config.scaleFontSize+3);
						} else {
							ctx.fillText(xAxisLabel[i], yAxisPosX + i*valueHop,xAxisPosY + config.scaleFontSize+3);
						}
					}				
				}

				ctx.beginPath();
				if (LabelIsDate === true) {					
					ctx.moveTo(xLabel(xAxisLabel[i]), xAxisPosY+3);
				} else {
					if (is_like_rank === true) {
						ctx.moveTo(yAxisPosX +  disLabelYAxis*valueHop+ xLabelDis * i * valueHop, xAxisPosY+3);
					} else {
						ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY+3);
					}
				}
				
				
				if(config.scaleShowGridLines){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					if (LabelIsDate === true) {					
						ctx.lineTo(xLabel(xAxisLabel[i]), 5);
					} else {
						if (is_like_rank === true) {
							ctx.lineTo(yAxisPosX +  disLabelYAxis*valueHop+ xLabelDis * i * valueHop, 5);
						} else {
							ctx.lineTo(yAxisPosX + i * valueHop, 5);
						}
					}
				}
				else{
					if (LabelIsDate === true) {
						ctx.lineTo(xLabel(xAxisLabel[i]), xAxisPosY+3);	
					} else {
						if (is_like_rank === true) {
							ctx.lineTo(yAxisPosX +  disLabelYAxis*valueHop+ xLabelDis * i * valueHop, xAxisPosY+3);	
						} else {
							ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY+3);	
						}
					}
				}
				ctx.stroke();
			}
			
			function is_like_rank() {
				var distance = data.labels[1]-data.labels[0];
				var round = get_round_dec(distance);
	
				var like_rank = distance;
				for (var i=2; i<data.labels.length; i++){ 
						if (round_dec(data.labels[i]-data.labels[i-1],round) != distance) {
							like_rank = false;
							break;
							
						}
					}
				return like_rank;
			}
			
			function xLabel(value) {
				if (isNumber(value)) {
					return xLabelYear(value);	
				}
				
				return xLabelMonth(monthArray.indexOf(value)+1);	
			}
			
			function xLabelYear(year){
					var year_timestamp = new Date("01/01/"+year).getTime();
			
					return yAxisPosX+((year_timestamp-min_timestamp)/max_dif)*xAxisLength;
			}
			
			function xLabelMonth(mon){
					var year_timestamp = new Date(mon+"/01/"+currentYear).getTime();
					return yAxisPosX+((year_timestamp-min_timestamp)/max_dif)*xAxisLength;
			}
			
			
			//Y axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+5);
			ctx.lineTo(yAxisPosX,5);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			
			if (config.scaleShowLabels){
				ctx.fillText(thousand_separator(calculatedScale.graphMin),yAxisPosX-8,xAxisPosY);
			}
			
			for (var j=0; j<calculatedScale.steps; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-3,xAxisPosY - ((j+1) * scaleHop));
				if (config.scaleShowGridLines){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(yAxisPosX + xAxisLength + 5,xAxisPosY - ((j+1) * scaleHop));					
				}
				else{
					ctx.lineTo(yAxisPosX-0.5,xAxisPosY - ((j+1) * scaleHop));
				}

				ctx.stroke();

				if (config.scaleShowLabels){
					ctx.fillText(thousand_separator(calculatedScale.labels[j]),yAxisPosX-8,xAxisPosY - ((j+1) * scaleHop));
				}
			}


		}
		function calculateXAxisSize(){
			var longestText = 1;
			//if we are showing the labels
			if (config.scaleShowLabels){
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
				for (var i=0; i<calculatedScale.labels.length; i++){
					var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
					longestText = (measuredText > longestText)? measuredText : longestText;
				}
				//Add a little extra padding from the y axis
				longestText +=10;
			}
			xAxisLength = width - longestText - widestXLabel;
			valueHop = xAxisLength/(data.labels.length-1)	

			yAxisPosX = width-widestXLabel/2-xAxisLength;
			xAxisPosY = scaleHeight + config.scaleFontSize/2;				
		}		
		function calculateDrawingSizes(){
			maxSize = height;

			//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
			  ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;

			  var widestYLabel;
			  var upperValue = Number.MIN_VALUE;
			  var lowerValue = Number.MAX_VALUE;
			  for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
				  var k = i;
				  var temp = data.datasets[0].data[j];
				  while ( k > 0 ){ //get max of stacked data
					temp += data.datasets[k].data[j];
					k--;
				  }
				  if ( temp > upperValue) { upperValue = temp; };
				  if ( temp < lowerValue) { lowerValue = temp; };
				}
			  };
			  var widestYLabel = ctx.measureText(upperValue).width;
			  
			widestXLabel = 1;
			//alert(data.datasets.data[0]);
			for (var i=0; i<data.labels.length; i++){
				var textLength = ctx.measureText(data.labels[i]).width;
				//If the text length is longer - make that equal to longest text!
				widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
			}
			if ((width-widestYLabel-10-widestXLabel)/data.labels.length < widestXLabel){
				rotateLabels = 45;
				if ((width-widestYLabel-10-widestXLabel)/data.labels.length < Math.cos(rotateLabels) * widestXLabel){
					rotateLabels = 90;
					maxSize -= widestXLabel; 
				}
				else{
					maxSize -= Math.sin(rotateLabels) * widestXLabel;
				}
			}
			else{
				maxSize -= config.scaleFontSize;
			}

			//Add a little padding between the x line and the text
			maxSize -= 5;


			labelHeight = config.scaleFontSize;

			maxSize -= labelHeight;
			//Set 5 pixels greater than the font size to allow for a little padding from the X axis.

			scaleHeight = maxSize;

			//Then get the area above we can safely draw on.

		}		
	}

	var LineDoubleY = function(data,config,ctx){
		var maxSize, scaleHop_Y1, scaleHop_Y2, calculatedScale, calculatedScale_Y1, calculatedScale_Y2 , distance_Y2, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY, rotateLabels = 0;
			
		calculateDrawingSizes();
		
		valueBounds = getValueBounds(data,scaleHeight,labelHeight,"LineDoubleY");
		
		
		
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";
	
		if (config.climate) {
			// minimum value should be <= 0	
			if (valueBounds.minValue_Y2 > 0) {
				valueBounds.minValue_Y2 = 0;
			}
			if (valueBounds.minValue_Y1 > 0) {
				valueBounds.minValue_Y1 = 0;
			}
		
			if (config.climate) {
				var maxTemperature = valueBounds.maxValue_Y1;
			}
			
			/**
			 *  get the maximum value (2* °C is mm)
			 *  so 20°C maximum is 40mm => maximum = 40
			 */
			if (valueBounds.maxValue_Y1*2 < valueBounds.maxValue_Y2) {
				valueBounds.maxValue_Y1 = valueBounds.maxValue_Y2/2;
			}
			
		}
		
		
		calculatedScale_Y1 = calculateScale(config,scaleHeight,valueBounds.maxSteps,
												valueBounds.minSteps,valueBounds.maxValue_Y1,
												valueBounds.minValue_Y1,labelTemplateString);
		
		
		calculatedScale_Y2 = calculateScale(config,scaleHeight,valueBounds.maxSteps,
													valueBounds.minSteps,valueBounds.maxValue_Y2,valueBounds.minValue_Y2,labelTemplateString);
		
		
		if (config.climate) {
			// climate diagramm scale => mm starts at 0 where °C is zero!
			// mm is two times the °C
			calculatedScale_Y2 = climateScaleY2(config,calculatedScale_Y1,calculatedScale_Y2,
												   scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue_Y2,
												   valueBounds.minValue_Y2,labelTemplateString);
		}
		
		calculatedScale = calculatedScale_Y1; // it is only important for x-Axis
		
		
		scaleHop_Y1 = Math.floor(scaleHeight/calculatedScale_Y1.steps);
		scaleHop_Y2 = Math.floor(scaleHeight/calculatedScale_Y2.steps);
		calculateXAxisSize();
		animationLoop(config,drawScale,drawLines,ctx);		
		
		function drawLines(animPc){
			var pointArray = [];
			var pointRadius = config.pointDotRadius+config.pointDotStrokeWidth;
			var zeroY = xAxisPosY - animPc*(calculateOffset(config,0,calculatedScale_Y1,scaleHop_Y1));
			for (var n_scale = 1; n_scale<=2; n_scale++) {
				pointArray[n_scale] = [];
				var actual_dataset = eval('data.datasets_Y'+n_scale);
				var actual_scaleHop = eval('scaleHop_Y'+n_scale);
				var actual_calculatedScale = eval('calculatedScale_Y'+n_scale);
				for (var i=0; i<actual_dataset.length; i++){
					ctx.strokeStyle = actual_dataset[i].strokeColor;
					ctx.lineWidth = config.datasetStrokeWidth;
					ctx.beginPath();
					ctx.moveTo(yAxisPosX, xAxisPosY - animPc*(calculateOffset(config,actual_dataset[i].data[0],
																			  actual_calculatedScale,actual_scaleHop)));
					
					pointArray[n_scale][0] = {'x':yAxisPosX,'y':xAxisPosY - animPc*(calculateOffset(config,actual_dataset[i].data[0],
																			  actual_calculatedScale,actual_scaleHop))};
					for (var j=1; j<actual_dataset[i].data.length; j++){
						ctx.lineTo(xPos(j),yPos(i,j));
						
						pointArray[n_scale][j] = {'x':xPos(j),'y':yPos(i,j)};
						
					}
					ctx.stroke();
					if (config.datasetFill && !config.climate){
						ctx.lineTo(yAxisPosX + (valueHop*(actual_dataset[i].data.length-1)),xAxisPosY);
						ctx.lineTo(yAxisPosX,xAxisPosY);
						ctx.closePath();
						ctx.fillStyle = actual_dataset[i].fillColor;
						ctx.fill();
					}
					else {
						ctx.closePath();
					}
					
					if(config.pointDot){
						ctx.fillStyle = actual_dataset[i].pointColor;
						ctx.strokeStyle = actual_dataset[i].pointStrokeColor;
						ctx.lineWidth = config.pointDotStrokeWidth;
						for (var k=0; k<actual_dataset[i].data.length; k++){
							ctx.beginPath();
							ctx.arc(yAxisPosX + (valueHop *k),xAxisPosY - animPc*(calculateOffset(config,actual_dataset[i].data[k],
																								  actual_calculatedScale,actual_scaleHop)),
									config.pointDotRadius,0,Math.PI*2,true);
							if(animPc >= 1 && config.showTooltips) {
								registerTooltip(ctx,{type:'circle',x:xPos(k),y:yPos(i,k),r:pointRadius},
												{label:data.labels[k],value:actual_dataset[i].data[k]},'LineDoubleY');
							}
							ctx.fill();
							ctx.stroke();
						}
					}
					
					if (n_scale == 2 && config.datasetFill && config.climate){
						var numberOfLines = Math.floor(xAxisLength/(2*(pointRadius+config.datasetStrokeWidth)));
						var numberOfValues = data.datasets_Y1[i].data.length;
						// lines between two points
						var linesPerPart = Math.floor(numberOfLines/numberOfValues);
						// all lines
						var numberOfLines = linesPerPart*numberOfValues;
						
						var j,arid,stepsBetween,rainY,tempY,HalfLine = config.datasetStrokeWidth/2;
						
						for (var l=1; l < numberOfLines; l++) {	
							j = Math.floor(l/linesPerPart);
							stepsBetween = l/linesPerPart-j;
							if (j+1 < numberOfValues) {
								// true if rainfall < temperature
								arid =  pointArray[2][j].y+stepsBetween*(pointArray[2][j+1].y-pointArray[2][j].y) >
										pointArray[1][j].y+stepsBetween*(pointArray[1][j+1].y-pointArray[1][j].y);
							
								// if the climate is arid => red else blue
								ctx.strokeStyle = arid ? data.datasets_Y1[i].strokeColor : data.datasets_Y2[i].strokeColor;
								
								if (stepsBetween == 0) {
									rainY = arid ? pointArray[2][j].y-pointRadius : pointArray[2][j].y+pointRadius;
									tempY = arid ? pointArray[1][j].y+pointRadius : pointArray[1][j].y-pointRadius;
								} else {
									rainY = pointArray[2][j].y+stepsBetween*(pointArray[2][j+1].y-pointArray[2][j].y);
									tempY = pointArray[1][j].y+stepsBetween*(pointArray[1][j+1].y-pointArray[1][j].y);
									rainY += arid ? -HalfLine : HalfLine;
									tempY += arid ? HalfLine : -HalfLine;
								}
								// no humidity lines under 0
								if (tempY > zeroY) {
									tempY = zeroY;	
								}
								ctx.beginPath();
								ctx.moveTo(xPos(j+stepsBetween),tempY);
								ctx.lineTo(xPos(j+stepsBetween),rainY);
								ctx.closePath();
								ctx.stroke();
							}
						}

						
					}
				}
			
				
				
			}
			function yPos(dataSet,iteration){	
				return xAxisPosY - animPc*(calculateOffset(config,actual_dataset[dataSet].data[iteration],actual_calculatedScale,actual_scaleHop));			
			}
			function xPos(iteration){
				return yAxisPosX + (valueHop * iteration);
			}
		}
		function drawScale(){
			//X axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY);
			ctx.lineTo(yAxisPosX+xAxisLength+0.5,xAxisPosY);
			ctx.stroke();
			
			
			if (rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;
			for (var i=0; i<data.labels.length; i++){
				ctx.save();
				if (rotateLabels > 0){
					ctx.translate(yAxisPosX + i*valueHop,xAxisPosY + config.scaleFontSize);
					ctx.rotate(-(rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0,0);
					ctx.restore();
				}
				
				else{
					ctx.fillText(data.labels[i], yAxisPosX + i*valueHop,xAxisPosY + config.scaleFontSize+3);					
				}

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY+3);
				
				//Check i isnt 0, so we dont go over the Y axis twice.
				if(config.scaleShowGridLines && i>0 && i < (data.labels.length-1)){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;					
					ctx.lineTo(yAxisPosX + i * valueHop, 5);
				}
				else{
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY+3);				
				}
				ctx.stroke();
			}
			
			//Y axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			// Left y - Axis
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+5);
			ctx.lineTo(yAxisPosX,5);
			ctx.stroke();
			// Right y - Axis
			ctx.beginPath();
			ctx.moveTo(yAxisPosX+xAxisLength,xAxisPosY+5);
			ctx.lineTo(yAxisPosX+xAxisLength,5);
			ctx.stroke();
			
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			
			for (var n_scale = 1; n_scale <= 2; n_scale++) {
				var actual_calculatedScale = eval('calculatedScale_Y'+n_scale);
				var actual_scaleHop = eval('scaleHop_Y'+n_scale);
				var actual_dataset = eval('data.datasets_Y'+n_scale);
					for (var j=0; j<actual_calculatedScale.steps; j++){
					ctx.beginPath();
					if (n_scale == 1) {
						ctx.moveTo(yAxisPosX-3,xAxisPosY - ((j+1) * actual_scaleHop));
					} else {
						ctx.moveTo(yAxisPosX+xAxisLength+3,xAxisPosY - ((j+1) * actual_scaleHop));
					}
					if (n_scale == 1) {
						ctx.lineTo(yAxisPosX-0.5,xAxisPosY - ((j+1) * actual_scaleHop));
					} else {
						ctx.lineTo(yAxisPosX+xAxisLength+0.5,xAxisPosY - ((j+1) * actual_scaleHop));
					}
					ctx.stroke();
					if (thousand_separator(actual_calculatedScale.labels[j]) == 0) {
						ctx.beginPath();
						ctx.moveTo(yAxisPosX,xAxisPosY - ((j+1) * actual_scaleHop));
						ctx.lineTo(yAxisPosX+xAxisLength+0.5,xAxisPosY - ((j+1) * actual_scaleHop));
						ctx.stroke();
					}
					
					
					
					if (config.scaleShowLabels){
						ctx.fillStyle = actual_dataset[0].strokeColor;
						if (n_scale == 1) {
							ctx.fillText(thousand_separator(actual_calculatedScale.labels[j]),yAxisPosX-8,xAxisPosY - ((j+1) * actual_scaleHop));
							if (parseInt(actual_calculatedScale.labels[j]) > maxTemperature) {
								break; // go to n_scale = 2	
							}
						} else {
							// if this is a climate diagram start mm with 0
							if ((config.climate && actual_calculatedScale.labels[j] >= 0) || !config.climate) {
								ctx.fillText(thousand_separator(actual_calculatedScale.labels[j]),
											 yAxisPosX+xAxisLength+distance_Y2+8,xAxisPosY - ((j+1) * actual_scaleHop));
							}
						}
					}
				}
			}
			
			
			
			
		}
		function calculateXAxisSize(){
			var longestText_Y1 = 1;
			var longestText_Y2 = 1;
			var longestText;
			//if we are showing the labels
			if (config.scaleShowLabels){
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
				for (var i=0; i<calculatedScale_Y1.labels.length; i++){
					var measuredText = ctx.measureText(calculatedScale_Y1.labels[i]).width;
					longestText_Y1 = (measuredText > longestText_Y1)? measuredText : longestText_Y1;
				}
				for (var i=0; i<calculatedScale_Y2.labels.length; i++){
					var measuredText = ctx.measureText(calculatedScale_Y2.labels[i]).width;
					longestText_Y2 = (measuredText > longestText_Y2)? measuredText : longestText_Y2;
				}
				//Add a little extra padding from the y axis
				longestText =20+longestText_Y1+longestText_Y2;
			}
			distance_Y2 = longestText_Y2;
			
			xAxisLength = width - longestText - widestXLabel;
			valueHop = Math.floor(xAxisLength/(data.labels.length-1));	
				
			yAxisPosX = width-widestXLabel/2-xAxisLength-longestText_Y2;
			xAxisPosY = scaleHeight + config.scaleFontSize/2;				
		}		
		function calculateDrawingSizes(){
			maxSize = height;

			//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
			widestXLabel = 1;
			for (var i=0; i<data.labels.length; i++){
				var textLength = ctx.measureText(data.labels[i]).width;
				//If the text length is longer - make that equal to longest text!
				widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
			}
			if (width/data.labels.length < widestXLabel){
				rotateLabels = 45;
				if (width/data.labels.length < Math.cos(rotateLabels) * widestXLabel){
					rotateLabels = 90;
					maxSize -= widestXLabel; 
				}
				else{
					maxSize -= Math.sin(rotateLabels) * widestXLabel;
				}
			}
			else{
				maxSize -= config.scaleFontSize;
			}
			
			//Add a little padding between the x line and the text
			maxSize -= 5;
			
			
			labelHeight = config.scaleFontSize;
			
			maxSize -= labelHeight;
			//Set 5 pixels greater than the font size to allow for a little padding from the X axis.
			
			scaleHeight = maxSize;
			
			//Then get the area above we can safely draw on.
			
		}		
		

		
	}
	
	
	var StackedBar = function(data,config,ctx){
    var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY,barWidth, rotateLabels = 0;
      
    calculateDrawingSizes();
    
    valueBounds = getValueBounds(data,scaleHeight,labelHeight,"StackedBar");
		
    //Check and set the scale
    labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";
    if (!config.scaleOverride){
	  var maxsumvalue = 0;
      for (var j=0; j<data.datasets[0].data.length; j++){
          var sumvalue = 0;
		  for (var i=0; i<data.datasets.length; i++){
			sumvalue = sumvalue+data.datasets[i].data[j];
		  }
		  if (sumvalue > maxsumvalue) {
			maxsumvalue = sumvalue;
		  }
	  }
	  if (maxsumvalue == 100) {
			calculatedScale = {
			steps : 10,
			stepValue : 10,
			graphMin : 0,
			labels : ["10","20","30","40","50","60","70","80","90","100"]
		  }
	  }
	  else {
		calculatedScale = calculateScale(config,scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
	  }
    }
    else {
      calculatedScale = {
        steps : config.scaleSteps,
        stepValue : config.scaleStepWidth,
        graphMin : config.scaleStartValue,
        labels : []
      }
	  // important for the function populateLabels
		var graphMax = "undefined"; 
		config.logarithmic = false; // always for override
		populateLabels(config,labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,graphMax,config.scaleStepWidth);
    }
    
    scaleHop = Math.floor(scaleHeight/calculatedScale.steps);
    calculateXAxisSize();
    animationLoop(config,drawScale,drawBars,ctx);    
    
    function drawBars(animPc){
      ctx.lineWidth = config.barStrokeWidth;
      var yStart = new Array(data.datasets.length);
      for (var i=0; i<data.datasets.length; i++){
          ctx.fillStyle = data.datasets[i].fillColor;
          ctx.strokeStyle = data.datasets[i].strokeColor;
        if (i == 0) { //on the first pass, act as normal
          for (var j=0; j<data.datasets[i].data.length; j++){
            var barOffset = yAxisPosX + config.barValueSpacing + valueHop*j + barWidth*i + config.barDatasetSpacing*i + config.barStrokeWidth*i;
            ctx.beginPath();
            ctx.moveTo(barOffset, xAxisPosY);
            ctx.lineTo(barOffset, xAxisPosY - animPc*calculateOffset(config,data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2));
            ctx.lineTo(barOffset + barWidth, xAxisPosY - animPc*calculateOffset(config,data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2));
            ctx.lineTo(barOffset + barWidth, xAxisPosY);
            yStart[j] = data.datasets[i].data[j];
            if(config.barShowStroke){
              ctx.stroke();
            }
            ctx.closePath();
            ctx.fill();
			if(animPc >= 1 && config.showTooltips) {
						// register tooltips
						var x = barOffset,
							height = calculateOffset(config,data.datasets[i].data[j],calculatedScale,scaleHop),
							y = xAxisPosY-height,
							width = barWidth;
							registerTooltip(ctx,{type:'rect',x:x,y:y,width:width,height:height},{label:data.datasets[i].title,value:data.datasets[i].data[j]},'Bar');
					}
          }
        } else { //on all other passes, just build on top of the last set of data
         
		 for (var j=0; j<data.datasets[i].data.length; j++){
            var barOffset = yAxisPosX + config.barValueSpacing + valueHop*j;
            ctx.beginPath();
			
            ctx.moveTo(barOffset, xAxisPosY - (animPc*calculateOffset(config,yStart[j],calculatedScale,scaleHop)) + 1);
            ctx.lineTo(barOffset, xAxisPosY - animPc*calculateOffset(config,data.datasets[i].data[j]+yStart[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2));
            ctx.lineTo(barOffset + barWidth, xAxisPosY - animPc*calculateOffset(config,data.datasets[i].data[j]+yStart[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2));
            ctx.lineTo(barOffset + barWidth, xAxisPosY - (animPc*calculateOffset(config,yStart[j],calculatedScale,scaleHop)) + 1);
            
            if(config.barShowStroke){
              ctx.stroke();
            }
            ctx.closePath();
            ctx.fill();
			
			if(animPc >= 1 && config.showTooltips) {
						// register tooltips
						var x = barOffset,
							height = calculateOffset(config,data.datasets[i].data[j]+yStart[j],calculatedScale,scaleHop)-calculateOffset(config,yStart[j],calculatedScale,scaleHop),
							y = xAxisPosY-calculateOffset(config,data.datasets[i].data[j]+yStart[j],calculatedScale,scaleHop),
							width = barWidth;
							registerTooltip(ctx,{type:'rect',x:x,y:y,width:width,height:height},{label:data.datasets[i].title,value:data.datasets[i].data[j]},'Bar');
					}
			yStart[j] = data.datasets[i].data[j]+yStart[j];
		  }
		  
		 
        }
		
			
		
      }
    }

    function drawScale(){
      //X axis line
      ctx.lineWidth = config.scaleLineWidth;
      ctx.strokeStyle = config.scaleLineColor;
      ctx.beginPath();
      ctx.moveTo(width-widestXLabel/2+5,xAxisPosY);
      ctx.lineTo(width-(widestXLabel/2)-xAxisLength-5,xAxisPosY);
      ctx.stroke();
      
      
      if (rotateLabels > 0){
        ctx.save();
        ctx.textAlign = "right";
      }
      else{
        ctx.textAlign = "center";
      }
      ctx.fillStyle = config.scaleFontColor;
      for (var i=0; i<data.labels.length; i++){
        ctx.save();
        if (rotateLabels > 0){
          ctx.translate(yAxisPosX + i*valueHop + valueHop/2,xAxisPosY + config.scaleFontSize);
          ctx.rotate(-(rotateLabels * (Math.PI/180)));
          ctx.fillText(data.labels[i], 0,0);
          ctx.restore();
        }
        
        else{
          ctx.fillText(data.labels[i], yAxisPosX + i*valueHop + valueHop/2,xAxisPosY + config.scaleFontSize+3);          
        }

        ctx.beginPath();
        ctx.moveTo(yAxisPosX + (i+1) * valueHop, xAxisPosY+3);
        
        //Check i isnt 0, so we dont go over the Y axis twice.
          ctx.lineWidth = config.scaleGridLineWidth;
          ctx.strokeStyle = config.scaleGridLineColor;          
          ctx.lineTo(yAxisPosX + (i+1) * valueHop, 5);
        ctx.stroke();
      }
      
      //Y axis
      ctx.lineWidth = config.scaleLineWidth;
      ctx.strokeStyle = config.scaleLineColor;
      ctx.beginPath();
      ctx.moveTo(yAxisPosX,xAxisPosY+5);
      ctx.lineTo(yAxisPosX,5);
      ctx.stroke();
      
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (var j=0; j<calculatedScale.steps; j++){
        ctx.beginPath();
        ctx.moveTo(yAxisPosX-3,xAxisPosY - ((j+1) * scaleHop));
        if (config.scaleShowGridLines){
          ctx.lineWidth = config.scaleGridLineWidth;
          ctx.strokeStyle = config.scaleGridLineColor;
          ctx.lineTo(yAxisPosX + xAxisLength + 5,xAxisPosY - ((j+1) * scaleHop));          
        }
        else{
          ctx.lineTo(yAxisPosX-0.5,xAxisPosY - ((j+1) * scaleHop));
        }
        
        ctx.stroke();
        if (config.scaleShowLabels){
          ctx.fillText(thousand_separator(calculatedScale.labels[j]),yAxisPosX-8,xAxisPosY - ((j+1) * scaleHop));
        }
      }
      
      
    }
    function calculateXAxisSize(){
      var longestText = 1;
      //if we are showing the labels
      if (config.scaleShowLabels){
        ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
        for (var i=0; i<calculatedScale.labels.length; i++){
          var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
          longestText = (measuredText > longestText)? measuredText : longestText;
        }
        //Add a little extra padding from the y axis
        longestText +=10;
      }
      xAxisLength = width - longestText - widestXLabel;
      valueHop = xAxisLength/(data.labels.length);  
      
      barWidth = (valueHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - (config.barStrokeWidth/2)-1);
      
      yAxisPosX = width-widestXLabel/2-xAxisLength;
      xAxisPosY = scaleHeight + config.scaleFontSize/2;        
    }    
    function calculateDrawingSizes(){
      maxSize = height;
	  
	  //Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
      ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;

	  var widestYLabel;
	  var upperValue = Number.MIN_VALUE;
      var lowerValue = Number.MAX_VALUE;
      for (var i=0; i<data.datasets.length; i++){
        for (var j=0; j<data.datasets[i].data.length; j++){
          var k = i;
          var temp = data.datasets[0].data[j];
          while ( k > 0 ){ //get max of stacked data
            temp += data.datasets[k].data[j];
            k--;
          }
          if ( temp > upperValue) { upperValue = temp; };
          if ( temp < lowerValue) { lowerValue = temp; };
        }
      };
	  var widestYLabel = ctx.measureText(upperValue).width;
	  
      
      widestXLabel = 1;
      for (var i=0; i<data.labels.length; i++){
        var textLength = ctx.measureText(data.labels[i]).width;
        //If the text length is longer - make that equal to longest text!
        widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
      }
      if ((width-widestYLabel-10-widestXLabel)/data.labels.length < widestXLabel){
        rotateLabels = 45;
        if (width/data.labels.length < Math.cos(rotateLabels) * widestXLabel){
          rotateLabels = 90;
          maxSize -= widestXLabel; 
        }
        else{
          maxSize -= Math.sin(rotateLabels) * widestXLabel;
        }
      }
      else{
        maxSize -= config.scaleFontSize;
      }
      
      //Add a little padding between the x line and the text
      maxSize -= 5;
      
      
      labelHeight = config.scaleFontSize;
      
      maxSize -= labelHeight;
      //Set 5 pixels greater than the font size to allow for a little padding from the X axis.
      
      scaleHeight = maxSize;
      
      //Then get the area above we can safely draw on.
      
    }    
  }
	
	
	var Bar = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY,barWidth, rotateLabels = 0;
	
		calculateDrawingSizes();

		valueBounds = getValueBounds(data,scaleHeight,labelHeight,"Bar");
		
		// true or fuzzy (error for negativ values (included 0))
		if (config.logarithmic !== false) {
			if (valueBounds.minValue <= 0) {
				config.logarithmic = false;
			}
		}
		
		
		 // Check if logarithmic is meaningful
		var OrderOfMagnitude = calculateOrderOfMagnitude(Math.abs(valueBounds.maxValue-valueBounds.minValue))+1;
	
		if ((config.logarithmic == 'fuzzy' && OrderOfMagnitude < 4) || config.scaleOverride) {
		  config.logarithmic = false;
		} else if (config.logarithmic == 'fuzzy') {
			config.logarithmic = true;
		}
		
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";
		if (!config.scaleOverride){
			calculatedScale = calculateScale(config,scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			// important for the function populateLabels
			var graphMax = "undefined"; 
			config.logarithmic = false; // always for override
			populateLabels(config,labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,graphMax,config.scaleStepWidth);
		}

		
		scaleHop = Math.floor(scaleHeight/calculatedScale.steps);
		calculateXAxisSize();
		
		var zeroY = 0;
		if (valueBounds.minValue < 0) {
			zeroY = calculateOffset(config,0,calculatedScale,scaleHop);
		}
		
		
		animationLoop(config,drawScale,drawBars,ctx);		

		function drawBars(animPc){			
			ctx.lineWidth = config.barStrokeWidth;
			for (var i=0; i<data.datasets.length; i++){
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.strokeStyle = data.datasets[i].strokeColor;
				for (var j=0; j<data.datasets[i].data.length; j++){
					var barOffset = yAxisPosX + config.barValueSpacing + valueHop*j + barWidth*i + config.barDatasetSpacing*i + config.barStrokeWidth*i;
					
					
					ctx.beginPath();				
					ctx.moveTo(barOffset, xAxisPosY-zeroY);
					ctx.lineTo(barOffset, xAxisPosY - animPc*calculateOffset(config,data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2));
					ctx.lineTo(barOffset + barWidth, xAxisPosY - animPc*calculateOffset(config,data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2));
					ctx.lineTo(barOffset + barWidth, xAxisPosY-zeroY);
					if(config.barShowStroke){
						ctx.stroke();
					}
					ctx.closePath();
					ctx.fill();
					
					if(animPc >= 1 && config.showTooltips) {
						// register tooltips
						var x = barOffset,
							height = calculateOffset(config,data.datasets[i].data[j],calculatedScale,scaleHop),
							y = xAxisPosY-height,
							width = barWidth;
						registerTooltip(ctx,{type:'rect',x:x,y:y,width:width,height:height},{label:data.labels[j],value:data.datasets[i].data[j]},'Bar');
					}
				}
				
				 
			
			}
			
			if (config.showAverageLine && data.datasets.length == 1) {
				var sum_values = 0;
				for (var j=0; j<data.datasets[0].data.length; j++){
					sum_values = sum_values+parseInt(data.datasets[0].data[j]);
				}
				var average_value = sum_values/data.datasets[0].data.length;
				ctx.lineWidth = config.barStrokeWidth;
				ctx.strokeStyle = config.AverageStrokeColor;
				ctx.beginPath();
				var x = yAxisPosX;
				var y = xAxisPosY-calculateOffset(config,average_value,calculatedScale,scaleHop)+(config.barStrokeWidth/2);
				var height = config.barStrokeWidth;
				var width = xAxisLength;
				ctx.moveTo(yAxisPosX, xAxisPosY-animPc*(calculateOffset(config,average_value,calculatedScale,scaleHop)+(config.barStrokeWidth/2)));
				ctx.lineTo(yAxisPosX+xAxisLength,xAxisPosY-animPc*(calculateOffset(config,average_value,calculatedScale,scaleHop)+(config.barStrokeWidth/2)));
				registerTooltip(ctx,{type:'rect',x:x,y:y,width:width,height:height},{label:"Average",value:average_value},'Bar');
				ctx.stroke();
				ctx.closePath();
			}

		}
		function drawScale(){
			//X axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(width-widestXLabel/2+5,xAxisPosY);
			ctx.lineTo(width-(widestXLabel/2)-xAxisLength-5,xAxisPosY);
			ctx.stroke();


			if (rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;
			for (var i=0; i<data.labels.length; i++){
				ctx.save();
				if (rotateLabels > 0){
					ctx.translate(yAxisPosX + i*valueHop + valueHop/2,xAxisPosY + config.scaleFontSize);
					ctx.rotate(-(rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0,0);
					ctx.restore();
				}

				else{
					ctx.fillText(data.labels[i], yAxisPosX + i*valueHop + valueHop/2,xAxisPosY + config.scaleFontSize+3);					
				}

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + (i+1) * valueHop, xAxisPosY+3);

				//Check i isnt 0, so we dont go over the Y axis twice.
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;					
					ctx.lineTo(yAxisPosX + (i+1) * valueHop, 5);
				ctx.stroke();
			}
			//ctx.fillText("xLabel", yAxisPosX+xAxisLength+"xLabel".length*5,xAxisPosY+5);					
			

			//Y axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+5);
			ctx.lineTo(yAxisPosX,5);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			if (config.scaleShowLabels){
				ctx.fillText(thousand_separator(calculatedScale.graphMin),yAxisPosX-8,xAxisPosY);
			}
			
			for (var j=0; j<calculatedScale.steps; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-3,xAxisPosY - ((j+1) * scaleHop));
				if (config.scaleShowGridLines){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(yAxisPosX + xAxisLength + 5,xAxisPosY - ((j+1) * scaleHop));					
				}
				else{
					ctx.lineTo(yAxisPosX-0.5,xAxisPosY - ((j+1) * scaleHop));
				}

				ctx.stroke();
				if (config.scaleShowLabels){
					ctx.fillText(thousand_separator(calculatedScale.labels[j]),yAxisPosX-8,xAxisPosY - ((j+1) * scaleHop));
				}
			}
			
			if (zeroY != 0) {
				ctx.strokeStyle = '#aaa';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(yAxisPosX, xAxisPosY-zeroY);
				ctx.lineTo(yAxisPosX+xAxisLength, xAxisPosY-zeroY);
				ctx.stroke();
			}

		}
		
	
		
		function calculateXAxisSize(){
			var longestText = 1;
			//if we are showing the labels
			if (config.scaleShowLabels){
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
				for (var i=0; i<calculatedScale.labels.length; i++){
					var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
					longestText = (measuredText > longestText)? measuredText : longestText;
				}
				//Add a little extra padding from the y axis
				longestText +=10;
			}
			xAxisLength = width - longestText - widestXLabel;
			valueHop = xAxisLength/(data.labels.length);	

			barWidth = (valueHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - ((config.barStrokeWidth/2)*data.datasets.length-1))/data.datasets.length;

			yAxisPosX = width-widestXLabel/2-xAxisLength;
			xAxisPosY = scaleHeight + config.scaleFontSize/2;				
		}		
		function calculateDrawingSizes(){
			maxSize = height;

			//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
			  ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;

			  var widestYLabel;
			  var upperValue = Number.MIN_VALUE;
			  var lowerValue = Number.MAX_VALUE;
			  for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
				  var k = i;
				  var temp = data.datasets[0].data[j];
				  while ( k > 0 ){ //get max of stacked data
					temp += data.datasets[k].data[j];
					k--;
				  }
				  if ( temp > upperValue) { upperValue = temp; };
				  if ( temp < lowerValue) { lowerValue = temp; };
				}
			  };
			  var widestYLabel = ctx.measureText(upperValue).width;
			  
			widestXLabel = 1;
			for (var i=0; i<data.labels.length; i++){
				var textLength = ctx.measureText(data.labels[i]).width;
				//If the text length is longer - make that equal to longest text!
				widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
			}
			if ((width-widestYLabel-10-widestXLabel)/data.labels.length < widestXLabel){
				rotateLabels = 45;
				if ((width-widestYLabel-10-widestXLabel) < Math.cos(rotateLabels) * widestXLabel){
					rotateLabels = 90;
					maxSize -= widestXLabel; 
				}
				else{
					maxSize -= Math.sin(rotateLabels) * widestXLabel;
				}
			}
			else{
				maxSize -= config.scaleFontSize;
			}

			//Add a little padding between the x line and the text
			maxSize -= 5;


			labelHeight = config.scaleFontSize;

			maxSize -= labelHeight;
			//Set 5 pixels greater than the font size to allow for a little padding from the X axis.

			scaleHeight = maxSize;

			//Then get the area above we can safely draw on.

		}		
	}

	
	
	function calculateOffset(config,val,calculatedScale,scaleHop){
		if (!config.logarithmic) {
			var outerValue = calculatedScale.steps * calculatedScale.stepValue;
			var adjustedValue = val - calculatedScale.graphMin;
			var scalingFactor = CapValue(adjustedValue/outerValue,1,0);
			return (scaleHop*calculatedScale.steps) * scalingFactor;
		} else {
			return CapValue(log10(val)*scaleHop-calculateOrderOfMagnitude(calculatedScale.graphMin)*scaleHop,undefined,0);
		}
	}

	function animationLoop(config,drawScale,drawData,ctx){
		var animFrameAmount = (config.animation)? 1/CapValue(config.animationSteps,Number.MAX_VALUE,1) : 1,
			easingFunction = animationOptions[config.animationEasing],
			percentAnimComplete =(config.animation)? 0 : 1;



		if (typeof drawScale !== "function") drawScale = function(){};

		requestAnimFrame(animLoop);

		function animateFrame(){
			var easeAdjustedAnimationPercent =(config.animation)? CapValue(easingFunction(percentAnimComplete),null,0) : 1;
			clear(ctx);
			if(config.scaleOverlay){
				drawData(easeAdjustedAnimationPercent);
				drawScale();
			} else {
				console.time('drawScale');
				drawScale();
				console.timeEnd('drawScale');
				console.time('drawData');
				drawData(easeAdjustedAnimationPercent);
				console.timeEnd('drawData');
			}				
		}
		function animLoop(){
			//We need to check if the animation is incomplete (less than 1), or complete (1).
				percentAnimComplete += animFrameAmount;
				
				animateFrame();	
				
				//Stop the loop continuing forever
				if (percentAnimComplete <= 1){
					requestAnimFrame(animLoop);
				}
				else{
					if (typeof config.onAnimationComplete == "function") config.onAnimationComplete();
				}

		}		

	}

	//Declare global functions to be called within this namespace here.


	// shim layer with setTimeout fallback
	var requestAnimFrame = (function(){
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	function calculateScale(config,drawingHeight,maxSteps,minSteps,maxValue,minValue,labelTemplateString){
		var graphMin,graphMax,graphRange,stepValue,numberOfSteps,valueRange,rangeOrderOfMagnitude,decimalNum;
		
		
		if (!config.logarithmic) { // no logarithmic scale
			valueRange = maxValue - minValue;
			rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange);
			graphMin = Math.floor(minValue / Math.pow(10, rangeOrderOfMagnitude)) * Math.pow(10, rangeOrderOfMagnitude);       
			
			graphMax = Math.ceil(maxValue / Math.pow(10, rangeOrderOfMagnitude)) * Math.pow(10, rangeOrderOfMagnitude);
		}
		else {
			graphMin = Math.pow(10,calculateOrderOfMagnitude(minValue));
			graphMax = Math.pow(10,calculateOrderOfMagnitude(maxValue)+1);
			rangeOrderOfMagnitude = calculateOrderOfMagnitude(graphMax)-calculateOrderOfMagnitude(graphMin);
		}
		
		graphRange = graphMax - graphMin;
		stepValue = Math.pow(10, rangeOrderOfMagnitude);
		numberOfSteps = Math.round(graphRange / stepValue);
		
		if (!config.logarithmic) { // no logarithmic scale
			//Compare number of steps to the max and min for that size graph, and add in half steps if need be.	        
			while(numberOfSteps < minSteps || numberOfSteps > maxSteps) {
				if (numberOfSteps < minSteps){
					stepValue /= 2;
					numberOfSteps = Math.round(graphRange/stepValue);
				}
				else{
					stepValue *=2;
					numberOfSteps = Math.round(graphRange/stepValue);
				}
			}
			
			if (graphMin-stepValue > 0) {
				graphMin -= stepValue;
				numberOfSteps++;
			}
		} else {
			numberOfSteps = rangeOrderOfMagnitude;
		}

		var labels = [];
		
		populateLabels(config,labelTemplateString, labels, numberOfSteps, graphMin, graphMax, stepValue);

		return {
			steps : numberOfSteps,
			stepValue : stepValue,
			graphMin : graphMin,
			graphMax : graphMax,
			labels : labels,
			maxValue: maxValue
		}

		
	}
	
	
	function climateScaleY2(config,ScaleY1,ScaleY2,drawingHeight,maxSteps,minSteps,maxValue,minValue,labelTemplateString) {
		var numberOfSteps,zero_Y1;
		numberOfSteps = ScaleY1.steps;
		$.each(ScaleY1.labels, function( index, value ) {
		  if (value == 0) {
			zero_Y1 = index;
			return;
		  }
		});
		
		ScaleY2.stepValue = ScaleY1.stepValue*2;
		
		var labels = [];
		
		ScaleY2.graphMin = ScaleY2.graphMin-(zero_Y1+1)*ScaleY2.stepValue;
		ScaleY2.graphMax = ScaleY2.graphMin+numberOfSteps*ScaleY2.stepValue;
		populateLabels(config,labelTemplateString, labels, numberOfSteps, ScaleY2.graphMin, ScaleY2.graphMax, ScaleY2.stepValue);

		return {
			steps : numberOfSteps,
			stepValue : ScaleY2.stepValue,
			graphMin : ScaleY2.graphMin,
			graphMax : ScaleY2.graphMax,
			labels : labels,
			maxValue: maxValue
		}
		
		
	}
	
	function calculateOrderOfMagnitude(val){
		switch(true) {
			case (val == 0):
				return 0;
			case (val>0):
				return Math.floor(Math.log(val) / Math.LN10);
			case (val<0):
				return -Math.floor(Math.log(Math.abs(val)) / Math.LN10);
		}
	}
	
	//Populate an array of all the labels by interpolating the string.
	function populateLabels(config,labelTemplateString, labels, numberOfSteps, graphMin, graphMax, stepValue) {
		if (labelTemplateString) {
			//Fix floating point errors by setting to fixed the on the same decimal as the stepValue.
			if (!config.logarithmic) {
				for (var i = 1; i < numberOfSteps + 1; i++) {
					labels.push(tmpl(labelTemplateString, {value: (graphMin + (stepValue * i)).toFixed(getDecimalPlaces(stepValue))}));
				}
			}else{
				var value = graphMin;
				while (value < graphMax) {
					value *= 10;
					labels.push(tmpl(labelTemplateString, {value: value.toFixed(getDecimalPlaces(stepValue))}));
				}
			}
		}
	}

	//Max value from array
	function Max( array ){
		return Math.max.apply( Math, array );
	};
	//Min value from array
	function Min( array ){
		return Math.min.apply( Math, array );
	};
	//Default if undefined
	function Default(userDeclared,valueIfFalse){
		if(!userDeclared){
			return valueIfFalse;
		} else {
			return userDeclared;
		}
	};
	//Is a number function
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	//Apply cap a value at a high or low number
	function CapValue(valueToCap, maxValue, minValue){
		if(isNumber(maxValue)) {
			if( valueToCap > maxValue ) {
				return maxValue;
			}
		}
		if(isNumber(minValue)){
			if ( valueToCap < minValue ){
				return minValue;
			}
		}
		return valueToCap;
	}
	
	function getDecimalPlaces (num){
		var numberOfDecimalPlaces;
		if (num%1!=0){
			return num.toString().split(".")[1].length
		}
		else{
			return 0;
		}

	} 
	
	//Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
	  var cache = {};

	  function tmpl(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
		  cache[str] = cache[str] ||
			tmpl(document.getElementById(str).innerHTML) :

		  // Generate a reusable function that will serve as a template
		  // generator (and which will be cached).
		  new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +

			// Introduce the data as local variables using with(){}
			"with(obj){p.push('" +

			// Convert the template into pure JavaScript
			str
			  .replace(/[\r\t\n]/g, " ")
			  .split("<%").join("\t")
			  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
			  .replace(/\t=(.*?)%>/g, "',$1,'")
			  .split("\t").join("');")
			  .split("%>").join("p.push('")
			  .split("\r").join("\\'")
		  + "');}return p.join('');");

		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	  };

	function getFadeColor(percent, primColor, secColor) {
		var pseudoEl = document.createElement('div'),
			rgbPrim,
			rgbSec;
		pseudoEl.style.color = primColor;
		document.body.appendChild(pseudoEl);
		rgbPrim = window.getComputedStyle(pseudoEl).color;
		pseudoEl.style.color = secColor;
		rgbSec = window.getComputedStyle(pseudoEl).color;
		var regex = /rgb *\( *([0-9]{1,3}) *, *([0-9]{1,3}) *, *([0-9]{1,3}) *\)/,
			valuesP = regex.exec(rgbPrim),
			valuesS = regex.exec(rgbSec),
			rP = Math.round(parseFloat(valuesP[1])),
			gP = Math.round(parseFloat(valuesP[2])),
			bP = Math.round(parseFloat(valuesP[3])),
			rS = Math.round(parseFloat(valuesS[1])),
			gS = Math.round(parseFloat(valuesS[2])),
			bS = Math.round(parseFloat(valuesS[3])),
			rCur = parseInt((rP-rS)*percent+rS),
			gCur = parseInt((gP-gS)*percent+gS),
			bCur = parseInt((bP-bS)*percent+bS);
		pseudoEl.parentNode.removeChild(pseudoEl);
		return "rgb("+rCur+','+gCur+','+bCur+')';
	}
	
	
	/**
	 * Get Value Bounds
	 * @param data data including values
	 * @param scaleHeight height of scale
	 * @param labelHeight height of labels
	 * @param type PolarArea|Radar|Line|LineDoubleY|Bar|StackedBar
	 */
	function getValueBounds(data,scaleHeight,labelHeight,type) {
		var valueBounds = {};
		
		var upperValue = Number.MIN_VALUE;
		var lowerValue = Number.MAX_VALUE;
	
		
		switch (type) {
			case "PolarArea":
				for (var i=0; i<data.length; i++){
					if (data[i].value > upperValue) {upperValue = data[i].value;}
					if (data[i].value < lowerValue) {lowerValue = data[i].value;}
				};

				valueBounds = {
					maxValue : upperValue,
					minValue : lowerValue
				};
				break;
			case "Radar":
			case "Line":
			case "Bar":
				for (var i=0; i<data.datasets.length; i++){
					for (var j=0; j<data.datasets[i].data.length; j++){
						if (data.datasets[i].data[j] > upperValue){upperValue = data.datasets[i].data[j]}
						if (data.datasets[i].data[j] < lowerValue){lowerValue = data.datasets[i].data[j]}
					}
				}

				valueBounds = {
					maxValue : upperValue,
					minValue : lowerValue
				};
				break;
			case "LineDoubleY":
				var upperValue_Y1 = upperValue;
				var lowerValue_Y1 = lowerValue;
				var upperValue_Y2 = upperValue;
				var lowerValue_Y2 = lowerValue;
		
				for (var i=0; i<data.datasets_Y1.length; i++){
					for (var j=0; j<data.datasets_Y1[i].data.length; j++){
						if ( data.datasets_Y1[i].data[j] > upperValue_Y1) { upperValue_Y1 = data.datasets_Y1[i].data[j] };
						if ( data.datasets_Y1[i].data[j] < lowerValue_Y1) { lowerValue_Y1 = data.datasets_Y1[i].data[j] };
					}
				};

				// second Y-axis
				for (var i=0; i<data.datasets_Y2.length; i++){
					for (var j=0; j<data.datasets_Y2[i].data.length; j++){
						if ( data.datasets_Y2[i].data[j] > upperValue_Y2) { upperValue_Y2 = data.datasets_Y2[i].data[j] };
						if ( data.datasets_Y2[i].data[j] < lowerValue_Y2) { lowerValue_Y2 = data.datasets_Y2[i].data[j] };
					}
				};


				valueBounds = {
					maxValue_Y1 : upperValue_Y1,
					minValue_Y1 : lowerValue_Y1,
					maxValue_Y2 : upperValue_Y2,
					minValue_Y2 : lowerValue_Y2
				};
				break;
			case "StackedBar":
				 for (var i=0; i<data.datasets.length; i++){
					for (var j=0; j<data.datasets[i].data.length; j++){
					  var k = i;
					  var temp = data.datasets[0].data[j];
					  while ( k > 0 ){ //get max of stacked data
						temp += data.datasets[k].data[j];
						k--;
					  }
					  if ( temp > upperValue) { upperValue = temp; };
					  if ( temp < lowerValue) { lowerValue = temp; };
					}
				  }

				 valueBounds = {
					maxValue : upperValue,
					minValue : lowerValue
				  };
				break;
		}
		
		
		
		var maxSteps = Math.floor((scaleHeight / (labelHeight*0.66)));
		var minSteps = Math.floor((scaleHeight / labelHeight*0.25));

		valueBounds.minSteps = minSteps;
		valueBounds.maxSteps = maxSteps;
		return valueBounds;
		
	}
	
	
	function thousand_separator(input) {
		return parseFloat(input).toLocaleString(lang);
	}
	
	function log10(val) {
		return Math.log(val) / Math.LN10;
	}
	
	function get_round_dec(val) {
		var ret = Math.floor(Math.log(val) / Math.LN10);
		if (ret != Math.abs(ret)) {
			return Math.abs(ret);
		} else {
			return 0;
		}
	}
	
	function round_dec(x, n) {
	  if (n < 0 || n > 14) return false;
	  var e = Math.pow(10, n);
	  var k = (Math.round(x * e) / e).toString();
	  if (k.indexOf('.') == -1) k += '.';
	  k += e.toString().substring(1);
	  return k.substring(0, k.indexOf('.') + n+1);
	}
	
}