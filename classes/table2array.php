<?php
/*
* This class generates an row based array of a table
* + a structure array of this table 
*	- type for each entry
* + a column structure array
*	- type for each column (summary of the strucure array)
*
* You need to include this file in your PHP-file to use this class
* 		include "table2array.php";
* 
*	$lang = "de" or "en" 
* 		-> important for values 
*			de -> 7,3
*			en -> 7.3
*
*
* To generate these arrays, the commands are
* 	$table2array = new table2array()
* 	$table2array->get_array($table,$lang); 
*	
*   // row array
*	$table2array->row_array;
*
*	// array structure
*	$table2array->array_structure;
*
*	// Column_Structure
*	$table2array->column_structure
*
* 
* author: Ole Kröger
* license: MIT license
*/


	
	class table2array {
		public $lang;
	
		public $table;
		public $column_titles;
		public $row_count;
		public $col_count;
		public $col_count_unique;
		public $row_array;
		public $type_array;
		public $array_structure;
		public $column_structure;
		
		
		/*  main function creates all arrays */
		
		function get_array($table,$lang) {
			$this->table = $table;
			$this->lang = $lang;
			
			$this->column_titles = $this->get_column_titles();
			$this->get_structured_array();
			$this->array_structure = $this->get_structure();
			$this->column_structure = $this->get_column_structure();
			
		}
		
		/* Creating the column array */
		
		function get_column_titles() {
			// update $this->table
			$table_start = explode("<table", $this->table);
			$table_start = substr($table_start[1],strpos($table_start[1],">")+1);
			$table = explode("</table>", $table_start);
			$this->table = $table[0];
			
			$tr_start = explode("<tr", $this->table);
			$tr_start = substr($tr_start[1],strpos($tr_start[1],">")+1);
			$tr = explode("</tr>", $tr_start);
			$ths = explode("<th",str_replace("</th>","",$tr[0]));
			$this->col_count = count($ths)-1;
			for ($i = 1; $i <= $this->col_count; $i++) {
				// delete some html in the <th>-Tag 
				$ths[$i] = $this->readable_html($ths[$i]);
				
				$result[] = trim(utf8_decode(substr($ths[$i],strpos($ths[$i],">")+1)));
			}
			// if table has a two-column based table (year,inhabitans),(year,inhabitans) create unique titles (delete redundant titles)
			$result = $this->get_unique_titles($result); 
			return $result;
		}
		
		/* Creating unique titles */ 
		function get_unique_titles($result) {
			$array = $result;
			$not_unique = array();
			for ($i = 0; $i < $this->col_count; $i++) {
				$ele = array_pop($result); 
				if (in_array($ele,$result)) { // if column title not unique
					$not_unique[] = $i;
				}
			}
			$result = array();
			for ($i = 0; $i < $this->col_count; $i++) {
				if (!in_array($i,$not_unique)) {
				$result[] = $array[$i];
				}
			}
			$this->col_count_unique = count($result);
			return $result;
		}
		
		
		/* Creating a row based array */
		function get_structured_array() { 
				$row_array = array();
				$rows = explode("<tr",$this->table);
				
				
				
				
				$r = 0;
				// ($this->col_count/$this->col_count_unique) = number of "single tables"
				for ($t = 1; $t <= ($this->col_count/$this->col_count_unique); $t++) { 
					$col_min = ($t-1)*$this->col_count_unique;
					$col_max = $t*$this->col_count_unique;
					
					
					$i = -2;
					foreach ($rows as $row) {
						// $row No. 1 is not in the table because of the $rows = explode ("<tr",$this->table);
						// $row No. 2 is the column row -> start with $i = 0 here
						if ($i >= 0) {
							$col_array = array();
							$row = substr($row,strpos($row,">")+1);
							
							$cols = explode("<td",$row);
							$j = -1; 
							foreach ($cols as $col) {
								// check if this $col is in the current "single table"
								if (($j >= (($t-1)*$this->col_count_unique)) and ($j < ($t*$this->col_count_unique))) {
								
									// some columns have a colspan so the entries have to be colspan times in the array
									$colspan = 1;
									preg_match('#colspan="(.*)"#',substr($col,0,strpos($col,">")),$match_colspan);
									if ($match_colspan) {
										$colspan = $match_colspan[1];
									}
									
									// delete some html in the columns here
									$col = substr($col,strpos($col,">")+1);
									
									$col = $this->readable_html($col);
									
									$col = utf8_decode($col);
									
									// in some entries there is sth. like < 0.1 so a number 
									$col = str_replace('&lt;','<',$col);
									
									$bool_date = false;
									if (($this->lang == "de") and (preg_match('#\d{1,2}\.[ ]?(Januar |Februar |März |April |Mai |Juni |Juli |August |September |Oktober |November |Dezember |((0?[1-9])|10|11|12)\.)[1-2]\d{3}#',$col))) {
										$bool_date = true;
									}
									if (($this->lang == "en") and (preg_match('#\d{1,2}( January | February | March | April | May | June | July | August | September | Oktober | November | December |\.((0?[1-9])|10|11|12)\.)[1-2]\d{3}#',$col))) {
										$bool_date = true;
									}
									
									
									if ((!preg_match('#[a-zA-Z]#', $col)) and ($bool_date === false)) { // no letter and no date
										if ($this->lang == "de") {
											$col = str_replace('.','',$col); 
											$col = str_replace(',','.',$col); 
										}
										if ($this->lang == "en") {
											$col = str_replace(',','',$col); 
										}									
									}
									
									// delete "<" number (example: < 0.1 => 0.1 !important for the correct column_structure) 
									$smaller = trim(preg_replace('/</','',$col,1)); // replace only once
									
									
									if (is_numeric($smaller) === true) {
										$col = $smaller;
									}
									
									if (strlen(trim($col)) != 0) {
										$j--;
										for ($c =0; $c < $colspan; $c++) { // make the entry colspan times
											$j++;
											$col_array[$this->column_titles[$j % $this->col_count_unique]] = trim($col);
										}
									}
								}
								$j++;
							}
							if (!empty($col_array)) {
							$row_array[$r] = $col_array;
							$r++;
							}
						}
						$i++;
					}
				}
				$this->row_count = $r+1;
				$this->row_array = $row_array;
		}
		
		function get_structure() { // returns a type-array
				/*
					TYPE-ARRAY
					Array (
						[Column1] => Array ( [0] => 0 [1] => 0 [2] => 0 [3] => 0 [4] => 0 [5] => 0 [6] => 0 [7] => 0 )
						[Column2] => Array ( [0] => 1 [1] => 1 [2] => 1 [3] => 1 [4] => 1 [5] => 1 [6] => 1 [7] => 1 )
					)				
				*/
				$type = array();
				for ($y = 0; $y < $this->row_count-1; $y++) { // -1 because -> first_row
					for ($x = 0; $x < $this->col_count_unique; $x++) { 
						$type[$this->column_titles[$x]][] = $this->get_type($y,$this->column_titles[$x],$x); 
					}
				}
				
				return $type;
		}
		
		function get_type($row,$col,$col_nr) { 
			/* 
				Types
				0: string
				1: number	
				2: percentage
				3: sum of all
				4: year
				5: date
				6: change value (+|-)
				7: rank 
			*/
			
			// date => 5
			if ((($this->lang == "de") and (preg_match('#\d{1,2}\.[ ]?(Januar |Februar |März |April |Mai |Juni |Juli |August |September |Oktober |November |Dezember |((0?[1-9])|10|11|12)\.)[1-2]\d{3}#',$this->row_array[$row][$col]))) or
				(($this->lang == "en") and (preg_match('#\d{1,2}( January | February | March | April | May | June | July | August | September | Oktober | November | December |\.((0?[1-9])|10|11|12)\.)[1-2]\d{3}#',$this->row_array[$row][$col])))) {
				$return =  5;
			}
			
			if (!isset($return)) {
				if (strpos($this->row_array[$row][$col],"%") !== false) {
					$percent = trim(str_replace("%","",$this->row_array[$row][$col]));
					if (is_numeric($percent))
					{
						$this->row_array[$row][$col] = $percent;
						if ((round($percent,2) - round(100,2)) == 0) {
							$return = 3; // sum of all
						}
						else {
							$return = 2; // percentage
						}
					}			
				}
				
				if (!isset($return)) {
					if (is_numeric($this->row_array[$row][$col])) {
						if ((strpos(strtolower($this->column_titles[$col_nr]),"rank") !== false) or (strpos($this->column_titles[$col_nr],"Rang") !== false) or (strpos($this->column_titles[$col_nr],"Nr.") !== false) or (strpos(strtolower($this->column_titles[$col_nr]),"no.") !== false))
						{
							$return = 7; // rank
						}
						else 
						{
						if (($this->row_array[$row][$col] >= 1000) and ($this->row_array[$row][$col] <= date("Y")) and (strlen($this->row_array[$row][$col]) == 4)) 
						{
							$return = 4; // year
						}
						else
						{
							if ($row == $this->row_count-2) { // last row
								$sum = 0;
								for ($i = 0; $i < $row; $i++) {
									$sum = $sum + $this->row_array[$i][$col];
								}
								
								if (($this->row_count-2) >= 3) {
									switch ($sum) {
										case ($sum <= 10):
											$max_dif = 0.1;
											break;
										case ($sum <= 100):
											$max_dif = 1;
											break;
										case ($sum <= 1000):
											$max_dif = 10;
											break;
										case ($sum <= 10000):
											$max_dif = 100;
											break;
										case ($sum <= 100000):
											$max_dif = 1000;
											break;
										default:
											$max_dif = 10000;																		
									}
								} else { $max_dif = 0.1; }
								
							
								if (abs($sum-$this->row_array[$row][$col]) <= $max_dif) { 
										$return = 3; // sum of all
									}
							}
							if (!isset($return)) {
								if (strpos($this->column_titles[$col_nr],"%") !== false)
								{
									if ((strpos($this->column_titles[$col_nr],"Veränderung") !== false) or (strpos(strtolower($this->column_titles[$col_nr]),"change") !== false)) {
										$return = 6; // change (+|-)
									} else {
										$return = 2; // percentage
									}
								} else {
									$return = 1; // number
								}
							}
						}
					 }
					}
					else {
						$return = 0; // string
					}
				}
			}
			return $return;
		}
		
		
		function get_column_structure() { // structure per column
			$return = array();
			
			for ($i = 0; $i < $this->col_count; $i++) {
				$value = array();
				$column_structure = $this->array_structure[$this->column_titles[$i]][0];
				for ($j = 1; $j < $this->row_count-1; $j++) {
					if ((($j == $this->row_count-2) and ($this->array_structure[$this->column_titles[$i]][$j] != 3)) or ($j != $this->row_count-2)) { 
						if ($this->array_structure[$this->column_titles[$i]][$j] != $column_structure) {
							// year can be interpreted as a normal number
							if ((($column_structure == 4) and ($this->array_structure[$this->column_titles[$i]][$j] == 1)) or (($column_structure == 1) and ($this->array_structure[$this->column_titles[$i]][$j] == 4))) {
								if ($column_structure == 4) { $this->array_structure[$this->column_titles[$i]][0] = 1; }
								if ($column_structure == 1) { $this->array_structure[$this->column_titles[$i]][$j] = 1; }
								$column_structure = 1;	
							}
							else {
								$column_structure = "undefined";
								break;
							}
						}
					}
					

					
					if ($column_structure == 0) { // string
						if (!in_array($this->row_array[$j][$this->column_titles[$i]],$value)) {
							$value[$j] = $this->row_array[$j][$this->column_titles[$i]];
						}
						else {
							if ($this->no_null($this->column_titles[$i])) {
								$column_structure = "not_unique_text";
							}
							else {
								$column_structure = "undefined";
							}							
							break;
						}
					}
				}
				$return[$this->column_titles[$i]] = $column_structure;
			}
			return $return;
		}
		
		function no_null($column) {
			$return = true;
			for ($i = 0; $i < $this->row_count-1; $i++) { 
				if ($this->row_array[$i][$column] == "" or !isset($this->row_array[$i][$column])) {
					$return = false;
					break;
				}
			}
			return $return;
		}
		
		
		function readable_html($in) {
			$in = preg_replace('#<[a-zA-Z]{1,5} (.*)style="(.*)display:none(.*)"></[a-zA-Z]{1,5}>#Uis',"",$in);
			$in = preg_replace('#<[a-zA-Z]{1,5}>#Uis',"",$in);
			$in = preg_replace('#</[a-zA-Z]{1,5}>#Uis',"",$in);
			$in = preg_replace('#<[a-zA-Z]{1,5} (.*)>#Uis',"",$in);
			
			
			$in = str_replace('&#160;','',$in);
			$out = str_replace("\n","",$in); 
			return $out;
		}
	}
	
	
	
	
	

?>