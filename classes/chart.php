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
*		list($type,$data) = $chart->create_json_line($label,$values); 
*                                                    $label = name of label column
*                                                    $values = name of value column(s) // is an array so $values[0],$values[1]
* 
* author: Ole Kröger
* license: MIT license
*/
	
	
class chart extends table2array {		
		
	public $console;

	private $json;

	private $value_columns;
	private $label_columns;
	private $rank_columns;
	private $nut_label_columns;
	
	/**
	 * get all arrays of the table2array class	
	 * @param string $table html table
	 * @param string $lang (de|en)
	*/
	function __construct($table,$lang) {
		date_default_timezone_set('Europe/Berlin');
		$this->get_countries();
		$this->get_array($table,$lang);
	}
		
		
	function create_graph() {
		
		
		if ($this->row_count-1 <= 0) {
			return array('none',''); 
		}
		
		
		//format the date entries 
		$this->format_date(); 
		
		
		// create special arrays for label columns, value columns and not_unique_text columns (nut)
		$graph = array();
		$n = 0;
		for ($i = 0; $i < $this->col_count; $i++) {
			$c_column_struct = $this->column_structure[$this->column_titles[$i]]; // current column structure;
			if ($c_column_struct !== "undefined") {					
				// value number or percentage
				if (($c_column_struct == table2array::TYPE_NUMBER) or ($c_column_struct == table2array::TYPE_PERCENTAGE)) { 
					$this->value_columns[] = $this->column_titles[$i];
				}
				if ($c_column_struct == table2array::TYPE_RANK) {
					$this->rank_columns[] = $this->column_titles[$i];	
				}
				
				// label
				$labels_types = [table2array::TYPE_STRING,table2array::TYPE_YEAR,table2array::TYPE_DATE,table2array::TYPE_MONTH,table2array::TYPE_COUNTRY];
				if (in_array($c_column_struct,$labels_types)) { 
					$this->label_columns[] = $this->column_titles[$i];
				}
				if ($c_column_struct === 'not_unique_text') {
					$this->nut_label_columns[] = $this->column_titles[$i];
				}
			}
		}
		
		// Check if the last entry of each value_column is a sum of all 
		// -> delete this row (row_array)
		// if one or more value columns exist
		if (count($this->value_columns) != 0) {
			$sumall = true;
			for ($i = 0; $i < count($this->value_columns); $i++) {			
				if ($this->array_structure[$this->value_columns[$i]][$this->row_count-2] != table2array::TYPE_SUM_ALL) {
					$sumall = false;
				}
			}
			if ($sumall === true) {
				array_pop($this->row_array); // delete last row
				$this->row_count = $this->row_count-1;
			}
		}
		
	// Is there at least one label and one value column
	if (((count($this->label_columns) != 0) or (count($this->nut_label_columns) != 0)) and (count($this->value_columns) != 0))
	{
		// One value column
		if (count($this->value_columns) == 1) {
			//percentage 
			if ($this->column_structure[$this->value_columns[0]] == table2array::TYPE_PERCENTAGE) {
				$checksum = 0;
				for ($y = 0; $y < $this->row_count-1; $y++) {
					$checksum = $checksum + $this->row_array[$y][$this->value_columns[0]];
				}
				if (round($checksum,2) == 100) { // pie chart
					$graph["type"] = "pie";
					$graph["label"] = $this->label_columns[0];
					$graph["values"][] = $this->value_columns[0]; 
				}
				else {
					$graph = $this->line_or_bar();
				}
			}
			else { // no percentage
				if (count($this->rank_columns) > 0) { 
					$graph["type"] = "bar";
					$graph["val_type"] = table2array::TYPE_NUMBER;
					$graph["label"] = $this->label_columns[0];
					$value_columns = $this->value_columns;
					$value_columns[] = $this->rank_columns[0];
					$graph["values"] = $value_columns; 
				} else if ($this->column_structure[$this->label_columns[0]] == table2array::TYPE_COUNTRY) { //country column
					$graph["type"] = "map";
					$graph["val_type"] = table2array::TYPE_NUMBER;
					$graph["label"] = $this->label_columns[0];
					$graph["values"] = array($this->value_columns[0]); 
				} else {
					$graph = $this->line_or_bar();
				}
			}
		}		
		else { // more than 1 value column
			if ($this->column_structure[$this->label_columns[0]] == table2array::TYPE_COUNTRY) {
					$graph["type"] = "map";
					$graph["val_type"] = table2array::TYPE_NUMBER;
					$graph["label"] = $this->label_columns[0];
					$graph["values"] = $this->value_columns; 
			} else {
			// line or bar
			// check if each column is percentage or a normal number
			$checksum = 0;
			for ($i = 0; $i < count($this->value_columns); $i++) {
				$checksum = $checksum + $this->column_structure[$this->value_columns[$i]];
			}
			if (($checksum/count($this->value_columns))==table2array::TYPE_NUMBER) { // all normal numbers
				if (count($this->label_columns) == 1) { // only one label
					if (($this->row_count <= 10) or (count($this->nut_label_columns) == 0)) {
						$graph = $this->line_or_bar();
					}
					else { 						
							$graph["type"] = "bar";
							$graph["label"] = $this->nut_label_columns[0];
							for ($i = 0; $i < count($this->value_columns); $i++) {
								$graph["values"][] = $this->value_columns[$i];
							}
							$graph["special"] = "nut";
					}
				}
				else { // more than 1 label column
					if (($this->row_count <= 10) or (count($this->nut_label_columns) == 0)) {
						$graph = $this->line_or_bar();
					}
					else { 					
						$graph["type"] = "bar";
						$graph["label"] = $this->nut_label_columns[0];
						for ($i = 0; $i < count($this->value_columns); $i++) {
							$graph["values"][] = $this->value_columns[$i];
						}
						$graph["special"] = "nut";
					}						
				}
			}
			
			
			
			if (($checksum/count($this->value_columns))==table2array::TYPE_PERCENTAGE) { // all percentage				
				// row based
				$row_based_hundred = true;
				$this->console[] = array(165,"row_based_hundred = true");
				for ($y = 0; $y < $this->row_count-1; $y++) {
					$sum_row[$y] = 0;
					for ($x = 0; $x < count($this->value_columns); $x++) {
						$sum_row[$y] = $sum_row[$y] + $this->row_array[$y][$this->value_columns[$x]];
					}
					$this->console[] = array(170,$sum_row[$y]);
					if (round($sum_row[$y],2) != 100) {
						$row_based_hundred = false;
						$this->console[] = array(174,"row_based_hundred = false");
					}
					
				}
				
					// can't be pie chart 
					if ($row_based_hundred === false) {
						$graph["type"] = "bar";
						$graph["label"] = $this->label_columns[0];
						for ($i = 0; $i < count($this->value_columns); $i++) {
							$graph["values"][] = $this->value_columns[$i];
						}
					}
					else {
						$graph["type"] = "stackedbar";
						$graph["label"] = $this->label_columns[0];
						for ($i = 0; $i < count($this->value_columns); $i++) {
							$graph["values"][] = $this->value_columns[$i];
							$graph["label_value"][] = $this->value_columns[$i];
						}						
					}					
				
			}
			
			
			// some values are percantage (TYPE_PERCENTAGE := 2 & TYPE_NUMBER := 1) and some are normal numbers
			if ((($checksum/count($this->value_columns))>table2array::TYPE_NUMBER) and (($checksum/count($this->value_columns))<table2array::TYPE_PERCENTAGE)) {				
				$percentage_columns = array();
				$number_columns = array();
				for ($i = 0; $i < count($this->value_columns); $i++) {
					if ($this->column_structure[$this->value_columns[$i]] == table2array::TYPE_PERCENTAGE) {
						$percentage_columns[] = $this->value_columns[$i];
					}
					else {
						$number_columns[] =  $this->value_columns[$i];
					}
				}
				
				for ($i = 0; $i < count($this->label_columns); $i++)
				{
					if (($this->column_structure[$this->label_columns[$i]] == table2array::TYPE_YEAR) or ($this->column_structure[$this->label_columns[$i]] == table2array::TYPE_DATE)) { // year or date
						// line
						$graph["type"] = "line";
						$graph["label"] = $this->label_columns[$i];
						for ($j = 0; $i < count($number_columns); $j++) {
							$graph["values"][] = $number_columns[$j];
						}	
						break;
					}
				}
				
				if ($graph["type"] != "line") {
					// bar
					$graph["type"] = "bar";
					$graph["label"] = $this->label_columns[0];
					for ($i = 0; $i < count($number_columns); $i++) {
							$graph["values"][] = $number_columns[$i];
						}						
				}
					
					
					
			}
		}
		}
	} else {
		// line chart
		if (count($this->label_columns) == 0) {
			if (count($this->value_columns) == 2) {
				// check if one value column is like 1,2,3,4...
				for ($i = 0; $i < $this->value_columns; $i++) {
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
			}
			if (!isset($graph['type'])) {
				// no rank -> first column = label -> other columns = value
				$graph['type'] = 'line';
				$graph['label'] = $this->value_columns[0];
				for ($i = 1; $i < count($this->value_columns); $i++) {
					$graph['value'][] = $this->value_columns[$i];
				}
			}
		}
		
		// two label columns and no value column
		if (count($this->label_columns) == 2) {
				// country labels
				if (($this->column_structure[$this->label_columns[0]] == table2array::TYPE_COUNTRY) or ($this->column_structure[$this->label_columns[1]] == table2array::TYPE_COUNTRY)) {
					$graph["type"] = "map";
					$graph["val_type"] = table2array::TYPE_STRING;
					if ($this->column_structure[$this->label_columns[0]] == table2array::TYPE_COUNTRY) {
						$graph["label"] = $this->label_columns[0];
						$graph["values"] = $this->label_columns[1]; 
					} else {
						$graph["label"] = $this->label_columns[1];
						$graph["values"] = $this->label_columns[0]; 
					}
					
					
				}
				
				
		}
	}	
		
		if (!empty($graph)) {
			$graph["value_names"] = $graph["values"];

			switch($graph["type"]) {
				case "line": 
					return array('line',$this->create_json_line($graph["label"],$graph["values"],$graph["value_names"])); 
					break;
				case "pie":
					return array('pie',$this->create_json_pie($graph["label"],$graph["values"])); // value can't be an array
					break;
				case "bar":
					if (!isset($graph["special"])) {
						$graph["special"] = "";
					}
					return array('bar',$this->create_json_bar($graph["label"],$graph["values"],$graph["value_names"],$graph["special"])); 
					break;
				case "stackedbar":
					return array('stackedbar',$this->create_json_stackedbar($graph["label"],$graph["values"],$graph["label_value"])); 
					break;
				case "climate":
					return array('climate',$this->create_json_lineDoubleY($graph["label"],$graph["values"])); 
					break;
				case "lineDoubleY":
					return array('lineDoubleY',$this->create_json_lineDoubleY($graph["label"],$graph["values"])); 
					break;
				case "map":
					return array('map',$this->create_json_map($graph["label"],$graph["values"],$graph["val_type"])); 
					break;
			}
		} else {
			return array('none',array());
		}
	}
		
	function line_or_bar() {
		$graph = array();
		for ($i = 0; $i < count($this->label_columns); $i++)
			{
				$c_column_struct = $this->column_structure[$this->label_columns[$i]];
				// year, date or month
				if (($c_column_struct == table2array::TYPE_YEAR) or ($c_column_struct == table2array::TYPE_DATE) or ($c_column_struct == table2array::TYPE_MONTH)) { 
					// line
					$graph["type"] = "line";
					$graph["label"] = $this->label_columns[$i];
					$graph["values"] = $this->value_columns;
					
					if (count($this->value_columns) == 2) {
						$unit_1 = $this->get_value_unit($this->value_columns[0]);
						$unit_2 = $this->get_value_unit($this->value_columns[1]);
						
						$temperatureUnits = array('C','°C','&deg;C','&deg; C','°F','F','&deg;F','&deg; F','Celsius','Fahrenheit');
						$rainfallUnits = array('mm');
						if (($unit_1 != "") and ($unit_1 != $unit_2)) { // not the same and unempty unit
							if ((in_array($unit_1,$temperatureUnits) and in_array($unit_2,$rainfallUnits))
							   or (in_array($unit_2,$temperatureUnits) and in_array($unit_1,$rainfallUnits))) {
								$graph["type"] = "climate";
							} else {
							  $graph["type"] = "lineDoubleY"; 
							}
							$graph["label"] = $this->label_columns[$i];
							// switch the temperature to unit_1 and rainfall to unit_2
							if (in_array($unit_2,$temperatureUnits) and in_array($unit_1,$rainfallUnits)) {
								$rainCol = $this->value_columns[0];
								$rainUnit = $unit_1;
								$this->value_columns[0] = $this->value_columns[1];
								$unit_1 = $unit_2;
								$this->value_columns[1] = $rainCol;
								$unit_2 = $rainUnit;	
							}
							$graph["values"] = $this->value_columns;
						}
					}
					return $graph;
				}
			}
			
		// bar
		$graph["type"] = "bar";
		$graph["label"] = $this->label_columns[0];
		$graph["values"] = $this->value_columns;		
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
		
		return json_encode(array("title"=>$this->table_title,"data"=>$return));
	}	
	
	
	
	
	
	function create_json_bar($label,$values,$val_names,$special) { // values = array
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
					$datasets[] = array("fillColor"=>$rgb[$v],"strokeColor"=>$rgb[$v],"title"=>$val_names[$v],"data"=>$data);
				}
				
				// if there is only one dataset the function sort_array sorts the dataset desc
				if (count($datasets) == 1) {
					list($labels,$datasets) = $this->sort_array($labels,$datasets,$values);
				}
				
				break;
			case "no_sort":
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
					
					$datasets[] = array("fillColor"=>$rgb[$v],"strokeColor"=>$rgb[$v],"title"=>$val_names[$v],"data"=>$data);
				}
				if ($special != "nosort") {
					// if there is only one dataset the function sort_array sorts the dataset desc
					if (count($datasets) == 1) {
						list($labels,$datasets) = $this->sort_array($labels,$datasets,$values);
					} else { // check if one dataset is a rank
						$rank_column = false;
						for($i = 0; $i < count($datasets); $i++) {
							$this->console[] = array(482,json_encode($datasets[$i]["data"]));
							if ((max($datasets[$i]["data"])-min($datasets[$i]["data"])+1) == count($datasets[$i]["data"])) {
								$rank_column = $i;
								break;
							}
						}
						if ($rank_column !== false) {
							list($labels,$datasets) = $this->sort_array($labels,$datasets,$values,$rank_column);
						}
					}					
				}
				break;
		}
	
		

		
		$return = array("labels"=>$labels,"title"=>$this->table_title,"datasets"=>$datasets);
		
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
		
		
		$return = array("labels"=>$labels,"title"=>$this->table_title,"datasets"=>$datasets);
		
		return json_encode($return);	
		
	}
	
	
	function create_json_line($label,$values,$val_names) {
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
				
				$datasets[] = array("fillColor"=>$rgb[$v],"strokeColor"=>$rgb[$v],"pointColor"=>$rgb[$v],"pointStrokeColor"=>$rgb[$v],"title"=>$val_names[$v],"data"=>$data);
			}

		$return = array("labels"=>$labels,"title"=>$this->table_title,"datasets"=>$datasets);
		
		return json_encode($return);
		
		//return $return;		
	
	}
	
	
	function create_json_lineDoubleY($label,$values) {
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

		$return = array("labels"=>$labels,"title"=>$this->table_title,"datasets_Y1"=>array($datasets[0]),"datasets_Y2"=>array($datasets[1]));
		
		return json_encode($return);
		
		//return $return;		
	
	}
	
	function create_json_map($label_col,$value_cols,$val_type) {
		$labels = array();
		for ($i = 0; $i < $this->row_count-1; $i++) {
			$labels[] = $this->row_array[$i][$label_col];
		}
		$values = array();
		if ($val_type == table2array::TYPE_NUMBER) {
			for ($j = 0; $j < count($value_cols); $j++) {
				$values[$j] = array();
				for ($i = 0; $i < $this->row_count-1; $i++) {
					$values[$j][] = floatval($this->row_array[$i][$value_cols[$j]]);
				}
			}	
			$return = array("title"=>$this->table_title,"columnTitles"=>$value_cols,"labels"=>$labels,"values"=>$values);
		} else { // value column is a string column!
			for ($j = 0; $j < count($value_cols); $j++) {
				$values[$j] = array();
				for ($i = 0; $i < $this->row_count-1; $i++) {
					$values[$j][] = $this->row_array[$i][$value_cols[$j]];
				}
			}
			$unique_values = array_unique($values);
			
			$rgb = Color::get_n_colors(count($unique_values));
			
			$colors = array();
			$i = 0;
			foreach($unique_values as $unique_value) {
				$colors[] = array("value"=>$unique_value,"color"=>$rgb[$i]);
				$i++;
			}
			$return = array("title"=>$this->table_title,"columnTitles"=>$value_cols,"labels"=>$labels,"values"=>$values,"colors"=>$colors);
		}
		return json_encode($return);
		
		//return $return;		
	
	}
	
	
	
	/** ******************************************************************* */
	
	
	function sort_array($labels,$datasets,$values,$datasetNr=0) {
		$array = array();
		for ($i = 0; $i < count($labels); $i++) {
			for ($j = 0; $j < count($labels)-$i-1; $j++) {
				if ($datasets[$datasetNr]["data"][$j] > $datasets[$datasetNr]["data"][$j+1]) {
					$cache = $labels[$j];
					$labels[$j] = $labels[$j+1];
					$labels[$j+1] = $cache;
					for ($d = 0; $d < count($datasets); $d++) {
						$cache = $datasets[$d]["data"][$j];
						$datasets[$d]["data"][$j] = $datasets[$d]["data"][$j+1];
						$datasets[$d]["data"][$j+1] = $cache;
					}
				}
			}
		}
		
		return array($labels,$datasets);
	}
		
		
	// replace 16 March 1932 to 16.03.1932 -> !important for chart.js	
	function format_date() {
		for ($i = 0; $i < $this->col_count; $i++) {
			if ($this->column_structure[$this->column_titles[$i]] == table2array::TYPE_DATE) {
				for ($j = 0; $j < $this->row_count-1; $j++) {
					if ($this->lang == "de") {preg_match(table2array::DATE_RX_DE,$this->row_array[$j][$this->column_titles[$i]], $matches);}
					if ($this->lang == "en") {preg_match(table2array::DATE_RX_EN,$this->row_array[$j][$this->column_titles[$i]], $matches);}
					if ($matches) {
						$new_date = $this->row_array[$j][$this->column_titles[$i]];
						for ($m = 0; $m < 12; $m++) {
							// change January to 1
							$new_date = str_replace($this->month[12+$m],$m+1,$new_date);
							// change Jan to 1
							$new_date = str_replace($this->month[$m],$m+1,$new_date);
						}
						$new_date = str_replace(' ','.',$new_date);
						$this->row_array[$j][$this->column_titles[$i]] = str_replace('..','.',$new_date);
					}
					
				}
			}
		}	
	}
	
	function ddMMYYYY2array($date,$format) {
		if (in_array($format,$this->month)) {
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
	
	
	function get_value_unit($string) {
		preg_match("/(.*) (in (.*)|\((.*)\))/", $string, $output_array);
		if ($output_array[3]) {
			return $output_array[3];
		} 
		if ($output_array[4]) {
			return $output_array[4];
		} 
		return "";
	}

	
	function calculateOrderOfMagnitude($val){
		return floor(log($val) / log(10));
	}
	
	
}
	
	
	
	
	

?>