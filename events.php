<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 3/21/16
 * Time: 6:20 PM
 */
require_once(realpath(dirname(__FILE__) . "/../../plugin-config.php"));

//load the redcap connect file before requesting
//any data from the redcap server, this will
//authenticate credentials of the user
//echo $config["redcap-connect"];
//require_once "http://ec2-52-73-119-42.compute-1.amazonaws.com/redcap/redcap_connect.php";
require_once $config["redcap-connect"];

//todo: no support for events is provided in this
//version need so currently sending error that no
//data is there
echo "{\"error\":\"You cannot export events for classic projects\"}";
//echo REDCap::getEventNames('json');
