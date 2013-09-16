<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Table2Chart - Wikunia - GitHub</title>
		<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon" />
		<meta name="description" content="Open source tool which visualizes tables with Chart.js."/>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
		<script type="text/javascript" src="JS/chart.js"></script>
		<script type="text/javascript" src="JS/index.js"></script>
		<script type="text/javascript" src="JS/filesaver.js"></script>
		<script type="text/javascript" src="JS/canvas-toBlob.js"></script>
		<link rel="stylesheet" href="CSS/styles.css"/>
	</head>
	<body>
	<header>
		<h1>Table2Chart</h1>
		<h2>PHP/JS tool which visualizes tables</h2>
	</header>
	<a href="https://github.com/Wikunia"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"></a>
	<section id="doc">
		This tool visualizes tables automatically by creating a structured table array. It decides which chart type is the best choice.<br>
		This is <b>open source</b> so everybody can improve this tool and of course use it for <b>free</b> (It's licensed under the <a href="http://opensource.org/licenses/MIT">MIT License</a>).<br>
		To create charts I use <a href="http://chartjs.org">Chart.js</a> by <a href="http://nickdownie.com">Nick Downie</a>.<br>
	</section>
	<hr>
	<section id="examples">
		<article id="lineChart" >
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
					include('tables/line.htm');
				?>
				</div>
			</div>
			<div class="clearleft">
			<br><div id="vis_line" class="button vis_it">Visualize it!</div><div id="save_line" class="button save">Save as png</div><div class="clearleft"></div>
		</article>

		<hr>
		
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
					include('tables/bar.htm');
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
		
		

	</section>
	
	<footer>
		A project by <a href="https://github.com/Wikunia">Ole Kröger</a>
	</footer>
	</body>
</html>