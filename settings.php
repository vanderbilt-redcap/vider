<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 5/11/16
 * Time: 9:58 PM
 */

$token  = $_POST["token"];
$url = $_POST["url"];

$tokenFile = fopen("token.txt", "w");
$urlFile = fopen("url.txt", "w");

fwrite($tokenFile,$token);
fwrite($urlFile,$url);

fclose($tokenFile);
fclose($urlFile);

