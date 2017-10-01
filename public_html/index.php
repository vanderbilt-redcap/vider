<?php

/**
 * Created by PhpStorm.
 * User: sunny
 * Date: 1/26/16
 * Time: 2:45 PM
 */
require_once(realpath(dirname(__FILE__) . "/../resources/config.php"));

require_once(LIBRARY_PATH . "/templateFunctions.php");

//require_once(TEMPLATES_PATH . "/header.php");

/*
    Now you can handle all your php logic outside of the template
    file which makes for very clean code!
*/

//load all the data from teh redcap and attach to variables
/*$instruments = require_once(REDCAP_LIBRARY_PATH.'/instruments.php');
$metadata = require_once(REDCAP_LIBRARY_PATH.'/metadata.php');
$records = require_once(REDCAP_LIBRARY_PATH.'/records.php');*/

// Must pass in variables (as an array) to use in template
$variables = array(
    /*'instruments' => $instruments,
     'metadata' => $metadata,
     'records' => $records*/
);

//this will load all the files requried by the
//renderLayoutWithContentFile("variableNavigator.php", $variables);
//renderLayoutWithContentFile("mainPanel.php", $variables);
//renderLayoutWithContentFile("comparisonPanel.php", $variables);
//renderLayoutWithContentFile("dataPanel.php", $variables);

//require_once(TEMPLATES_PATH . "/footer.php");

header('X-Frame-Options: GOFORIT');
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
    "http://www.w3.org/TR/html4/strict.dtd">

<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>ViDER - Visual Data Explorer For REDCap</title>
</head>

<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="https://rawgit.com/jasondavies/d3-cloud/master/build/d3.layout.cloud.js"></script>

<link rel="stylesheet" type="text/css" href="../bower_components/please-wait/build/please-wait.css">
<link rel="stylesheet" type="text/css" href="../public_html/css/numHistogram.css">
<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/themes/smoothness/jquery-ui.css">
<link rel="stylesheet" type="text/css" href="../bower_components/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="../public_html/css/ie10-viewport-bug-workaround.css">
<link rel="stylesheet" type="text/css" href="../public_html/css/dashboard.css">
<link rel="stylesheet" type="text/css" href="../public_html/css/main.css">
<link rel="stylesheet" type="text/css" href="//rawgithub.com/Caged/d3-tip/master/examples/example-styles.css">
<link rel="stylesheet" type="text/css" href="../public_html/css/d3Parsets.css">
<link rel="stylesheet" type="text/css" href="../bower_components/components-font-awesome/css/font-awesome.css">

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
            <a class="navbar-brand">ViDER - Visual Data Explorer for REDCap</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav navbar-right">
                <li><a data-toggle="modal" data-target="#scatterPlotModal">Scatter Plot</a></li>
                <li><a id="parallel-sets">Parallel Sets</a></li>
                <li><a id="data-panel">Data Panel</a></li>
                <li><a data-toggle="modal" data-target="#settingsModal">Settings</a></li>
                <li><a href="public_html/aboutus.html" target="_blank">About Us</a></li>
            </ul>
<!--            <form class="navbar-form navbar-right">-->
<!--                <input type="text" class="form-control" placeholder="Search...">-->
<!--            </form>-->
        </div>
    </div>
</nav>



<div id="leftPanel" style="overflow: scroll;" class="split split-horizontal">
    <div id="left-top" style="overflow: scroll; height: 60%;" class="split split-vertical">
        <div class="col-sm-12 col-md-12">
            <svg id="varPanel"></svg>
        </div>
    </div>

    <div id="left-bottom" style="overflow: scroll; height: 40%" class="split split-vertical">
        <div class="col-sm-12 col-md-12">
            <svg class="dataDistPanel" width="100%"></svg>
        </div>
        <div class="col-sm-12 col-md-12">
            <div class="stratAndColFilter"></div>
        </div>
        <div class="col-sm-12 col-md-12">
            <div class="filterPanel">
<!--                <div class="col-sm-12 col-md-12 stratByPanel" style="overflow: auto; height: 30px;">-->
<!--                    <span style="font-weight: bold;">Stratify By:</span><span> Selected Vairable</span>-->
<!--                </div>-->
<!--                <div class="col-sm-12 col-md-12 colorByPanel" style="overflow: auto;">-->
<!--                    <br>-->
<!--                    <span style="font-weight: bold">Color By:</span><span> Selected Vairable</span>-->
<!--                    <div style="overflow: scroll;height: 50px;">-->
<!--                    <span style="width=10;height: 10; background-color: green;">&nbsp;&nbsp;&nbsp;&nbsp;</span>Mexican American-->
<!--                    <span style="width=10;height: 10; background-color: blue;">&nbsp;&nbsp;&nbsp;&nbsp;</span>Other Hispanic-->
<!--                    <span style="width=10;height: 10; background-color: red;">&nbsp;&nbsp;&nbsp;&nbsp;</span>Non Hispanic White-->
<!--                    <span style="width=10;height: 10; background-color: orange;">&nbsp;&nbsp;&nbsp;&nbsp;</span>Non Hispanic Black-->
<!--                    <span style="width=10;height: 10; background-color: grey;">&nbsp;&nbsp;&nbsp;&nbsp;</span>Other Race-->
<!--                    </div>-->
<!--                </div>-->
                <table class="table table-hover table-condensed">
                    <thead>
<!--                        <tr>-->
<!--                            <th colspan="4" style="background-color: #ffffff; font-size: x-large; text-align: center;">Filtering Details</th>-->
<!--                        </tr>-->
<!--                        <tr style="background-color: #ffffff">-->
<!--                            <th width="15%" style="background-color: #ffffff; font-size: large; text-align: center;"></th>-->
<!--                            <th width="40%" style="background-color: #ffffff; font-size: large; text-align: center;"></th>-->
<!--                            <th width="40%" style="background-color: #ffffff; font-size: large; text-align: center;"></th>-->
<!--                            <th width="10%" style="background-color: #ffffff; font-size: large; text-align: center;"></th>-->
<!--                        </tr>-->
                    </thead>
                    <tbody id="filterTable"></tbody>
                </table>
            </div>
        </div>
    </div>

</div>

<div id="mainPanel" style="overflow: hidden; " class="split split-horizontal">
    <div id="main-top" class="split split-vertical">
        <div id="main-top-left" style="overflow: scroll;" class="split split-horizontal">
<!--            <div class="col-sm-12 col-md-12">-->
<!--                <button type="button" class="btn btn-primary btn-sm" id = "createScatter">Add a ScatterPlot</button>-->
<!--            </div>-->
            <div class="col-sm-12 col-md-12 table-responsive"></div>
            <div class="col-sm-12 col-md-12">
                <div class="graph-outer" id="scatterPlot"></div>
            </div>
        </div>
        <div id="main-top-right" style="overflow: scroll;" class="split split-horizontal">
            <div id="comparisionPanel" style="text-align: center; vertical-align: middle;">
            </div>
            <!-- Modal -->
            <div class="modal fade" id="selectField" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title" id="myModalLabel">Pick a field</h4>
                        </div>
                        <div class="modal-body">
                            <svg id="fieldsContainer"></svg>
                        </div>
                        <div class="modal-footer" style="padding-bottom: 5px; padding-top: 5px">
                            <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Close</button>
                            <!--<button type="button" class="btn btn-primary">Save changes</button>-->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="main-bottom" class="split split-vertical" style="position: relative; overflow: hidden; ">
            <!--<div id="rightPanel" class="split split-horizontal">-->

<!--            <div class="col-sm-12 col-md-12">-->
<!--                <div class="row" style="text-align: right; height: 20%">-->
<!--                    <a type="button" class="btn btn-sm btn-success" id="exportCSV">Export CSV</a>-->
<!--                </div>-->
                <div id="bottomOprPanel" style="background-color:white;width: 100%; top:0; height: 50px; position:absolute; width: 99%;">
                    <div id = "pageNavPosition" style="top: -50px;"></div>
                    <a type="button"
                       class="btn btn-sm btn-success"
                       id="exportCSV"
                       style="float: right; margin-top: 20px;">
                        Export CSV
                    </a>
                </div>
                <div id="dataPanel" class="table-container" style="position: absolute; top: 70px; overflow: scroll; height: 550px; width: 99%;">

                </div>
<!--                <div style="overflow: scroll;">-->
<!--                    <div class="row"-->
<!--                         style="overflow: scroll; height:100%; position: fixed;"-->
<!--                         id="dataPanel"-->
<!--                         class="table-container">-->
<!---->
<!--                        <!-- here goes the table which show the data -->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--            <div id="stateDisplay"></div>-->
<!--            </div>-->
    </div>
</div>



<!--<div class="container-fluid">
    <div class="row">
        <div class="col-sm-4 col-md-3 sidebar tab" id="leftPanel" style="overflow: scroll;">
            <svg id="varPanel"></svg>
        </div>
        <div class="col-sm-5 col-sm-offset-4 col-md-7 col-md-offset-3 main tab" id="mainPanel">
            <div class="row">
                <div class="col-sm-12 col-md-12">
                    <svg class="dataDistPanel" width="100%"></svg>
                </div>
                <div class="col-sm-12 col-md-12">
                    <div class = "row">
                        <div class="col-sm-8 col-md-8">
                            <div class="filterPanel"></div>
                        </div>
                        <div class="col-sm-4 col-md-4">
                            <div class="eventPanel"></div>
                        </div>
                    </div>
                    <div class = "row">
                        <div class="col-sm-12 col-md-12">
                            <div class="stratAndColFilter">

                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-12 col-md-12 table-responsive"></div>
                <div class="col-sm-12 col-md-12" id="comparisionPanel"></div>
            </div>

        </div>
        <div class="col-sm-3 col-md-2 col-md-offset-10 sidebar tab" id="rightPanel">
            <h3 style="margin-top: 10px"> Data Panel</h3>
            <div>
                <div>Save data: <a type="button" class="btn btn-sm btn-success" id="exportCSV" onclick="$('#dataTable').table2CSV()">Export CSV</a></div>
                <div id="dataPanel" class="table-container"></div>
            </div>
            <div id="stateDisplay"></div>

            <div class="col-sm-12 col-md-12 table-responsive"></div>
            <div class="col-sm-12 col-md-12">
                <div class="graph-outer" id="scatterPlot"></div>
            </div>
            <div class="col-sm-12 col-md-12" id="comparisionPanel"></div>

        <!-- Modal -->
        <div class="modal fade" id="selectField" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">Pick a field</h4>
                    </div>
                    <div class="modal-body">
                        <svg id="fieldsContainer"></svg>
                    </div>
                    <div class="modal-footer" style="padding-bottom: 5px; padding-top: 5px">
                        <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Close</button>
                        <!--<button type="button" class="btn btn-primary">Save changes</button>-->
                    </div>
                </div>
            </div>
            </div>

        <!--        this if for the settings modal      -->
        <div class="modal fade" role="dialog" id="scatterPlotModal">
            <div class="modal-dialog">

                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Settings</h4>
                    </div>
                    <div class="modal-body">
                        <form>
                            X - Axis :
                            <select id="xAxis">
                            </select>
                            <!--<input type="text" name="token" id="token" value="EA9391F955A3536F26E0547699E94117" style="width: 100%;"><br>-->
                            <br><br>
                            Y -  Axis :
                            <select id="yAxis">
                            </select>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" id="addScatterPlot">Add Scatter Plot</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>

            </div>
        </div>

        <!--        this if for the settings modal      -->
        <div class="modal fade" role="dialog" id="settingsModal">
            <div class="modal-dialog">

                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Settings</h4>
                    </div>
                    <div class="modal-body">
                        <form>
                            Token:<br>
                            <input type="text" name="token" id="token" value="308EB88F77DCF662827EC71208BCC58A" style="width: 100%;"><br>
                            <!--<input type="text" name="token" id="token" value="EA9391F955A3536F26E0547699E94117" style="width: 100%;"><br>-->
                            URL:<br>
                            <input type="text" name="url" id="url" value="https://redcap-dev01.brisc.utah.edu/redcap/active/redcap/api/" style="width: 100%;">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" id="reload">Reload</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>

            </div>
        </div>

        <!--        this is for the rebinning modal         -->
        <div class="modal fade" role="dialog" id="rebinningModal">
            <div class="modal-dialog">

                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Settings</h4>
                    </div>
                    <div class="modal-body">
                        <form>
                            Token:<br>
                            <input type="text" name="token" id="token" value="" style="width: 100%;"><br>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" id="reload">Change</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div>

            </div>
        </div>


    </div>
</div>

<script type="text/javascript" src="../bower_components/please-wait/build/please-wait.min.js"></script>
<script type="text/javascript">
    var loading_screen = window.pleaseWait({
        logo: "img/vider.png",
        backgroundColor: '#FFFFFF',
        loadingHtml: "<div>"
                        + "<style scoped>"
                        + "\@import '\/redcap\/plugins\/vider\/public_html\/css\/loadingScreen.css';"
                        + "</style>"
                            + "<div class='spinner'>"
                                + " <div class='rect1'>&nbsp;</div>"
                                + " <div class='rect2'>&nbsp;</div>"
                                + " <div class='rect3'>&nbsp;</div>"
                                + " <div class='rect4'>&nbsp;</div>"
                                + " <div class='rect5'>&nbsp;</div>"
                            + "</div>"
                        + "</div>"

    });
</script>
<script data-main="../public_html/js/main" src="../bower_components/requirejs/require.js"></script>

<!-- jQuery library -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
<script src="../public_html/js/utility/paging.js"></script>
<script src="../public_html/js/utility/htmltocsv.js"></script>
<script>
    var pager = new Pager('dataTable', 15);
</script>

</body>
</html>
