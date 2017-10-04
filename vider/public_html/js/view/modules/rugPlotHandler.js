/**
 * Created by sunny on 2/18/16.
 */
define(["d3"],function(d3){

    //here goes the private variable
    //required for this function
    //as settings required for the
    //rug plot
    //
    //todo: right now this function will be static
    var self = this;

    self.svgWidth = 50;
    self.svgHeight = 15;
    self.outRectBorderColor = "BLACK";
    self.outRectWidth = 1;
    self.outRectBorderWidth = 0;
    self.outRectColor = "BLACK";

    /**
     *
     * @param _div
     */
    var printSVG = function(_d3Container){
        var self = this;

        //Make an SVG Container
        self.svgContainer = _d3Container.style("stroke", 1)
            .style("stroke-width", 1);
    }

    /**
     * this function will set up the scale required
     * to plot the rectangle on the plot
     * @param _data
     */
    var settingScale = function(_data){
        var dataset = _data;

        self.scale = d3.scale.linear();
        self.scale.domain([Math.min.apply(Math,dataset),Math.max.apply(Math,dataset)]);
        self.scale.range([1,self.svgWidth-1]);
    }

    /**
     * plot all the rectangle for the rug plot
     * @param _data
     */
    var startPlotttingLine =  function(_data){
        var dataset = _data;
        dataset.forEach(function(d){
            self.svgContainer.append("rect")
                .attr("x", self.scale(d))
                .attr("y", 0)
                .attr("width", outRectWidth)
                .attr("height", svgHeight)
                .style("stroke", self.outRectBorderColor)
                .style("fill", self.outRectColor)
                .style("opacity", .2)
                .style("stroke-width", self.outRectBorderWidth);
        });
    }

    /**
     * this function wil create the rug plot
     * for the numerical data on the given div
     * @param _div
     * @param _data
     */
    var create =  function(_d3Container,_data){
        printSVG(_d3Container);
        settingScale(_data);
        startPlotttingLine(_data);
    }

    /**
     * exposed functions of the class
     */
    return {
        create: create
    }
})