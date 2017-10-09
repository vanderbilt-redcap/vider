<?php
/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16
 * Time: 3:04 PM
 */
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">

<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>REDCap Data Visualizer</title>
</head>

<link rel="stylesheet" type="text/css" href="<?= getUrl('css/numHistogram.css'); ?>"/>
<link rel="stylesheet" type="text/css" href="<?= getUrl('css/jquery-ui.css'); ?>"/>
<link rel="stylesheet" href="<?= getUrl("bower_components/bootstrap/dist/css/bootstrap.min.css"); ?>"/>
<link href="<?= getUrl("css/ie10-viewport-bug-workaround.css"); ?>" rel="stylesheet"/>
<link href="<?= getUrl("css/dashboard.css"); ?>" rel="stylesheet"/>
<link href="<?= getUrl("css/main.css"); ?>" rel="stylesheet"/>
<?php require_once("../css/main.php"); ?>
<link href="<?= getUrl("css/d3Parsets.css"); ?>" rel="stylesheet"/>

<link rel="stylesheet" href="//rawgithub.com/Caged/d3-tip/master/examples/example-styles.css"/>

<script data-main="<?= getUrl("js/main.js"); ?>" src="<?= getUrl("bower_components/requirejs/require.js") ?>"></script>

<!-- jQuery library -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
<script src="<?= getUrl("js/bootstrap.min.js"); ?>"></script>
<script src="<?= getUrl("js/paging.js"); ?>"></script>
<script src="<?= getUrl("js/htmltocsv.js"); ?>"></script>

<body>

<nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">REDCap-SurveyVIS</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav navbar-right">
                <li><a href="#">Home</a></li>
                <li><a href="#">Settings</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Help</a></li>
            </ul>
            <form class="navbar-form navbar-right">
                <input type="text" class="form-control" placeholder="Search...">
            </form>
        </div>
    </div>
</nav>
