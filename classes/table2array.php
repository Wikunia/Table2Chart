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
		public $t2aConsole;
		
		public $lang;
		public $month;
	
		public $table;
		public $table_title;
		public $column_titles;
		public $row_count;
		public $col_count;
		public $col_count_unique;
		public $row_array;
		public $col_array;
		public $type_array;
		public $array_structure;
		public $column_structure;
		
		public $countries;
		
		//constants for value_types
		const TYPE_STRING 		= 0;
		const TYPE_NUMBER 		= 1;
		const TYPE_PERCENTAGE 	= 2;
		const TYPE_SUM_ALL 		= 3;
		const TYPE_YEAR 		= 4;
		const TYPE_DATE 		= 5;
		const TYPE_CHANGE 		= 6;
		const TYPE_RANK 		= 7;
		const TYPE_MONTH 		= 8;
		const TYPE_COUNTRY 		= 9;
		const TYPE_EMPTY 		= 10;
		const DATE_RX_DE 		= '#^\d{1,2}\.[ ]?(Jan(?:uar)?|Feb(?:ruar)?|März?|Apr(?:il)?|Mai|Juni?|Juli?|Aug(?:ust)?|Sep(?:tember)?|Okt(?:ober)?|Nov(?:ember)?|Dez(?:ember)?|((0?[1-9])|10|11|12))( ?\.[1-2]\d{3})?$#';
		const DATE_RX_EN		= '#^\d{1,2}( Jan(?:uary)?| Feb(?:ruary)?| Mar(?:ch)?| Apr(?:il)?| May| June?| July?| Aug(?:ust)?| Sep(?:tember)?| Oct(?:ober)?| Nov(?:ember)?| Dec(?:ember)?|\.((0?[1-9])|10|11|12))( ?\.[1-2]\d{3})?$#';

		
		function __construct() {
			$this->get_countries();
		}
		
		
		/**
			Generates a country array ($this->countries)
		*/
		function get_countries() {
			$this->countries = json_decode(file_get_contents('JSON/countries.json'),true);
		}
		
		/**
		 *  main function creates all arrays ($this->)
		 *  column_titles
		 *	row_count
		 *	col_count
		 *	col_count_unique
		 *	row_array
		 *	col_array
		 *	type_array
		 *	array_structure
		 *	column_structure
		 *  @param string $table html table
		 *  @param string $lang (de|en)
		*/
		function get_array($table,$lang) {
		
			// Get months
			switch($lang) {
				case "en": 
					$this->month = array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",											 							"January","February","March","April","May","June","July","August","September","October","November","December");
					break;
				case "de": 
					$this->month = array("Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez",
										 "Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember");
					break;
			}
		
			
			$this->table = $table;
			$this->lang = $lang;
			
			$this->table_title = $this->getTableTitle();
			
			// Remove all html comments
			$this->removeComments();
			
			// get the column titles
			$this->column_titles = $this->get_column_titles();
			
			$this->get_structured_array();
			
			
			// add empty labels
			$loop_var = $this->row_count;
			for ($r = 0; $r < $loop_var-1; $r++) {		
				for ($c = 0; $c < $this->col_count; $c++) {
					$colTitle = $this->column_titles[$c];
					if (!array_key_exists($colTitle,$this->row_array[$r])) {
						$this->row_array[$r][$colTitle] = "";
					}
				}
			}
					
			$this->array_structure = $this->get_structure();
			
			
			// Check row_array for unit entries like '12 &deg; C' => interpreted this as a number and the column title would have &deg; C afterwards
			$this->unit_checker();
	
			
			$this->column_structure = $this->get_column_structure();
			
			
		}
		
		/**
		 * Remove all comments
		 */
		function removeComments() {
			$this->table = preg_replace('/<!--(.*?)-->/s','',$this->table);	
		}
		
		/**
		 *  Creating the column array 
		 *  @return column_array
		*/
		function get_column_titles() {
			// update $this->table (only text inside <table>)
			$table_start = preg_split("/<table/i", $this->table);
			// $this->t2aConsole[] = array(155,json_encode($table_start));
			$table_start = substr($table_start[1],strpos($table_start[1],">")+1);
			$table = preg_split("/<\/table>/i", $table_start);
			$this->table = $table[0];
			
			// get the first row and the ths
			$tr_start = preg_split("/<tr/i", $this->table);
			$tr_start = substr($tr_start[1],strpos($tr_start[1],">")+1);
			$tr = preg_split("/<\/tr>/i", $tr_start);
			$ths = preg_split("/<th/i",str_ireplace("</th>","",$tr[0]));
			$this->col_count = count($ths)-1;
			
			// no <th> tags
			if ($this->col_count == 0) { 
				$ths = preg_split("/<td/i",str_ireplace("</td>","",$tr[0]));
				$this->col_count = count($ths)-1;
			}
			
			// delete some html in the <th>/<td>-Tag 
			for ($i = 1; $i <= $this->col_count; $i++) {				
				$ths[$i] = $this->delete_until($ths[$i],'>');
				$ths[$i] = $this->readable_html($ths[$i]);
				$result[] = trim($ths[$i]);
			}
			// if table has a two-column based table (year,inhabitans),(year,inhabitans) create unique titles (delete redundant titles)
			$result = $this->get_unique_titles($result); 
			$this->t2aConsole[] = array(197,json_encode($result));
			return $result;
		}
		
		/**
		 *  Creating unique titles 
		 *  Sets $this->col_count_unique
		 *  @return unique columns
		*/ 
		function get_unique_titles($titles) {
			$result = array();
			$k = 0;
			for ($i = 0; $i < $this->col_count; $i++) {
				// get the first element
				$ele = array_shift($titles); 
				// if column title not unique
				if (!in_array($ele,$titles) and $ele != "") { 
					$result[] = $ele;
				} else if ($ele == "") {
					$result[] = "empty".$k;	
					$k++;
				}
			}
			$this->col_count_unique = count($result);
			return $result;
		}
		
		
		/**
		 *  Creating a row based array 
		*/
		function get_structured_array() { 
				$row_array = array();
				$rows = preg_split("/<tr/i",$this->table);
				// number of rows (with not empty columns)			
				$i = 0;
				// ($this->col_count/$this->col_count_unique) = number of "single tables"
				$this->t2aConsole[] = array(212,$this->col_count_unique);
				for ($t = 1; $t <= ($this->col_count/$this->col_count_unique); $t++) { 
					$col_min = ($t-1)*$this->col_count_unique;
					$col_max = $t*$this->col_count_unique;
					
					
					// $row No. 0 is not in the table because of the $rows = preg_split("/<tr/i",$this->table);
					// $row No. 1 is the column row -> start with $r = 2
					for ($r = 2; $r < count($rows); $r++) {
						$row = $rows[$r];
						
						$col_array = array();
						$row = substr($row,strpos($row,">")+1);

						$cols = preg_split("/<td/i",$row);
						$cols = array_slice($cols,1); // remove the first (before <td)
						// check if this $col is in the current "single table"
						for ($c = $col_min; $c < $col_max; $c++) {
							$col = $cols[$c];
							
							
							// some columns have a colspan so the entries have to be colspan times in the array
							$colspan = 1;
							preg_match('#colspan="(.*)"#',substr($col,0,strpos($col,">")),$match_colspan);
							if ($match_colspan) {
								$colspan = $match_colspan[1];
							}

							// delete some html in the columns here
							$col = substr($col,strpos($col,">")+1);

							$col = $this->readable_html($col);

							
							// in some entries there is sth. like '< 0.1' so a number 
							$col = str_replace('&lt;','<',$col);

							$bool_date = false;
							if (($this->lang == "de") and (preg_match(self::DATE_RX_DE,$col))) {
								$bool_date = true;
							}
							if (($this->lang == "en") and (preg_match(self::DATE_RX_EN,$col))) {
								$bool_date = true;
							}
							
							$col = trim($col);
							
							// no date
							if ($bool_date === false) { 
								$colNumber = false;
								// remove the thousand separators
								if ($this->lang == "de") {
									$colNumber = str_replace('.','',$col); 
									$colNumber = str_replace(',','.',$colNumber); 
								}
								if ($this->lang == "en") {
									$colNumber = str_replace(',','',$col); 
								}	
								
								if ($colNumber and is_numeric($colNumber)) {
									$col = $colNumber;	
								}
							}
							
								
							// delete "<" number (example: < 0.1 => 0.1 !important for the correct column_structure) 
							$smaller = trim(preg_replace('/</','',$col,1)); // replace only once


							if (is_numeric($smaller) === true) {
								$col = $smaller;
							}

							$col = trim($col);
							if (strlen($col) != 0) {
								for ($cs =$c; $cs < $c+$colspan; $cs++) { // make the entry colspan times
									$col_array[$this->column_titles[$cs % $this->col_count_unique]] = $col;
								}
							}
						}
						$this->t2aConsole[] = array(308,json_encode($col_array));
						if (!empty($col_array)) {
							$row_array[$i] = $col_array;
							$i++;
						}
					}
				}
				$this->row_count = $i+1;
				$this->row_array = $row_array;
				
				// more columns than rows => transpose table
				/*if ($this->col_count_unique > $this->row_count+1) {
					$this->transpose_table();
				}*/
		}
		
		/**
		 	Get the type structure
			TYPE-ARRAY
			Array (
				[Column1] => Array ( [0] => 0 [1] => 0 [2] => 0 [3] => 0 [4] => 0 [5] => 0 [6] => 0 [7] => 0 )
				[Column2] => Array ( [0] => 1 [1] => 1 [2] => 1 [3] => 1 [4] => 1 [5] => 1 [6] => 1 [7] => 1 )
			)	
			@return type array
		*/
		function get_structure() { 
			
			$type = array();
			for ($y = 0; $y < $this->row_count-1; $y++) { // -1 because -> first_row
				for ($x = 0; $x < $this->col_count_unique; $x++) { 
					$type[$this->column_titles[$x]][] = $this->get_type($y,$x,$this->column_titles[$x]); 
				}
			}

			return $type;
		}
		
		/**
			Types
			0: string
			1: number	
			2: percentage
			3: sum of all
			4: year
			5: date
			6: change value (+|-)
			7: rank
			8: month
			9: country
			10: empty (can be string or number (0) or percentage (0))
			@param integer $rowNr row number
			@param integer $colNr column number
			@param string $col column title
			@return type
		*/
		function get_type($rowNr,$colNr,$col) { 		
			if (mb_strlen(trim($this->row_array[$rowNr][$col])) == 0) {
				return self::TYPE_EMPTY;	
			}			
			if (strpos($this->row_array[$rowNr][$col],"%") !== false) {
				$percent = trim(str_replace("%","",$this->row_array[$rowNr][$col]));
				if (is_numeric($percent)) {
					$this->row_array[$rowNr][$col] = $percent;
					// Check if the last entry in a percentage column is 100 (sum of all)
					if ((round($percent,2) - round(100,2)) == 0) {
						return self::TYPE_SUM_ALL; 
					}
					else {
						return self::TYPE_PERCENTAGE; 
					}
				}			
			}
				
				
			if (is_numeric($this->row_array[$rowNr][$col])) {
				if ($this->entryInStr(strtolower($this->column_titles[$colNr]),array("rank","rang","nr.","no.")) == true) {
					return self::TYPE_RANK; 
				}
				else {
					// a year can be between 1000 and 2114 (current year + 100)
					if (($this->row_array[$rowNr][$col] >= 1000)
						and ($this->row_array[$rowNr][$col] <= date("Y")+100)
						and (strlen($this->row_array[$rowNr][$col]) == 4))	{
						return self::TYPE_YEAR; 
					}
					else {
					// last row
					if ($rowNr == $this->row_count-2) {
						// Compute the sum of all entries to the last in a column
						$sum = 0;
						for ($i = 0; $i < $rowNr; $i++) {
							$sum = $sum + $this->row_array[$i][$col];
						}

						// the maximum difference between the sum and the last entry is dependent on the amount of the sum
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


						if (abs($sum-$this->row_array[$rowNr][$col]) <= $max_dif) { 
							return self::TYPE_SUM_ALL;
						}
					}
					if (strpos($this->column_titles[$colNr],"%") !== false)
					{
						// Veränderung or change
						if ($this->entryInStr($this->column_titles[$colNr],array("Veränderung","change")) == true) {
							return self::TYPE_CHANGE; // change (+|-)
						} else {
							return self::TYPE_PERCENTAGE;
						}
					} else {
						return self::TYPE_NUMBER; 
					}
					
				}
			 }
			}
			else { // not numeric
				// Date format (de: 12.07.1932,12.7.1932,12. Juli 1932 or 12. Juli) || (en: 12.07.1932,12.7.1932,12 July 1932 or 12 July)
				if ((($this->lang == "de") and (preg_match(self::DATE_RX_DE,$this->row_array[$rowNr][$col]))) or
					(($this->lang == "en") and (preg_match(self::DATE_RX_EN,$this->row_array[$rowNr][$col])))) {
					return self::TYPE_DATE;
				}
				
				// is month
				if (in_array($this->row_array[$rowNr][$col],$this->month)) { 
					return self::TYPE_MONTH;
				} elseif (in_array($this->row_array[$rowNr][$col],$this->countries)) { // no month
					return self::TYPE_COUNTRY;
				} else { // no month and no country
					return self::TYPE_STRING;
				}					
			}
	
		}
		
		/**
		 * Get the structure of a column
		 * if the entries have a different type
		 * => year can be a normal number
		 * => month, country can be string
		 * @return column structure (array) 
		 */
		function get_column_structure() { 
			$return = array();
			
			for ($i = 0; $i < $this->col_count; $i++) {
				$value = array();
				//column structure = structure of first entry
				$column_structure = $this->array_structure[$this->column_titles[$i]][0];
				$value[0] = $this->row_array[0][$this->column_titles[$i]];
				for ($j = 1; $j < $this->row_count-1; $j++) {
					// current cell type
					$cCellType = $this->array_structure[$this->column_titles[$i]][$j];
					
					// if (last entry and not sum of all) or not last entry
					if ((($j == $this->row_count-2) and 
						 ($cCellType != self::TYPE_SUM_ALL))
						or ($j != $this->row_count-2)) { 
						// if type of entry != type of column
						if ($cCellType != $column_structure) {
							$isPossible = false;
							
							// empty type can be interpreted as number or string or percentage
							$maybeEmptyTypes = array(self::TYPE_NUMBER,self::TYPE_STRING,self::TYPE_PERCENTAGE);
							if ((array_search($column_structure,$maybeEmptyTypes) !== false)
								 and  ($cCellType == self::TYPE_EMPTY)) {
								continue;
							} else if (($column_structure == self::TYPE_EMPTY) and 
								(($typeIndex = array_search($cCellType,$maybeEmptyTypes)) !== false)) {
								$column_structure = $maybeEmptyTypes[$typeIndex];
								switch ($typeIndex) {
									case self::TYPE_NUMBER: 
										$this->row_array[$j][$i] = 0;
										break;
									case self::TYPE_PERCENTAGE: 
										$this->row_array[$j][$i] = 0;
										break;
									case self::TYPE_STRING: 
										$this->row_array[$j][$i] = "";
										break;
								}
								continue;
							}
							
							
							// year can be interpreted as a normal number
							if ((($column_structure == self::TYPE_YEAR) and 
								 ($cCellType == self::TYPE_NUMBER))
							 or (($column_structure == self::TYPE_NUMBER) and 
								 ($cCellType == self::TYPE_YEAR))) {
								$column_structure = self::TYPE_NUMBER;	
								continue;
							}
							
							// month and country can be interpreted as a normal string
							if (in_array($column_structure,array(self::TYPE_MONTH,self::TYPE_STRING,self::TYPE_COUNTRY)) and
								in_array($cCellType,
										 array(self::TYPE_MONTH,self::TYPE_STRING,self::TYPE_COUNTRY))) {
								$column_structure = self::TYPE_STRING;	
								continue;
							} 
							$column_structure = "undefined";
						}
					}
					

					
					if ($column_structure == self::TYPE_STRING) { 
						// Check if there are two entries with same data
						if (!in_array($this->row_array[$j][$this->column_titles[$i]],$value)) {
							$value[$j] = $this->row_array[$j][$this->column_titles[$i]];
						}
						else {
							// Check if a entry for each row exists
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
		
		/**
		 * Check if each entries isn't empty or null
		 * @return false if at least one entry is null or empty 
		 */
		function no_null($column) {
			for ($i = 0; $i < $this->row_count-1; $i++) { 
				if ($this->row_array[$i][$column] == "" or !isset($this->row_array[$i][$column])) {
					return false;
				}
			}
			return true;
		}
		
		
		function readable_html($in) {
			$in = preg_replace('#<[a-zA-Z]{1,5} (.*?)style="(.*?)display:none(.*?)"></[a-zA-Z]{1,5}>#is',"",$in);
			$in = preg_replace('#<[a-zA-Z]{1,5}>#is',"",$in);
			$in = preg_replace('#</[a-zA-Z]{1,5}>#is',"",$in);
			$in = preg_replace('#<[a-zA-Z]{1,5} (.*?)>#is',"",$in);
			
			
			$in = str_replace('&#160;','',$in);
			$out = str_replace("\n","",$in); 
			return $out;
		}
		
		function delete_until($in,$until) {
			$in = preg_replace("/^(.*?)$until/i",'',$in);
			return $in;
		}
		
		function transpose_table() {
			$new_array = array();
			// new Columns (old rows)
			for ($r = 0; $r < $this->row_count-1; $r++) {
				for ($c = 1; $c < $this->col_count; $c++) {
					$new_array[$c-1][empty0] = $this->column_titles[$c];
					$new_array[$c-1][$this->row_array[$r][empty0]] = $this->row_array[$r][$this->column_titles[$c]];
				}
			}
			$this->col_array = $new_array;
			$col_count = $this->row_count;
			$this->row_count = $this->col_count;
			$this->col_count = $col_count;
			
		
			
			$this->column_titles = array();
			foreach($this->col_array[0] as $col => $row) {
				$this->column_titles[] = $col;
			}
			$this->column_titles = $this->get_unique_titles($this->column_titles);
			$this->row_array = $this->col_array;
		}
		
		/**
			All string column with the same unit can be numeric
			Change the column title to 'title (unit)'
		*/
		function unit_checker() {
			// only string columns are interesting
			foreach ($this->array_structure as $col => $one_col_struct) {
				$full_break = false;
				foreach($one_col_struct as $cell_struct) {
					// break if one cell_struct isn't a string
					if ($cell_struct != self::TYPE_STRING) {
						$full_break = true;
						break;
					}
				}
				
				// every cell in this col is a string
				if ($full_break === false) {
					$unit_break = false;
					
					$numeric_parts = array();
					foreach($this->row_array as $row => $one_row_array) {
						$parts = explode(" ",$one_row_array[$col],2);
						if (count($parts) == 2) { // like 420 mm, 120 kHZ
							$numeric_part = $parts[0];
							$unit_part = trim($parts[1]);
							if (is_numeric($numeric_part))   {
								$numeric_parts[] = $numeric_part;
								// check if every unit is the same
								if ($unit_part != $unit) {
									if (!$unit) {
										$unit = $unit_part;
									} else {
										$unit_break = true;
										break;
									}
								}
							}
						} else {
							$unit_break = true; // there are no units
						}
					}
					if ($unit_break === false) {
						// every cell in this column has the same unit and is numeric
						// => new cell type (number instead of string)
						foreach ($this->array_structure[$col] as $key_cell => $val_cell) {
							$this->array_structure[$col][$key_cell] = self::TYPE_NUMBER;
						}
						// => new cell value (without unit) 
						for($cn = 0; $cn < $this->row_count-1; $cn++) {
							$this->row_array[$cn][$col] = $numeric_parts[$cn];
						}
						// => new column title 
						// in $this->column_titles
						$key = array_search($col,$this->column_titles);
						$this->column_titles[$key] = $this->column_titles[$key].' ('.$unit.')';
						// in $this->row_array
						for($cn = 0; $cn < $this->row_count-1; $cn++) {
							$this->row_array[$cn][$col.' ('.$unit.')'] = $this->row_array[$cn][$col];
							unset($this->row_array[$cn][$col]);
						}
						// in $this->array_structure
						$this->array_structure[$col.' ('.$unit.')'] = array();
						foreach ($this->array_structure[$col] as $key_cell => $val_cell) {
							$this->array_structure[$col.' ('.$unit.')'][$key_cell] = $this->array_structure[$col][$key_cell];
						}
						unset($this->array_structure[$col]);
							
							
					}
				}
			}
		}
		
		/**
		 * Found one entry of an array inside an string
		 * @param string $haystack search inside this string
		 * @param array $needles search each entry inside this array
		 * @return true if an entry was found
		*/
		function entryInStr($haystack,$needles) {
			foreach ($needles as $needle) {
				$this->t2aConsole[] = array(647,"strpos(".$haystack.",".$needle.")".strpos($haystack,$needle));
				if (strpos($haystack,$needle) !== false) {
					return true;	
				}
			}
			return false;
		}
		
		
		/**
		 * Get title of the table
		 * <h..></h1>|<b> before the table starts
		 * @return title of table
		 */
		function getTableTitle() {
			$tableHeader = preg_split("/<table/i",$this->table);
			$tableHeader = $tableHeader[0];
			$tableHeader = preg_replace('/<(\/)?(h[1-6]|b)>/','<${1}h>',$tableHeader);
			$posHeader = strrpos($tableHeader,"<h>");
			$posEndHeader = strpos($tableHeader,"</h>",$posHeader);
			return substr($tableHeader,$posHeader+3,$posEndHeader-$posHeader-3);
			
		}
	}