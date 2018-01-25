/**
 * Created by sunny on 2/18/16.
 */
define(["jquery", "d3", "d3-tip", "colorbrewer", "filterData", "global"],
    function ($, d3, d3tip, colorbrewer, filterData, global) {

        var localFormName;
        var localVarName;
        var fieldLabel;
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
        //call the numerical histogram handler

        this.lastKeyPressed = -1;


        // https://github.com/wbkd/d3-extended
        d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
                this.parentNode.appendChild(this);
            });
        };

        /**
         *
         */
        var init = function () {

            var self = this;

            //strat

            var textWidth = 80;
            var margin = {top: 40, right: 20, bottom: 60, left: 40},
                width = 250 - margin.left - margin.right,
                height = 25 * Object.keys(stratData[0].original).length + margin.top + margin.bottom;
            var flag = false;


            var drag= d3.behavior.drag()
                .origin(function(d) {
                    return d;
                })
                .on("dragstart", dragstarted)
                .on("drag", dragged)
                .on("dragend", dragended);

            function dragstarted(d) {
                d3.event.sourceEvent.stopPropagation();
                d3.select(this).classed("dragging", true);
                flag = true;

                d._y = d.y;

                // this will start and mouse enter and mouse level again
                svg.select(".main")
                    .selectAll(".barGroup")
                    .on("mouseenter",null)
                    .on("mouseleave",null);

                transDuration = 0;
            }

            function dragged(d) {
                var eventY = d3.event.y;
                d3.select(this).moveToFront();
                d3.select(this)
                    .attr("y", d.y = eventY)
                    .attr("transform", function (d) {
                        //var yScale = d3.select(this.parentNode).datum().yScale;
                        d.y = eventY;
                        if(d.y < 0){
                            d.y = 0;
                        }
                        else if(d.y > max){
                            d.y = max;
                        }

                        return "translate(" + 0 + "," + d.y  + ")";
                    });

                d3.select(this.parentNode)
                    .selectAll(".barGroup")
                    .each(function(d){
                        if(d.y - 12 < eventY && eventY < d.y){
                            d3.select(this)
                                .select(".overlay-horizontal-nominal-bar")
                                .style("fill","orangered");
                        }
                        else{
                            d3.select(this)
                                .select(".overlay-horizontal-nominal-bar")
                                .style("fill","#3366cc");
                        }
                    })
            }

            function dragended(d) {
                var moveDiff =  Math.abs(d.y - d._y);

                if(moveDiff > 3) {

                    d3.select(this).classed("dragging", false);
                    var newY = d.y;
                    var mergeFrom = d;
                    var lastY = d._y;

                    d3.select(this.parentNode)
                        .selectAll(".barGroup")
                        .each(function (d) {

                            if (d.y - 12 < newY && newY < d.y && flag) {

                                d3.select(this)
                                    .select(".overlay-horizontal-nominal-bar")
                                    .style("fill", "#3366cc");

                                var mergeTo = d;
                                var form = mergeFrom.form;
                                var variable = mergeFrom.variable;
                                var topData = $.extend(true, {}, require("stateCtrl").top()); // get the copy of the data

                                var binName = mergeFrom.value.trim().replaceAll("\\s","_")
                                              + "/"
                                              + mergeTo.value.trim().replaceAll("\\s","_");

                                //this will update the top data
                                topData.binPanel.param.push({form: form,
                                    var: variable,
                                    bin: binName,
                                    indexToMerge: [mergeFrom.key, mergeTo.key]});


                                //add the top data on the queue
                                require("stateCtrl").add(topData);

                                flag = false;
                            }
                            else {
                                d3.select(this).attr("y", lastY);
                            }
                        })

                    // add the filter in the filter data
                    filterData.add(d.form, d.variable, d.key, FILTER.UNCLICK);
                    //this will refresh the view with the new state
                    require("view").updateNewState(require("stateCtrl").top());

                    d3.selectAll(".d3-tip").remove();


                }

                transDuration = 1000;

                // this will start and mouse enter and mouse level again
                svg.select(".main")
                    .selectAll(".barGroup")
                    .on("mouseenter",function(d){
                        // add the filter in the filter data
                        filterData.add(d.form, d.variable, d.key, FILTER.HOVER);
                        // add filter data int this data so that
                        require("view").updateNewState(require("stateCtrl").top());
                    })
                    .on("mouseleave",function(d){
                        // add the filter in the filter data
                        filterData.remove(d.form, d.variable, d.key, FILTER.UNHOVER);
                        // add filter data int this data so that
                        require("view").updateNewState(require("stateCtrl").top());
                    });
            }


            /*var circleTip = d3tip()
             .attr('class', 'd3-tip')
             .offset([-12, 0])
             .html(function(d) {
             return "<strong>"
             + d.label
             + ":</strong> <span style='color:red'>"
             + d.count; });*/


            ////////////////////////////////////////////////////////////////////////////////////////////////
            //Create Container
            ////////////////////////////////////////////////////////////////////////////////////////////////
            var maxOrgCount = d3.max(stratData,function(obj){
                return d3.max(d3.values(obj.original), function (d) {
                    return d.originalCount;
                });
            });

            stratData.map(function(d){
                d.maxOrgCount = maxOrgCount;
            });

            var svg = sel.selectAll("svg").data(stratData);
            var svgElements = svg.enter().append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height)
                .classed("graph-inner",true);

            svg.exit().remove();

            svgElements.append("rect")
                .style("class", "graph-label-box")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width + margin.left + margin.right - 7)
                .attr("height", height)
                .attr("fill", "#f9f9f9")
                .on("click",function(d){

                    //set it to -1
                    self.lastKeyPressed = -1;
                    // add the filter in the filter data
                    filterData.add(d.form, d.variable, d.key, FILTER.UNCLICK);
                    // add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top());
                });

            svgElements.append("text")
                .attr("class", "graph-label")
                .attr("x", 5)
                .attr("y", 20)
                .attr("width", width + margin.left + margin.right - 7)
                .on("mouseover",function(d){
                    global.tips.numTextTip.show(d.label);
                })
                .on("mouseout",global.tips.numTextTip.hide)
                .text(function (d) {
                    var label = d.label.length > 25 ?  d.label.substr(0,25) + "..." : d.label;
                    return label;
                })

            svg.select("text")
                .attr("class", "graph-label")
                .attr("x", 5)
                .attr("y", 20)
                .attr("width", width + margin.left + margin.right - 7)
                .text(function (d) {
                    var label = d.label.length > 25 ?  d.label.substr(0,25) + "..." : d.label;
                    return label;
                })

            svgElements.append("g")
                .classed("main",true)
                .attr("transform", "translate(" + 0 + "," + margin.top  + ")");

            svg.call(global.tips.tip1);
            svg.call(global.tips.queryTip);
            svg.call(global.tips.textTip);
            svg.call(global.tips.numTextTip);
            svg.call(global.tips.colorByTip);

            ////////////////////////////////////////////////////////////////////////////////////////////////
            //Set the Scales
            ////////////////////////////////////////////////////////////////////////////////////////////////
            svg.each(function(d) {

                var original = d3.values(d.original);
                var localHeight = 25 * Object.keys(original).length;
                var xScale = d3.scale.linear()
                    .domain([0, d.maxOrgCount])
                    .range([textWidth, width])
                    .nice();

                var yScale = d3.scale.ordinal()
                    .rangeRoundBands([0, localHeight], .1);

                yScale.domain(original.map(function (d) {
                    return d.value
                }))

                var xAxis = d3.svg.axis();
                xAxis.scale(xScale);
                xAxis.orient("bottom");
                xAxis.ticks(5);

                var axis = d3.select(this) //this will select current svg
                    .select("g")
                    .selectAll(".axis")
                    .data([1]);

                axis.enter().append("g");

                axis.classed("axis", true)
                    .attr("transform", "translate("
                        + 0 + "," + localHeight + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-90)"
                    })
                    .transition().duration(transDuration)
                    .attr("opacity", 1);

                //set the original again
                //d.original = original;

                //this will attach scales to the data
                d3.select(this).data([{
                    "xScale": xScale,
                    "yScale": yScale,
                    "data":d
                }]);
            });

            ////////////////////////////////////////////////////////////////////////////////////////////////
            //Bar group
            ////////////////////////////////////////////////////////////////////////////////////////////////
            var group = svg.select(".main").selectAll(".barGroup")
                .data(function(d){
                    return d3.values(d.data.original);
                });

            group.enter().append("g")

            var groupEnter = group.classed("barGroup", true)
                .classed("barGroup", true)
                .attr("transform", function (d) {
                    var yScale = d3.select(this.parentNode).datum().yScale;
                    d.y = yScale(d.value);
                    if(max < d.y){
                        max = d.y;
                    }
                    return "translate(" + 0 + "," + d.y  + ")";
                })
                .on("click",function(d){

                    var filterClicked = FILTER.CLICK;
                    if(event.ctrlKey || event.metaKey){
                        filterClicked = FILTER.CTRLCLICK;
                    };

                    //remove all the foreign object
                    d3.selectAll("foreignObject").remove();

                    //add new foreign object
                    var fo = d3.select(this).append("foreignObject");

                    fo.attr("x", function(d){
                        var xScale = d3.select(this.parentNode.parentNode).datum().xScale;
                        return textWidth + Math.abs(xScale(d.queryCount) - xScale(0)) + 5;
                    })
                    .attr("y", 3)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("float","left")
                    .append("xhtml:a")
                    .attr("data-toggle","tooltip")
                    .attr("title",function(d){
                        return "Filter by " + d.value;
                    })
                    .append("xhtml:i")
                    .attr("class",'fa fa-filter')
                    .style("font-size","12")
                    .attr("aria-hidden",'true')
                    .on("click", function (d) {
                        // add the filter in the filter data
                        filterData.add(d.form, d.variable, d.key, FILTER.SELECTION);
                        // add filter data int this data so that
                        require("view").updateNewState(require("stateCtrl").top());
                        //if clicked then remove all the foreign object
                        d3.selectAll("foreignObject").remove();
                    })



                    if(event.shiftKey && self.lastKeyPressed != -1){

                        var from = 0, to = 0;
                        if(self.lastKeyPressed < parseInt(d.key)){
                            from = self.lastKeyPressed;
                            to = parseInt(d.key);
                        }
                        else{
                            from = parseInt(d.key);
                            to = self.lastKeyPressed;
                        }
                        for ( var index = from ; index <= to ; index++){
                            group.each(function(d){
                                if(parseInt(d.key) == index){
                                    filterData.add(d.form, d.variable, d.key, FILTER.CTRLCLICK);
                                }
                            })
                        }
                    }
                    else{
                        // add the filter in the filter data
                        filterData.add(d.form, d.variable, d.key, filterClicked);
                    }

                    //track the last key pressed
                    self.lastKeyPressed = parseInt(d.key);

                    // add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top());


                })
                .on("mouseenter",function(d){

                    // add the filter in the filter data
                    filterData.add(d.form, d.variable, d.key, FILTER.HOVER);
                    // add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top());
                })
                .on("mouseleave",function(d){
                    // add the filter in the filter data
                    filterData.remove(d.form, d.variable, d.key, FILTER.UNHOVER);
                    // add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top());
                });

            group.call(drag);

            group.exit().remove();


            var textEnter = groupEnter.selectAll("text")
                .data(function(d){
                    return [d];
                });
            textEnter.enter().append("text")
                .on("mouseover",global.tips.textTip.show)
                .on("mouseout",global.tips.textTip.hide)
                .on("dblclick",function(d){

                    var finalVal = "";
                    var outerGraph = d3.select(this.parentNode.parentNode.parentNode.parentNode.parentNode);

                    var oprDiv = outerGraph.select(".inputdiv").selectAll("div").data([d]);
                    oprDiv.enter().append("div").classed("col-xs-8",true);
                    oprDiv.exit().remove();

                    var inpDiv = oprDiv.selectAll(".col-xs-10")
                        .data(function(d){
                            return [d];
                        });
                    inpDiv.enter().append("div")
                        .classed("col-xs-10",true)
                        .append("input")
                        .attr("type","text")
                        .classed("form-control", true)
                        .attr("id","input-xs")
                        .attr("size",3)
                        .attr("value",function(d){
                            this.value = d.value;
                        })
                        .on("input",function(){
                            finalVal = this.value;
                        });
                    inpDiv.select("input")
                        .classed("col-xs-10",true)
                        .attr("type","text")
                        .classed("form-control", true)
                        .attr("id","input-xs")
                        .attr("size",3)
                        .attr("value",function(d){
                            this.value = d.value;
                        })
                        .on("input",function(){
                            finalVal = this.value;
                        });

                    var execute = oprDiv.selectAll(".execute .col-xs-2")
                        .data(function(d){
                            return [d];
                        });

                    execute.enter().append("div")
                        .classed("execute",true)
                        .append("span")
                        .attr("class","glyphicon glyphicon-ok")
                        .on("click",function(d){

                            var data  = require("stateCtrl").top().mainPanel.data;
                            data[d.form].fields[d.variable].obj.select_choices_or_calculations =
                                data[d.form].fields[d.variable].obj
                                    .select_choices_or_calculations.replace(d.value,finalVal);


                            var state = require("stateCtrl").top();
                            state.mainPanel.data = data;
                            state.varPanel.data = data;

                            require("view").updateNewState(state);
                        });

                    execute.classed("execute",true)
                        .select("span")
                        .attr("class","glyphicon glyphicon-ok")
                        .on("click",function(d){

                            var data  = require("stateCtrl").top().mainPanel.data;
                            data[d.form].fields[d.variable].obj.select_choices_or_calculations =
                                data[d.form].fields[d.variable].obj
                                    .select_choices_or_calculations.replace(d.value,finalVal);

                            var state = require("stateCtrl").top();
                            state.mainPanel.data = data;
                            state.varPanel.data = data;

                            require("view").updateNewState(state);
                        });

                })
                .attr("opacity", 0)
                .transition().duration(transDuration)
                .attr("opacity", 1);

            textEnter.text(function (d) {
                if(d.value.length < 10 ) {
                    return d.value;
                }
                else{
                    return d.value.substring(0,7) + "...";
                }
            }).attr("x", textWidth - 10)
                // dy is a shift along the y axis
                .attr("dy", function(d){
                    return d3.select(this.parentNode.parentNode).datum().yScale.rangeBand() / 2;
                })
                // align it to the right
                .attr("text-anchor", "end")
                // center it
                .attr("alignment-baseline", "middle")
                .attr("data-toggle","modal")
                .attr("data-target","#code");

            var backBarEnter = groupEnter.selectAll(".horizontal-nominal-bar")
                .data(function(d){
                    return [d];
                });

            backBarEnter.enter().append("rect")
                .attr("class","horizontal-nominal-bar")
                .attr("width", "0")
                .on("mouseover",global.tips.tip1.show)
                .on("mouseout",global.tips.tip1.hide)
                .call(drag);

            backBarEnter.attr("x", textWidth)
                .attr("height", function(){
                    return d3.select(this.parentNode.parentNode).datum().yScale.rangeBand();
                })
                .transition().duration(transDuration)
                .attr("width", function (d) {
                    // here we call the scale function.
                    var xScale = d3.select(this.parentNode.parentNode).datum().xScale;
                    return Math.abs(xScale(d.originalCount) - xScale(0));
                });

            var overlayBarEnter = groupEnter.selectAll(".overlay-horizontal-nominal-bar")
                .data(function(d){
                    return [d];
                });

            overlayBarEnter.enter().append("rect")
                .attr("class","overlay-horizontal-nominal-bar")
                .attr("width", "0")
                .on("mouseover",global.tips.queryTip.show)
                .on("mouseout",global.tips.queryTip.hide);


            overlayBarEnter
                .attr("x", textWidth)
                .attr("height", function(){
                    return d3.select(this.parentNode.parentNode)
                             .datum().yScale.rangeBand();
                })
                .transition().duration(transDuration)
                .attr("width", function (d) {
                    // here we call the scale function.
                    var xScale = d3.select(this.parentNode.parentNode).datum().xScale;
                    return Math.abs(xScale(d.queryCount) - xScale(0));
                });

            var hoverBarEnter = groupEnter.selectAll(".hover-nominal-bar")
                .data(function(d){
                    return [d];
                });

            hoverBarEnter.enter().append("rect")
                .attr("class","hover-nominal-bar")
                .attr("width", "0")
                .on("mouseover",global.tips.queryTip.show)
                .on("mouseout",global.tips.queryTip.hide);

            hoverBarEnter.attr("x", textWidth)
                .attr("height", function(){
                    return d3.select(this.parentNode.parentNode).datum().yScale.rangeBand();
                })
                .attr("width", function (d) {
                    // here we call the scale function.
                    var xScale = d3.select(this.parentNode.parentNode).datum().xScale;
                    return Math.abs(xScale(d.hoverCount) - xScale(0));
                });


            var colorGroup = groupEnter.selectAll(".color-grp")
                .data(function(d){

                    var xScale = d3.select(this.parentNode.parentNode).datum().xScale;
                    var range = Math.abs(xScale(d.originalCount) - xScale(0));
                    var scale = d3.scale.linear().domain([0, d.colorTotal]).range([0,range]);
                    var colorKeys = d3.keys(d.colorByObj);
                    var color = d3.scale.ordinal()
                                .domain(colorKeys)
                                .range(colorbrewer.Set1[colorKeys.length % 11]);

                    var colorByMap = {};
                    var indexCounter = textWidth ;
                    for(var key in d.colorByObj){
                        d.colorByObj[key].color  = color(key);
                        d.colorByObj[key].xIndex = indexCounter;
                        d.colorByObj[key].width  = scale(d.colorByObj[key].count);
                        indexCounter += scale(d.colorByObj[key].count);

                        //todo: this is the work around solution to get the colors
                        //todo: on the view filter panel
                        if (d.colorByObj[key].obj != null) { // this is number
                            colorByMap[d.colorByObj[key].obj.x + " - "
                            + (d.colorByObj[key].obj.x + d.colorByObj[key].obj.dx)]
                                = color(key);
                        }
                        else{
                            colorByMap[d.colorByObj[key].value] = color(key)
                        }
                    }
                    filterData.setColorByScale(colorByMap);

                    return [d.colorByObj];
                });

            colorGroup.enter().append("g")
                .attr("x", textWidth)
                .attr("class","color-grp")
                .attr("height", function(d){
                    d.yScale = d3.select(this.parentNode.parentNode).datum().yScale.rangeBand();
                    return d.yScale;
                });

            colorGroup.exit().remove();



            var colorRectEnter = colorGroup.selectAll(".color-rect")
                .data(function(d){
                    return d3.values(d);
                });

            colorRectEnter.enter().append("rect");

            colorRectEnter.attr("class","color-rect")
                .style("fill",function(d){
                    return d.color;
                })
                .attr("x", function(d){
                    return d.xIndex;
                })
                .attr("height", function(){
                    return d3.select(this.parentNode.parentNode.parentNode).datum().yScale.rangeBand();
                })
                .attr("width", function (d) {
                    return d.width;
                })
                .on("mouseover",global.tips.colorByTip.show)
                .on("mouseout",global.tips.colorByTip.hide);

            colorRectEnter.exit().remove();
        }

        var _create = function (_container, _localFormName, _localVarName, _fieldLabel, _stratData) {

            sel = _container;
            localFormName = _localFormName;
            localVarName = _localVarName;
            fieldLabel = _fieldLabel;
            stratData = _stratData;

            init();
        }
        return {
            create: _create
        }
    })
