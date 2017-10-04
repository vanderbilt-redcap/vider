/**
 * Created by sunny on 2/14/16.
 */
define(["d3","stateCtrl", "viewVariablePanel", "rugPlotHandler",
        "numHistogramHndlr", "viewMainPanel", "viewFilterPanel",
        "viewEventPanel","dataPanel", "comparisionPanel", "scatterController"],
    function (d3,stateCtrl, viewVarPanel, rugPlotHandler,
              numHistogramHndlr, viewMainPanel, viewFilterPanel,
              viewEventPanel, dataPanel, comparisionPanel, scatter) {

        /**
         * This class is responsible for the modifiying the intruments
         * on the ui
         * @type {null}
         */

        var instance = null;
        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function View() {
            var self = this;
            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one View, use View.getInstance()");
            }
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        View.getInstance = function () {
            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new View();
            }
            return instance;
        };

        /**
         *  this will reset the view to default state
         */
        View.prototype.reset = function(){
            var self = this;
            self.clicked = false;
        };

        /**
         * initialize the view with the
         * state event handler
         * @param _stateEventHndlr
         */
        View.prototype.init= function(_stateEventHndlr){
            var self = this;

            self.varPanelData = {}
            self.stateEventHndlr = _stateEventHndlr;
            self.svg = d3.select("#mainPanel");

            var surveryData = stateCtrl.top().mainPanel.data;
            self.clicked = false;

            //this will set the filter panel
            //with the data
            viewFilterPanel.init( surveryData );
            viewEventPanel.init();

            self.addComboBoxData( surveryData );

            // 308EB88F77DCF662827EC71208BCC58A
            //update the view with the top
            //state data
            self.update();

        }

        /**
         *
         * @param data
         */
        View.prototype.addComboBoxData = function(forms){
            var numericalObjs = [];
            var xAxis = d3.select("#xAxis");
            var yAxis = d3.select("#yAxis");

            xAxis.selectAll("*").remove();
            xAxis.selectAll("*").remove();

            for(var form  in forms){
                for(var variable in forms[form].fields){
                    var obj = forms[form].fields[variable].obj;
                    var fieldType = obj.field_type;
                    var validationType = obj.text_validation_type_or_show_slider_number;
                    if (fieldType == "text" && (validationType=== "number" || validationType === "integer")){
                        numericalObjs.push(obj);

                        xAxis.append("option")
                            .attr("value",form+";"+variable)
                            .text(obj.field_label)

                        yAxis.append("option")
                            .attr("value",form+";"+variable)
                            .text(obj.field_label);
                    }
                }
            }

            if (numericalObjs.length == 0) {
                xAxis.hide();
                yAxis.hide();
                $('#scatterMessage').html('You must have a number/integer field validation type setup for a text box in order for this feature to have data to process.');
            }

            d3.select("#addScatterPlot")
                .on("click",function(){
                    var xArr = xAxis.node().value.split(";");
                    var yArr = yAxis.node().value.split(";");
                    stateCtrl.top().scatterPanel.param.push({
                        "form1":xArr[0],
                        "form2":yArr[0],
                        "var1":xArr[1],
                        "var2":yArr[1]
                    })
                    require("view").updateNewState(stateCtrl.top());
                });
        }

        /**
         * main function for the view
         *
         */
        View.prototype.update = function (_data) {
            var self = this;

            //self.filterData = require("filterData").getQuery();
            var latestStateData = stateCtrl.top();

            //todo step - 1 change the data
            viewMainPanel.update(latestStateData);

            //filter panel
            viewFilterPanel.update();

            //update the event panel
            viewEventPanel.update();

            //get the require data from the state control class
            var variableData = stateCtrl.top()["varPanel"].data;
            var selectedVariablePar = stateCtrl.top()["mainPanel"].param;

            $( "#createScatter" ).off('click').on('click', function() {
                scatter.init(variableData, selectedVariablePar);
                self.clicked = true;
                $('#createScatter').prop('disabled', true);
            });

            if(self.clicked){
                scatter.create();
                //scatter.update(self.filterData);
            }

            self.varPanelData = viewVarPanel.wrangleData(variableData,selectedVariablePar);
            viewVarPanel.initPanel(self.varPanelData, self.svgElement);

            if(_data === undefined){
                self.filterData = require("filterData").getQuery();
            }
            else{
                self.filterData = _data;
            }

            var compData = stateCtrl.top()["mainPanel"];

            self.dataPanelVals = dataPanel.wrangleData(compData);

            dataPanel.initPanel(self.dataPanelVals, self.filterData);

            self.comparisionPavelVals = comparisionPanel.wrangleData(compData, self.filterData);
            comparisionPanel.init();

        }

        /**
         * this function will be called when
         * the new state is required
         * todo: parameter of the same type as URL parameter received stateCtrl.top()
         */
        View.prototype.updateNewState = function(_parameter){
            var self = this;

            self.stateEventHndlr.stateChanged(_parameter);
        }

        return View.getInstance();

    });

function stripHtml(html) {
    if (!html) {
        return "";
    }
    var str = html;
    while (str.match(/<.+>/)) {
        str = str.replace(/<[^>]+>/, "");
    }
    return str;
}
