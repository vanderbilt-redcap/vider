/**
 * Created by sunny on 2/18/16.
 */
define(["d3-tip","d3","colorbrewer","filterData","global"],
    function(d3tip, d3, colorbrewer,filterData, global){

    var localFormName;
    var localVarName;
    var origData;
    var queryData;
    var container;
    var isLocked;
    var fieldLabel;


    var init = function(){

    }

    var printGraph = function() {

        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 200 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        // Attach all the data required by the D3
        origData.map(function (d) {
            d.localFormName = localFormName;
            d.localVarName = localVarName;
        });

        queryData.map(function (d) {
            d.localFormName = localFormName;
            d.localVarName = localVarName;
        });

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .range([height, 0]);

        var o = d3.scale.ordinal()
            .domain(origData.map(function(d) { return d.value; }))
            .range(colorbrewer.Greys[9]);

        var firstEventObject = d3.values(origData[Object.keys(origData)[0]].event);
        var eventColor = d3.scale.ordinal()
            .domain(firstEventObject.map(function(d) { return d.label; }))
            .range(colorbrewer.Spectral[9]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10, "%");

        //Initialize the d3 tip for displaying
        //value for each bar on mouse hover
        var tip = d3tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "check";
            });


        x.domain(origData.map(function(d) { return d.value; }));
        y.domain([0, d3.max(origData, function(d) { return d.count; })]);

        var svg = container;
        svg.call(tip);
        container.select(".axis").append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        var bar = svg.selectAll(".bar").data(origData);

            bar.attr("class", "bar")
            .attr("x", function(d) { return x(d.value); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { return height - y(d.count); })
            .on("click", function(d){

                //add the filter in the filter data
                filterData.add(d.localFormName,d.localVarName, d.key,"and");

                //add filter data int this data so that
                require("view").updateNewState(require("stateCtrl").top());
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

            bar.enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.value); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { return height - y(d.count); })
            .on("click", function(d){

                //add the filter in the filter data
                filterData.add(d.localFormName,d.localVarName, d.key,"and");

                //add filter data int this data so that
                require("view").updateNewState(require("stateCtrl").top());
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

            bar.exit().remove();

        var overlayBar = svg.selectAll(".query-bar").data(queryData);

            overlayBar.attr("class", "query-bar")
            .attr("x", function (d) {
                return x(d.value);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d.count);
            })
            .attr("height", function (d) {
                return height - y(d.count);
            })
            .style("fill", function (d) {
                return "grey"; //todo currently taking one
            })
            .on("click", function (d) {

                //this will filter all the data
                filterData.add(d.localFormName, d.localVarName, d.key, "and");

                //add filter data int this data so that
                require("view").updateNewState(require("stateCtrl").top());
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

            overlayBar.enter().append("rect")
            .attr("class", "query-bar")
            .attr("x", function (d) {
                return x(d.value);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d.count);
            })
            .attr("height", function (d) {
                return height - y(d.count);
            })
            .style("fill", function (d) {
                return "grey";
            })
            .on("click", function (d) {
                //this will filter all the data
                filterData.add(d.localFormName, d.localVarName, d.key, "and");

                //add filter data int this data so that
                require("view").updateNewState(require("stateCtrl").top());
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        overlayBar.exit().remove();

        var eventgroup = svg.selectAll(".event-group")
            .data(origData);

        var group = eventgroup.enter().append("g")
            .attr("class","event-group")
            .attr("transform", function(d) { return "translate("+x(d.value)+","+y(d.count)+") rotate(180 " + (x.rangeBand()/2) +" "+ ((height - y(d.count)) / 2) + ")"; });

        var circle = group.selectAll(".event-cirle")
            .data(function(d){ return d3.values(d.event); });

        circle.enter().append("circle")
            .attr("class","event-cirle")
            .attr("cx", function(d) { return x.rangeBand()/2 ; })
            .attr("cy", function(d) { return height - y(d.count); })
            .attr("count", function(d){
                return d.count;
            })
            .attr("r",x.rangeBand() * (3/8)) // todo this can be changed to perofr
            .attr("fill",function(d){
                return eventColor(d.label);
            })
            .attr("fill-opacity","0.75");
    }

    var _create = function(_container,_localFormName,_localVarName,_fieldLabel,_data,_qdata,_isLocked){

        container = _container;
        localFormName = _localFormName;
        localVarName = _localVarName;
        fieldLabel - _fieldLabel;
        origData = _data;
        queryData = _qdata;
        isLocked = _isLocked;

        printGraph();
    }
    return {
        create : _create
    }
})