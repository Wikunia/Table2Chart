$(function(){
	var lang = 'en'; // formatting numbers
	window.MapChart = function(map_id){
		var zoom;
        var range_amount;
		var colors;
		var data_vars;
		var dataColors = false;
        
		this.Map = function(data,options){
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
			    data_vars = get_data_vars(data.values,range_amount);
            } else {dataColors = true; }
			
			// create a map in the "map" div, set the view to a given place and zoom
			var map = L.map(map_id).setView([midpoint.lat, midpoint.lon], zoom);

			// add an OpenStreetMap tile layer
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);
			
			if (dataColors) {
				colors = data.colors;	
			} else {
				colors = Gradient.get(options.color_from, options.color_to, range_amount);
			}

			nextCountry(0);
			
			/**
			 * information window
			 */ 
				var info = L.control();

				info.onAdd = function (map) {
					this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
					this.update();
					return this._div;
				};

				// method that we will use to update the control based on feature properties passed
				info.update = function (props) {
					this._div.innerHTML = '<h4>'+data.title+'</h4>' +  (props ?
						'<b>' + props.name + '</b><br />' + props.value
						: 'Hover over a country/state');
				};

				info.addTo(map);

			/**
			 * Legend 
			 */
				var legend = L.control({position: 'bottomright'});

				legend.onAdd = function (map) {

					var div = L.DomUtil.create('div', 'info legend'),
						grades = [],
						labels = [];

						if (dataColors) {
							grades = colors; // colors[].value & colors[].color
						} else {
							// get all grades
							for (var g = 0; g < colors.length; g++) {
								grades.push(g ? data_vars.min+g*data_vars.step+1 : data_vars.min);
							}
						}

					// loop through grade intervals and generate a label with a colored square for each interval
					for (var i = 0; i < grades.length; i++) {
						if (dataColors) {
							div.innerHTML +=
								'<i style="background:' + grades[i].color + '"></i> ' +
								grades[i].value +'<br>';
						} else {
							div.innerHTML +=
								'<i style="background:' + getColor(grades[i]) + '"></i> ' +
								grades[i] + ((grades[i + 1]-1) ? '&ndash;' + (grades[i + 1]-1) + '<br>' : '+');
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
				var value = data.values[c];
				$.getJSON("getFunctions/layer.php", {country : label}, function(geoJSONData){	
					var geoJSONcoor = '{"'+geoJSONData.coor;
					var countryData =  {
						type: "Feature",
						properties: {
							"name": label,
							"value": value
						} 
					};
					countryData.geometry = JSON && JSON.parse(geoJSONcoor) || $.parseJSON(geoJSONcoor);
					L.geoJson(countryData, {style: style, onEachFeature: onEachFeature}).addTo(map);
				}).success(function() {
					if (c < data.labels.length) nextCountry(c+1);	
				});
				
			}

			/**
			 * get the color for a specific value
			 * @param {float} value 
			 * @return {hex} color
			 */
			function getColor(value) {
				if (!dataColors) {
					return colors[range_id(value,dataColors)];
				}
				for (var i = 0; i < data.colors.length; i++) {
					if (data.colors[i].value == value) {
						return data.colors[i].color;	
					}
				}
			}

			/**
			 * Get the style of country
			 * @param feature
			 * @return {object} fillColor,weight,opacity,color,dashArray,fillOpacity
			 */
			function style(feature) {
				return {
					fillColor: getColor(feature.properties.value),
					weight: 2,
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
					weight: 5,
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
					weight: 2,
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
			var upperValue = data[0];
			var lowerValue = data[0];
			
			for (var i=1; i<data.length; i++){
				if (data[i] > upperValue) { upperValue = data[i]; }
				if (data[i] < lowerValue) { lowerValue = data[i]; }
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
			  url: "getFunctions/latlon.php?country="+label,
			  success: function(midpoint) {
				callback({lat: midpoint.lat, lon: midpoint.lon});
			   }	 
			});
		}
		
		function get_range_amount(data) {
			var amounts = [];
			for (var i = 3; i <= 10; i++) {
				var data_vars = get_data_vars(data.values,i);
				var amount = [];
				for (var j = 0; j < i; j++) {
					amount[j] = 0;
					$.each(data.values, function(index,value) {
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
		 * @param {array} data
		 * @param {object} max,min,step
		 * @return {object} step,min,max
		 */
		function get_data_vars(data,range_amount) {
			// get min and max
			var range = min_max(data);	
			var step = Math.ceil((range.max-range.min)/range_amount).toPrecision(2);
			var OoM = OrderOfMagnitude(step);
			range.min = Math.floor(range.min/Math.pow(10,OoM))*Math.pow(10,OoM);
			var i = 0;
			while ((range.min + range_amount*step) < range.max) {
				step = Math.ceil((range.max-range.min)/(range_amount-i)).toPrecision(2);
				i++;
			}

			return {step: step, min: range.min, max: range.max};
		}
		
		/**
		 * get number of range for this value 
		 * @param {float} data value
		 * @return {int} range_id
		 */ 
		function range_id(val) {
			var id = 0;
            // if colors is not set (normal)
            if (!dataColors) {
                while (data_vars.min+(id+1)*data_vars.step < val) {
                   id++;
                }
            } else {
                while (id < range_amount && val != dataColors[id].value) {
                    id++;
                }
            }
			return id;
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
			return Math.floor(Math.log(val) / Math.LN10);
		}
		
		
		function thousand_separator(input) {
			return parseFloat(input).toLocaleString(lang);
		}
		}
	}
	
	var json = {"type":"map","data":{"title":"(2012) won by","labels":["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia (US)","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"],"values":["Romney","Romney","Romney","Romney","Obama","Obama","Obama","Obama","Obama","Obama","Romney","Obama","Romney","Obama","Romney","Obama","Romney","Romney","Romney","Obama","Obama","Obama","Obama","Obama","Romney","Romney","Romney","Romney","Obama","Obama","Obama","Obama","Obama","Romney","Romney","Obama","Romney","Obama","Obama","Obama","Romney","Romney","Romney","Romney","Romney","Obama","Obama","Obama","Romney","Obama","Romney"],"colors":[{"value":"Romney","color":"#ff0000"},{"value":"Obama","color":"#00ffff"}]}};	
	
	var myMapChart = new MapChart("map").Map(json.data,{ 
					color_from: '#00ff00', color_to: '#ff0000', legend: "mapLegend" }); 
});