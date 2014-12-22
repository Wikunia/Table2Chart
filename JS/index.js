
$(document).ready(function(){
	var lang = "en";
	var bool_show_all = new Array({'pie':false},{'line':false},{'climate':false},
								  {'lineDoubleY':false},{'bar':false},{'stackedBar':false},{'map':false});

	function create_graph(type,table,value_columns,animation) {
	
		
		if (value_columns.length > 0 && bool_show_all[type] === false) {
				var show_all = new Array();
				show_all.push({title:"Show all"});	
				legend(type+"Legend", show_all, false);
				bool_show_all[type] = true;
		} 
		if (value_columns.length == 0) {
			bool_show_all[type] = false;
		}
		
			
		console.log(JSON.stringify(value_columns));
		console.log(table);
		console.log(lang);
		$.post("getdata.php", {table: table,lang: lang,value: JSON.stringify(value_columns)}, function(json)  {
			if (json) {	
				
				json.data = JSON.parse(json.data);
				console.log(json);
				
				switch(json.type) {	
					case "pie": 
						var ctx = $("#pieChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).Pie(json.data.data,{
								animationSteps : 50,
								animationEasing : "easeOutCirc",
								animateRotate : true,
								animateScale : true,
								animation: animation
						}); 
						break;		
					case "line": 
						var ctx = $("#lineChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).Line(json.data,{	animation: animation, datasetFill:false, bezierCurve : false}); 
						if (value_columns.length == 0 && bool_show_all[type] === false) { legend("lineLegend", json.data); }
						break;
					case "lineDoubleY": 
						var ctx = $("#lineDoubleYChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).LineDoubleY(json.data,{	animation: animation, datasetFill:false, bezierCurve : false}); 
						if (value_columns.length == 0 && bool_show_all[type] === false) { legend("lineDoubleYLegend", json.data); }
						break;
					case "climate": 
						var ctx = $("#climateChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).LineDoubleY(json.data,{animation: animation,
																				 climate: true, datasetFill:true, bezierCurve : false}); 
						if (value_columns.length == 0 && bool_show_all[type] === false) { legend("climateLegend", json.data); }
						break;
					case "bar": 
						var ctx = $("#barChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).Bar(json.data, {animation: animation});
						if (value_columns.length == 0 && bool_show_all[type] === false) { legend("barLegend", json.data); }
						break;
					case "stackedbar": 
						$("#stackedBarChartCanvas").css("display","block");
						var ctx = $("#stackedBarChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).StackedBar(json.data, { animation: animation,
																				 scaleOverride: true,
																				 scaleSteps: 10, scaleStepWidth: 10, scaleStartValue: 0}); 
						if (value_columns.length == 0 && bool_show_all[type] === false) { legend("stackedBarLegend", json.data); }
						break;
					case "map":
						$("#map").css("display","block");
						console.log(json.data);
						var myMapChart = new MapChart("map").Map(json.data,{ 
							color_from: '#00ff00', color_to: '#ff0000'}); 
					default:
						// there is no canvas if the type is a map :/ 
						if (type != "map") {
							$("#"+type+"Legend").css("display","none");
							$("#"+type+"ChartCanvas").css("display","block");
							var ctx = $("#"+type+"ChartCanvas").get(0).getContext("2d");
							var img = new Image();
							img.onload = function(){
								ctx.drawImage(img, 0, 0, 741, 350);
							}
							switch (lang) {
								case "de": 
									img.src = 'images/error_de.png';
									break;
								case "en": 
									img.src = 'images/error_en.png';
									break;
							}
						}
						break;
				}
			}
		},"json");	
	}

	/**
	 * Visualization || Show Table button
	 */
	$('.vis_it').live('click', function() {
		// get the correct id (pie,line...)
		var id = $(this).attr("id").substr(4);
		if ($("#vis_"+id).text() == 'Visualize it!') {
			$("#"+id+"Table").css("display","none");
			$("#"+id+"ChartCanvas").css("display","block");
			if (id != "map") {
				$("#"+id+"Legend").css("display","block");
				bool_show_all[id] = false;
				$("#"+id+"Legend").html("");
			}
			var data = $("#"+id+"Table").html();
			$("#"+id+"ChartCanvas").data("columns", []);
			create_graph(id,data,[],true);	
			$('html, body').animate({
			scrollTop: $("#"+id+"Chart").offset().top
			}, 500);
			$("#save_"+id).css("display","block");
			$("#vis_"+id).html('Show table');
		} else {
			$("#rangeSliderDiv").css("display","none");
			$('html, body').animate({
				scrollTop: $("#"+id+"Chart").offset().top
			}, 500);
			if (id == "map") {
				$("#map").css('display','none');
			}
			$("#"+id+"ChartCanvas").css("display","none");	
			if (id != "map") {
				$("#"+id+"Legend").css("display","none");	
			}
			$("#"+id+"Table").css("display","block");
			$("#save_"+id).css("display","none");
			$("#vis_"+id).html('Visualize it!');	
		}

	});
	
	// save chart to png
	$('.save').live('click', function() {
		var type = $(this).attr("id").substr(5);
		var canvas = document.getElementById(type+"ChartCanvas");
		canvas.toBlob(function(blob) {
			saveAs(blob, type+"_chart.png");
		});
	});
	
	
	function legend(type, data,del) {
		del = typeof del !== 'undefined' ? del : true;
		
		var parent = $("#"+type);
		if (del === true) {
			$("#"+type).html('');
		}
		
		if (data.title) {
			var title = document.createElement('span');	
			title.className = 'tableTitle';
			parent.append(title);
			var text = document.createTextNode(htmlDecode(data.title));
			title.appendChild(text);
		}
		
		
		
		if (type == "lineDoubleYLegend" || type == "climateLegend") {
			for (var i = 1; i <= 2; i++) {
				var title = document.createElement('span');
				title.className = 'title';
				title.title = htmlDecode(eval("data.datasets_Y"+i)[0].title);
				title.style.borderColor = eval("data.datasets_Y"+i)[0].hasOwnProperty('strokeColor') ? eval("data.datasets_Y"+i)[0].strokeColor : eval("data.datasets_Y"+i)[0].color;
				parent.append(title);

				var text = document.createTextNode(htmlDecode(eval("data.datasets_Y"+i)[0].title));
				title.appendChild(text);
			};
		} else {
			var datas = data.hasOwnProperty('datasets') ? data.datasets : data;
			datas.forEach(function(d) {
				var title = document.createElement('span');
				title.className = 'title';
				title.title = d.title;
				title.style.borderColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
				parent.append(title);

				var text = document.createTextNode(d.title);
				title.appendChild(text);
			});
		}
	}
	
	$(".title").live("click", function(e) {
		var title = $(this).attr('title');
		var type = $(this).parent('.legend').attr("id").replace(/Legend/,'');
		
		if (type == "bar" || type == "stackedBar" || type == "line") {
			var data = $("#"+type+"Table").html();
			
			var columns = $("#"+type+"ChartCanvas").data("columns");
			if (!columns) { columns = []; }
			var posInArray = columns.indexOf(title);
			if (title == "Show all") { columns = []; }
			else if (posInArray >= 0) { // delete from array
				columns.splice(posInArray,1);
			} else { // add to array
				columns.push(title);
			}

			$("#"+type+"ChartCanvas").data("columns", columns);
			// false => no animation
			create_graph(type,data,columns,false);	
			$('html, body').animate({
			scrollTop: $("#"+type+"Chart").offset().top
			}, 500);				

		}		
	});
	
	
	// http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery User: CMS
	function htmlEncode(value){
	  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
	  //then grab the encoded contents back out.  The div never exists on the page.
	  return $('<div/>').text(value).html();
	}
	
	function htmlDecode(value){
	  return $('<div/>').html(value).text();
	}
	


});
