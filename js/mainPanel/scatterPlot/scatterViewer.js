0/**
 * Created by sunny on 10/14/16.
 */
define(["jquery", "d3", "d3-tip", "colorbrewer", "filterData", "global"], function ($, d3, d3tip, colorbrewer, filterData, global) {

    var stratData;
    var sel;
    var max =  Number.MIN_VALUE;
    var FILTER ={
        HOVER: 0,
        CLICK: 1,
        SELECTION: 2,
        DEFAULT: 3,
        UNCLICK: 4,
        UNHOVER: 5,
        NONE:6,
        CTRLCLICK:7
    }
    var transDuration = 1000;
    //call the numerical histogram handle
    this.lastKeyPressed = -1;
    var isBrushEnabled;
    var xLabel;
    var yLabel;

    var getFormattedDate = function (unixTs, validation) {
        var d = new Date(unixTs * 1000);
        var year = d.getFullYear();
        var month = ("0" + (d.getMonth() + 1)).substr(-2);
        var day = ("0" + (d.getDate())).substr(-2);

        var hours = ("0" + d.getHours()).substr(-2);
        var minutes = ("0" + d.getMinutes()).substr(-2);
        var seconds = ("0" + d.getSeconds()).substr(-2);

        if (validation == "date_ymd") {
            return year + "-" + month + "-" + day;
        }
        if (validation == "date_dmy") {
            return day + "-" + month + "-" + year;
        }
        if (validation == "date_mdy") {
            return month + "-" + day + "-" + year;
        }
        if (validation == "datetime_ymd") {
            return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_dmy") {
            return day + "-" + month + "-" + year + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_mdy") {
            return month + "-" + day + "-" + year + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_seconds_ymd") {
            return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        }
        if (validation == "datetime_seconds_dmy") {
            return day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
        }
        if (validation == "datetime_seconds_mdy") {
            return month + "-" + day + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
        }
    };

    var init = function () {
        var self = this;

        var textWidth = 80;
        var margin = {top: 40, right: 20, bottom: 60, left: 80},
            width = 750 - margin.left - margin.right,
            height = 500;

        // disqualify date values with 0. Assume that no one has a midnight 1-1-1970 date.

        //find the x min value
        var minXValue = Number.MAX_VALUE;
        stratData.forEach(function(strat){
            strat.data.forEach(function(d){
                if((minXValue > d.x) && (d.x !== "")){
                    if ((d.x !== 0) || !strat.xValidation.match(/^date/)) {
                        minXValue = d.x;
                    }
                }
            })
        })

        //find the x max value
        var maxXValue = Number.MIN_VALUE;
        stratData.forEach(function(strat){
            strat.data.forEach(function(d){
                if(maxXValue < d.x){
                    if ((d.x !== 0) || !strat.xValidation.match(/^date/)) {
                        maxXValue = d.x;
                    }
                }
            })
        })

        //find the y min value
        var minYValue = Number.MAX_VALUE;
        stratData.forEach(function(strat){
            strat.data.forEach(function(d){
                if((minYValue > d.y) && (d.y !== "")) {
                    if ((d.y !== 0) || !strat.yValidation.match(/^date/)) {
                        minYValue = d.y;
                    }
                }
            })
        })

        //find the y max value
        var maxYValue = Number.MIN_VALUE;
        stratData.forEach(function(strat){
            strat.data.forEach(function(d){
                if(maxYValue < d.y){
                    if ((d.y !== 0) || !strat.yValidation.match(/^date/)) {
                        maxYValue = d.y;
                    }
                }
            })
        })

        var x = d3.scale.linear()
            .domain([minXValue, maxXValue])
            .range([ 0, width ]);

        var y = d3.scale.linear()
            .domain([minYValue, maxYValue])
            .range([ height, 0 ]);

        var brush = d3.svg.brush()
            .x(x)
            .y(y)
            .on("brushend", brushend);

        function brushend(d){
            var e = brush.extent();
            filterData.setAllHoverToFalse();
            d3.select(this).selectAll(".point")
                .each(function(d){

                    //x and y value with respect to the linear scale
                    var xValue = x(d.x);
                    var yValue = y(d.y);

                    //this will update the data element
                    if((x(e[0][0]) <= xValue && xValue <= x(e[1][0]))
                        && (y(e[1][1]) <= yValue && yValue <= y(e[0][1]))){
                        filterData.setHoverIndexToTrue(d.index);
                    }
                });
            require("view").updateNewState(require("stateCtrl").top());
        }


        //svg
        var svg = sel.selectAll("svg").data(stratData);
        svg.enter().append("svg")
        svg.exit().remove();

        var svgElements = svg;

        svgElements.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .classed("graph-inner",true);

        svgElements.append("rect")
            .style("class", "graph-label-box")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right - 7)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "#f9f9f9");

        svgElements.append("text")
            .attr("class", "graph-label")
            .attr("x", 5)
            .attr("y", 20)
            .attr("width", width + margin.left + margin.right - 7)
            .text(function(d){
                return d.label;
            });

        // Add the x-axis.
        svgElements.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(100," + (height + 40) + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"))
                .append("text")
                .attr("class", "label")
                .attr("x", width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .text(xLabel);

        svgElements.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(100,40)")
            .call(d3.svg.axis().scale(y).orient("left"))
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(yLabel);

        // reformat for dates
        if (stratData[0].xValidation.match(/^date/)) {
            console.log("xes");
            $(svgElements).find(".tick").each(function(idx, ob) {
                console.log("x "+idx);
                // var d1 = $(ob).html();
                // $(ob).html(getFormattedDate(d1));
            });
        }
        if (stratData[0].yValidation.match(/^date/)) {
            console.log("ys "+svgElements);
            $(svgElements).find(".tick").each(function(idx, ob) {
                console.log("y "+idx);
                // var d1 = $(ob).html();
                // $(ob).html(getFormattedDate(d1));
            });
        }

        // Add the points!
        var scatterPlot = svgElements.append("g")
                            .attr("transform",
                                "translate(100,40)");

        var point = scatterPlot.selectAll(".point")
            .data(function(d){
                return d.data;
            });

        point.enter().append("circle")
            .attr("r",function(d){
                if(x(d.x) == 0 || y(d.y) == 0) {
                    return 0;
                }
                return 4;
            })
            .attr("class", "point")
            .attr("transform", function(d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            })
            .style("fill",function(d){
                return d.c;
            })
            .on("mouseover",function(d){
                global.tips.numTextTip.show("Rec : "+ d.r+" Event: "+ d.e+" Val : " +d.x + ", " + d.y);
            })
            .on("mouseout",global.tips.numTextTip.hide);

        point.exit().remove();

        var hoverPlot = svgElements.append("g")
            .attr("transform",
                "translate(100,40)");

        var hoverPoint = hoverPlot.selectAll(".hover-point")
            .data(function(d){
                return d.hoverData;
            });

        hoverPoint.enter().append("circle")
            .attr("r",function(d){
                if(x(d.x) == 0 || y(d.y) == 0) {
                    return 0;
                }
                return 4;
            })
            .attr("class", "hover-point")
            .attr("transform", function(d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            })
            .on("mouseover",function(d){
                global.tips.numTextTip.show("Rec : "+ d.r+" Event: "+ d.e+" Val : " +d.x + ", " + d.y);
            })
            .on("mouseout",global.tips.numTextTip.hide);

        hoverPoint.exit().remove();

        scatterPlot.call(brush);

        if(isBrushEnabled){
            scatterPlot.selectAll(".background").style("pointer-events", "all");
        }
        else {
            scatterPlot.selectAll(".background").style("pointer-events", "none");
        }


    };

    var _create = function (_container, _stratData, _isBrushEnabled, _xLabel, _yLabel) {

        sel = _container;
        stratData = _stratData;
        isBrushEnabled = _isBrushEnabled;
        xLabel = _xLabel;
        yLabel = _yLabel;

        init();
    };

    return {
        create: _create
    }
});
