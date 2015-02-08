<?php
	require_once("../classes/sqlite.php");

	
	$db = new MyDB("../Countries.db");

	$c = SQLite3::escapeString($_GET['country']);
	
	$result = $db->query("select Countries.country_code,Countries.coordinates from Countries
							join CountryRedirect on (CountryRedirect.country_code = Countries.country_code)
							where country = '$c' limit 1") or die('Query failed 1');
	while (list($cc,$coordinates) = $result->fetchArray())
	{
	 $arr = array ('cc'=>$cc,'coor'=>$coordinates);	
	}
	echo json_encode($arr);
 

?>