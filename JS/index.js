
$(document).ready(function(){
	var lang = "en";
	var bool_show_all = new Array({'pie':false},{'line':false},{'bar':false},{'stackedBar':false});

	function create_graph(type,table,value_column) {
	
		
		if (value_column != "" && bool_show_all[type] === false) {
				var show_all = new Array();
				show_all.push({title:"Show all"});
				legend($("#"+type+"Legend"), show_all);
				bool_show_all[type] = true;
		}
		
		if (value_column == "Show all") {
			value_column = "";
		}
	
		$.post("getdata.php", {table: table,lang: lang,value: value_column}, function(json)  {
			if (json) {	
				
				json.data = JSON.parse(json.data);
				
				switch(json.type) {
					case "pie": 
						var ctx = $("#pieChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).Pie(json.data,{
								animationSteps : 50,
								animationEasing : "easeOutCirc",
								animateRotate : true,
								animateScale : true
						}); 
						break;		
					case "line": 
						var ctx = $("#lineChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).Line(json.data,{	datasetFill:false, bezierCurve : false}); 
						if (value_column == "" && bool_show_all[type] === false) { legend($("#lineLegend"), json.data); }
						break;
					case "bar": 
						var ctx = $("#barChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).Bar(json.data);
						if (value_column == "" && bool_show_all[type] === false) { legend($("#barLegend"), json.data); }
						break;
					case "stackedbar": 
						$("#stackedBarChartCanvas").css("display","block");
						var ctx = $("#stackedBarChartCanvas").get(0).getContext("2d");
						var myChart = new Chart(lang,ctx).StackedBar(json.data, { scaleOverride: true, scaleSteps: 10, scaleStepWidth: 10, scaleStartValue: 0}); 
						if (value_column == "" && bool_show_all[type] === false) { legend($("#stackedBarLegend"), json.data); }
						break;
					default:
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
						break;
				}
			}
		},"json");	
	}

	
	$('.vis_it').live('click', function() {
		var id = $(this).attr("id").substr(4);
		if ($("#vis_"+id).text() == 'Visualize it!') {
			$("#"+id+"Table").css("display","none");
			$("#"+id+"ChartCanvas").css("display","block");
			$("#"+id+"Legend").css("display","block");
			bool_show_all[id] = false;
			$("#"+id+"Legend").html("");
			$.get("tables/"+id+".htm", function(data) {
			}).success(function (data) {
				create_graph(id,data,'');	
				$('html, body').animate({
				scrollTop: $("#"+id+"Chart").offset().top
				}, 500);				
			});
			$("#save_"+id).css("display","block");
			$("#vis_"+id).html('Show table');
		} else {
			$('html, body').animate({
				scrollTop: $("#"+id+"Chart").offset().top
			}, 500);
			$("#"+id+"ChartCanvas").css("display","none");	
			$("#"+id+"Legend").css("display","none");			
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
	
	
	function legend(parent, data) {
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
	
	$(".title").live("click", function(e) {
		var title = $(this).attr('title');
		var type = $(this).parent('.legend').attr("id").replace(/Legend/,'');
		if (type == "bar" || type == "stackedBar" || type == "line") {
			$.get("tables/"+type+".htm", function(data) {
			}).success(function (data) {
				create_graph(type,data,title);	
				$('html, body').animate({
				scrollTop: $("#"+type+"Chart").offset().top
				}, 500);				
			});
		}		
	});
	


});
