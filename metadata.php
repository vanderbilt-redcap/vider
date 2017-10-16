<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16
 * Time: 2:27 PM
 */

require_once(realpath(dirname(__FILE__) . "/plugin-config.php"));

//load the redcap connect file before requesting
//any data from the redcap server, this will
//authenticate credentials of the user
// require_once $config["redcap-connect"];

//send the json output to the vider application
if (isset($_GET['form'])) {
    $forms = REDCap::getInstrumentNames();
    if (isset($forms[$_GET['form']])) {
        echo REDCap::getDataDictionary('json', true, array(REDCap::getRecordIdField()), array($_GET['form']));
    } else {
        echo "[]";
    }
} else {
    echo REDCap::getDataDictionary('json');
}
