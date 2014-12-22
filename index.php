<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Table2Chart - Wikunia - GitHub</title>
		<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon" />
		<meta name="description" content="Open source tool which visualizes html tables with Chart.js. Even the type of representation is determined automatically."/>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
		<script type="text/javascript" src="JS/gradient.min.js"></script>
		<script type="text/javascript" src="JS/chart.js"></script>
		<script type="text/javascript" src="JS/index.js"></script>
		<script type="text/javascript" src="JS/filesaver.js"></script>
		<script type="text/javascript" src="JS/canvas-toBlob.js"></script>
		<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />
		<script type="text/javascript" src="JS/ion.rangeSlider.min.js"></script>
		<link rel="stylesheet" href="CSS/ion.rangeSlider.css"/>
		<link rel="stylesheet" href="CSS/ion.rangeSlider.skinNice.css"/>
		<link rel="stylesheet" href="CSS/styles.css"/>
		<link rel="stylesheet" href="CSS/map.css"/>
	</head>
	<body>
	<header>
		<h1>Table2Chart</h1>
		<h2>PHP/JS tool which visualizes tables</h2>
	</header>
	<a href="https://github.com/Wikunia/Table2Chart"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"></a>
	<section id="doc">
		This tool visualizes tables automatically by creating a structured table array. It decides which chart type is the best choice.<br>
		This is <b>open source</b> so everybody can improve this tool and of course use it for <b>free</b> (It's licensed under the <a href="http://opensource.org/licenses/MIT">MIT License</a>).<br>
		To create charts I use <a href="http://chartjs.org">Chart.js</a> by <a href="http://nickdownie.com">Nick Downie</a>.<br>
		I use <a href="http://leafletjs.com/">leafletjs.com</a> to draw the maps for the MapChart.<br>
	</section>
	<section id="new">
		<b>Now it's possible to visualize your own html tables <a href="create.php">here</a>!</b><br>
		<br>
	</section>
	<hr>
	<section id="examples">
		<article id="lineChart">
			<div class="left"> 
				<h2>Line charts</h2>
				<p>Tables with a date based column are interpreted as line charts.</p><br>
				<b>Required</b>
				<ul>
					<li>one date column</li>
					<li>one or more value or percentage columns</li>
				</ul>
				<div id="lineLegend" class="legend">
					
				</div>
			</div>
			<div class="canvasWrapper">
				<canvas id="lineChartCanvas" class="chart" width="800" height="400"></canvas>
				<div id="lineTable" class="table">
				<?php
					include('tables/births.htm');
				?>
				</div>
			</div>
			<div class="clearleft">
			<br><div id="vis_line" class="button vis_it">Visualize it!</div><div id="save_line" class="button save">Save as png</div><div class="clearleft"></div>
		</article>

		<hr>
		
		<!--<article id="climateChart" >
			<div class="left"> 
				<h2>Line double y-axis charts (climate chart)</h2>
				<p>Tables with a date based column and two value columns with different units are interpreted as line charts.</p><br>
				<b>Required</b>
				<ul>
					<li>one date column</li>
					<li>two value columns (°C or °F) and mm</li>
				</ul>
				<div id="climateLegend" class="legend">
					
				</div>
			</div>
			<div class="canvasWrapper">
				<canvas id="climateChartCanvas" class="chart" width="800" height="400"></canvas>
				<div id="climateTable" class="table">
				<?php
					//include('tables/climate.htm');
				?>
				</div>
			</div>
			<div class="clearleft">
			<br><div id="vis_climate" class="button vis_it">Visualize it!</div><div id="save_lineDoubleY" class="button save">Save as png</div><div class="clearleft"></div>
		</article>
		
		<hr>-->
		
		<!--<article id="lineDoubleYChart" >
			<div class="left"> 
				<h2>Line double y-axis charts</h2>
				<p>Tables with a date based column and two value columns with different units are interpreted as line charts.</p><br>
				<b>Required</b>
				<ul>
					<li>one date column</li>
					<li>two value columns with different units</li>
				</ul>
				<div id="lineDoubleYLegend" class="legend">
					
				</div>
			</div>
			<div class="canvasWrapper">
				<canvas id="lineDoubleYChartCanvas" class="chart" width="800" height="400"></canvas>
				<div id="lineDoubleYTable" class="table">
				<?php
					include('tables/lineDoubleY.htm');
				?>
				</div>
			</div>
			<div class="clearleft">
			<br><div id="vis_lineDoubleY" class="button vis_it">Visualize it!</div><div id="save_lineDoubleY" class="button save">Save as png</div><div class="clearleft"></div>
		</article>
		
		<hr>-->
		
		<article id="barChart" >
			<div class="left">
				<h2>Bar charts</h2>
				<p>A lot of tables can be interpreted as bar graphs or stacked bar graphs.</p><br>
				<b>Required</b>
				<ul>
					<li>one string column</li>
					<li>one or more value or percentage columns</li>
				</ul>
				<div id="barLegend" class="legend">
					
				</div>
			</div>
			<div class="canvasWrapper">
				<canvas id="barChartCanvas" class="chart" width="800" height="400"></canvas>
				<div id="barTable" class="table">
				<?php
					include('tables/WM2010rang.htm');
				?>
				</div>			
			</div>
			<div class="clearleft">
			<br><div id="vis_bar" class="button vis_it">Visualize it!</div><div id="save_bar" class="button save">Save as png</div><div class="clearleft"></div>	
		</article>
	
		<hr>

		<article id="stackedBarChart" >
			<div class="left">
				<h2>Stacked bar charts</h2>
				<p>Stacked bar charts can show 100% bar charts in a better way.</p><br>
				<b>Required</b>
				<ul>
					<li>one string column</li>
					<li>percentage columns with the sum of 100%</li>
				</ul>
				<div id="stackedBarLegend" class="legend">
					
				</div>				
			</div>
			<div class="canvasWrapper">
				<canvas id="stackedBarChartCanvas" class="chart" width="800" height="400"></canvas>
				<div id="stackedBarTable" class="table">
				<?php
					include('tables/stackedBar.htm');
				?>
				</div>			
			</div>
			<div class="clearleft">
			<br><div id="vis_stackedBar" class="button vis_it">Visualize it!</div><div id="save_stackedBar" class="button save">Save as png</div><div class="clearleft"></div>			
		</article>
			
		<hr>
		
		<article id="pieChart" >
			<div class="left">
				<h2>Pie charts</h2>
				<p>Pie charts are great at comparing percentage proportions.</p><br>
				<b>Required</b>
				<ul>
					<li>one string column</li>
					<li>one percentage column with the sum of 100%</li>
				</ul>
			</div>
			<div class="canvasWrapper">
				<canvas id="pieChartCanvas" class="chart" width="400" height="400"></canvas>
				<div id="pieTable" class="table">
				<?php
					include('tables/pie.htm');
				?>
				</div>			
			</div>
			<div class="clearleft">
			<br><div id="vis_pie" class="button vis_it">Visualize it!</div><div id="save_bar" class="button save">Save as png</div><div class="clearleft"></div>
		</article>
		
		
		<article id="mapChart" >
			<div class="left">
				<h2>Map charts</h2>
				<p>Map charts are great to visualize map-related data.</p><br>
				<b>Required</b>
				<ul>
					<li>one country column</li>
					<li>one label or value column</li>
				</ul>
			</div>
			<div class="canvasWrapper">
				<div id="map" class="chart"></div>
				<div id="rangeSliderDiv">
					<input type="text" id="rangeSlider" name="rangeSlider" value="" />
				</div>
				<div id="mapTable" class="table">
				<?php
					include('tables/ebola.htm');
				?>
				</div>					
			</div>
			<div class="clearleft">
			<br><div id="vis_map" class="button vis_it">Visualize it!</div><div class="clearleft"></div>
			
		</article>
		

	</section>
	
	<footer>
		A project by <a href="https://github.com/Wikunia">Ole Kröger</a>
	</footer>
	
	<script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
	<script src="JS/map.js"></script>
	</body>
</html>