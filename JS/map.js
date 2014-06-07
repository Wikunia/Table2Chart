
$(function(){
	var lang = 'en'; // formatting numbers
	
	
	window.MapChart = function(map_id){
		var zoom;
        var range_amount;
        
		this.Map = function(data,options){
			// defaults:
            if (data.colors) {
                options.range_amount = data.colors.length;
            } else {
                if (!options.range_amount) { 
                    options.range_amount = get_range_amount(data); 
                }
            }
            
			if (!options.color_from) { options.color_from = '#ffff00'; }
			if (!options.color_to) { options.color_to = '#ff0000'; }

            range_amount = options.range_amount;
            
			// set height and width of map
			$("#"+map_id).width(options.width);
			$("#"+map_id).height(options.height);

			var geojson_format = new OpenLayers.Format.GeoJSON({
				'internalProjection': new OpenLayers.Projection("EPSG:900913"),
				'externalProjection': new OpenLayers.Projection("EPSG:4326")
			});

			// get midpoint and zoom of the map
			var midpoint = get_midpoints(data.labels,options);
			
			// get variables like maximum and minimum and step value
            // if colors is not defined
            if (!data.colors) {
			    var data_vars = get_data_vars(data.values,range_amount);
            }
            
			
			var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
			var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
			
			var map = new OpenLayers.Map(map_id,
											{ theme:    null,
												controls: [ 
														   new OpenLayers.Control.Navigation(),    // direct panning via mouse drag
														   new OpenLayers.Control.PanZoom(),  
														]
											 }
										);
			var mapnik         = new OpenLayers.Layer.OSM();
			map.addLayer(mapnik);
			
			// set midpoint and zoom
			var position       = new OpenLayers.LonLat(midpoint.lon, midpoint.lat).transform( fromProjection, toProjection);
			map.setCenter(position, zoom);
			
			//////// country styles
			// get colors
            if (!data.colors) {
                var styles = new Array();
                var color = Gradient.get(options.color_from, options.color_to, range_amount);	
                for (var i = 0; i < range_amount; i++) {
                    styles[i] = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
                    styles[i].fillColor = color[i];
                    styles[i].strokeWidth = 0; 
                }
            }else {
                var styles = new Array();
                var color = new Array();
                for(var i = 0; i < range_amount; i++) {
                    color[i] =  data.colors[i].color
                    styles[i] = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
                    styles[i].fillColor = color[i];
                    styles[i].strokeWidth = 0; 
                }
            }
                                         
			
			// create layers
			var levels = new Array();
			for (var i = 0; i < range_amount; i++) {
				levels[i] = new OpenLayers.Layer.Vector("Level"+i,{style: styles[i], projection: toProjection});
				map.addLayer(levels[i]);
			}

			var countries = data.labels;
			// pigment countries
			next_country(0);
			
			
			function next_country(i) {
				// get layer coordinates
				$.getJSON("getFunctions/layer.php", {country : countries[i]}, function(data){	
					json_data = '{"'+data.coor;		
				}).success(function() {					
					var geojson_format = new OpenLayers.Format.GeoJSON({
						'internalProjection': new OpenLayers.Projection("EPSG:900913"),
						'externalProjection': new OpenLayers.Projection("EPSG:4326")
					});
					var geometry = geojson_format.read(json_data, 'Geometry');
					var vector = new OpenLayers.Feature.Vector(geometry);
					// set layer id
					vector.id = countries[i];
									
					levels[range_id(data_vars,data.values[i],data.colors)].addFeatures(vector);
					i++;
					if (i < data.labels.length) {
						next_country(i);
					}
				});
			}
			
			// create legend if legend is set
			if (options.legend) {
				create_legend(options.legend,data_vars,color,data.colors,data.title);			
			}
		}
		
		// get minimum and maximum
		function min_max(data) {
			var upperValue = data[0];
			var lowerValue = data[0];
			
			for (var i=1; i<data.length; i++){
				if (data[i] > upperValue) { upperValue = data[i]; }
				if (data[i] < lowerValue) { lowerValue = data[i]; }
			}
			return {min: lowerValue, max: upperValue};
		}
		
		// get data like maximum, minimum,step,...
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
		
		// get number of range for this value 
		function range_id(data_vars,val,colors) {
			var id = 0;
            // if colors is not set (normal)
            if (!colors) {
                while (data_vars.min+(id+1)*data_vars.step < val) {
                   id++;
                }
            } else {
                while (id < range_amount && val != colors[id].value) {
                    id++;
                }
            }
			return id;
		}
		
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
		
		
		// midpoint of a country
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
		
		
		// create legend
		function create_legend(id,data_vars,color,colors,title) {
			var i = 1;
			var labels = new Array();
            // if title is set in index.js
            if (title) {
                // create span for charttitle
                var title_span = document.createElement('span'); 
                title_span.className = 'legend_title';
                $("#"+id).append(title_span);
                // set title text
                var title_text = document.createTextNode(title);
                title_span.appendChild(title_text);
            }
            if (!colors) {
                labels[0] = thousand_separator(data_vars.min)+' - '+thousand_separator(parseFloat(data_vars.min)+parseFloat(data_vars.step));
                while (i < range_amount) {
                    // create range label
                    labels[i] = thousand_separator(data_vars.min+(i)*data_vars.step+1)+' - '+thousand_separator(data_vars.min+(i+1)*data_vars.step);
                    i++;
                }
            } else {
              i = 0;
              while (i < range_amount) {  
                  labels[i] = colors[i].value;
                  i++;
              }
            }
			i = 0;
			// create legend
			while (i < range_amount) {
				var range_title = document.createElement('span');
				range_title.className = 'range_title';
				range_title.title = labels[i];
				range_title.style.borderColor = color[i];
				$("#"+id).append(range_title);

				var text = document.createTextNode(labels[i]);
				range_title.appendChild(text);
				i++;
			}
			$("#"+id).css("display","block");
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
		
		function get_best_distribution(distributions) {
			var best = 1,
				best_nr;
			for(var d = 3; d <= 10; d++) {
				var value = distributions[d];
				var len = value.length;
				var total = 0;
				for (var i = 0; i < value.length; i++) {
					total += value[i]*i;
				}
				var medium = total/value.length;
				var dis2med = 1/2-medium/len;
				if (dis2med < best) {
					best = dis2med;
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
});