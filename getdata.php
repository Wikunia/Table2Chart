<?php
	
	include("classes/table2array.php");
	include("classes/chart.php");
	
	include("classes/color.php");
	
	$table = $_POST['table'];
	$value = json_decode($_POST['value'], true); // value_columns
	$lang  = $_POST['lang'];
	
	$chart = new chart($table,$lang);
	list($type,$data) = $chart->create_graph();
		
	//echo $type.'<br>'.$data;
	if (count($value) > 0) {
		$data_array = json_decode($data,true);
		$data_new = $data_array;
		$data_new['datasets'] = "";
		for ($i = 0; $i < count($data_array['datasets']); $i++) {
			if (in_array($data_array['datasets'][$i][title],$value)) {
				$data_new['datasets'][] = $data_array['datasets'][$i];
			}
		}
		$data = json_encode($data_new);
	}
	$json = json_encode(array('type'=>$type,'data'=>$data));
	
	echo $json;
	
	


?>