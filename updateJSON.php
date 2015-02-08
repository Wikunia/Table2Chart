<?php
	require_once("classes/sqlite.php");

	
	$db = new MyDB("Countries.db");

	$countries = array();

	$result = $db->query("select country from CountryRedirect") or die('Select Query failed 1');
	while (list($red_country) = $result->fetchArray())
	{
		$countries[] = $red_country;
	}
	
	file_put_contents("JSON/countries.json",json_encode($countries));


?>