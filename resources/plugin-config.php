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

//give the path of the redcap_connect.php with
//reference to the following folder :
//vider/bower_components/resources/library/redcap/
$config = array(
    "redcap-connect" => "../../../../../redcap_connect.php"
);

/*
    Error reporting.
    Remove this error reporting for debugging application
*/

// Turn off all error reporting
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
//error_reporting(E_ALL);


