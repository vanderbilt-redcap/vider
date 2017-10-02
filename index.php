<?php

require_once("../../redcap_connect.php");

$pid = $_GET['pid'];

$instruments = \REDCap::getInstrumentNames();

$isLong = \REDCap::isLongitudinal();
if ($isLong) {
    $events = \REDCap::getEventNames(false);
    $unique_event_ids = \REDCap::getEventNames(true);
}

echo "<h1>ViDER</h1>";
echo "<h2>".\REDCap::getProjectTitle()."</h2>";
echo "<h3>Instruments</h3>";
if ($isLong) {
    echo "<h3>Events</h3>";
}
