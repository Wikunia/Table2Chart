<?php
	require_once("../classes/sqlite.php");

	
	$db = new MyDB();

	$array = array();

	$result = $db->query("select country_code from Countries") or die('Select Query failed 1');
	while (list($iso3) = $result->fetchArray())
	{
		$countries = array();
		$red_result = $db->query("select country from CountryRedirect where country_code = '$iso3'") or die('Select Query failed 2');
		while (list($red_country) = $red_result->fetchArray())
		{
			$countries[] = $red_country;
		}
		$array[] = array('iso3'=>$iso3,'country'=>$countries);
	}
	
	echo json_encode($array);


?>