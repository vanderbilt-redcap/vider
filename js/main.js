function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    var components = url.split(/\?/);
    if (components.length == 1) {
        return null;
    }
    var paramPairs = components[1].split(/&/);
    var params = {};
    for (var i = 0; i < paramPairs.length; i++) {
        var a = paramPairs[i].split(/=/);
        if (a.length == 2) {
            params[a[0]] = a[1];
        }
    }
    if (!name) {
        return params;
    }

    name = name.replace(/[\[\]]/g, "\\$;");
    if (typeof params[name] != 'undefined') {
        return decodeURIComponent(params[name].replace(/\+/g, " "));
    }
    return null;
}

/**
 * This method transforms the current URL into a new URL for the given page name
 * assumes that the given page name does not contain http://
 */
function getUrl(page) {
	var params = getParameterByName();
	var url = window.location.href;

	var components = url.split(/\?/);
	var main = components[0];

	var pageTrunk = page.replace(/\.php.*$/, "");

	main += "?pid="+params['pid'];
	if (params['prefix']) {
		main += "&prefix="+params['prefix'];
	} else {
		main += "&id="+params['id'];
	}
	main += "&page="+pageTrunk;
	return main;
}

requirejs.config({
    waitSeconds: 100,
    paths:{
        "jquery": getUrl("bower_components/jquery/dist/jquery.min.js"),
        "split": getUrl("bower_components/Split.js/split.js"),
        "html2csv":getUrl("js/htmltocsv.js"),
        "paging":getUrl("js/paging.js"),
        "bootstrap": getUrl("bower_components/bootstrap/dist/js/bootstrap.min.js"),
        "colorbrewer": getUrl("bower_components/colorbrewer/colorbrewer.js"),
        "d3": getUrl("bower_components/d3/d3.js"),
        "d3-tip": getUrl("bower_components/d3-tip/index.js"),
        "d3-word-cloud": getUrl("js/mainPanel/wordGraph/d3.layout.cloud.js"),
        "loadData":getUrl("js/loadData.js"),
        "redCapData":getUrl("js/redcapData.js"),
        "dataWrapper":getUrl("js/dataWrapper.js"),
        "stateCtrl":getUrl("js/stateCtrl.js"),
        "stateVarCtrl":getUrl("js/stateVarPanel/stateVarCtrl.js"),
        "stateVarData":getUrl("js/stateVarPanel/stateVarData.js"),
        "stateMainCtrl":getUrl("js/stateMainPanel/stateMainCtrl.js"),
        "stateMainData":getUrl("js/stateMainPanel/stateMainData.js"),
        "stateBinCtrl":getUrl("js/stateBin/stateBinCtrl.js"),
        "stateBinData":getUrl("js/stateBin/stateBinData.js"),
        "stateScatterCtrl":getUrl("js/stateScatter/stateScatterCtrl.js"),
        "stateScatterData":getUrl("js/stateScatter/stateScatterData.js"),
        "url":getUrl("js/url.js"),
        "urlModifier":getUrl("js/urlModifier.js"),
        "urlReader":getUrl("js/urlReader.js"),
        "view":getUrl("js/view.js"),
        "viewVariablePanel":getUrl("js/variablePanel/viewVarPanel.js"),
        "viewMainPanel":getUrl("js/mainPanel/viewMainPanel.js"),
        "controller":getUrl("js/controller.js"),
        "rugPlotHandler":getUrl("js/modules/rugPlotHandler.js"),
        "numHistogramHndlr":getUrl("js/modules/numHistogramHndlr.js"),
        "nominalGraphHndlr":getUrl("js/modules/nominalGraphHndlr.js"),
        "categoryPlotHndlr":getUrl("js/modules/categoryPlotHndlr.js"),
        "dataPanel":getUrl("js/dataPanel/viewDataPanel.js"),
        "comparisionPanel":getUrl("js/comparisionPanel/viewComparisionPanel.js"),
        "filterData":getUrl("js/filterData.js"),
        "viewFilterPanel":getUrl("js/filterPanel/viewFilterPanel.js"),
        "nominalView":getUrl("js/mainPanel/nominalGraph/nominalView.js"),
        "nominalController":getUrl("js/mainPanel/nominalGraph/nominalController.js"),
        "viewEventPanel":getUrl("js/filterPanel/viewEventPanel.js"),
        "d3Parsets":getUrl("js/comparisionPanel/parsets.js"),
        "numericalView":getUrl("js/mainPanel/numericalGraph/numericalView.js"),
        "numericalController":getUrl("js/mainPanel/numericalGraph/numericalController.js"),
        "stratifiedController":getUrl("js/mainPanel/stratifiedGraph/stratifiedController.js"),
        "stratifiedView":getUrl("js/mainPanel/stratifiedGraph/stratifiedView.js"),
        "scatterController":getUrl("js/mainPanel/scatterPlot/scatterController.js"),
        "scatterView":getUrl("js/mainPanel/scatterPlot/scatterView.js"),
        "scatterControl":getUrl("js/mainPanel/scatterPlot/scatterControl.js"),
        "scatterViewer":getUrl("js/mainPanel/scatterPlot/scatterViewer.js"),
        "wordCloudController":getUrl("js/mainPanel/wordGraph/wordCloudController.js"),
        "wordCloudView":getUrl("js/mainPanel/wordGraph/wordCloudView.js"),
        "rebinning":getUrl("js/rebinning.js"),
        "global":getUrl("js/global.js"),
        "nominalCheckBoxView":getUrl("js/mainPanel/nominalCheckBoxGraph/nominalCheckBoxView.js"),
        "nominalCheckBoxController":getUrl("js/mainPanel/nominalCheckBoxGraph/nominalCheckBoxController.js")
    },
    shim: {
        "d3-tip":["d3"],
        "d3-word-cloud":["d3"],
        "html2csv":["jquery"],
        "dataPanel":["paging", "jquery"],
        "scatterController":["jquery", "bootstrap"],
        "colorbrewer":["d3-tip","d3"]
    }
});

//this function will load the data
require(["require","controller", "split", "global"],
    function (require,controller, split, global) {

        var self = this;

        //this will split the div of the website accordingly
        Split(['#leftPanel', '#mainPanel'],{sizes: [20, 79], minSize: [410]});
        Split(['#left-top', '#left-bottom'],{direction: 'vertical',gutterSize: 10, sizes: [80, 20]/*, minSize: [200, 100]*/});
	$('#main-top').css({ 'height' : '100%' });
        // Split(['#main-top-left', '#main-top-right'],{gutterSize: 10, sizes: [50, 50]});

        //initialize the controller

        //this will act as a master
        //and controller every thing
        //i.e. every operation goes
        //from this class
        controller.init();

        //this handle the export button click
        $( "#exportCSV" ).click(function() {
            $('#dataTable').table2CSV();
        });



        //this function will check if the
        //settings modal is reloaded with
        //the new
        $("#reload").click(function() {
            loading_screen = window.pleaseWait({
                logo: getUrl("img/content/800px-University_of_Utah_horizontal_logo.png"),
                backgroundColor: '#FFFFFF',
                loadingHtml: "<div>"
                    + "<style scoped>"
                    + "\@import '" + getUrl('css/loadingScreen.css') + "';"
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

            //set the new url for the state
            history.pushState('', 'red cap', global.baseURL + "?");

            //restart the complete interface
            controller.init();
        });

        self.isParallel = true;
        // $("#parallel-sets").click(function(){
            // if(self.isParallel) {
                // $("#main-top-right").css("visibility", "hidden");
                // $('#main-top-left').css('width', '98.5%').css('width', '-=5px');
                // // $('#main-top-right').css('width', '0.5%').css('width', '-=5px');

                // $(this).css("color","#9d9d9d")
            // }
            // else{
                // $("#main-top-right").css("visibility", "visible");
                // $('#main-top-left').css('width', '49.5%').css('width', '-=5px');
                // $('#main-top-right').css('width', '49.5%').css('width', '-=5px');

                // $(this).css("color","white")
            // }

            // require("view").updateNewState(require("stateCtrl").top());
            // self.isParallel = !self.isParallel;
        // })

        //


        self.isDataPanel = true;
        $("#data-panel").click(function(){

            if(self.isDataPanel) {
                $('#main-top').css('height', '100%');

                $(this).css("color","#9d9d9d")
            }
            else{
                $('#main-top').css('height', '100%');

                $(this).css("color","white")
                require("view").updateNewState(require("stateCtrl").top());
            }
            self.isDataPanel = !self.isDataPanel;
        })


        $("#data-panel").click();
        // $("#parallel-sets").click();

});
