/**
 * Created by sunny on 3/7/16.
 */
define(["jquery", "d3",  "d3-tip", "filterData", "global"],
    function ($, d3, d3tip, filterData, global) {

        /**
         * This class is responsible for the modifiying the intruments
         * on the ui
         * @type {null}
         */
        var instance = null;
        var data = [];
        var AND = 0;
        var OR = 2;
        var NOT = 3;

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function ViewFilterPanel() {
            var self = this;
            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one ViewFilterPanel, use ViewFilterPanel.getInstance()");
            }
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        ViewFilterPanel.getInstance = function () {
            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new ViewFilterPanel();
            }
            return instance;
        };

        /**
         * initialize the view with the
         * state event handler
         * @param _stateEventHndlr
         */
        ViewFilterPanel.prototype.init = function (_data) {
            var self = this;

            self.data = _data;
            self.tip = global.tips.filterTip;
        }

        /**
         *
         */
        ViewFilterPanel.prototype.stratify = function () {
            var self = this;


            var stratData = [];
            var stratObj = require("filterData").getStrat();
            if (stratObj.isStrat) {
                var obj = self.data[stratObj.form].fields[stratObj.variable].obj;
                var stratLabel = obj.field_label;
                stratLabel = stratLabel.length < 30 ? stratLabel : stratLabel.substr(0, 27) + "...";
                stratData.push(stratLabel);
            }

            var filterPanel = d3.select("#filterTable");

            var srow = filterPanel.selectAll(".stratby").data(stratData)
            var enterSRow = srow.enter().append("tr").classed("stratby",true);
            enterSRow.append("td")
                .classed("filter-opr",true)
                .text("Stratify By");
            enterSRow.append("td")
                .classed("filter-var",true)
                .text(function(d){
                    return d;
                });
            enterSRow.append("td")
                .classed("filter-sel",true)
                .text("NA");
            enterSRow.append("td")
                .classed("filter-remove",true)
                .append("i")
                .classed("fa fa-times",true)
                .attr("aria-hidden","true")
                .on("click", function (d) {
                    require("filterData").removeStrat();
                    require("view").updateNewState(require("stateCtrl").top());
                });

            srow.select(".filter-opr")
                .text("Stratify By");

            srow.select(".filter-var")
                .text(function(d){
                    return d;
                });

            srow.select(".filter-sel")
                .text(function(d){
                    return "NA";
                });

            srow.select(".fa")
                .attr("aria-hidden","true")
                .on("click", function (d) {
                    require("filterData").removeStrat();
                    require("view").updateNewState(require("stateCtrl").top());
                });

            srow.exit().remove();

            var colorByMap = require("filterData").getColorByScale();
            var colorByNodes = d3.select(".colorByPanel").selectAll(".colorByNodes").data(d3.values(colorByMap));
            colorByNodes.enter().append("span")




            var colorData = [];
            var colorByObj = require("filterData").getColorBy();
            if (colorByObj.isColorBy) {
                var obj = self.data[colorByObj.form].fields[colorByObj.variable].obj;
                var colorByLabel = obj.field_label;
                //colorByLabel = colorByLabel.length < 30 ? colorByLabel : colorByLabel.substr(0, 27) + "...";
                colorData.push(colorByLabel);
            }

            var crow = filterPanel.selectAll(".colorby").data(colorData)
            var enterCRow = crow.enter().append("tr").classed("colorby",true);
            enterCRow.append("td")
                .classed("filter-opr",true)
                .text("Color By");
            enterCRow.append("td")
                .classed("filter-var",true)
                .text(function(d){
                    return d;
                });
            enterCRow.append("td")
                .classed("filter-sel",true)
                .text("NA");
            enterCRow.append("td")
                .classed("filter-remove",true)
                .append("i")
                .classed("fa fa-times",true)
                .attr("aria-hidden","true")
                .on("click", function (d) {
                    require("filterData").remColorBy();
                    require("view").updateNewState(require("stateCtrl").top());
                });

            crow.select(".filter-opr")
                .text("Color By");
            crow.select(".filter-var")
                .text(function(d){
                    return d;
                });
            crow.select(".filter-sel")
                .text(function(d){
                    return "NA";
                });
            crow.select(".fa")
                .attr("aria-hidden","true")
                .on("click", function (d) {
                    require("filterData").remColorBy();
                    require("view").updateNewState(require("stateCtrl").top());
                });

            crow.exit().remove();



        }


        /**
         * initialize the view with the
         * state event handler
         * @param _stateEventHndlr
         */
        ViewFilterPanel.prototype.update = function () {
            var self = this;

            //this will call the stratify function
            self.stratify();

            self.forms = require("filterData").getQueryVarMap();
            var selectionArr = [];
            for (var f in self.forms) {
                for (var v in self.forms[f].variables) {
                    for(var s in self.forms[f].variables[v].selections){
                        var selection = self.forms[f].variables[v].selections[s];
                        selectionArr.push(selection);
                    }
                }
            }

            var filterPanel = d3.select("#filterTable");
            var row = filterPanel.selectAll(".fil").data(selectionArr)
            var enterRow = row.enter().append("tr").classed("fil",true);
            enterRow.append("td")
                .classed("filter-opr",true)
                .text(function(d){
                    if(d.opr == AND) {
                        return "And";
                    }
                    else if(d.opr == NOT) {
                        return "Not";
                    }
                    else if(d.opr == OR) {
                        return "Or";
                    }
                    return "";
                });
            enterRow.append("td")
                .classed("filter-var",true)
                .text(function(d){
                    var variable = self.forms[d.form].variables[d.var];
                    return variable.label;
                    //return variable.label.length > 20 ? variable.label.substr(0,17) + "..." : variable.label;
                });
            enterRow.append("td")
                .classed("filter-sel",true)
                .text(function(d){
                    return d.label;
                    //return d.label.length > 20 ? d.label.substr(0,17) + "..." : d.label;
                });
            enterRow.append("td")
                .classed("filter-remove",true)
                .append("i")
                .classed("fa fa-times",true)
                .attr("aria-hidden","true")
                .on("click", function (d) {
                    //this will filter the data accordingly
                    filterData.remove(d.form, d.var, d.value, 8);
                    //add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top());
                });

            row.select(".filter-opr")
                .text(function(d){
                if(d.opr == AND) {
                    return "And";
                }
                else if(d.opr == NOT) {
                    return "Not";
                }
                else if(d.opr == OR) {
                    return "Or";
                }
                return "";
            });
            row.select(".filter-var")
                .text(function(d){
                    var variable = self.forms[d.form].variables[d.var];
                    return variable.label;
                    //return variable.label.length > 20 ? variable.label.substr(0,17) + "..." : variable.label;
                });
            row.select(".filter-sel")
                .text(function(d){
                    return d.label;
                    //return d.label.length > 20 ? d.label.substr(0,17) + "..." : d.label;
                });
            row.select(".fa")
                .attr("aria-hidden","true")
                .on("click", function (d) {
                    //this will filter the data accordingly
                    filterData.remove(d.form, d.var, d.value, 8);
                    //add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top());
                });

            row.exit().remove();





            var svg = d3.select(".dataDistPanel");
            svg.call(self.tip);

            //this will show the distribution of data
            var queryOut = require("filterData").getQuery();
            if (queryOut != null) {
                var total = queryOut.length;
                var count = 0;
                queryOut.forEach(function (d) {
                    if (d == true) {
                        count++;
                    }
                });

                var divWidth = $(".dataDistPanel").width();
                var countColor = (divWidth / total) * count;
                var percentage = (countColor/divWidth) * 100;
                var con = d3.select(".dataDistPanel")
                    .selectAll("rect")
                    .data([{
                        width: countColor,
                        percent: percentage
                    }]);

                con.exit().remove();

                con.attr("x", 0)
                    .attr("y", 0)
                    .attr("height", 5)
                    .style("fill", 'grey')
                    .on("mouseover",self.tip.show)
                    .on("mouseout",self.tip.hide)
                    .transition().duration(5000)
                    .attr("width", function (d) {
                        return d.width;
                    });

                con.enter().append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("height", 5)
                    .style("fill", 'grey')
                    .attr("width", 0)
                    .on("mouseover",self.tip.show)
                    .on("mouseout",self.tip.hide)
                    .transition().duration(5000)
                    .attr("width", function (d) {
                        return d.width;
                    });
            }

        }

        //return the singleton instance
        return ViewFilterPanel.getInstance();

    });