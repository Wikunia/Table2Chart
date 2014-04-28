<?php
	require_once("../classes/sqlite.php");

	
	$db = new MyDB();

	$array = array();
	
	$result = $db->query("select country_code,country from Countries") or die('Query failed 1');
	while (list($iso3,$country) = $result->fetchArray())
	{
		$array[] = array('iso3'=>$iso3,'country'=>$country);
	}
	
	echo json_encode($array);


?>