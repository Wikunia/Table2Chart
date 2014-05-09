<?php
	require_once("classes/sqlite.php");

	
	$db = new MyDB("Countries.db");

	$countries = array();

	$result = $db->query("select country_code from Countries") or die('Select Query failed 1');
	while (list($iso3) = $result->fetchArray())
	{
		
		$red_result = $db->query("select country from CountryRedirect where country_code = '$iso3'") or die('Select Query failed 2');
		while (list($red_country) = $red_result->fetchArray())
		{
			$countries[] = $red_country;
		}
		
	}
	
	file_put_contents("JSON/countries.json",json_encode($countries));


?>