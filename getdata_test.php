<?php
	include("classes/table2array.php");
	include("classes/chart.php");
	
	include("classes/color.php");
	
	$table = file_get_contents('tables/'.$_GET['table'].'.htm');
	$value = json_decode($_GET['value'], true); // value_columns
	$lang = $_GET['lang'];
	
	$chart = new chart($table,$lang);
	list($type,$data) = $chart->create_graph();

	echo 'Row length<br>';
	print_r($chart->row_count);
	echo '<br><br>';
	echo 'Col length<br>';
	print_r($chart->col_count);
	echo '<br><br>';
	echo 'Array_structure<br>';
	print_r($chart->array_structure);
	echo '<br><br>';
	echo 'Column_structure<br>';
	print_r($chart->column_structure);
	echo '<br><br>';
	echo 'Column_titles<br>';
	print_r($chart->column_titles);
	echo '<br><br>';
		
	//echo $type.'<br>'.$data;
	if (count($value) > 0) {
		$data_array = json_decode($data,true);
		$data_new = $data_array;
		$data_new[datasets] = "";
		for ($i = 0; $i < count($data_array[datasets]); $i++) {
			if (in_array($data_array[datasets][$i][title],$value)) {
				$data_new[datasets][] = $data_array[datasets][$i];
			}
		}
		$data = json_encode($data_new);
	}
	$json = json_encode(array('type'=>$type,'data'=>$data));
	
	echo $json;