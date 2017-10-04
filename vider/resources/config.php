<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16
 * Time: 2:27 PM
 */
/*
    The important thing to realize is that the config file should be included in every
    page of your project, or at least any page you want access to these settings.
    This allows you to confidently use these settings throughout a project because
    if something changes such as your red cap token, required urls, or a path to a
    specific resource, you'll only need to update it here.
*/

//$resources =  $_SERVER["DOCUMENT_ROOT"] . "/resources/";

//$tokenFile = fopen($resources . "token.txt", "r") or die("Unable to open file!");
//$urlFile = fopen($resources . "url.txt", "r") or die("Unable to open file!");

$token = $_GET['token'];
$url = $_GET['url'];

//$token = fread($tokenFile,filesize($resources . "token.txt"));
//$url = fread($urlFile,filesize($resources . "url.txt"));

//fclose($tokenFile);
//fclose($urlFile);

error_reporting(0); // this is used to disable the NOTICE messages from php
//TODO
//http://stackoverflow.com/questions/8652933/how-to-disable-notice-and-warning-in-php-within-htaccess-file


$config = array(
    "redcap-api-token" => $token,
    "urls" => array(
        "redcap-api-url" => $url
    ),
    "paths" => array(
        "resources" => "/path/to/resources",
        "images" => array(
            "content" => $_SERVER["DOCUMENT_ROOT"] . "/images/content",
            "layout" => $_SERVER["DOCUMENT_ROOT"] . "/images/layout"
        )
    )
);

/*
    Creating constants for heavily used paths makes things a lot easier.
    ex. require_once(LIBRARY_PATH . "Paginator.php")
*/
defined("LIBRARY_PATH")
or define("LIBRARY_PATH", realpath(dirname(__FILE__) . '/library'));
defined("REDCAP_LIBRARY_PATH")
or define("REDCAP_LIBRARY_PATH", realpath(dirname(__FILE__) . '/library/redcap'));
defined("TEMPLATES_PATH")
or define("TEMPLATES_PATH", realpath(dirname(__FILE__) . '/templates'));


/*
    Error reporting.
    Remove this error reporting for debugging application
*/

// Turn off all error reporting
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
//error_reporting(E_ALL);


