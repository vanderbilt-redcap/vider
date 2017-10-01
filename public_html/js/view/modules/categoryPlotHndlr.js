/**
 * Created by sunny on 2/18/16.
 */
define(["d3","colorbrewer"],function(d3,colorbrewer){

    //here goes the private variable
    //required for this function
    //as settings required for the
    //rug plot
    //
    //todo: right now this function will be static
    var self = this;

    self.svgWidth = 200;
    self.svgHeight = 15;
    self.outRectBorderColor = "BLACK";
    self.outRectWidth = 1;
    self.outRectBorderWidth = 1;
    self.outRectColor = "BLACK";


    /**
     *
     * @param _div
     */
    var printSVG = function(_d3Container){
        var self = this;

        //Make an SVG Container
        self.svgContainer = _d3Container;

    }

    /**
     * this function will set up the scale required
     * to plot the rectangle on the plot
     * @param _data
     */
    var settingScale = function(_data){
        var dataset = _data;

        var totalCount = 0;
        dataset.forEach(function(d){
            totalCount += d.count;
        });

        self.scale = d3.scale.linear();
        self.scale.domain([0,totalCount]);
        self.scale.range([1,self.svgWidth-1]);
    }

    /**
     * plot all the rectangle for the rug plot
     * @param _data
     */
    var startPlotttingLine =  function(_data){
        var min = 0;
        var max = Number.MIN_VALUE;
        _data.forEach(function(d){
            if(max < d.count){
               max = d.count;
            }
        })
        //console.log(categor)
        var o = d3.scale.ordinal()
            .domain([min,max])
            .range(colorbrewer.Greys[9]);

        var setx = 0;
        _data.forEach(function(d){
            var count = d.count;
            var value = d.value;

            self.svgContainer.append("rect")
                .attr("x",setx)
                .attr("y", 0)
                .attr("width", self.scale(count))
                .attr("height", svgHeight)
                .style("stroke", self.outRectBorderColor)
                .style("fill",o(value))
                .style("stroke-width", self.outRectBorderWidth);

            setx += self.scale(d.count);
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