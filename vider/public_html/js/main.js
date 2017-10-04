requirejs.config({
    waitSeconds: 100,
    paths:{
        "jquery": "../../bower_components/jquery/dist/jquery.min",
        "split":"../../bower_components/Split.js/split",
        "html2csv":"../../public_html/js/utility/htmltocsv",
        "paging":"../../public_html/js/utility/paging",
        "bootstrap": "../../bower_components/bootstrap/dist/js/bootstrap.min",
        "colorbrewer": "../../bower_components/colorbrewer/colorbrewer",
        "d3": "../../bower_components/d3/d3",
        "d3-tip": "../../bower_components/d3-tip/index",
        "d3-word-cloud": "../../public_html/js/view/mainPanel/wordGraph/d3.layout.cloud",
        "loadData":"../../public_html/js/utility/loadData",
        "redCapData":"../../public_html/js/data/redcapData",
        "dataWrapper":"../../public_html/js/data/dataWrapper",
        "stateCtrl":"../../public_html/js/state/stateCtrl",
        "stateVarCtrl":"../../public_html/js/state/stateVarPanel/stateVarCtrl",
        "stateVarData":"../../public_html/js/state/stateVarPanel/stateVarData",
        "stateMainCtrl":"../../public_html/js/state/stateMainPanel/stateMainCtrl",
        "stateMainData":"../../public_html/js/state/stateMainPanel/stateMainData",
        "stateBinCtrl":"../../public_html/js/state/stateBin/stateBinCtrl",
        "stateBinData":"../../public_html/js/state/stateBin/stateBinData",
        "stateScatterCtrl":"../../public_html/js/state/stateScatter/stateScatterCtrl",
        "stateScatterData":"../../public_html/js/state/stateScatter/stateScatterData",
        "url":"../../public_html/js/url/url",
        "urlModifier":"../../public_html/js/url/urlModifier",
        "urlReader":"../../public_html/js/url/urlReader",
        "view":"../../public_html/js/view/view",
        "viewVariablePanel":"../../public_html/js/view/variablePanel/viewVarPanel",
        "viewMainPanel":"../../public_html/js/view/mainPanel/viewMainPanel",
        "controller":"../../public_html/js/controller",
        "rugPlotHandler":"../../public_html/js/view/modules/rugPlotHandler",
        "numHistogramHndlr":"../../public_html/js/view/modules/numHistogramHndlr",
        "nominalGraphHndlr":"../../public_html/js/view/modules/nominalGraphHndlr",
        "categoryPlotHndlr":"../../public_html/js/view/modules/categoryPlotHndlr",
        "dataPanel":"../../public_html/js/view/dataPanel/viewDataPanel",
        "comparisionPanel":"../../public_html/js/view/comparisionPanel/viewComparisionPanel",
        "filterData":"../../public_html/js/data/filterData",
        "viewFilterPanel":"../../public_html/js/view/filterPanel/viewFilterPanel",
        "nominalView":"../../public_html/js/view/mainPanel/nominalGraph/nominalView",
        "nominalController":"../../public_html/js/view/mainPanel/nominalGraph/nominalController",
        "viewEventPanel":"../../public_html/js/view/filterPanel/viewEventPanel",
        "d3Parsets":"../../public_html/js/view/comparisionPanel/parsets",
        "numericalView":"../../public_html/js/view/mainPanel/numericalGraph/numericalView",
        "numericalController":"../../public_html/js/view/mainPanel/numericalGraph/numericalController",
        "stratifiedController":"../../public_html/js/view/mainPanel/stratifiedGraph/stratifiedController",
        "stratifiedView":"../../public_html/js/view/mainPanel/stratifiedGraph/stratifiedView",
        "scatterController":"../../public_html/js/view/mainPanel/scatterPlot/scatterController",
        "scatterView":"../../public_html/js/view/mainPanel/scatterPlot/scatterView",
        "scatterControl":"../../public_html/js/view/mainPanel/scatterPlot/scatterControl",
        "scatterViewer":"../../public_html/js/view/mainPanel/scatterPlot/scatterViewer",
        "wordCloudController":"../../public_html/js/view/mainPanel/wordGraph/wordCloudController",
        "wordCloudView":"../../public_html/js/view/mainPanel/wordGraph/wordCloudView",
        "rebinning":"../../public_html/js/data/rebinning",
        "global":"../../public_html/js/data/global",
        "nominalCheckBoxView":"../../public_html/js/view/mainPanel/nominalCheckBoxGraph/nominalCheckBoxView",
        "nominalCheckBoxController":"../../public_html/js/view/mainPanel/nominalCheckBoxGraph/nominalCheckBoxController"
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
        Split(['#leftPanel', '#mainPanel'],{gutterSize: 10, sizes: [20 , 80], minSize: [410]});
        Split(['#left-top', '#left-bottom'],{direction: 'vertical',gutterSize: 10, sizes: [60, 40]/*, minSize: [200, 100]*/});
        Split(['#main-top', '#main-bottom'],{direction: 'vertical',gutterSize: 10, sizes: [75, 25]/*, minSize: [600, 100]*/});
        Split(['#main-top-left', '#main-top-right'],{gutterSize: 10, sizes: [50, 50]});

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
                logo: "public_html/img/content/800px-University_of_Utah_horizontal_logo.png",
                backgroundColor: '#FFFFFF',
                loadingHtml: "<div>"
                    + "<style scoped>"
                    + "\@import '\/public_html\/css\/loadingScreen.css';"
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
        $("#parallel-sets").click(function(){
            if(self.isParallel) {
                //$("#main-top-right").css("visibility", "hidden");
                $('#main-top-left').css('width', '98.5%').css('width', '-=5px');
                $('#main-top-right').css('width', '0.5%').css('width', '-=5px');

                $(this).css("color","#9d9d9d")
            }
            else{
                //$("#main-top-right").css("visibility", "visible");
                $('#main-top-left').css('width', '49.5%').css('width', '-=5px');
                $('#main-top-right').css('width', '49.5%').css('width', '-=5px');

                $(this).css("color","white")
            }

            require("view").updateNewState(require("stateCtrl").top());
            self.isParallel = !self.isParallel;
        })

        //

        $('#main-bottom').css('width', '95%').css('width', '-=5px');


        self.isDataPanel = true;
        $("#data-panel").click(function(){

            if(self.isDataPanel) {
                $("#main-bottom").css("visibility", "hidden");
                $('#main-top').css('height', '100%').css('height', '-=5px');
                $('#main-bottom').css('height', '0px');

                $(this).css("color","#9d9d9d")
            }
            else{
                $("#main-bottom").css("visibility", "hidden");
                $('#main-top').css('height', '100%').css('height', '-=5px');
                $('#main-bottom').css('height', '0px');

                $(this).css("color","white")
                require("view").updateNewState(require("stateCtrl").top());
            }
            self.isDataPanel = !self.isDataPanel;
        })


        $("#data-panel").click();
        $("#parallel-sets").click();

});
