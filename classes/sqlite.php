<?php
	// open database
	class MyDB extends SQLite3
	{
		function __construct()
		{
			$this->open('../Countries.db');
		}
	}