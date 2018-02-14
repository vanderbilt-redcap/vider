/**
 * Created by sunny on 2/14/16.
 * Singleton Class
 */
define(["require", "numHistogramHndlr", "nominalGraphHndlr", "dataWrapper",
        "nominalController", "numericalController", "stratifiedController",
        "wordCloudController","rebinning","scatterControl","nominalCheckBoxController"],
    function (require, numHistogramHndlr, nominalGraphHndlr, dataWrapper,
              nominalController, numericalController, stratifiedController,
              wordCloudController, rebinning,scatterControl, nominalCheckBoxController) {

        /**
         * This class is responsible for the modifiying the intruments
         * on the ui
         * @type {null}
         */


        var instance = null;
        var varToD3Container = {};

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function ViewMainPanel() {
            var self = this;
            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one ViewMainPanel, use " +
                    "ViewMainPanel.getInstance()");
            }

            self.isQueried = {};
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        ViewMainPanel.getInstance = function () {
            var self = this;

            // gets an instance of the singleton. It is better to use
            if (instance === null) {

                instance = new ViewMainPanel();
            }
            return instance;
        };

        /**
         *
         * @param obj
         * @returns {*}
         */
        ViewMainPanel.prototype.getDataType = function (obj) {
            var self = this;

            var fieldType = obj.field_type;
            var validationType = obj.text_validation_type_or_show_slider_number;
            if (fieldType == "text" && (validationType === "number" || validationType === "integer" || validationType.match(/^date/))) {
                return "NUMERICAL";
            }
            else if (fieldType === "dropdown" || fieldType === "radio") {
                return "CATEGORICAL";
            }
            else if (fieldType === "checkbox") {
                return "CHECKBOX_CATEGORICAL";
            }
            return null;
        }



        /**
         * this will create container for the graphs
         * @param _formName
         * @param _variableName
         * @returns {*|boolean}
         */
        ViewMainPanel.prototype.createContainer = function (_formName, _variableName) {

            var self = this;

            var varLabel = self.data[_formName].fields[_variableName].obj.field_label;
            var validation = self.data[_formName].fields[_variableName].obj.text_validation_type_or_show_slider_number;
            var data = self.data[_formName].fields[_variableName].data;
            var dataType = self.getDataType(self.data[_formName].fields[_variableName].obj);
            var newLabel = varLabel.substring(0, 60);
            if (varLabel.length > 60) {
                newLabel = newLabel + "...";
            }

            //this will create the container
            if (!varToD3Container.hasOwnProperty(_formName)) {
                varToD3Container[_formName] = {
                    variables: {}
                }
            }

            if (!varToD3Container[_formName].variables.hasOwnProperty(_variableName)) {

                //call the numerical histogram handler
                var margin = {top: 40, right: 20, bottom: 30, left: 40},
                    width = 400 - margin.left - margin.right,
                    height = 200 - margin.top - margin.bottom;

                if (!self.isQueried.hasOwnProperty(_formName)) {
                    self.isQueried[_formName] = {
                        variable: {}
                    }
                }

                if (!self.isQueried[_formName].variable.hasOwnProperty(_variableName)) {
                    self.isQueried[_formName].variable[_variableName] = {
                        status: true
                    }
                }

                var sel = d3.select(".table-responsive")
                    .append("div")
                    .classed("graph-outer", true);


                var div = sel.append("div").classed("header", true);
                //appending header
                div.append("h3").text(function () {
                    return stripHtml(varLabel);
                })

                var oprDiv = div.append("div").classed("col-xs-8", true);

                //if numerical then add rebinning icon
                if (dataType === "NUMERICAL" && !validation.match(/^date/)) {

                    //task
                    oprDiv.append("div")
                        .classed("col-xs-1", true)
                        .append("a").attr("data-toggle","tooltip").attr("title","Re-Categorize")
                        .append("span")
                        .attr("class", "glyphicon glyphicon-object-align-left")
                        .on("click", function () {
                            self.rebinning(oprDiv,data,_formName,_variableName);
                        })
                        .on("dblclick", function () {
                            rebinning.remove(_formName,_variableName);
                        });
                }
                else if (dataType !== "CHECKBOX_CATEGORICAL") {

                    //task
                    oprDiv.append("div")
                        .classed("col-xs-1", true)
                        .append("a").attr("data-toggle","tooltip").attr("title","Reset Cloud")
                        .append("span")
                        .attr("class", "glyphicon glyphicon-retweet")
                        .on("click", function () {
                            var data = require("stateCtrl").top();
                            if(data.binPanel != null){
                                data.binPanel.param = data.binPanel.param.filter(function(el){
                                    return !(el.form === _formName && el.var === _variableName);
                                })
                            }
                            require("view").updateNewState(data);
                        });
                }

                //task
                if (!validation.match(/^date/)) {
                    oprDiv.append("div")
                        .classed("col-xs-1", true)
                        .append("a").attr("data-toggle","tooltip").attr("title","Show All Data Distribution")
                        .append("span")
                        .attr("class", "glyphicon glyphicon-tasks")
                        .on("click", function () {
                            if (self.isQueried[_formName].variable[_variableName].status == false) {
                                self.isQueried[_formName].variable[_variableName].status = true;
                            }
                            else {
                                self.isQueried[_formName].variable[_variableName].status = false;
                            }
                            require("view").updateNewState(require("stateCtrl").top());
                        });
                }

                //remove
                oprDiv.append("div")
                    .classed("col-xs-1", true)
                    .append("a").attr("data-toggle","tooltip").attr("title","Remove")
                    .append("span")
                    .attr("class", "glyphicon glyphicon-remove")
                    .on("click", function () {
                        var curStateData = require("stateCtrl").top();
                        curStateData.mainPanel.param = curStateData.mainPanel.param.filter(function (el) {
                            return !(el.formName === _formName && el.variableName === _variableName);
                        })
                        require("view").updateNewState(curStateData);
                    });

                //input
                oprDiv.append("div")
                    .classed("inputdiv col-xs-9", true);


                var svgDiv = sel.append("div").classed("col-xs-12", true);

                varToD3Container[_formName].variables[_variableName] = {
                    container: sel,
                    htmlDiv: svgDiv,
                    status: false
                }
            }

            //return the new container or the laready created one
            return varToD3Container[_formName].variables[_variableName];
        }

        /**
         * this will create the scatter plot
         * with respect to
         * @param form1
         * @param variable1
         * @param form2
         * @param variable2
         * @returns {*}
         */
        ViewMainPanel.prototype.createScatterContainer = function (form1,var1, form2, var2) {

            var self = this;

            var _formName = form1 + form2; //form the unique combination
            var _variableName = var1 +  var2; //form the unique combination

            //this will create the container
            if (!varToD3Container.hasOwnProperty(_formName)) {
                varToD3Container[_formName] = {
                    variables: {}
                }
            }

            if (!varToD3Container[_formName].variables.hasOwnProperty(_variableName)) {

                //call the numerical histogram handler
                var margin = {top: 40, right: 20, bottom: 30, left: 40},
                    width = 400 - margin.left - margin.right,
                    height = 200 - margin.top - margin.bottom;

                if (!self.isQueried.hasOwnProperty(_formName)) {
                    self.isQueried[_formName] = {
                        variable: {}
                    }
                }

                if (!self.isQueried[_formName].variable.hasOwnProperty(_variableName)) {
                    self.isQueried[_formName].variable[_variableName] = {
                        status: true
                    }
                }

                var sel = d3.select(".table-responsive")
                    .append("div")
                    .classed("graph-outer", true);

                var div = sel.append("div").classed("header", true);

                div.append("h3").text(function () {
                    return "Scatter Plot";
                })

                var oprDiv = div.append("div").classed("col-xs-8", true);

                //task
                oprDiv.append("div")
                    .classed("col-xs-1", true)
                    .append("a").attr("data-toggle","tooltip").attr("title","Filter Brush")
                    .append("span")
                    .attr("class", "glyphicon glyphicon-hand-up")
                    .on("click", function () {
                        self.isQueried[_formName].variable[_variableName].status
                            = !self.isQueried[_formName].variable[_variableName].status
                        require("view").updateNewState(require("stateCtrl").top());
                    });

                //remove
                oprDiv.append("div")
                    .classed("col-xs-1", true)
                    .append("a").attr("data-toggle","tooltip").attr("title","Remove")
                    .append("span")
                    .attr("class", "glyphicon glyphicon-remove")
                    .on("click", function () {
                        var curStateData = require("stateCtrl").top();
                        curStateData.scatterPanel.param = curStateData.scatterPanel.param.filter(function (el) {
                            return !(el.form1 === form1 && el.form2 === form2
                                    && el.var1 === var1 && el.var2 === var2 );
                        })
                        require("view").updateNewState(curStateData);
                    });

                //input
                oprDiv.append("div")
                    .classed("inputdiv col-xs-9", true);

                var svgDiv = sel.append("div").classed("col-xs-12", true);

                varToD3Container[_formName].variables[_variableName] = {
                    container: sel,
                    htmlDiv: svgDiv,
                    status: true
                }
            }

            //return the new container or the laready created one
            return varToD3Container[_formName].variables[_variableName];
        }
        /**
         *
         * @param _mainPanelData
         */
        ViewMainPanel.prototype.update = function (latestStateData) {
            var self = this;

            var mainPanelParam = latestStateData.mainPanel.param;
            var scatterPanelParam = latestStateData.scatterPanel.param;
            var data = latestStateData.mainPanel.data;
            self.data = latestStateData.mainPanel.data;

            //remove all the unwanted div from the main panel
            for (var f in varToD3Container) {
                for (var v in varToD3Container[f].variables) {
                    varToD3Container[f].variables[v].status = false;
                }
            }

            //divide the data over here
            mainPanelParam.forEach(function (d) {

                //over here check for the data type
                //if the data is numerical go for the
                //histogram
                var fieldType = data[d.formName].fields[d.variableName].obj.field_type;
                var validationType = data[d.formName].fields[d.variableName].obj.text_validation_type_or_show_slider_number;

                //todo added for temporary purpose
                if (fieldType === "text" && (validationType === "number" || validationType === "integer" || validationType.match(/^date/))) {
                    var container = self.createContainer(d.formName, d.variableName);
                    var isQueried = self.isQueried[d.formName].variable[d.variableName].status;
                    numericalController.create(d, data, container.htmlDiv, isQueried);
                }
                else if (fieldType === "dropdown" || fieldType === "radio") {
                    var container = self.createContainer(d.formName, d.variableName);
                    var isQueried = self.isQueried[d.formName].variable[d.variableName].status;
                    nominalController.create(d, data, container.htmlDiv, isQueried);
                }
                else if (fieldType === "checkbox") {
                    var container = self.createContainer(d.formName, d.variableName);
                    var isQueried = self.isQueried[d.formName].variable[d.variableName].status;
                    nominalCheckBoxController.create(d, data, container.htmlDiv, isQueried);
                }
                else if(fieldType === "text"){
                    var container = self.createContainer(d.formName, d.variableName);
                    var isQueried = self.isQueried[d.formName].variable[d.variableName].status;
                    wordCloudController.create(d, data, container.htmlDiv, isQueried);
                }

                //mark the form and variables to delete
                if (varToD3Container.hasOwnProperty(d.formName)
                    && varToD3Container[d.formName].variables.hasOwnProperty(d.variableName)) {
                    varToD3Container[d.formName].variables[d.variableName].status = true;
                }
            });

            ///////////////////////////////////////////////////////
            // todo read the data structure of the scatter plot
            ///////////////////////////////////////////////////////

            scatterPanelParam.forEach(function(d){
                var container = self.createScatterContainer(d.form1, d.var1, d.form2, d.var2);
                var isQueried = self.isQueried[d.form1+d.form2].variable[d.var1+d.var2].status;
                scatterControl.create(d,self.data,container.htmlDiv,isQueried);

                //mark the form and variables to delete
                if (varToD3Container.hasOwnProperty(d.form1+d.form2)
                    && varToD3Container[d.form1+d.form2].variables.hasOwnProperty(d.var1+d.var2)) {
                    varToD3Container[d.form1+d.form2].variables[d.var1+d.var2].status = true;
                }
            })


            //remove all the unwanted div from the main panel
            for (var f in varToD3Container) {
                for (var v in varToD3Container[f].variables) {
                    if (varToD3Container[f].variables[v].status == false) {
                        varToD3Container[f].variables[v].container.remove();
                        delete varToD3Container[f].variables[v];
                    }
                }
            }
        }

        /**
         *
         * @param data
         * @param obj
         */
        ViewMainPanel.prototype.getNumericalCategories = function (data) {
            var self = this;

            var domain = d3.scale.linear()
                .domain([Math.min.apply(Math, data),
                    Math.max.apply(Math, data)]);

            var yTotalData = d3.layout.histogram()
                .bins(domain.ticks(10))//this will take the partitions
                (data);

            return yTotalData;
        }

        /**
         *
         * @param outerGraph
         * @param data
         * @param _form
         * @param _var
         */
        ViewMainPanel.prototype.rebinning = function (outerGraph,data,_form,_var) {
            var self = this;

            var d = "";
            var finalVal = "";
            var categories = self.getNumericalCategories(data);
            categories.forEach(function(cat){
                d += cat.x + "-" + (cat.x + cat.dx) + ",";
            })

            if(d.length != 0){
                d = d.substr(0, d.length-1);
            }

            var oprDiv = outerGraph.select(".inputdiv").selectAll("div").data([d]);
            oprDiv.enter().append("div").classed("col-xs-8",true);
            oprDiv.exit().remove();

            var inpDiv = oprDiv.selectAll(".col-xs-9")
                .data(function (d) {
                    return [d];
                });
            inpDiv.enter().append("div")
                .classed("col-xs-9", true)
                .append("input")
                .attr("type", "text")
                .classed("form-control", true)
                .attr("id", "input-xs")
                .attr("size", 3)
                .attr("value", function (d) {
                    this.value = d;
                    finalVal = this.value;
                })
                .on("input", function () {
                    finalVal = this.value;
                });
            inpDiv.select("input")
                .classed("col-xs-9", true)
                .attr("type", "text")
                .classed("form-control", true)
                .attr("id", "input-xs")
                .attr("size", 3)
                .attr("value", function (d) {
                    this.value = d;
                    finalVal = this.value;
                })
                .on("input", function () {
                    finalVal = this.value;
                });

            var execute = oprDiv.selectAll(".execute .col-xs-2")
                .data(function (d) {
                    return [d];
                });

            execute.enter().append("div")
                .classed("execute", true)
                .append("span")
                .attr("class", "glyphicon glyphicon-ok")
                .on("click", function () {
                    rebinning.add(_form,_var,finalVal);
                    require("view").updateNewState(require("stateCtrl").top());
                });

            execute.classed("execute", true)
                .select("span")
                .attr("class", "glyphicon glyphicon-ok")
                .on("click", function () {
                    rebinning.add(_form,_var,finalVal);
                    require("view").updateNewState(require("stateCtrl").top());

                    //remove the selected element
                    d3.select(this).remove();
                    inpDiv.remove();
                });

        }

        return ViewMainPanel.getInstance();
    });
