<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16„
 * Time: 2:27 PM
 */

require_once(realpath(dirname(__FILE__) . "/../../plugin-config.php"));

//load the redcap connect file before requesting
//any data from the redcap server, this will
//authenticate credentials of the user
require_once $config["redcap-connect"];

//send the json data to the vider applicationw
if (isset($_GET['form'])) {
    $fields = array_merge(REDCap::getFieldNames($_GET['form']), array(REDCap::getRecordIdField()));
    if (isset($_GET['event_id'])) {
        echo REDCap::getData('json', NULL, $fields, array($_GET['event_id']));
    } else {
        echo REDCap::getData('json', NULL, $fields);
    }
} else {
    echo REDCap::getData('json');
}
