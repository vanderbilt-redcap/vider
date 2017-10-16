<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16
 * Time: 2:27 PM
 */

function getUrl($url) {
	global $module;
	return $module->getUrl($url);
}

//give the path of the redcap_connect.php with
//reference to the following folder :
//vider/bower_components/resources/library/redcap/
$config = array(
    "redcap-connect" => "../../redcap_connect.php"
);

/*
    Error reporting.
    Remove this error reporting for debugging application
*/

// Turn off all error reporting
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
//error_reporting(E_ALL);


