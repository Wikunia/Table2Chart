$(function(){
	var lang = 'en'; // formatting numbers
	window.MapChart = function(map_id){
		var zoom;
		var colors;
		var data_vars;
		var dataColors = false;
		var map;
		var getFunctionPath;
		var lastSliderNumber = 0;
		var thisMapChart = this;
		var countryLayer = [];
		var data;
		var smallestOoM;
		var smallestNoZ; // smallest number of Zeros at the end
        
		this.update = function(valCol) {
			$("#mapLegendTitle").html(data.columnTitles[valCol]);
			for (var i = 0; i < data.labels.length; i++) {
				for (var key in countryLayer[i]._layers) {
					countryLayer[i]._layers[key].feature.properties.value = data.values[valCol][i];
					countryLayer[i]._layers[key].setStyle({
						fillColor: thisMapChart.getColor(data.values[valCol][i]),
						weight: 1,
						opacity: 1,
						color: 'white',
						dashArray: '3',
						fillOpacity: 0.7
					});
					break;
				}
			}
		}

		/**
		 * get the color for a specific value
		 * @param {float} value
		 * @return {hex} color
		 */
		this.getColor = function(value) {
			if (!dataColors) {
				return colors[thisMapChart.range_id(value)];
			}
			for (var i = 0; i < data.colors.length; i++) {
				if (data.colors[i].value == value) {
					return data.colors[i].color;
				}
			}
		}

		/**
		 * get number of range for this value
		 * @param {float} data value
		 * @return {int} range_id
		 */
		this.range_id = function(val) {
			var id = 0;

            // if colors is not set (normal)
			while (data_vars.min+(id+1)*data_vars.step < val) {
			   id++;
			}
			return id;
		}

		this.Map = function(inputData,options,path){
			data = inputData;
			getFunctionPath = (typeof path === "undefined") ? "" : path;


			// defaults:
            if (data.colors) {
                options.range_amount = data.colors.length;
            } else {
                if (!options.range_amount) { 
                    options.range_amount = get_range_amount(data); 
                }
            }
            
			options.width = $("#"+map_id).width();
			options.height = $("#"+map_id).height();

			if (!options.color_from) { options.color_from = '#ffff00'; }
			if (!options.color_to) { options.color_to = '#ff0000'; }


			var midpoint = get_midpoints(data.labels,options);
			


			// get variables like maximum and minimum and step value
            // if colors is not defined
            if (!data.colors) {
				var minmax = min_max(data.values);
			    data_vars = get_data_vars(minmax,options.range_amount);
            } else {dataColors = true; }
			

			// create a map in the "map" div, set the view to a given place and zoom
			map = L.map(map_id).setView([midpoint.lat, midpoint.lon], zoom);

			// add an OpenStreetMap tile layer
			L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
				minZoom: 0,
				maxZoom: 19,
				attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
			}).addTo(map);
			

			if (dataColors) {
				colors = data.colors;
			} else {
				colors = Gradient.get(options.color_from, options.color_to, options.range_amount);
			}

			
			nextCountry(0);
			




			/**
			 * information window
			 */
				var info = L.control();

				info.onAdd = function (map) {
					this._div = L.DomUtil.create('div', 'mapInfo'); // create a div with a class "info"
					this.update();
					return this._div;
				};

				// method that we will use to update the control based on feature properties passed
				info.update = function (props) {
					this._div.innerHTML = '<h4>'+data.title+'</h4>' +  (props ?
						'<b>' + props.name + '</b><br />' + thousand_separator(props.value)
						: 'Hover over a country/state');
				};

				info.addTo(map);


			/**
			 * Legend
			 */
				var legend = L.control({position: 'bottomright'});

				legend.onAdd = function (map) {
					var div = L.DomUtil.create('div', 'info mapLegend'),
						grades = [],
						labels = [];

						if (dataColors) {
							grades = colors; // colors[].value & colors[].color
						} else {
							// get all grades
							for (var g = 0; g < colors.length; g++) {
								grades.push(data_vars.min+g*data_vars.step);
							}
						}

					// loop through grade intervals and generate a label with a colored square for each interval
					var fromLegend = thousand_separator(grades[0],true);
					if (fromLegend.postfix) {
						div.innerHTML = '<b id="mapLegendTitle">'+data.columnTitles[0]+'</b> (in '+fromLegend.postfix+')<br>';
					} else {
						div.innerHTML = '<b id="mapLegendTitle">'+data.columnTitles[0]+'</b><br>';
					}
					for (var i = 0; i < grades.length; i++) {
						if (dataColors) {
							div.innerHTML +=
								'<i style="background:' + grades[i].color + '"></i> ' +
								grades[i].value +'<br>';
						} else {
							var fromLegend = thousand_separator(grades[i],true);
							var toLegend = thousand_separator(grades[i+1],true);
							div.innerHTML +=
								'<i style="background:' + thisMapChart.getColor(grades[i]) + '"></i> ' +
								fromLegend.value +
								(grades[i + 1] ? '&ndash;' + toLegend.value + '<br>' : '+');
						}
					}

					return div;
				};

				legend.addTo(map);




			function onEachFeature(feature, layer) {
				layer.on({
					mouseover: highlightFeature,
					mouseout: resetHighlight,
					click: zoomToFeature
				});
			}
			
			/**
			 * Draw the next countries (recursive)
			 * @param c number of next country
			 */
			function nextCountry(c) {
				var label = data.labels[c];
				var value = data.values[0][c];
				$.getJSON(getFunctionPath+"getFunctions/layer.php", {country : label}, function(geoJSONData){
					var geoJSONcoor = '{"'+geoJSONData.coor;
					var countryData =  {
						type: "Feature",
						properties: {
							"name": label,
							"value": value
						}
					};
					countryData.geometry = JSON && JSON.parse(geoJSONcoor) || $.parseJSON(geoJSONcoor);
					countryLayer[c] = L.geoJson(countryData, {style: style, onEachFeature: onEachFeature}).addTo(map);
				}).success(function() {
					if (c < data.labels.length) nextCountry(c+1)
					else {
						if (data.values.length > 1) {
							$("#rangeSlider").css("display","block");
							$("#rangeSlider").ionRangeSlider({values:data.columnTitles,type:'single',onChange: function(obj) {
									if (obj.fromNumber !== lastSliderNumber) {
										thisMapChart.update(obj.fromNumber);
										lastSliderNumber = obj.fromNumber;
									}
							}});
						}
					}
				});

			}



			/**
			 * Get the style of country
			 * @param feature
			 * @return {object} fillColor,weight,opacity,color,dashArray,fillOpacity
			 */
			function style(feature) {
				return {
					fillColor: thisMapChart.getColor(feature.properties.value),
					weight: 1,
					opacity: 1,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.7
				};
			}
		
			/**
			 * Hightlight a Country
			 */
			function highlightFeature(e) {
				var layer = e.target;

				layer.setStyle({
					weight: 2,
					color: '#666',
					dashArray: '',
					fillOpacity: 0.7
				});

				if (!L.Browser.ie && !L.Browser.opera) {
					layer.bringToFront();
				}
				info.update(layer.feature.properties);
			}

			/**
			 * Reset the highlight
			 */
			function resetHighlight(e) {
				var layer = e.target;

				layer.setStyle({
					weight: 1,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.7
				});

				if (!L.Browser.ie && !L.Browser.opera) {
					layer.bringToFront();
				}
				info.update();
			}


			/**
			 * Zoom to a Country
			 */
			function zoomToFeature(e) {
				map.fitBounds(e.target.getBounds());
			}

		/**
		 * get minimum and maximum
		 * @param {array} values
		 * @return {object} min and max
		 */
		function min_max(data) {
			var upperValue = data[0][0];
			var lowerValue = data[0][0];
			for (var d = 0; d < data.length; d++) {
				for (var i=1; i<data[d].length; i++){
					if (data[d][i] > upperValue) { upperValue = data[d][i]; }
					if (data[d][i] < lowerValue) { lowerValue = data[d][i]; }
				}
			}

			return {min: lowerValue, max: upperValue};
		}
		
		/**
		 * Get the midpoint and the zoom factor (global variable)
		 * @param {array} labels
		 * @param {options} options (needs width and height)
		 * @return {object} lat, lon
		 */
		function get_midpoints(labels,options) {
			var midpoint,max_lat,min_lat,max_lon,min_lon;
			
			// get maximum and minium latitudes and longitudes
			for(var i = 0; i < labels.length; i++) {
				midpoint = get_midpoint(labels[i], function(midpoint){
				if (midpoint.lat > max_lat || !max_lat) {max_lat = midpoint.lat;}
				if (midpoint.lon > max_lon || !max_lon) {max_lon = midpoint.lon;}
				if (midpoint.lat < min_lat || !min_lat) {min_lat = midpoint.lat;}
				if (midpoint.lon < min_lon || !min_lon) {min_lon = midpoint.lon;}
				})
			}
			// get midpoint
			var mid_lat = (max_lat+min_lat)/2;
			var mid_lon = (max_lon+min_lon)/2;
			
			// get maximum difference (between max and mid)
			var lat = mid_lat * Math.PI/180;
			var max_dx = 111.3 * Math.cos(lat) * (max_lon - mid_lon);
			var max_dy = 111.3 * (max_lat - mid_lat);

			// get zoom level
			// zoom levels (http://wiki.openstreetmap.org/wiki/Zoom_levels)
			var zoom_arr = new Array(156.412,78.206,39.103,19.551,9.776,4.888,2.444,1.222,0.610984,0.305942,0.152746,0.076373,0.038173,0.019093,0.009547,0.004773,0.002387,0.001193,0.0005936,0.000298);
			for (z = 0; z < zoom_arr.length; z++) {
				if (max_dx > zoom_arr[z]*(options.width/3) || max_dy > zoom_arr[z]*(options.height/3)) {
					// set global variable zoom
					zoom = (z != 0) ? z-1 : 0; // can't be -1 
					break;					
				}
			}
			
			return { lat: mid_lat, lon: mid_lon };
		}
		
		
		/**
		 * Get the Midpoint of one country
		 * Callback {object} lat, lon
		 */
		function get_midpoint(label,callback) {
			$.ajax({
			  dataType: "json",
			  async: false,
			  url: getFunctionPath+"getFunctions/latlon.php?country="+label,
			  success: function(midpoint) {
				callback({lat: midpoint.lat, lon: midpoint.lon});
			   }	 
			});
		}

		function get_range_amount(data) {
			var amounts = [];
			// get min and max
			var minmax = min_max(data.values);
			for (var i = 3; i <= 10; i++) {
				var data_vars = get_data_vars(minmax,i);
				var amount = [];
				for (var j = 0; j < i; j++) {
					amount[j] = 0;
					$.each(data.values[0], function(index,value) {
						if (value > (data_vars.min+data_vars.step*j) && value < (data_vars.min+data_vars.step*(j+1))) {
							amount[j]++;
						}
					})
				}
				amounts[i] = amount;
			}
			return get_best_distribution(amounts);
		}
			
		/**
		 * get data like maximum, minimum,step
		 * @param {object} range (max,min)
		 * @param {object} max,min,step
		 * @return {object} step,min,max
		 */
		function get_data_vars(range,range_amount) {
			var step = Math.ceil((range.max-range.min)/range_amount).toPrecision(2);
			var OoM = OrderOfMagnitude(step);

			range.min = Math.floor(range.min/Math.pow(10,OoM))*Math.pow(10,OoM);

			var i = 0;
			while ((range.min + range_amount*step) < range.max) {
				step = Math.ceil((range.max-range.min)/(range_amount-i)).toPrecision(2);
				i++;
			}


			smallestOoM = OrderOfMagnitude(range.min+step);
			for(var i=1; i < smallestOoM; i++) {
				if ((range.min+step)%(10*i) !== 0) {
					smallestNoZ = i;
					break;
				}
			}



			return {step: step, min: range.min, max: range.max};
		}
		



		/**
		 * Get the best nr of colors
		 * @param {array} distributions
		 */
		function get_best_distribution(distributions) {
			var best = 0,
				best_nr;
			for(var d = 3; d <= 10; d++) {
				var value = distributions[d];
				var len = value.length;
				var total = 0;
				for (var i = 0; i < value.length; i++) {
					total += value[i]*i;
				}
				var medium = total/len;
				if (medium > best) {
					best = medium;
					best_nr = d;
				}
			}
			return best_nr;
		}

		function OrderOfMagnitude(val) {
			var OoM = Math.floor(Math.log(val) / Math.LN10);
			return OoM;
		}
		
		
		function thousand_separator(input,legend) {
			legend = (typeof legend === "undefined") ? false : legend;
			var postfix ='';
			switch(smallestNoZ) {
				case 3:	case 4:	case 5:
					smallestNoZ = 3;
					postfix = "thousand";
					break;
				case 6:	case 7:	case 8:
					smallestNoZ = 6;
					postfix = "million";
					break;
				case 9:	case 10:	case 11:
					smallestNoZ = 9;
					postfix = "billion";
					break;
				case 12:	case 13:	case 14:
					smallestNoZ = 12;
					postfix = "trillion";
					break;
			}
			if (postfix != '') {
				if (legend) {
					return {value:parseFloat(input/Math.pow(10,smallestNoZ)).toLocaleString(lang),postfix: postfix};
				}
				return parseFloat(input/Math.pow(10,smallestNoZ)).toLocaleString(lang)+' '+postfix;
			}
			if (legend) {
				return  {value:parseFloat(input).toLocaleString(lang),postfix:postfix};
			}
			return parseFloat(input).toLocaleString(lang);
		}
		}
	}

});
