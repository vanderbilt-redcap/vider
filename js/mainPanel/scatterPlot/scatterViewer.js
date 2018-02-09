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

    var init = function () {
        var self = this;

        var textWidth = 80;
        var margin = {top: 40, right: 20, bottom: 60, left: 80},
            width = 750 - margin.left - margin.right,
            height = 500;

        //find the x min value
        var minXValue = Number.MAX_VALUE;
        stratData.forEach(function(strat){
            strat.data.forEach(function(d){
                if(minXValue > d.x){
                    minXValue = d.x;
                }
            })
        })

        //find the x max value
        var maxXValue = Number.MIN_VALUE;
        stratData.forEach(function(strat){
            strat.data.forEach(function(d){
                if(maxXValue < d.x){
                    maxXValue = d.x;
                }
            })
        })

        //find the y min value
        var minYValue = Number.MAX_VALUE;
        stratData.forEach(function(strat){
            strat.data.forEach(function(d){
                if(minYValue > d.y){
                    minYValue = d.y;
                }
            })
        })

        //find the y max value
        var maxYValue = Number.MIN_VALUE;
        stratData.forEach(function(strat){
            strat.data.forEach(function(d){
                if(maxYValue < d.y){
                    maxYValue = d.y;
                }
            })
        })

        console.log("x: min "+minXValue+", max "+maxXValue);
        var x = d3.scale.linear()
            .domain([minXValue, maxXValue])
            .range([ 0, width ]);

        console.log("y: min "+minYValue+", max "+maxYValue);
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
            .attr("transform", "translate(50," + (height + 40) + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"))
                .append("text")
                .attr("class", "label")
                .attr("x", width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .text(xLabel);

        svgElements.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(50,40)")
            .call(d3.svg.axis().scale(y).orient("left"))
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(yLabel);


        // Add the points!
        var scatterPlot = svgElements.append("g")
                            .attr("transform",
                                "translate(50,40)");

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
                "translate(50,40)");

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

        console.log(_xLabel, _yLabel);

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
