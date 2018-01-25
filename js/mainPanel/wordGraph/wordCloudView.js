/**
 * Created by sunny on 11/9/16.
 */
define(["jquery",  "d3-tip", "d3", "d3-word-cloud",
        "colorbrewer", "filterData", "global"],
    function ($,  d3tip, d3, d3WordCloud,
              colorbrewer, filterData, global) {

    var stratData;
    var sel;

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
    var color = d3.scale.linear()
        .domain([0,1,2,3,4,5,6,10,15,20,100])
        .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;

    var textWidth = 80;
    var margin = {top: 40, right: 20, bottom: 60, left: 80},
        width = 250 - margin.left - margin.right,
        height = 300;

    var transDuration = 1000;
    //call the numerical histogram handle
    this.lastKeyPressed = -1;
    var scale;
    var fontScale;


    // Encapsulate the word cloud functionality
    function wordCloud(selector) {

        var fill = d3.scale.category20();

        //Construct the word cloud's SVG element
        var svg = selector
            .attr("width", width + margin.left + margin.right - 7)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate("+(margin.left +50)+","+(margin.top + 170)+")");


        //Draw the word cloud
        function draw(words) {
            var cloud = svg.selectAll("g text")
                .data(words, function(d) {return d.key; })

            //Entering words
            cloud.enter()
                .append("text")
                .style("font-family", "Impact")
                .style("fill", function(d, i) { return "#3366cc"/*fill(i)*/; })
                .attr("text-anchor", "middle")
                .attr('font-size', 1)
                .text(function(d) { return d.key; });

            //Entering and existing words
            cloud.transition()
                .duration(600)
                .style("font-size", function(d) { return d.size + "px"; })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("fill-opacity", 1);

            //Exiting words
            cloud.exit()
                .transition()
                .duration(200)
                .style('fill-opacity', 1e-6)
                .attr('font-size', 1)
                .remove();
        }


        //Use the module pattern to encapsulate the visualisation code. We'll
        // expose only the parts that need to be public.
        return {

            //Recompute the word cloud for a new set of words. This method will
            //asycnhronously call draw when the layout has been computed.
            //The outside world will need to call this function, so make it part
            // of the wordCloud return value.
            update: function(words) {
                d3.layout.cloud().size([width + margin.left + margin.right - 7,
                                        height + margin.top + margin.bottom])
                    .words(words)
                    .padding(5)
                    .overflow(true)
                    .rotate(function() { return ~~(Math.random() * 2) * 90; })
                    .font("Impact")
                    .fontSize(function(d) { return fontScale(d.value); })
                    .on("end", draw)
                    .start();
            }
        }

    }

    var init = function () {

        var self = this;

        var svg = sel.selectAll("svg").data(stratData);
        svg.enter().append("svg");
        svg.exit().remove();

        var svgElements = svg;

        svgElements.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .classed("graph-inner", true);

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
            .text(function (d) {
                return d.label;
            });

        // Add the points!
        svgElements.selectAll(".wordcloud").remove();
        svgElements.append("g")
            .attr("class", "wordcloud")
            .each(function(d){
                var words = d3.entries(d.data);
                // min/max word size
                var maxSize = d3.max(words, function(d) { return d.value; });
                var minSize = d3.min(words, function(d) { return d.value; });

                fontScale = d3.scale.linear() // scale algo which is used to map the domain to the range
                            .domain([minSize, maxSize]) //set domain which will be mapped to the range values
                            .range([15,40]); // set min/max font size (so no matter what the size of the highest word it will be set to 40 in this case)


                var myWordCloud = wordCloud(d3.select(this));
                myWordCloud.update(words);
            })
    }

    var _create = function (_container, _stratData) {

        sel = _container;
        stratData = _stratData;

        for(var strat in stratData){
            for(var key in stratData[strat].data){
                var value = stratData[strat].data[key];
                if(max < value){
                    max = value;
                }
                if(min > value){
                    min = value;
                }
            }
        }

        var scale = d3.scale.linear()
            .domain([min, max])
            .range([15, 75]);

        for(var strat in stratData){
            for(var key in stratData[strat].data){
                var value = stratData[strat].data[key];
                stratData[strat].data[key] = scale(value);
            }
        }


        init();
    };

    return {
        create: _create
    }
});
