<?php
	require_once("../classes/sqlite.php");

	
	$db = new MyDB("../Countries.db");

	$c = SQLite3::escapeString($_GET['country']);

	$result = $db->query("select latitude,longitude from Countries
							join CountryRedirect on (CountryRedirect.country_code = Countries.country_code)
							where country = '$c' limit 1") or die('Query failed 1');
	while (list($lat,$lon) = $result->fetchArray())
	{
	 $arr = array ('lat'=>$lat,'lon'=>$lon);	
	}
	echo json_encode($arr);

 
?>