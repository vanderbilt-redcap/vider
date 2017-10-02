<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16
 * Time: 2:27 PM
 */


require_once(realpath(dirname(__FILE__) . "/../../plugin-config.php"));

//load the redcap connect file before requesting
//any data from the redcap server, this will
//authenticate credentials of the user
require_once $config["redcap-connect"];

//this will format the instrument to the
//json format required by the vider app
function array_kshift(&$arr)
{
    list($k) = array_keys($arr);
    $r  = array($k=>$arr[$k]);
    unset($arr[$k]);
    return $r;
}


// Print out the names of all instruments in the project
$instrument_names = REDCap::getInstrumentNames();
if (isset($_GET['form'])) {
    if (isset($instrument_names[$_GET['form']])) {
        $instrument_names = array($_GET['form'] => $instrument_names[$_GET['form']]); 
    }
} else if (isset($_GET['event_id'])) {
    $numEventId = 0;
    if (is_numeric($_GET['event_id'])) {
        // protect if outside project
        if (REDCap::getEventNames(true, false, $_GET['event_id'])) {
            $numEventId = $_GET['event_id'];
        }
    } else {
        $numEventId = REDCap::getEventIdFromUniqueEvent($_GET['event_id']);
    }
    if (!$numEventId) {
        $numEventId = 0;
    }

    $instrument_names = array();
    if ($numEventId > 0) {
        $instruments = array();
        $sql = "SELECT form_name WHERE event_id = $numEventId;";
        $q = db_query($sql);
        while ($row = db_fetch_assoc($q)) {
            $instruments[] = $row['form_name'];
        }
        $instrument_names = REDCap::getInstrumentNames($instruments);
    }
}

//get the first element to adjust comma in json
//data accordingly
$firstElement = array_kshift($instrument_names);

//laying out the json data
echo "[";
echo "{\"instrument_name\":\"";
echo key($firstElement);
echo "\", \"instrument_label\":\"";
echo array_shift($firstElement);
echo "\"}";

foreach ($instrument_names as $unique_name=>$label)
{
    // Print this instrument name and label
    echo ",";
    echo "{\"instrument_name\":\"$unique_name\", \"instrument_label\":\"$label\"}";
}
echo "]";
