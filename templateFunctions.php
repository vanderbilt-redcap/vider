<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16
 * Time: 2:27 PM
 */
require_once(realpath(dirname(__FILE__) . "/config.php"));

function renderLayoutWithContentFile($contentFile, $variables = array())
{
    $contentFileFullPath = TEMPLATES_PATH . "/" . $contentFile;

    // making sure passed in variables are in scope of the templates
    // each key in the $variables array will become a variable
    if (count($variables) > 0) {
        foreach ($variables as $key => $value) {
            if (strlen($key) > 0) {
                ${$key} = $value;
            }
        }
    }

    echo "<div id=\"container\" style=\"border:1px solid black; margin: 10px ; float: left;\" >\n"
        . "\t<div id=\"content\">\n";

    if (file_exists($contentFileFullPath)) {
        require_once($contentFileFullPath);
    } else {
        /*
            If the file isn't found the error can be handled in lots of ways.
            In this case we will just include an error templates.
        */
        require_once(TEMPLATES_PATH . "/error.php");
    }

    // close content div
    echo "\t</div>\n";

    // close container div
    echo "</div>\n";
}
