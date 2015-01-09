<?php
	require_once("../classes/sqlite.php");

	
	$db = new MyDB("../Countries.db");

	$c = SQLite3::escapeString($_GET['country']);
	
	$result = $db->query("select country_code from CountryRedirect where country = '$c' limit 1") or die('Query failed 1');
	while (list($iso3) = $result->fetchArray())
	{
		if ($iso3) {
			$cc = $iso3;
		}
	}
	
	$result = $db->query("select country_code,coordinates from Countries where country_code = '$cc' limit 1") or die('Query failed 2');
	while (list($cc,$coordinates) = $result->fetchArray())
	{
	 $arr = array ('cc'=>$cc,'coor'=>$coordinates);	
	}
	echo json_encode($arr);


?>