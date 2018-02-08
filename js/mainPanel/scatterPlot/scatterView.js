/**
 * Created by Sateesh on 5/4/16.
 */

define(["require", "colorbrewer", "filterData", "dataWrapper",
        "nominalController","numericalController","stratifiedController"],
    function (require, colorbrewer, filterData, dataWrapper,
              nominalController,numericalController,stratifiedController) {

        var instance = null;

        function ScatterView() {
            var self = this;

            if (instance !== null) {
                throw new Error("Cannot instantiate more than one ScatterView, use " +
                    "ScatterView.getInstance()");
            }

            self.isQueried = {};
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        ScatterView.getInstance = function () {
            var self = this;

            // gets an instance of the singleton. It is better to use
            if (instance === null) {

                instance = new ScatterView();
            }
            return instance;
        };

        /**
         * this function will print the numerical
         * histogram
         * @param d
         * @param data
         */
        ScatterView.prototype.numericalHistogram = function (d, data, _container) {
            var self = this;


        }


        /**
         * this will create container for the graphs
         * @param _formName
         * @param _variableName
         * @returns {*|boolean}
         */
        ScatterView.prototype.init = function (xData, yData) {

            var self = this;

            self.data = [];

            self.margin = {top: 30, right: 20, bottom: 60, left: 40},
            self.width = 750 - self.margin.left - self.margin.right,
            self.height = 500 + self.margin.top + self.margin.bottom;

            self.x = d3.scale.linear()
                .range([0, self.width]);

            self.y = d3.scale.linear()
                .range([self.height, 0]);

            self.colors = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"];

            self.color = d3.scale.linear();

            self.xAxis = d3.svg.axis()
                .scale(self.x)
                .orient("bottom");

            self.yAxis = d3.svg.axis()
                .scale(self.y)
                .orient("left");

            self.brush = d3.svg.brush()
                .x(self.x)
                .y(self.y)
                .on("brushstart", brushstart)
                .on("brush", brushmove)
                .on("brushend", brushend);

            // Clear the previously-active brush, if any.
            function brushstart(p) {
                //console.log('Brush Start', p);

            }

            // Highlight the selected circles.
            function brushmove(p) {
                var e = self.brush.extent();
                var brushedData = [];
                var brushFilterData = [];

                for(var i = 0; i < p.originalData.length; i++){
                    brushFilterData.push(0);
                }

                for(var i = 0; i < p.indexVals.length; i++){
                    if(!(e[0][0] > p.data[i][0] || p.data[i][0] > e[1][0]
                        || e[0][1] > p.data[i][1] || p.data[i][1] > e[1][1])){
                        brushedData.push(p.indexVals[i]);
                    }
                }

                for(var i = 0; i < brushedData.length; i++){
                    brushFilterData[brushedData[i]] = 1;
                }

                if(brushedData.length > 0)
                    require("view").update(brushFilterData);
                else
                    require("view").update();

                //console.log('Brush Filtered Data - ', brushFilterData);

            }

            // If the brush is empty, select all circles.
            function brushend() {
                //console.log('End');
                //if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
            }


            //scatterController.create();
            require("scatterController").create();
            //self.update(xData, yData, '', '', stratify);
        };


        ScatterView.prototype.update = function (scatterObj){

            var self = this;

            //console.log('Scatter view update - ', scatterObj);

            var colorBy = filterData.getColorBy();
            var isColorBy = colorBy.isColorBy;

            self.sel = d3.select("#scatterPlot");

            self.svg = self.sel.selectAll("svg").data(scatterObj);

            self.svgElements = self.svg.enter().append("svg")
                .attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom)
                .attr("class", "graph-inner")
                .append("g")
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

            self.svgElements.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + self.height + ")")
                .call(self.xAxis)
                .append("text")
                .attr("class", "label")
                .attr("x", self.width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .text(function (d) {
                    var label = d.xLabel > 40 ? d.xLabel.substr(0,40) + "..." : d.xLabel;
                    return label;});

            self.svgElements.append("g")
                .attr("class", "y axis")
                .call(self.yAxis)
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(function (d) {
                    var label = d.yLabel > 40 ? d.yLabel.substr(0,40) + "..." : d.yLabel;
                    return label;});

            self.circles = self.svgElements.selectAll(".dot")
                .data(function(d){
                    return d.data;
                })
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 3.5)
                .attr("cx", function(d) {
                    return self.x(d[0]);
                })
                .attr("cy", function(d) {
                    return self.y(d[1]);
                })
                .attr("fill", function(d){
                    return '#66c2a5'
                });

            self.svg.exit().remove();

            self.x.domain([0, d3.max(scatterObj[0].originalData, function(d) { return d[0]; })]).nice();

            self.y.domain([0, d3.max(scatterObj[0].originalData, function(d) { return d[1]; })]).nice();

            self.svg.each(function(d) {
                self.colVals = d3.values(d.colData);

                //console.log('Inside for each');

                d3.select(this).selectAll('.graph-label').remove();

                self.color.domain([0, d3.max(d.colKeys)]);

                //var colRange = self.colors.slice(0, d.colKeys.length);

                self.color.range(self.colors);

                /*self.color.range(function(d){
                    console.log('Range - ', self.colors.slice(0, d.colKeys.length + 1));
                    return self.colors.slice(0, d.colKeys.length + 1);
                });*/

                /*self.color.domain(d.colKeys).range(function(d){
                    if(d.colKeys.length > 2)
                        return colorbrewer.Set1[d.colKeys.length];
                    else
                        return colorbrewer.Set1[3];
                })*/

                //self.x.domain(d3.extent(d.data, function(d) { return d[0]; })).nice();
                //self.x.domain([0, d3.max(d.data, function(d) { return d[0]; })]).nice();

                //self.svgElements.select(".x.axis").transition().call(self.xAxis);
                d3.select(this).select(".x.axis").transition().call(self.xAxis);

                d3.select(this).select(".x.axis").selectAll("text.label").text(function () {
                    var label = d.xLabel > 40 ? d.xLabel.substr(0,40) + "..." : d.xLabel;
                    return label;});

                //self.y.domain(d3.extent(d.data, function(d) { return d[1]; })).nice();
                //self.y.domain([0, d3.max(d.data, function(d) { return d[1]; })]).nice();

                //self.svgElements.select(".y.axis").transition().call(self.yAxis);
                d3.select(this).select(".y.axis").transition().call(self.yAxis);

                d3.select(this).select(".y.axis").selectAll("text.label").text(function () {
                    var label = d.yLabel > 40 ? d.yLabel.substr(0,40) + "..." : d.yLabel;
                    return label;});

                d3.select(this).append("text")
                    .attr("class", "graph-label")
                    .attr("x", 40)
                    .attr("y", 20)
                    .attr("width", self.width + self.margin.left + self.margin.right - 7)
                    .text(function (d) {
                        var label = d.label.length > 40 ?  d.label.substr(0,40) + "..." : d.label;
                        return label;
                    });

                var dot = d3.select(this).select('g').selectAll("circle")
                    .data(d.data, function(d) {return d});

                // udpate
                dot.transition()
                    .duration(1000)
                    .attr({
                        "cx": function(d) { return self.x(d[0]); }
                        , "cy": function(d) { return self.y(d[1]); }
                        , "r": 3.5
                    });
                // enter
                dot.enter().append("circle")
                    .attr("class", "dot")
                    .transition()
                    .duration(1000)
                    .each("start", function() {
                        d3.select(this)
                            .attr("fill", function(e, i){
                                return self.color(self.colVals[i]);
                            })
                            .attr("r", 5);
                    })
                    .delay(function(e, i) {
                        return i / d.data.length * 500;
                    })
                    .attr("cx", function(d) {
                        return self.x(d[0]);
                    })
                    .attr("cy", function(d) {
                        return self.y(d[1]);
                    })
                    .attr("fill", function(e, i){
                        //console.log('Inside Fill attribute - ', self.colVals[i], i);
                        //return 'red';
                        return self.color(self.colVals[i]);
                    })
                    .each("end", function() {
                        d3.select(this)
                            .transition()
                            .duration(500)
                            .attr("fill", function(e, i){
                                return self.color(self.colVals[i]);
                            })  // Change color
                            .attr("r", 3.5);  // Change radius
                    });
                dot.exit().transition()
                    .style('fill', 'red')
                    .transition()
                    .duration(500)
                    .style('opacity', 1e-6)
                    .remove();

                if(isColorBy){

                    d3.select(this).select('g').selectAll('circle').data(function(e) {
                        return e.colData;
                    }).each(function(e){
                        d3.select(this).attr('fill', function(e){
                            return self.color(e);
                        });
                    });
                }
                else{
                    console.log('In else ');
                }

                d3.select(this).select("g").call(self.brush);

            });

        };

        return ScatterView.getInstance();
    });
