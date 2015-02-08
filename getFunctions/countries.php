<?php
	require_once("../classes/sqlite.php");

	
	$db = new MyDB("../Countries.db");

	$array = array();

	$result = $db->query("select country_code,country from CountryRedirect") or die('Select Query failed 1');
	while (list($iso3,$country) = $result->fetchArray())
	{
		if (array_key_exists($iso3,$array)) {
			$array[$iso3][] = $country;	
		} else {
			$array[$iso3] = array($country);
		}
	}
	
	echo json_encode($array);
 

?>