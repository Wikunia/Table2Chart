<html>
<head>
	<title>Visualize your table</title>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<link rel="stylesheet" href="CSS/create.css"/>
	<script type="text/javascript" src="JS/gradient.min.js"></script>
	<script type="text/javascript" src="JS/chart.js"></script>
	<script type="text/javascript" src="JS/map.js"></script>
	<script type="text/javascript" src="JS/create.js"></script>
	<script type="text/javascript" src="JS/filesaver.js"></script>
	<script type="text/javascript" src="JS/canvas-toBlob.js"></script>
	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />
	<link rel="stylesheet" href="CSS/map.css"/>
</head>
<body>
<h1>Visualize your HTML-Table</h1>
Your entry is saved for the improvement of the service. <br>
<div class="left">
	<textarea id="table" placeholder="Your html-code goes here"></textarea><br>
	<div id="vis" class="button vis_it">Visualize it!</div><div id="save" class="button save">Save as png</div><div class="clearleft"></div>
</div>
<div class="canvasWrapper">
	<canvas id="ChartCanvas" class="chart" width="800" height="400"></canvas>
	<div id="map"></div>
</div>
<br> 
<div id="Legend" class="legend">
					
</div>
<div class="clearleft">

<script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
<script src="JS/map.js"></script>
</body>
</html>