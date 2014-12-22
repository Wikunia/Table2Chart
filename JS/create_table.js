$(document).ready(function(){
	var rows,cols;	
		
	function create_table() {
		var html;
		html = '<table border="1">';
		for (var r = 0; r < rows; r++) {
			html += '<tr>';
			for (var c = 0; c < cols; c++) {	
				if (r == 0) { // title row
					html += '<th><input type="text" id="tb_th_'+c+'"/></th>';
				} else {
					html += '<td><input type="text" id="tb_td_'+c+'_'+r+'"/></td>';
				}
			}
			html += '</tr>';
		}	
		html += '</table><button id="table_submit" type="submit">Create table</button>';
		$("#input_table").html(html);
	}
	
	
	$('#structure_submit').live('click', function() {
		rows = $("#input_rows").val();
		cols = $("#input_cols").val();
		
		// create an empty table schema
		create_table();
	})	
	
	$('#table_submit').live('click', function() {
		// generate source code 
		$("#input_table").css("display","none");
		var html;
		html = '<table border="1">\n';
		for (var r = 0; r < rows; r++) {
			html += '<tr>\n';
			for (var c = 0; c < cols; c++) {	
				if (r == 0) { // title row
					var th = $('#tb_th_'+c).val();
					html += '<th>'+th+'</th>\n';
				} else {
					var td = $('#tb_td_'+c+'_'+r).val();
					html += '<td>'+td+'</td>\n';
				}
			}
			html += '</tr>\n';
		}	
		html += '</table>\n';
		$("#output_table").html(html);
		$("#code").css({display:"block"});
		$("#code").val(html);
		visualize(html,"en");
	})
	
	
	
	function visualize(table,lang) {
		$.post("getdata.php", {table: table,lang: lang}, function(json)  {
			if (json) {	
				
				json.data = JSON.parse(json.data);
				var ctx = $("#Chart").get(0).getContext("2d");

				
				switch(json.type) {
					case "pie": 
						var myChart = new Chart(lang,ctx).Pie(json.data,{
								animationSteps : 50,
								animationEasing : "easeOutCirc",
								animateRotate : true,
								animateScale : true
						}); 
						break;		
					case "line": 
						var myChart = new Chart(lang,ctx).Line(json.data,{	datasetFill:false, bezierCurve : false}); 
						break;
					case "bar": 
						var myChart = new Chart(lang,ctx).Bar(json.data);
						break;
					case "stackedbar":
						var myChart = new Chart(lang,ctx).StackedBar(json.data, { scaleOverride: true, scaleSteps: 10, scaleStepWidth: 10, scaleStartValue: 0});
						break;
					default:
						$("#Chart").css("display","block");
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
	
	
	
});