<?php
/*
* This class generates chart data for Chart.js
* 
* You need to include this file in your PHP-file to use this class
* 		include "chart.php";
*		and you need to include the class table2array.php, too.
* 		include "table2array.php";
* 
* To generate chart data, the command is
* 		$chart = new Chart($table,$lang); // $table and $lang are important for the table2array class.
*		list($type,$data) = $chart->create_graph(); // $type is for example 'line' and data is the data for chart.js 
*
* If you want to generate a chart without an analyse, you can use
*		list($type,$data) = $chart->create_json_line($label,$values); // $values is an array 
* 
* author: Ole Kröger
* license: MIT license
*/
	
	
class chart extends table2array {

		private $json;
		
		private $value_columns;
		private $label_columns;
		private $nut_label_columns;
	
	function __construct($table,$lang) {
		// get all arrays of the table2array class
		$this->get_array($table,$lang);
	}
		
		
	function create_graph($table,$lang) {
		
		
		
		
		//format the date entries 
		$this->format_date(); 
		
		
		// create special arrays for label columns, value columns and not_unique_text columns (nut)
		$graph = array();
		$n = 0;
		for ($i = 0; $i < $this->col_count; $i++) {
			if ($this->column_structure[$this->column_titles[$i]] !== "undefined") {					
				if (($this->column_structure[$this->column_titles[$i]] == 1) or ($this->column_structure[$this->column_titles[$i]] == 2)) { // value number or percentage
					$this->value_columns[] = $this->column_titles[$i];
				}
				if (($this->column_structure[$this->column_titles[$i]] === 0) or ($this->column_structure[$this->column_titles[$i]] == 4) or ($this->column_structure[$this->column_titles[$i]] == 5)) { // label
					$this->label_columns[] = $this->column_titles[$i];
				}
				if ($this->column_structure[$this->column_titles[$i]] === 'not_unique_text') {
					$this->nut_label_columns[] = $this->column_titles[$i];
				}
			}
		}
		
		// Check if the last entry of each value_column is a sum of all 
		// -> delete this row (row_array)
		$sumall = true;
		for ($i = 0; $i < count($this->value_columns); $i++) {			
			if ($this->array_structure[$this->value_columns[$i]][$this->row_count-2] != 3) {
				$sumall = false;
			}
		}
		if ($sumall === true) {
			array_pop($this->row_array); // delete last row
			$this->row_count = $this->row_count-1;
		}
		
	if (((count($this->label_columns) != 0) or (count($this->nut_label_columns) != 0)) and (count($this->value_columns) != 0))
	{
		
		if (count($this->value_columns) == 1) {
			//percentage 
			if ($this->column_structure[$this->value_columns[0]] == 2) {
				$checksum = 0;
				for ($y = 0; $y < $this->row_count-1; $y++) {
					$checksum = $checksum + $this->row_array[$y][$this->value_columns[0]];
				}
				if (round($checksum,2) == 100) { // pie chart
					$graph["type"] = "pie";
					$graph["label"] = $this->label_columns[0];
					$graph["value"][] = $this->value_columns[0]; 
				}
				else {
					$graph = $this->line_or_bar();
				}
			}
			else {
				$graph = $this->line_or_bar();
			}
		}		
		else {
			// line or bar
			// check if each column is percentage or a normal number
			$checksum = 0;
			for ($i = 0; $i < count($this->value_columns); $i++) {
				$checksum = $checksum + $this->column_structure[$this->value_columns[$i]];
			}
			if (($checksum/count($this->value_columns))==1) { // all normal numbers
				if (count($this->label_columns) == 1) { // only one label
					if (($this->row_count <= 10) or (count($this->nut_label_columns) == 0)) {
						$graph = $this->line_or_bar();
					}
					else { 						
							$graph["type"] = "bar";
							$graph["label"] = $this->nut_label_columns[0];
							for ($i = 0; $i < count($this->value_columns); $i++) {
								$graph["value"][] = $this->value_columns[$i];
							}
							$graph["special"] = "nut";
						
					}
				}
				else {
				
					
					if (($this->row_count <= 10) or (count($this->nut_label_columns) == 0)) {
						$graph = $this->line_or_bar();
					}
					else { 					
						$graph["type"] = "bar";
						$graph["label"] = $this->nut_label_columns[0];
						for ($i = 0; $i < count($this->value_columns); $i++) {
							$graph["value"][] = $this->value_columns[$i];
						}
						$graph["special"] = "nut";
					}						
				}
			
			}
			
			
			
			if (($checksum/count($this->value_columns))==2) { // all percentage				
				// row based
				$row_based_hundred = true;
				for ($y = 0; $y < $this->row_count-1; $y++) {
					$sum_row[$y] = 0;
					for ($x = 0; $x < count($this->value_columns); $x++) {
						$sum_row[$y] = $sum_row[$y] + $this->row_array[$y][$this->value_columns[$x]];
					}
					if (round($sum_row[$y],2) != 100) {
						$row_based_hundred = false;
					}
				}
				
				// can't be pie chart 
				
					if ($row_based_hundred === false) {
						$graph["type"] = "bar";
						$graph["label"] = $this->label_columns[0];
						for ($i = 0; $i < count($this->value_columns); $i++) {
							$graph["value"][] = $this->value_columns[$i];
						}
					}
					else {
						$graph["type"] = "stackedbar";
						$graph["label"] = $this->label_columns[0];
						for ($i = 0; $i < count($this->value_columns); $i++) {
							$graph["value"][] = $this->value_columns[$i];
							$graph["label_value"][] = $this->value_columns[$i];
						}						
					}					
				
			}
			
			
			// some values are percantage and some are normal numbers
			if ((($checksum/count($this->value_columns))>1) and (($checksum/count($this->value_columns))<2)) {				
				$percentage_columns = array();
				$number_columns = array();
				for ($i = 0; $i < count($this->value_columns); $i++) {
					if ($this->column_structure[$this->value_columns[$i]] == 2) {
						$percentage_columns[] = $this->value_columns[$i];
					}
					else {
						$number_columns[] =  $this->value_columns[$i];
					}
				}
				
				for ($i = 0; $i < count($this->label_columns); $i++)
				{
					if (($this->column_structure[$this->label_columns[$i]] == 4) or ($this->column_structure[$this->label_columns[$i]] == 5)) { // year or date
						// line
						$graph["type"] = "line";
						$graph["label"] = $this->label_columns[$i];
						for ($j = 0; $i < count($number_columns); $j++) {
							$graph["value"][] = $number_columns[$j];
						}	
						break;
					}
				}
				
				if ($graph["type"] != "line") {
					// bar
					$graph["type"] = "bar";
					$graph["label"] = $this->label_columns[0];
					for ($i = 0; $i < count($number_columns); $i++) {
							$graph["value"][] = $number_columns[$i];
						}						
				}
					
					
					
			}
		}
	} else {
		// line chart
		if ((count($this->label_columns) == 0) and (count($this->value_columns) == 2)) {
			// check if one value column is like 1,2,3,4...
			for ($i = 0; $i < 2; $i++) {
				if ($this->is_like_rank($this->value_columns[$i])) {
					$graph['type'] = 'line';
					$graph['label'] = $this->value_columns[$i];
					switch ($i) {
						case 0:
							$graph['value'][] = $this->value_columns[1];
							break;
						case 1:
							$graph['value'][] = $this->value_columns[0];
							break;
					}
					break;
				}
			}
			if (!isset($graph['type'])) {
				// no rank -> first column = label -> second column = value
				$graph['type'] = 'line';
				$graph['label'] = $this->value_columns[0];
				$graph['value'][] = $this->value_columns[1];
			}
		}
	}	
	
		
		
		
		switch($graph["type"]) {
			case "line": 
				return array('line',$this->create_json_line($graph["label"],$graph["value"])); 
				break;
			case "pie":
				return array('pie',$this->create_json_pie($graph["label"],$graph["value"])); // array in value not possible
				break;
			case "bar":
				return array('bar',$this->create_json_bar($graph["label"],$graph["value"],$graph["special"])); 
				break;
			case "stackedbar":
				return array('stackedbar',$this->create_json_stackedbar($graph["label"],$graph["value"],$graph["label_value"])); 
				break;
		
		}
	}
		
	function line_or_bar() {
		$graph = array();
		for ($i = 0; $i < count($this->label_columns); $i++)
			{
				if (($this->column_structure[$this->label_columns[$i]] == 4) or ($this->column_structure[$this->label_columns[$i]] == 5)) { // year or date
					// line
					$graph["type"] = "line";
					$graph["label"] = $this->label_columns[$i];
					$graph["value"] = $this->value_columns;
				}
				break;
			}
			
		if ($graph["type"] != "line") {
			// bar
			$graph["type"] = "bar";
			$graph["label"] = $this->label_columns[0];
			$graph["value"] = $this->value_columns;						
		}		
		return $graph;
	}
		
		
		
	function is_like_rank($column) {
		$is_like_rank = true;
		$distance = $this->row_array[1][$column]-$this->row_array[0][$column];
		for ($i = 2; $i < $this->row_count-1; $i++) {
			if ($this->row_array[$i][$column]-$this->row_array[$i-1][$column] != $distance)	{
				$is_like_rank = false;
				break;
			}
		}
		return $is_like_rank;
	}
	
	
		
	// sum of values
	function add_value_sum($label,$values) {
		$unique_label = array();
		$unique_values = array();
		for ($i = 0; $i < $this->row_count-1; $i++) {
			if ((!in_array($this->row_array[$i][$label],$unique_label)) and ($this->row_array[$i][$label] != "")) {
				$unique_label[] = $this->row_array[$i][$label];
			}
			for ($y = 0; $y < count($values); $y++) {
				if ($this->row_array[$i][$label] != "") {
					$unique_values[$y][$this->row_array[$i][$label]] = $unique_values[$y][$this->row_array[$i][$label]] + $this->row_array[$i][$values[$y]];
				}
			}
		}
		
		return array($unique_label,$unique_values);
	}
	
	/* 
	* chart types 
	* input: 
		$label (array)
		$values (array)
		
		
		Color::get_n_colors(N);
		returns n different colors for n datasets (see color.php)
	*/
	
	function create_json_pie($label,$values) {			
		$return = array();
		$value = $values[0];	
		$rgb = Color::get_n_colors($this->row_count-1);
		for ($i = 0; $i < $this->row_count-1; $i++) {
			if (($this->array_structure[$value][$i] == 1) or ($this->array_structure[$value][$i] == 2)) {
				$return[] = array("label"=>$this->row_array[$i][$label],"labelFontStyle"=>"Helvetica Neue","value"=>floatval($this->row_array[$i][$value]),"color"=>$rgb[$i],"title"=>$this->row_array[$i][$label]);
			}
		}
		
		return json_encode($return);
	}	
	
	
	
	
	
	function create_json_bar($label,$values,$special) { // values = array
		$count_val = count($values);
		
		$rgb = Color::get_n_colors($count_val);
		
		switch ($special) {
			case "nut": 
				// if the label is a nut label (not_unique) the function add_value_sum generates the correct value for each unique label
				list($labels,$unique_values) = $this->add_value_sum($label,$values);

				$datasets = array();
				for ($v = 0; $v < $count_val; $v++) {
					$data = array();
					for ($i = 0; $i < count($labels); $i++) {
						$data[] = floatval($unique_values[$v][$labels[$i]]);
					}
					$datasets[] = array("fillColor"=>$rgb[$v],"strokeColor"=>$rgb[$v],"title"=>$values[$v],"data"=>$data);
				}
				
				// if there is only one dataset the function sort_array sorts the dataset desc
				if (count($datasets) == 1) {
					list($labels,$datasets) = $this->sort_array($labels,$datasets,$values);
				}
				
				break;
			case "no_sort":
				$labels = array();
				for ($i = 0; $i < $this->row_count-1; $i++) {
					$labels[] = $this->row_array[$i][$label];
				}
				
				$datasets = array();
				for ($v = 0; $v < $count_val; $v++) {
					$data = array();
					for ($i = 0; $i < $this->row_count-1; $i++) {
						$data[] = floatval($this->row_array[$i][$values[$v]]);
					}
					
					$datasets[] = array("fillColor"=>$rgb[$v],"strokeColor"=>$rgb[$v],"title"=>$values[$v],"data"=>$data);
				}
				break;
			default:
				$labels = array();
				for ($i = 0; $i < $this->row_count-1; $i++) {
					$labels[] = $this->row_array[$i][$label];
				}
				
				$datasets = array();
				for ($v = 0; $v < $count_val; $v++) {
					$data = array();
					for ($i = 0; $i < $this->row_count-1; $i++) {
						$data[] = floatval($this->row_array[$i][$values[$v]]);
					}
					
					$datasets[] = array("fillColor"=>$rgb[$v],"strokeColor"=>$rgb[$v],"title"=>$values[$v],"data"=>$data);
				}
				
				// if there is only one dataset the function sort_array sorts the dataset desc
				if (count($datasets) == 1) {
					list($labels,$datasets) = $this->sort_array($labels,$datasets,$values);
				}
				break;
		}
	
		

		
		$return = array("labels"=>$labels,"datasets"=>$datasets);
		
		return json_encode($return);	
		
	}
	
	function create_json_stackedbar($label,$values,$label_values) { 
		$count_val = count($values);
		
		$rgb = Color::get_n_colors($count_val);

		$labels = array();
		for ($i = 0; $i < $this->row_count-1; $i++) {
			$labels[] = $this->row_array[$i][$label];
		}
		
		$datasets = array();
		for ($v = 0; $v < $count_val; $v++) {
			$data = array();
			for ($i = 0; $i < $this->row_count-1; $i++) {
				$data[] = floatval($this->row_array[$i][$values[$v]]);
			}
			
			$datasets[] = array("fillColor"=>$rgb[$v],"strokeColor"=>$rgb[$v],"title"=>$label_values[$v],"data"=>$data);
		}
		
		
		$return = array("labels"=>$labels,"datasets"=>$datasets);
		
		return json_encode($return);	
		
	}
	
	
	function create_json_line($label,$values) {
		//list($labels,$data,$dot) = $this->interim_values($label,$value);
		$count_val = count($values);
		
		$rgb = Color::get_n_colors($count_val);
		
		$labels = array();
			for ($i = 0; $i < $this->row_count-1; $i++) {
				$labels[] = $this->row_array[$i][$label];
			}
			
			$datasets = array();
			for ($v = 0; $v < $count_val; $v++) {
				$data = array();
				for ($i = 0; $i < $this->row_count-1; $i++) {
					$data[] = floatval($this->row_array[$i][$values[$v]]);
				}
				
				$datasets[] = array("fillColor"=>$rgb[$v],"strokeColor"=>$rgb[$v],"pointColor"=>$rgb[$v],"pointStrokeColor"=>$rgb[$v],"title"=>$values[$v],"data"=>$data);
			}
		

		
		
		$return = array("labels"=>$labels,"datasets"=>$datasets);
		
		return json_encode($return);
		
		//return $return;		
	
	}
	
	
	
	
	function sort_array($labels,$datasets,$values) {
		$data = $datasets[0]["data"];
		$array = array();
		for ($i = 0; $i < count($labels); $i++) {
			$array[$labels[$i]] = $data[$i];
		}
		arsort($array);
		$labels = array();
		$data = array();
		
		foreach($array as $label=>$value) {
			$labels[] = $label;
			$data[] = $value;
		}
		$return_datasets = array();
		$return_datasets[] = array("fillColor"=>$datasets[0]["fillColor"],"strokeColor"=>$datasets[0]["strokeColor"],"title"=>$values[0],"data"=>$data);
		return array($labels,$return_datasets);
	}
		
		
	// replace 16 March 1932 to 16.03.1932 -> !important for chart.js	
	function format_date() {
		for ($i = 0; $i < $this->col_count; $i++) {
			if ($this->column_structure[$this->column_titles[$i]] == 5) {
				for ($j = 0; $j < $this->row_count-1; $j++) {
					if ($this->lang == "de") {preg_match('#\d{1,2}\.[ ]?(Januar |Februar |MÃ¤rz |April |Mai |Juni |Juli |August |September |Oktober |November |Dezember |((0?[1-9])|10|11|12)\.)[1-2]\d{3}#',$this->row_array[$j][$this->column_titles[$i]], $matches);}
					if ($this->lang == "en") {preg_match('#\d{1,2}( January | February | March | April | May | June | July | August | September | Oktober | November | December |\.((0?[1-9])|10|11|12)\.)[1-2]\d{3}#',$this->row_array[$j][$this->column_titles[$i]], $matches);}
					$format_month = trim($matches[1]); // March or 03 or 3
					list($year,$month,$day) = $this->ddMMYYYY2array($this->row_array[$j][$this->column_titles[$i]],$format_month);
					$this->row_array[$j][$this->column_titles[$i]] = $day.'.'.$month.'.'.$year;
				}
			}
		}	
	}
	
	function ddMMYYYY2array($date,$format) {
		if ($this->lang == "de") { $months = array("Januar","Februar","MÃ¤rz","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"); }
		if ($this->lang == "en") { $months = array("January","February","March","April","May","June","July","August","September","Oktober","November","December"); }
		if (in_array($format,$months)) {
			$parts = explode(" ", $date);
			$month = array_search($parts[1], $months)+1;
			if ($month < 10) {
				$month = '0'.$month;
			}
			
			$day = str_replace(".","",$parts[0]);
			$year = $parts[2];
		}
		else
		{
			$parts = explode(".", $date);
			$day = trim($parts[0]);
			$month = trim($parts[1]);
			if (strlen($month) == 1) {
				$month = '0'.$month;
			}			
			$year = trim($parts[2]);
		}
		return array($year,$month,$day);
	}
	

}
	
	
	
	
	

?>