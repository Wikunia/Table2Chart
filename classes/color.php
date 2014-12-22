<?php
/**
* This class generates any number of differentiable colors, e.g. for charts
* 
* You need to include this file in your PHP-file to use this class
* 		include "color.php";
* 
* To generate colors, the command is
* 		Color::get_n_colors(N)
* N is an integer, which indicates, how many colors you want to be generated
* This function returns an array of HEX-code-strings, e.g. ["#ffbb00", "#ff0000", "#aabbcc"]
* 
* author: Konstantin Kobs
* date: 12th July 2013
* license: MIT license
*/



class Color
{
	// Generates n differentiable colors and returns them as an array of HEX-code-strings
	public static function get_n_colors($n){
		$step = floor(360 / $n);
		
		$farben = array();
		
		for ($i = 0; $i < $n; $i++) {
			$hue = $step * $i;
			$rgb = self::hsv_to_rgb($hue, 1, 1);
			$hex = self::rgb_to_hex($rgb[0], $rgb[1], $rgb[2]);
			$farben[] = $hex;
		}
		
		return $farben;
	}
	
	
	
	/** 
	* Converts a color in HSV color space into an RGB-representation
	*
	* The instrucions on this site were used to implement the algorithm:
	* 		https://de.wikipedia.org/wiki/HSV-Farbraum#Umrechnung_HSV_in_RGB
	*
	* @param float $hue in [0,360)
	* @param float $saturation in [0,1]
	* @param float $value in [0,1]
	* @return rgb array
	*/ 
	private static function hsv_to_rgb($hue, $saturation, $value){
		$h = floor($hue/60);
		$f = $hue/60 - $h;
		
		$p = $value * (1 - $saturation);
		$q = $value * (1 - $saturation * $f);
		$t = $value * (1 - $saturation * (1 - $f));
		
		switch ($h) {
			case 0:
			case 6: $rgb = array($value, $t, $p);
					break;
			case 1: $rgb = array($q, $value, $p);
					break;
			case 2: $rgb = array($p, $value, $t);
					break;
			case 3: $rgb = array($p, $q, $value);
					break;
			case 4: $rgb = array($t, $p, $value);
					break;
			case 5: $rgb = array($value, $p, $q);
					break;
			default: $rgb = array(0, 0, 0);
		}
		
		foreach ($rgb as $key => $wert) {
			$rgb[$key] = floor($wert * 255);
		}
		
		return $rgb;
		
	}
	
	
	// Converts a color in RGB color space into a HEX-code-string (including #)
	//
	// Requirements:
	// 		$r, $g and $b in [0,255]
	// 
	
	private static function rgb_to_hex($r, $g, $b){
		$rBase16 = base_convert((string) $r, 10, 16);
		$rHex = strlen($rBase16) === 1 ? "0" . $rBase16 : $rBase16;
		
		$gBase16 = base_convert((string) $g, 10, 16);
		$gHex = strlen($gBase16) === 1 ? "0" . $gBase16 : $gBase16;
		
		$bBase16 = base_convert((string) $b, 10, 16);
		$bHex = strlen($bBase16) === 1 ? "0" . $bBase16 : $bBase16;
		
		$hex = "#" . $rHex . $gHex . $bHex;
		
		return $hex;
	}

}


?>