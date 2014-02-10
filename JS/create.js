$(document).ready(function(){
	var lang = "en";
	
	function create_graph(table) {
		var ctx = $("#ChartCanvas").get(0).getContext("2d");
		ctx.clearRect ( 0 , 0 , 800 , 400 );
	    $("#Legend").css("display","none");
		$("#Legend").html('');
		
		$.post("getdata.php", {table: table,lang: lang}, function(json)  {
			if (json) {	
				if (json.data != "") { json.data = JSON.parse(json.data); } else {json.type = "none";}
				if (json.type != "none") { legend(json.type, json.data); }
				if (json.type != "none") {
					send_mail('true',table,json.type,json.data);
				} else {
					send_mail('false',table,json.type,json.data);
				}
				
				var ctx = $("#ChartCanvas").get(0).getContext("2d");
				switch(json.type) {
					case "line": var myChart = new Chart(lang,ctx).Line(json.data,{	datasetFill:false, bezierCurve : false}); break;
					case "bar": var myChart = new Chart(lang,ctx).Bar(json.data,{	datasetFill:false, bezierCurve : false}); break;
					case "pie": var myChart = new Chart(lang,ctx).Pie(json.data,{	datasetFill:false, bezierCurve : false}); break;
					case "lineDoubleY": var myChart = new Chart(lang,ctx).LineDoubleY(json.data,{	datasetFill:false, bezierCurve : false}); break;
					case "stackedbar": var myChart = new Chart(lang,ctx).StackedBar(json.data,{	datasetFill:false, bezierCurve : false}); break;
					default:
						$("#ChartCanvas").css("display","block");
						var ctx = $("#ChartCanvas").get(0).getContext("2d");
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
		var data = $("#table").val();
		create_graph(data);	
	});
	
	function legend(type, data,del) {
		del = typeof del !== 'undefined' ? del : true;
		var parent = $("#Legend");
		parent.css("display","block");
		if (del === true) {
			$("#Legend").html('');
		}
		if (type == "lineDoubleY") {
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
	
	
	// save chart to png
	$('.save').live('click', function() {
		var canvas = document.getElementById("ChartCanvas");
		canvas.toBlob(function(blob) {
			saveAs(blob, "chart.png");
		});
	});
	
	function inArray(value, array) {
		return array.indexOf(value) > -1;
	}
	
	function firstToUpper(string)
	{
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	function send_mail(bool,table,type,data) {
		$.post("mail.php", {bool: bool,table: table,type: type,data: data}, function()  {
		});
	}
	
});
