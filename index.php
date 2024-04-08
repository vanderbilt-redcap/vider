<?php

namespace Vanderbilt\ViderExternalModule;

$pid = htmlspecialchars($_GET['pid'], ENT_QUOTES);

# have to reset equals in GET
if (isset($_GET['filter'])) {
	$_GET['filter'] = preg_replace("/%3D/", "=", $_GET['filter']);
}
if (isset($_GET['plainFilter'])) {
	$_GET['plainFilter'] = preg_replace("/%3D/", "=", $_GET['plainFilter']);
	$plainFilterText = " filtered by ".htmlspecialchars($_GET['plainFilter'], ENT_QUOTES);
} else {
	$plainFilterText = "";
}
$numSortables = 5;

# Check user rights
$userRights = \REDCap::getUserRights(USERID);
$validForms = array();
if ($userRights[USERID]['expiration'] != "" && $userRights[USERID]['expiration'] < TODAY) {
	die();
}
foreach ($userRights[USERID]['forms'] as $form => $permission) {
	if ($permission) {
		$validForms[] = $form;
	}
}

$blank = "<option value=''>---SELECT---</option>";

# must be hex
$defaultColor = '#c03017';
if (isset($_GET['color'])) {
$defaultColor = "#".htmlspecialchars($_GET['color'], ENT_QUOTES);
}
$canvasHeight = "400px";
if (isset($_GET['canvasHeight'])) {
$canvasHeight = htmlspecialchars($_GET['canvasHeight'], ENT_QUOTES)."px";
}

$metadataJSON = \REDCap::getDataDictionary($pid, 'json');
$metadata = json_decode($metadataJSON, true);

$types = array();
$types['discrete'] = array("checkbox", "dropdown", "radio");
$types['continuous'] = array("text");
$validationTypes = array();
$validationTypes['discrete'] = false;
$validationTypes['continuous'] = array("integer", "number", "date_ymd", "date_mdy", "date_dmy", "datetime_dmy", "datetime_mdy", "datetime_ymd", "datetime_seconds_ymd", "datetime_seconds_mdy", "datetime_seconds_dmy", "time");
$fields = array("discrete" => array(), "continuous" => array());

foreach ($metadata as $row) {
foreach ($types as $dataType => $fieldTypes) {
	if (in_array($row['field_type'], $fieldTypes)) {
		if ($validationTypes[$dataType] && in_array($row['form_name'], $validForms)) {
			if (in_array($row['text_validation_type_or_show_slider_number'], $validationTypes[$dataType])) {
				$fields[$dataType][$row['field_name']] = $row['field_label'];
			}
		} else {
			$fields[$dataType][$row['field_name']] = $row['field_label'];
		}
	}
} 
}

?>
<html>
<head>
<title>ViDER 2</title>
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">

<style>
	h1,h2,h3,h4 { text-align: center; }
	body { font-family: Arial, Helvetica, sans-serif; }
	.ui-autocomplete { font-size: 14px; }
	input[type=submit] { border: 1px solid #bbbbbb; padding: 8px 16px; border-radius: 6px; text-align: center; box-shadow: 2px 2px; display: inline-block; font-size: 16px; margin: 4px 4px; }
	.custom-combobox-toggle { height: 21px; }
	.one { background-color: #eeeeee; }
	.two { background-color: <?= $blue ?>; }
	a { color: <?= $darkBlue ?>; }
	.three { background-color: #bbbbbb; }
	td.rounded { border: 1px dotted black; padding: 10px; border-radius: 10px; }
	td { vertical-align: middle; text-align: center; }
	table { border-spacing: 20px; }
	select { width: 200px; }
	.red, a { color: #C13017; }
	.nomargin { margin: 0px; }
	.small { margin-top: 0px; font-size: 12px; }
	button { border-radius: 8px; background-color: #a6ffae; font-size: 20px; font-weight: bold; }

	.connectedSortable { border: 1px solid #444444; width: 142px; min-height: 20px; list-style-type: none; margin: 0; padding: 5px 0 0 0; float: left; margin-right: 10px; }
	.connectedSortable li { margin: 0 5px 5px 5px; padding: 5px; font-size: 14px; width: 120px; }

</style>
<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>


<script>
	function save(chart) {
		var link = document.createElement('a');
		link.download = "vider_chart.png";
		link.href = chart.toBase64Image().replace(/^data:image\/png;/i, "data:application/octet-stream;");
		link.click();
	}

	function selectHandler(e, ary) {
<?php
		if (isset($_GET['iframe']) && $_GET['iframe']) {
?>
			var otherIframe = '<?= htmlspecialchars($_GET['iframe'], ENT_QUOTES) ?>';
			if (window.parent && window.parent.document.getElementById(otherIframe) && ary[0]) {
				var idx = ary[0]['_index'];
				var filter = filters[jsDataLabels[idx]];
				var plainFilter = plainFilters[jsDataLabels[idx]];
				filter = filter.replace(/=/, "%3D");
				plainFilter = plainFilter.replace(/=/, "%3D");
				var urlParts = window.parent.document.getElementById(otherIframe).src.split(/\?/);
				var getParts = urlParts[1].split(/\&/);
				var urlWithFilter = urlParts[0]+'?';
				var urlWithoutFilter = urlParts[0]+'?';
				for (var i=0; i < getParts.length; i++) {
					if (i !== 0) {
						urlWithFilter = urlWithFilter + "&";
						urlWithoutFilter = urlWithoutFilter + "&";
					}
					if (getParts[i].match(/^plainFilter=/) || getParts[i].match(/^filter=/)) {
					} else if (!getParts[i].match(/^iframe=/)) {
						urlWithFilter = urlWithFilter + getParts[i];
						if (!getParts[i].match(/filter=/) && !getParts[i].match(/plainFilter=/)) {
							urlWithoutFilter = urlWithoutFilter + getParts[i];
						}
					} else {
						urlWithFilter = urlWithFilter + "&iframe=";
						urlWithoutFilter = urlWithoutFilter + "&" + getParts[i];
					}
				}
				urlWithFilter = urlWithFilter + "&filter="+encodeURI(filter)+"&plainFilter="+encodeURI(plainFilter);
				window.parent.document.getElementById(otherIframe).src = urlWithFilter;
				document.getElementById("reset").innerHTML = "<a href='javascript:;' onclick='window.parent.document.getElementById(\""+otherIframe+"\").src = \""+urlWithoutFilter+"\"; $(this).parent().html(\"&nbsp;\");'>Reset other panel</a>";
			}
<?php
		}
		if (isset($_GET['type'])) {
?>
			var recordId;
			if (ary[0]
				&& ary[0]['_chart']
				&& ary[0]['_chart']['data']
				&& ary[0]['_chart']['data']['datasets']
				&& ary[0]['_chart']['data']['datasets'][0]
				&& ary[0]['_chart']['data']['datasets'][0]['data']
				&& ary[0]['_index']
				&& ary[0]['_chart']['data']['datasets'][0]['data'][ary[0]['_index']]
				&& ary[0]['_chart']['data']['datasets'][0]['data'][ary[0]['_index']]['record_id']
			) {
				recordId = ary[0]['_chart']['data']['datasets'][0]['data'][ary[0]['_index']]['record_id'];
				console.log(recordId);
			} else {
				console.log(ary);
			}
			if (recordId) {
				window.open('<?= APP_PATH_WEBROOT."DataEntry/record_home.php?pid=".htmlspecialchars($_GET['pid'], ENT_QUOTES)."&id=" ?>'+recordId);
			}
<?php
		}
?>
	}

	function buildCurrentUrl(paramsToChange = "") {
		var a = window.location.href.split(/\?/);
		if (a.length == 2) {
			var ps = {};
			ps['current'] = a[1].split(/\&/);
			ps['new'] = paramsToChange.split(/\&/);
			var params = {};
			var b, i;
			for (i = 0; i < ps['current'].length; i++) {
				b = ps['current'][i].split(/=/);
				if (b.length == 2) {
					params[b[0]] = b[1];
				}
			}
			for (i = 0; i < ps['new'].length; i++) {
				b = ps['new'][i].split(/=/);
				if (b.length == 2) {
					params[b[0]] = b[1];
				}
			}
		}

		var paramStr = "";
		for (var variable in params) {
			if (paramStr) {
				paramStr += "&" + variable + "=" + params[variable];
			} else {
				paramStr = "?" + variable + "=" + params[variable];
			}
		} 
		var url = a[0] + paramStr;
		console.log(url);
		return url;
	}

	$(document).ready(function() {
		$('input[type=color]').change(function() { window.location.href = buildCurrentUrl("color="+this.value.replace(/^\#/, "")); });
	});
</script>
</head>
<body>

<?php
if (!isset($_GET['iframe']) || (preg_match("/_config$/", $_GET['iframe']) && !preg_match("/_config$/", $_GET['type']))) {
	# header
	echo "<div class='small' style='text-align: right;'>";
	$space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	if (isset($_GET['type'])) {
		echo "Color: <input type='color' value='$defaultColor' style='width: 50px;' />".$space;
		echo "<a class='red' href='".$module->getUrl("index.php")."&pid=$pid'>Design Another Graph</a>".$space;
	}
	if (isset($_GET['type']) && ($_GET['type'] != "parallel")) {
		echo "<a href='javascript:;' onclick='save(myChart);'>Save</a>".$space;
	}
	echo "<a href='".APP_PATH_WEBROOT."index.php?pid=$pid'>REDCap</a>$space<a href='".$module->getUrl("aboutus.php")."'>About Us</a>";
	echo "</div>";
	if (!isset($_GET['type'])) {
		echo "<div style='text-align: center;'><img src='".\ExternalModules\ExternalModules::getUrl('vider', 'img/vider.png')."' style='height:48px;'></div>";
	}
} else if (isset($_GET['type'])) {
	if (!preg_match("/_config$/", $_GET['type'])) {
		echo "<div class='small' style='text-align: right;'><a href='javascript:;' onclick='save(myChart);'>Save</a></div>";
	}
	if ($_GET['type'] == "histogram" || $_GET['type'] == "scatter") {
		echo "<h2 class='nomargin'>&nbsp;</h2>";
		echo "<div style='text-align: center;' id='reset'>&nbsp;</div>";
	} else if ($_GET['type'] == "custom_bar") {
		echo "<h2 class='nomargin'>&nbsp;</h2>";
		echo "<div style='text-align: center;' id='reset'>&nbsp;</div>";
	} else if ($_GET['type'] == "bar") {
		echo "<h2 class='nomargin'>Select a bar to inspect</h2>";
		echo "<div style='text-align: center;' id='reset'>&nbsp;</div>";
	}
}

if (!isset($_GET['type'])) {
echo "<h2 class='red'>What do you want to create?</h2>";
$options = array();
foreach ($fields as $dataType => $fieldNames) {
	$options[$dataType] = array();
	foreach ($fieldNames as $fieldName => $label) {
		$options[$dataType][] = "<option value='$fieldName'>[$fieldName] $label</option>";
	}
}
?>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
	<script>
		$( function() {
			$.widget( "custom.combobox", {
				_create: function() {
					this.wrapper = $( "<span>" )
						.addClass( "custom-combobox" )
						.insertAfter( this.element );

					this.element.hide();
					this._createAutocomplete();
					this._createShowAllButton();
				},

				_createAutocomplete: function() {
					var selected = this.element.children( ":selected" ),
						value = selected.val() ? selected.text() : "";

					this.input = $( "<input>" )
						.appendTo( this.wrapper )
						.val( value )
						.attr( "title", "" )
						.addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
						.autocomplete({
							delay: 0,
							minLength: 0,
							source: $.proxy( this, "_source" )
						})
						.tooltip({
							classes: {
								"ui-tooltip": "ui-state-highlight"
							}
						});

					this._on( this.input, {
						autocompleteselect: function( event, ui ) {
							ui.item.option.selected = true;
							this._trigger( "select", event, {
								item: ui.item.option
							});
						},

						autocompletechange: "_removeIfInvalid"
					});
				},

				_createShowAllButton: function() {
					var input = this.input,
						wasOpen = false;

					$( "<a>" )
						.attr( "tabIndex", -1 )
						.attr( "title", "Show All Items" )
						.tooltip()
						.css({ "height" : "22px", "margin-top" : "-1px" })
						.appendTo( this.wrapper )
						.button({
							icons: {
								primary: "ui-icon-triangle-1-s"
							},
							text: false
						})
						.removeClass( "ui-corner-all" )
						.addClass( "custom-combobox-toggle ui-corner-right" )
						.on( "mousedown", function() {
							wasOpen = input.autocomplete( "widget" ).is( ":visible" );
						})
						.on( "click", function() {
							input.trigger( "focus" );

							// Close if already visible
							if ( wasOpen ) {
								return;
							}

							// Pass empty string as value to search for, displaying all results
							input.autocomplete( "search", "" );
						});
				},

				_source: function( request, response ) {
					var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
					response( this.element.children( "option" ).map(function() {
						var text = $( this ).text();
						if ( this.value && ( !request.term || matcher.test(text) ) )
							return {
								label: text,
								value: text,
								option: this
							};
					}) );
				},

				_removeIfInvalid: function( event, ui ) {

					// Selected an item, nothing to do
					if ( ui.item ) {
						return;
					}

					// Search for a match (case-insensitive)
					var value = this.input.val(),
						valueLowerCase = value.toLowerCase(),
						valid = false;
					this.element.children( "option" ).each(function() {
						if ( $( this ).text().toLowerCase() === valueLowerCase ) {
							this.selected = valid = true;
							return false;
						}
					});

					// Found a match, nothing to do
					if ( valid ) {
						return;
					}

					// Remove invalid value
					this.input
						.val( "" )
						.attr( "title", value + " didn't match any item" )
						.tooltip( "open" );
					this.element.val( "" );
					this._delay(function() {
						this.input.tooltip( "close" ).attr( "title", "" );
					}, 2500 );
					this.input.autocomplete( "instance" ).term = "";
				},

				_destroy: function() {
					this.wrapper.remove();
					this.element.show();
				}
			});

			$( ".combobox" ).combobox();
		} );
	</script>
</head>
<table style='margin-left: auto; margin-right: auto;'>
	<tr>
		<td class='rounded one'><form method='GET' action='index.php'>
			<input type='hidden' name='pid' value='<?= $pid ?>'>
			<input type='hidden' name='id' value='<?= htmlspecialchars($_GET['id'], ENT_QUOTES) ?>'>
			<input type='hidden' name='page' value='<?= htmlspecialchars($_GET['page'], ENT_QUOTES) ?>'>
			<input type='hidden' name='prefix' value='vider'>
			<input type='hidden' name='type' value='bar'>
			<h4 class='nomargin'>Bar Chart<br>(Discrete)</h4>
			<p class='small'>Radio buttons, dropdowns, and checkboxes</p>
			<p>Select Variable:<br><select class='combobox' name='var1'><?= $blank.implode("", $options['discrete']) ?></select></p>
			<p><input type='submit' value='Show'></p>
		</form></td>
		<td class='rounded two'><form method='GET' action='index.php'>
			<input type='hidden' name='pid' value='<?= $pid ?>'>
			<input type='hidden' name='id' value='<?= htmlspecialchars($_GET['id'], ENT_QUOTES) ?>'>
			<input type='hidden' name='page' value='<?= htmlspecialchars($_GET['page'], ENT_QUOTES) ?>'>
			<input type='hidden' name='prefix' value='vider'>
			<input type='hidden' name='type' value='histogram'>
			<h4 class='nomargin'>Histogram<br>(Continuous)</h4>
			<p class='small'>Numbers, integers, dates, and times</p>
			<p>Select Variable:<br><select class='combobox' name='var1'><?= $blank.implode("", $options['continuous']) ?></select></p>
			<p><input type='submit' value='Show'></p>
		</form></td>
		<td class='rounded three'><form method='GET' action='index.php'>
			<input type='hidden' name='pid' value='<?= $pid ?>'>
			<input type='hidden' name='id' value='<?= htmlspecialchars($_GET['id'], ENT_QUOTES) ?>'>
			<input type='hidden' name='page' value='<?= htmlspecialchars($_GET['page'], ENT_QUOTES) ?>'>
			<input type='hidden' name='prefix' value='vider'>
			<input type='hidden' name='type' value='custom_bar_config'>
			<h4 class='nomargin'>Custom Bar Chart<br>(Merge Discrete Categories)</h4>
			<p class='small'>Radio buttons, dropdowns, and checkboxes</p>
			<p>Select Variable:<br><select class='combobox' name='var1'><?= $blank.implode("", $options['discrete']) ?></select></p>
			<p><input type='submit' value='Configure'></p>
		</form></td>
	<tr>
		<td class='rounded three' colspan='3'><form method='GET' action='index.php'>
			<input type='hidden' name='pid' value='<?= $pid ?>'>
			<input type='hidden' name='id' value='<?= htmlspecialchars($_GET['id'], ENT_QUOTES) ?>'>
			<input type='hidden' name='page' value='<?= htmlspecialchars($_GET['page'], ENT_QUOTES) ?>'>
			<input type='hidden' name='prefix' value='vider'>
			<input type='hidden' name='type' value='scatter'>
			
			<table style='width: 100%;'><tr>
				<td style='width: 33%; vertical-align: middle;'>
					<h4 class='nomargin'>Scatter Plot<br>(Continuous)</h4>
					<p class='small'>Numbers, integers, dates, and times</p>
				</td>
				<td style='width: 34%; vertical-align: middle;'>
					<p>Select X Variable:<br><select class='combobox' name='var1x'><?= $blank.implode("", $options['continuous']) ?></select></p>
					<p>Select Y Variable:<br><select class='combobox' name='var1y'><?= $blank.implode("", $options['continuous']) ?></select></p>
				</td>
				<td style='width: 33%; vertical-align: middle;'>
					<input type='submit' value='Show'>
				</td>
			</tr></table>
		</form></td>
	</tr>
	<tr>
		<td class='rounded three'><form method='GET' action='index.php'>
			<input type='hidden' name='pid' value='<?= $pid ?>'>
			<input type='hidden' name='id' value='<?= htmlspecialchars($_GET['id'], ENT_QUOTES) ?>'>
			<input type='hidden' name='page' value='<?= htmlspecialchars($_GET['page'], ENT_QUOTES) ?>'>
			<input type='hidden' name='prefix' value='vider'>
			<input type='hidden' name='type' value='parallel'>
			<h4>Parallel Sets<br>(Histograms / Bar Charts)</h4>
			<p>Select Variable 1:<br><select class='combobox' name='var1'><?= $blank.implode("", array_merge($options['discrete'], $options['continuous'])) ?></select></p>
			<p>Select Variable 2:<br><select class='combobox' name='var2'><?= $blank.implode("", array_merge($options['discrete'], $options['continuous'])) ?></select></p>
			<p><input type='submit' value='Show'></p>
		</form></td>
		<td class='rounded one'><form method='GET' action='index.php'>
			<input type='hidden' name='pid' value='<?= $pid ?>'>
			<input type='hidden' name='id' value='<?= htmlspecialchars($_GET['id'], ENT_QUOTES) ?>'>
			<input type='hidden' name='page' value='<?= htmlspecialchars($_GET['page'], ENT_QUOTES) ?>'>
			<input type='hidden' name='prefix' value='vider'>
			<input type='hidden' name='type' value='parallel'>
			<h4>Parallel Sets<br>(Chart &amp; Scatter Plot)</h4>
			<p>Select Variable 1:<br><select class='combobox' name='var1'><?= $blank.implode("", array_merge($options['discrete'], $options['continuous'])) ?></select></p>
			<p>Select 2nd X Variable:<br><select class='combobox' name='var2x'><?= $blank.implode("", $options['continuous']) ?></select></p>
			<p>Select 2nd Y Variable:<br><select class='combobox' name='var2y'><?= $blank.implode("", $options['continuous']) ?></select></p>
			<p><input type='submit' value='Show'></p>
		</form></td>
		<td class='rounded two'><form method='GET' action='index.php'>
			<input type='hidden' name='pid' value='<?= $pid ?>'>
			<input type='hidden' name='id' value='<?= htmlspecialchars($_GET['id'], ENT_QUOTES) ?>'>
			<input type='hidden' name='page' value='<?= htmlspecialchars($_GET['page'], ENT_QUOTES) ?>'>
			<input type='hidden' name='prefix' value='vider'>
			<input type='hidden' name='type' value='parallel'>
			<h4>Parallel Sets<br>(Scatter Plots)</h4>
			<p>Select 1st X Variable:<br><select class='combobox' name='var1x'><?= $blank.implode("", $options['continuous']) ?></select></p>
			<p>Select 1st Y Variable:<br><select class='combobox' name='var1y'><?= $blank.implode("", $options['continuous']) ?></select></p>
			<p>Select 2nd X Variable:<br><select class='combobox' name='var2x'><?= $blank.implode("", $options['continuous']) ?></select></p>
			<p>Select 2nd Y Variable:<br><select class='combobox' name='var2y'><?= $blank.implode("", $options['continuous']) ?></select></p>
			<p><input type='submit' value='Show'></p>
		</form></td>
	</tr>
</table>
<?php
} else {
$getFields = array("var1", "var2", "var1x", "var1y", "var2x", "var2y");
$varsToFetch = array();
foreach ($getFields as $var) {
	if (isset($_GET[$var]) && $_GET[$var]) {
		$varsToFetch[$var] = htmlspecialchars($_GET[$var], ENT_QUOTES);
	}
}
$proceed = false;
$jsData = array();
if (!empty($varsToFetch)) {
	$varsFields = array_merge(array("record_id"), array_values($varsToFetch));
	$filterLogic = NULL;
	if ($_GET['filter']) {
		$filterLogic = htmlspecialchars($_GET['filter'], ENT_QUOTES);
?>
		<script>
			$(document).ready(function() {
				document.getElementById('reset').innerHTML = "<?= htmlspecialchars($_GET['plainFilter'], ENT_QUOTES) ?>";
			});
		</script>
<?php
	}
	$json = \REDCap::getData($pid, 'json', NULL, $varsFields, NULL, NULL, FALSE, FALSE, FALSE, $filterLogic);
	$data = json_decode($json, true);
	$proceed = true;
	$choices = getChoices($metadata);
}
if ($proceed && ($_GET['type'] != "parallel") && !preg_match("/_config$/", $_GET['type'])) {
	echo "<canvas id='chart' style='width: 800px; height: $canvasHeight;'></canvas>\n";
	echo "<script type='text/javascript' src='".$module->getUrl("chart.js/dist/Chart.bundle.min.js")."'></script>\n";
}
if ($proceed && ($_GET['type'] == "custom_bar_config")) {
	$var = $varsToFetch['var1'];
	$metadataRow = array();
	foreach ($metadata as $row) {
		if ($row['field_name'] == $var) {
			$metadataRow = $row;
		}
	}
?>
<script>
$(document).ready(function() {
	$(".connectedSortable").sortable({
		connectWith: ".connectedSortable",
		cursor: "move",
		dropOnEmpty: true
	}).disableSelection();
});

function submitSortables() {
	var match = new RegExp('<?= $var ?>-', "i" );
	var sortables = {};
	for (var i = 1; i <= <?= $numSortables ?>; i++) {
		var ary = $("#sortable"+i).sortable("toArray");
		// start at 1 to eliminate intial "" from the header (Category $i)
		var ary2 = new Array();
		for (var j = 1; j < ary.length; j++) {
			ary2[j-1] = ary[j].replace(match, "");
		}
		if (ary.length > 0) {
			sortables[i] = ary2;
		}
	}
	var url = buildCurrentUrl("type=custom_bar&focus=");
	for (var i in sortables) {
		if (sortables[i].length > 0) {
			url += "&sortables"+i+"="+encodeURI(JSON.stringify(sortables[i]));
		}
	}
	if (window.location.href.match(/focus=parent/)) {
		window.parent.location.href = url;
	} else {
		window.location.href = url;
	}
}
</script>

<h2 style='margin-bottom: 0px; text-align: center'>&larr; Drag-and-Drop Categories &rarr;</h2>
<p style='text-align: center;'>Press <button onclick='submitSortables();'>Submit</button> When Ready</p>
<table style='margin-left: auto; margin-right: auto;'><tr><td>
<?php
		$hasGETData = false;
		for ($i = 1; $i <= $numSortables; $i++) {
			if (isset($_GET['sortables'.$i])) {
				$ary = [];
				foreach (json_decode($_GET['sortables'.$i]) as $item) {
					$ary[] = htmlspecialchars($item, ENT_QUOTES);
				}
				$sortables[$i] = $ary; 
				$hasGETData = true;
			} else {
				# empty
				$sortables[$i] = array();
			}
		}
		if (!$hasGETData) {
			foreach ($choices[$var] as $choice => $value) {
				$cats[] = $choice;
			}
			$cats[] = "";
			$sortables[1] = $cats;
		}
		for ($i = 1; $i <= $numSortables; $i++) {
			echo "<ul id='sortable$i' class='connectedSortable'><h4>Category $i</h4>";
			foreach ($sortables[$i] as $cat) {
				if ($cat !== "") {
					echo "<li class='ui-state-default' id='$var-$cat'>{$choices[$var][$cat]}</li>";
				} else {
					echo "<li class='ui-state-default' id='$var-'>[Empty]</li>";
				}
			}
			echo "</ul>";
		}
		echo "</td></tr></table>";
	} else if ($proceed && $_GET['type'] == "histogram") {
		# 1 col continuous 
		$var = $varsToFetch['var1'];
		$metadataRow = array();
		foreach ($metadata as $row) {
			if ($row['field_name'] == $var) {
				$metadataRow = $row;
			}
		}
		$colData = array();
		foreach ($data as $row) {
			$jsData[] = $row[$var];
		}
		$jsData = binData($jsData, $metadataRow['text_validation_type_or_show_slider_number']);
?>
		<script>
		var ctx = document.getElementById("chart").getContext('2d');
		var myChart = new Chart(ctx, {
			type: 'bar',
			options: {
				scales: {
					xAxes: [{
						scaleLabel: {
							display: true,
							labelString: '<?= $metadataRow['field_label'] ?>'
						}
					}],
					yAxes: [{
						ticks: {
							beginAtZero:true
						},
						scaleLabel: {
							display: true,
							labelString: 'Count'
						}
					}]
				}
			},
			data: {
				labels: <?= json_encode($jsData['labels']) ?>,
				datasets: [{
					label: "<?= $metadataRow['field_label'].$plainFilterText ?>",
					data: <?= json_encode($jsData['data']) ?>,
					backgroundColor: '<?= $defaultColor ?>',
					borderWidth: 1
				}]
			}
		});
		</script>

<?php
	} else if ($proceed && ($_GET['type'] == "bar" || $_GET['type'] == "custom_bar")) {
		# 1 col discrete 
		$var = $varsToFetch['var1'];
		$metadataRow = array();
		foreach ($metadata as $row) {
			if ($row['field_name'] == $var) {
				$metadataRow = $row;
			}
		} 
		$colData = array();
		foreach ($choices[$var] as $value => $label) {
			$colData[$value] = 0;
		}
		$colData[""] = 0;
		foreach ($data as $row) {
			$colData[$row[$var]]++;
		}
		$jsDataLabels = array();
		$jsData = array();
		$filters = array();
		$plainFilters = array();
		if ($_GET['type'] == "bar") {
			foreach ($colData as $value => $cnt) {
				if ($value === "") {
					$jsDataLabels[] = "Empty";
				} else {
					$jsDataLabels[] = $choices[$var][$value];
				}
				$jsData[] = $cnt;
				$filters[$choices[$var][$value]] = "[".$var."] = '".$value."'";
				$plainFilters[$choices[$var][$value]] = "[".$var."] = '".$choices[$var][$value]."'";
			}
		} else {
			$bins = array();
			foreach ($_GET as $key => $value) {
				if (preg_match("/^sortables/", $key)) {
					$ary = [];
					foreach (json_decode($value) as $item) {
						$ary[] = htmlspecialchars($item, ENT_QUOTES);
					}
					$bins[preg_replace("/^sortables/", "", htmlspecialchars($key, ENT_QUOTES))] = $ary;
				}
			}
			$binTotals = array();
			foreach ($colData as $value => $cnt) {
				foreach ($bins as $i => $cats) {
					if (in_array($value, $cats)) {
						if (!isset($binTotals[$i])) {
							$binTotals[$i] = 0;
						}
						$binTotals[$i] += $cnt;
					}
				}
			}
			foreach ($bins as $i => $cats) {
				$fs = array();
				foreach ($cats as $cat) {
					$fs[] = "[".$var."] = '".$cat."'";
				}
				$filters[$i] = implode(" OR ", $fs);
				$plainFilters[$i] = "[".$var."] = Category $i";
			}
			foreach ($binTotals as $i => $cnt) {
				$jsData[] = $cnt;
				$jsDataLabels[] = "Category $i";
			}
		}
?>
<script>
var ctx = document.getElementById("chart").getContext('2d');
var filters = <?= json_encode($filters) ?>;
var plainFilters = <?= json_encode($plainFilters) ?>;
var jsData = <?= json_encode($jsData) ?>;
var jsDataLabels = <?= json_encode($jsDataLabels) ?>;

var myChart = new Chart(ctx, {
	type: 'horizontalBar',
	options: {
		scales: {
			xAxes: [{
				scaleLabel: {
					display: true,
					labelString: '<?= $metadataRow['field_label'] ?>'
				}
			}],
			yAxes: [{
				ticks: {
					beginAtZero:true
				},
				scaleLabel: {
					display: true,
					labelString: 'Count'
				}
			}]
		}
<?php
		if ($_GET['type'] == "bar") {
			echo ",\nonClick: function(e, ary) { selectHandler(e, ary); }";
		}
?>
	},
	data: {
		labels: jsDataLabels,
		datasets: [{
			label: "<?= $metadataRow['field_label'].$plainFilterText ?>",
			data: jsData,
			backgroundColor: '<?= $defaultColor; ?>',
			borderWidth: 1
		}]
	}
});
</script>
<?php
		if ($_GET['type'] == "custom_bar") {
?>
			<iframe id='iframe_config' style='width: 100%; height: 600px;'>
				<p>Your browser does not support iframes.</p>
			</iframe>
			<script>
<?php
				$str = "";
				foreach ($bins as $i => $cats) {
					$str = "&sortable$i=".json_encode($cats);
				}
				echo "var sortablesStr = encodeURI('$str');";
?>
				$('#iframe_config').attr("src", buildCurrentUrl("iframe=iframe_config&type=custom_bar_config&focus=parent" + sortablesStr)); 
			</script>
<?php
		}
	} else if ($proceed && $_GET['type'] == "scatter") {
		# continuous vs. continuous
		$x = $varsToFetch['var1x'];
		$y = $varsToFetch['var1y'];
		$metadataRowX = array();
		foreach ($metadata as $row) {
			if ($row['field_name'] == $x) {
				$metadataRowX = $row;
			}
			if ($row['field_name'] == $y) {
				$metadataRowY = $row;
			}
		} 
		$xData = array();
		$yData = array();
		$records = array();
		foreach ($data as $row) {
			$xData[] = $row[$x];
			$yData[] = $row[$y];
			$records[] = $row["record_id"];
		}
		$pts = array("x" => array(), "y" => array());
		for ($i = 0; $i < count($xData) && $i < count($yData); $i++) {
			$xPt = $xData[$i];
			$yPt = $yData[$i];
			if (preg_match("/^date/", $metadataRowX['text_validation_type_or_show_slider_number']) || $metadataRowX['text_validation_type_or_show_slider_number'] == "time") {
				$xPt = convertToDate($xData[$i], $metadataRowX['text_validation_type_or_show_slider_number']);
				$pts['x'][] = convertToTimestamp($xData[$i], $metadataRowX['text_validation_type_or_show_slider_number']);
			} else {
				$pts['x'][] = $xPt;
			}
			if (preg_match("/^date/", $metadataRowY['text_validation_type_or_show_slider_number']) || $metadataRowY['text_validation_type_or_show_slider_number'] == "time") {
				$yPt = convertToDate($yData[$i], $metadataRowY['text_validation_type_or_show_slider_number']);
				$pts['y'][] = convertToTimestamp($yData[$i], $metadataRowY['text_validation_type_or_show_slider_number']);
			} else {
				$pts['y'][] = $yPt;
			}
			
			if ($xPt !== "" && $yPt !== "") {
				if (is_int(xPt)) {
					$xPt = intval($xPt);
				} else if (is_numeric($xPt)) {
					$xPt = floatval($xPt);
				}
				if (is_int(yPt)) {
					$yPt = intval($yPt);
				} else if (is_numeric($yPt)) {
					$yPt = floatval($yPt);
				}
				$jsData[] = array("x" => $xPt, "y" => $yPt, "record_id" => $records[$i]);
			}
		}

		$xUnit = array();
		$yUnit = array();
		if (preg_match("/^date/", $metadataRowX['text_validation_type_or_show_slider_number']) || $metadataRowX['text_validation_type_or_show_slider_number'] == "time") {
			$minX = min($pts['x']);
			$maxX = max($pts['x']);
			$xUnit = findUnit($maxX - $minX, $metadataRowX['text_validation_type_or_show_slider_number']);
		}
		if (preg_match("/^date/", $metadataRowY['text_validation_type_or_show_slider_number']) || $metadataRowY['text_validation_type_or_show_slider_number'] == "time") {
			$minY = min($pts['y']);
			$maxY = max($pts['y']);
			$yUnit = findUnit($maxY - $minY, $metadataRowY['text_validation_type_or_show_slider_number']);
		}
		$curr = floor($min / $size) * $size;
		$jsDataStr = replaceStringDates(json_encode($jsData));
?>
		<script>
			var ctx = document.getElementById("chart").getContext('2d');
			var myChart = new Chart(ctx, {
				type: 'scatter',
				options: {
					scales: {
						xAxes: [{
<?php
if (preg_match("/^date/", $metadataRowX['text_validation_type_or_show_slider_number']) || ($metadataRowX['text_validation_type_or_show_slider_number'] == "time")) {
	echo "type: 'time',\n";
	echo "time: ".json_encode($xUnit).",\n";
}
?>
                					distribution: 'linear',
							scaleLabel: {
								display: true,
								labelString: '<?= $metadataRowX['field_label'] ?>'
							}

						}],
						yAxes: [{
<?php
if (preg_match("/^date/", $metadataRowY['text_validation_type_or_show_slider_number']) || ($metadataRowY['text_validation_type_or_show_slider_number'] == "time")) {
	echo "type: 'time',\n";
	echo "time: ".json_encode($yUnit).",\n";
}
?>
                					distribution: 'linear',
							scaleLabel: {
								display: true,
								labelString: '<?= $metadataRowY['field_label'] ?>'
							}

						}]
					},
					onClick: function(e, ary) {
						if (ary[0]) {
							selectHandler(e, ary);
						}
					}
				},
				data: {
					datasets: [{
						label: "<?= $metadataRowX['field_label']." vs. ".$metadataRowY['field_label'].$plainFilterText ?>",
						backgroundColor: '<?= $defaultColor ?>',
						data: <?= $jsDataStr ?> 
					}]
				}
			});
		</script>
<?php
	} else if ($proceed && $_GET['type'] == "parallel") {
		# 2 charts
		$url1 = $module->getUrl("index.php")."&pid=$pid&iframe=iframe2&canvasHeight=800&color=".preg_replace("/^#/", "", $defaultColor);
		$url2 = $module->getUrl("index.php")."&pid=$pid&iframe=iframe1&canvasHeight=800&color=".preg_replace("/^#/", "", $defaultColor);
		if (isset($_GET['var1'])) {
			$url1 .= "&var1=".htmlspecialchars($_GET['var1'], ENT_QUOTES);
			if (isset($fields['discrete'][$_GET['var1']])) {
				$url1 .= "&type=bar";
			} else {
				$url1 .= "&type=histogram";
			}
		} else {
			# scatter plot
			$url1 .= "&var1x=".htmlspecialchars($_GET['var1x'], ENT_QUOTES);
			$url1 .= "&var1y=".htmlspecialchars($_GET['var1y'], ENT_QUOTES);
			$url1 .= "&type=scatter";
		}
		if (isset($_GET['var2'])) {
			$url2 .= "&var1=".htmlspecialchars($_GET['var2'], ENT_QUOTES);
			if (isset($fields['discrete'][$_GET['var2']])) {
				$url2 .= "&type=bar";
			} else {
				$url2 .= "&type=histogram";
			}
		} else {
			# scatter plot
			$url2 .= "&var1x=".htmlspecialchars($_GET['var2x'], ENT_QUOTES);
			$url2 .= "&var1y=".htmlspecialchars($_GET['var2y'], ENT_QUOTES);
			$url2 .= "&type=scatter";
		}
?>
		<iframe src="<?= $url1 ?>" id='iframe1' style="width: 49%; height: 100%; float: left;">
			<p>Your browser does not support iframes.</p>
		</iframe>
		<iframe src="<?= $url2 ?>" id='iframe2' style="width: 49%; height: 100%; float: right;">
			<p>Your browser does not support iframes.</p>
		</iframe>
<?php
	} else {
		echo "<p>I am unable to complete the request. <a href='".$module->getUrl("index.php")."'>Please restart the process</a></p>";
	}
}

function getChoices($metadata) {
	$choicesStrs = array();
	$multis = array("checkbox", "dropdown", "radio");
	foreach ($metadata as $row) {
		if (in_array($row['field_type'], $multis) && $row['select_choices_or_calculations']) {
			$choicesStrs[$row['field_name']] = $row['select_choices_or_calculations'];
		} else if ($row['field_type'] == "yesno") {
			$choicesStrs[$row['field_name']] = "0,No|1,Yes";
		} else if ($row['field_type'] == "truefalse") {
			$choicesStrs[$row['field_name']] = "0,False|1,True";
		}
	}
	$choices = array();
	foreach ($choicesStrs as $fieldName => $choicesStr) {
		$choicePairs = preg_split("/\s*\|\s*/", $choicesStr);
		$choices[$fieldName] = array();
		foreach ($choicePairs as $pair) {
			$a = preg_split("/\s*,\s*/", $pair);
			if (count($a) == 2) {
				$choices[$fieldName][$a[0]] = $a[1];
			} else if (count($a) > 2) {
				$a = preg_split("/,/", $pair);
				$b = array();
				for ($i = 1; $i < count($a); $i++) {
					$b[] = $a[$i];
				}
				$choices[$fieldName][trim($a[0])] = implode(",", $b);
			}
		}
	}
	return $choices;
}

function convertToTimestamp($value, $validationType) {
	if ($value === "") {
		return "";
	}
        $format = getFormat($validationType);
        if (!$format) {
                return $value;
	}
	date_default_timezone_set('UTC');
	$date = date_create($value);
	date_format($date, $format);
	$d = date_timestamp_get($date);
	return $d;
}

function getFormat($validationType) {
	$format = "";
        if ($validationType == "date_ymd") {
                $format = "Y-m-d";
        } else if ($validationType == "date_mdy") {
                $format = "m-d-Y";
        } else if ($validationType == "date_dmy") {
                $format = "d-m-Y";
        } else if ($validationType == "datetime_ymd") {
                $format = "Y-m-d h:i";
        } else if ($validationType == "datetime_mdy") {
                $format = "m-d-Y h:i";
        } else if ($validationType == "datetime_dmy") {
                $format = "d-m-Y h:i";
        } else if ($validationType == "datetime_seconds_ymd") {
                $format = "Y-m-d h:i:s";
        } else if ($validationType == "datetime_seconds_mdy") {
                $format = "m-d-Y h:i:s";
        } else if ($validationType == "datetime_seconds_dmy") {
                $format = "d-m-Y h:i:s";
        } else if ($validationType == "time") {
		$format = "h:i";
	}
	return $format;
}

function convertToDate($value, $validationType) {
	if ($value === "") {
		return "";
	}
	$nodes = preg_split("/[:\-\s]/", $value);
	if ($validationType == "date_ymd") {
		return "new Date({$nodes[0]}, ".($nodes[1]-1).", {$nodes[2]})";
	} else if ($validationType == "date_mdy") {
		return "new Date({$nodes[2]}, ".($nodes[0]-1).", {$nodes[1]})";
	} else if ($validationType == "date_dmy") {
		return "new Date({$nodes[0]}, ".($nodes[1]-1).", {$nodes[2]})";
	} else if ($validationType == "datetime_ymd") {
		return "new Date({$nodes[0]}, ".($nodes[1]-1).", {$nodes[2]}, {$nodes[3]}, {$nodes[4]}, 0, 0)";
	} else if ($validationType == "datetime_mdy") {
		return "new Date({$nodes[2]}, ".($nodes[0]-1).", {$nodes[1]}, {$nodes[3]}, {$nodes[4]}, 0, 0)";
	} else if ($validationType == "datetime_dmy") {
		return "new Date({$nodes[0]}, ".($nodes[1]-1).", {$nodes[2]}, {$nodes[3]}, {$nodes[4]}, 0, 0)";
	} else if ($validationType == "datetime_seconds_ymd") {
		return "new Date({$nodes[0]}, ".($nodes[1]-1).", {$nodes[2]}, {$nodes[3]}, {$nodes[4]}, {$nodes[5]}, 0)";
	} else if ($validationType == "datetime_seconds_mdy") {
		return "new Date({$nodes[2]}, ".($nodes[0]-1).", {$nodes[1]}, {$nodes[3]}, {$nodes[4]}, {$nodes[5]}, 0)";
	} else if ($validationType == "datetime_seconds_dmy") {
		return "new Date({$nodes[0]}, ".($nodes[1]-1).", {$nodes[2]}, {$nodes[3]}, {$nodes[4]}, {$nodes[5]}, 0)";
	} else if ($validationType == "time") {
		return "new Date(1970, 0, 1, {$nodes[0]}, {$nodes[1]}, 0, 0)";
	}
	return $value;
}

function replaceStringDates($str) {
	return preg_replace("/['\"]new Date\(([^\)]+?)\)['\"]/", "new Date($1)", $str);
}

# returns array("data" => <DATA COUNT>, "labels" => <LABELS>)
function binData($data, $validationType) {
	if (preg_match("/^date/", $validationType) || ($validationType == "time")) {
		for ($i = 0; $i < count($data); $i++) {
			$data[$i] = convertToTimestamp($data[$i], $validationType);
		}
	}
	foreach ($data as $d) {
		if ($d === "" || $d === false) {
			continue;
		}
		if (!isset($min)) {
			$min = $d;
		}
		if (!isset($max)) {
			$max = $d;
		}
		if ($d > $max) {
			$max = $d;
		}
		if ($d < $min) {
			$min = $d;
		}
	}

	if (preg_match("/^date/", $validationType)) {
		if ($max - $min > 3600 * 24 * 365 * 100 + 25 * 3600 * 24) {
			# centuries
			$size = 3600 * 24 * 365 * 100 + 25 * 3600 * 24;
		} else if ($max - $min > 3600 * 24 * 365 * 10 + 2.5 * 3600 * 24) {
			# decades
			$size = 3600 * 24 * 365 * 10 + 2.5 * 3600 * 24;
		} else if ($max - $min > 3600 * 24 * 365 + 0.25 * 3600 * 24) {
			# years
			$size = 3600 * 24 * 365 + 0.25 * 3600 * 24;
		} else if ($max - $min > 3600 * 24 * 30) {
			# months
			$size = 3600 * 24 * 30;
		} else if ($max - $min > 3600 * 24) {
			# days
			$size = 3600 * 24;
		} else if ($max - $min > 3600) {
			# hours 
			$size = 3600;
		} else {
			# minutes
			$size = 60;
		}
		$curr = floor($min / $size) * $size;
	} else if ($validationType == "time") {
		if ($max - $min > 3600) {
			# hours
			$size = 3600;
		} else if ($max - $min > 60) {
			# minutes
			$size = 60;
		} else {
			# seconds
			$size = 15;
		}
		$curr = floor($min / $size) * $size;
	} else if (is_int($min) && is_int($max)) {
		$size = floor(($max - $min) / 10);
		$curr = $min;
	} else {
		$size = ($max - $min) / 10;
		$curr = $min;
	}
	if ($size <= 0) {
		$size = 1;
	}

	$i = 0;
	$returnData = array( 'data' => array(), 'labels' => array() );
	while ($curr <= $max) {
		$returnData['data'][$i] = 0;
		$format = "";
		if (preg_match("/_ymd/", $validationType)) {
			$format = "Y-m-d";
		} else if (preg_match("/_mdy/", $validationType)) {
			$format = "m-d-Y";
		} else if (preg_match("/_dmy/", $validationType)) {
			$format = "d-m-Y";
		}

		if (preg_match("/^datetime/", $validationType)) {
			if (preg_match("/_seconds/", $validationType)) {
				$returnData['labels'][$i] = "[".date($format." h:i:s", $curr)." - ".date($format." h:i:s", ($curr + $size)).")";
			} else {
				$returnData['labels'][$i] = "[".date($format." h:i", $curr)." - ".date($format." h:i", ($curr + $size)).")";
			}
		} else if (preg_match("/^date/", $validationType)) {
			date_default_timezone_set('UTC');
			$returnData['labels'][$i] = "[".date($format, $curr)." - ".date($format, ($curr + $size)).")";
		} else if ($validationType == "time") {
			date_default_timezone_set('UTC');
			$returnData['labels'][$i] = "[".date("h:i:s", $curr)." - ".date("h:i:s", ($curr + $size)).")";
		} else  if (is_int($curr) && is_int($size)) {
			$returnData['labels'][$i] = "[".$curr." - ".($curr + $size).")";
		} else {
			# float - round
			$a = 10;
			while ($size * $a < 1) {
				$a *= 10;
			}
			$returnData['labels'][$i] = "[".(floor($curr * $a) / $a)." - ".(floor(($curr + $size) * $a) / $a).")";
		}
		foreach ($data as $d) {
			if ($d === false || $d === "") {
				continue;
			} else if ($curr <= $d && $curr + $size > $d) {
				$returnData['data'][$i]++;
			}
		}
		$curr += $size; 
		$i++;
	}
	$returnData['labels'][$i] = "Empty";
	$returnData['data'][$i] = 0;
	foreach ($data as $d) {
		if ($d === false || $d === "") {
			$returnData['data'][$i]++;
		}
	}
	return $returnData;
}

echo "</body></html>";

function findUnit($diff, $validationType) {
	$unit = array("unit" => "minute");
	if (preg_match("/^date/", $validationType)) {
		if ($diff > 3600 * 24 * 365 * 100 + 25 * 3600 * 24) {
			# centuries
			$unit = array("unit" => "year");
		} else if ($diff > 3600 * 24 * 365 * 10 + 2.5 * 3600 * 24) {
			# decades
			$unit = array("unit" => "year");
		} else if ($diff > 3600 * 24 * 365 + 0.25 * 3600 * 24) {
			# years
			$unit = array("unit" => "year");
		} else if ($diff > 3600 * 24 * 30) {
			# months
			$unit = array("unit" => "month");
		} else if ($diff > 3600 * 24) {
			# days
			$unit = array("unit" => "day");
		} else {
			$unit = array("unit" => "day");
		}
	} else {
		if ($diff > 3600) {
			# hours 
			$unit = array("unit" => "hour");
		} else {
			# minutes
			$unit = array("unit" => "minute");
		}
	}
	return $unit;
}
