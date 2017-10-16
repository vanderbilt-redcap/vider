<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16
 * Time: 2:27 PM
 */
/*

/*
    Creating constants for heavily used paths makes things a lot easier.
    ex. require_once(LIBRARY_PATH . "Paginator.php")
*/
defined("LIBRARY_PATH")
or define("LIBRARY_PATH", realpath(dirname(__FILE__)));
defined("REDCAP_LIBRARY_PATH")
or define("REDCAP_LIBRARY_PATH", realpath(dirname(__FILE__)));
defined("TEMPLATES_PATH")
or define("TEMPLATES_PATH", realpath(dirname(__FILE__) . '/templates'));


function getUrl($url) {
    global $module;
    return $module->getUrl($url);
}

/*
    Error reporting.
    Remove this error reporting for debugging application
*/

// Turn off all error reporting
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
//error_reporting(E_ALL);


