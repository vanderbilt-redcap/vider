/**
 * Created by sunny on 2/18/16.
 */
define(["d3-tip","d3","filterData"],function(d3Tip, d3, filterData){

    //reference https://bl.ocks.org/mbostock/3048450

    // Generate a Bates distribution of 10 random variables.
    var printGraph = function(_d3Container,_values, _formName, _varName,_queryData) {

        //todo add settings from numerical graph
        var margin = {top: 10, right: 30, bottom: 30, left: 30},
            width = 200 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        var x = d3.scale.linear()
                .domain([Math.min.apply(Math,_values),Math.max.apply(Math,_values)])
                .range([0, width]);

        // Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram()
                    .bins(x.ticks(10))//fix it make in 10 todo make the
                    (_values);

        data.map(function(d){
            d.form = _formName;
            d.var = _varName;
        })

        // Generate a histogram using twenty uniformly-spaced bins.
        var overlayData = d3.layout.histogram()
                            .bins(x.ticks(10))//fix it make in 10 todo make the
                            (_queryData);

        overlayData.map(function(d){
            d.form = _formName;
            d.var = _varName;
        })


        var y = d3.scale.linear()
            .domain([0, d3.max(data, function (d) {
                return d.y;
            })])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        //Initialize the d3 tip for displaying
        //value for each bar on mouse hover
        //var tip = d3Tip()
        //    .attr('class', 'd3-tip')
        //    .offset([-10, 0])
        //    .html(function (d) {
        //        return d.x + "-" + (d.x + d.dx) + " : " + d.y;
        //    });

        _d3Container.on("mouseover",function(){
            _d3Container.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
        });
        _d3Container.on("mouseout",function(){
            _d3Container.selectAll(".axis").remove();
        });

        var bar = _d3Container.selectAll(".numerical-bar").data(data);

            bar.enter().append("g")
            .attr("class", "numerical-bar")
            .attr("transform", function (d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            })
            .append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function (d) {
                return height - y(d.y);
            })
            .on("click",function(d){
                //perform the filtering of the data
                filterData.numericalAdd(d.form, d.var, {x: d.x,dx: d.dx},"and");
                //add filter data int this data so that
                require("view").updateNewState(require("stateCtrl").top());

            });

            bar.attr("class", "numerical-bar")
            .attr("transform", function (d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            })
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function (d) {
                return height - y(d.y);
            })
            .on("click",function(d){
                //perform the filtering of the data
                filterData.numericalAdd(d.form, d.var, {x: d.x,dx: d.dx},"and");
                //add filter data int this data so that
                require("view").updateNewState(require("stateCtrl").top());

            });

            bar.exit().remove();

        var overlayBar = _d3Container.selectAll(".overlay-numerical-bar").data(overlayData);

            overlayBar.enter().append("g")
            .attr("class", "overlay-numerical-bar")
            .attr("transform", function (d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            })
            .append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function (d) {
                return height - y(d.y);
            })
            .on("click",function(d){
                //perform the filtering of the data
                filterData.numericalAdd(d.form, d.var, {x: d.x,dx: d.dx},"and");
                //add filter data int this data so that
                require("view").updateNewState(require("stateCtrl").top());

            });


            overlayBar.attr("class", "overlay-numerical-bar")
            .attr("transform", function (d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            })
            .select("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .on("click",function(d){
                //perform the filtering of the data
                filterData.numericalAdd(d.form, d.var, {x: d.x,dx: d.dx},"and");
                //add filter data int this data so that
                require("view").updateNewState(require("stateCtrl").top());

            })
            .transition()
            .duration(300)
            .attr("height", function (d) {
                return height - y(d.y);
            });

            overlayBar.exit().remove();


    }

    var _create = function(_d3Container,_data,_formName,_variableName, _queryData){
        printGraph(_d3Container,_data,_formName,_variableName, _queryData);
    }
    return {
        create : _create
    }
})