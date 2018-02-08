/**
 * Created by Sateesh on 5/4/16.
 */

define(["scatterView", "viewVariablePanel", "filterData", "d3-tip", "rugPlotHandler", "categoryPlotHndlr", "require", "d3"],
    function(scatterView, varPanel, filterData, d3tip, rugPlotHandler, categoryPlotHndlr, require, d3){

        var margin = {top: 30, right: 10, bottom: 30, left: 10},
            width = 600 - margin.left - margin.right,
            barHeight = 40,
            barWidth = width * 0.9;

        var fieldsContainer = d3.select("#fieldsContainer");
        var textTip;

        var svgElement = fieldsContainer.attr("width", "100%")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var i = 0,
            duration = 0,
            root;

        var tree = d3.layout.tree()
            .nodeSize([0, 5]);

        var data;

        var xValues = [];
        var yValues = [];

        var axis = '';

        var xLabel = '';
        var yLabel = '';

        var stratObj;
        var stratData;

        var stratFieldID = '';

        function _click(d) {

            var curStateData = require("stateCtrl").top();

            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }

            //check for the leaves and then perform operation
            //addition on main panel
            if(d.depth == 3) {
                var param = {};
                param['formName'] = d.parent.id;
                param['variableName'] = d.id;
                /*curStateData.mainPanel.param.push(param);
                require("view").updateNewState(curStateData);*/

                $('#selectField').modal('hide');

                $('#selectField').on('hidden.bs.modal', function (e) {
                    if (axis === 'x') {
                        xValues = d.data;
                        xLabel = d.Name;
                        $("#scatterX").text(xLabel.substring(0,30) +  (xLabel.length > 30 ? "..." : ""));
                        //Add a method to change the structure of data for scatterview update function.
                        _createContainer();
                        //scatterView.update(xValues, yValues, xLabel, yLabel, false);
                    }
                    else if(axis === 'y'){
                        yValues = d.data;
                        yLabel = d.Name;
                        $("#scatterY").text(yLabel.substring(0,30) +  (yLabel.length > 30 ? "..." : ""));
                        //Add a method to change structure of data ...
                        _createContainer();
                        //scatterView.update(xValues, yValues, xLabel, yLabel, false);
                    }
                    $(this).off('hidden.bs.modal');
                });
            }
            _buildTree(d);
        }

        /**
         * Creates the data structure as per selected fields including stratify and colorby.
         *
         * @private
         */

        var _createContainer = function(){
            var scatterObjectArr = [];

            var strat = filterData.getStrat();
            var isStrat = strat.isStrat;

            var filter_data = filterData.getQuery();

            var colorBy = filterData.getColorBy();
            var isColorBy = colorBy.isColorBy;

            var colorData = '';
            var colorObj = '';

            if(isColorBy){
                colorData = data[colorBy.form].fields[colorBy.variable].data;
                colorObj = data[colorBy.form].fields[colorBy.variable].obj;
            }


            if(isStrat) {
                stratObj = data[strat.form].fields[strat.variable].obj;
                stratData = data[strat.form].fields[strat.variable].data;

                var choiceMap = {};
                var colorChoiceMap = {};
                var colorChoiceLabels = [];
                var filteredStratData = [];
                var filteredColData = [];
                var colKeyData = [];
                var filteredIndexVals = [];
                var originalData = [];

                var scatterData = [];

                var choicelabels = stratObj.select_choices_or_calculations.split('|');
                if(isColorBy) {

                    colorChoiceLabels = colorObj.select_choices_or_calculations.split('|');

                    for (var i = 0; i < colorChoiceLabels.length; i++) {
                        var key = colorChoiceLabels[i].split(',')[0].trim();
                        var value = colorChoiceLabels[i].split(',')[1].trim();

                        colorChoiceMap[key] = value;
                    }

                    for(var key in colorChoiceMap){
                        colKeyData.push(key);
                    }
                }
                else{
                    colorChoiceLabels = [];
                    colorChoiceMap = {};
                    colKeyData = [0];
                }

                for (var i = 0; i < choicelabels.length; i++) {
                    var key = choicelabels[i].split(',')[0].trim();
                    var value = choicelabels[i].split(',')[1].trim();

                    choiceMap[key] = value;
                }


                for(var i = 0; i< filter_data.length; i++){
                    var xval = xValues[i];
                    var yval = yValues[i];

                    if(xval === '')
                        xval = 0;
                    if(yval === '')
                        yval = 0;

                    if(filter_data[i] == true || filter_data[i] == 1){
                        filteredStratData.push(stratData[i]);
                        filteredIndexVals.push(i);

                        if(isColorBy)
                            filteredColData.push(colorData[i]);
                        else
                            filteredColData.push(0);

                        scatterData.push([Number(xval), Number(yval)]);
                    }
                    originalData.push([Number(xval), Number(yval)]);
                }

                //console.log('Strat Data filtered - ', filteredStratData, stratData);
                for(var key in choiceMap){
                    var scatterObj = {};
                    var filteredXY = [];
                    var colFilteredXY = [];
                    var indexVals = [];

                    if (choiceMap.hasOwnProperty(key)) {
                        for(var i = 0; i< filteredStratData.length; i++){
                            if(Number(filteredStratData[i]) == key){
                                filteredXY.push(scatterData[i]);
                                if(filteredColData[i] === '')
                                    colFilteredXY.push(0);
                                else
                                    colFilteredXY.push(Number(filteredColData[i]));
                                indexVals.push(filteredIndexVals[i]);
                            }
                        }
                    }

                    if(xLabel === '')
                        scatterObj.xLabel = 'No Field Selected ..';
                    else
                        scatterObj.xLabel = xLabel;

                    if(yLabel === '')
                        scatterObj.yLabel = 'No Field Selected ..';
                    else
                        scatterObj.yLabel = yLabel;

                    scatterObj.data = filteredXY;
                    scatterObj.colData = colFilteredXY;
                    scatterObj.colKeys = colKeyData;
                    scatterObj.label = choiceMap[key];
                    scatterObj.indexVals = indexVals;
                    scatterObj.originalData = scatterData;

                    scatterObjectArr.push(scatterObj);
                }
            }
            else{
                var scatterObj = {};

                if(xLabel === '')
                    scatterObj.xLabel = 'No Field Selected ..';
                else
                    scatterObj.xLabel = xLabel;

                if(yLabel === '')
                    scatterObj.yLabel = 'No Field Selected ..';
                else
                    scatterObj.yLabel = yLabel;


                var scatterData = [];

                if(xValues === 0 && yValues === 0){
                    for(var i = 0; i < filter_data.length; i++){
                        scatterData.push([0, 0]);
                    }
                }
                else if(xValues === 0){
                    for(var i = 0; i < filter_data.length; i++){
                        var yval = yValues[i];
                        if(yval === '')
                            yval = 0;
                        scatterData.push([0, Number(yval)]);
                    }
                }
                else if(yValues === 0){
                    for(var i = 0; i < filter_data.length; i++){
                        var xval = xValues[i];
                        if(xval === '')
                            xval = 0;
                        scatterData.push([Number(xval), 0]);
                    }
                }
                else{
                    for(var i = 0; i < filter_data.length; i++){
                        var xval = xValues[i];
                        var yval = yValues[i];

                        if(xval === '')
                            xval = 0;

                        if(yval === '')
                            yval = 0;

                        scatterData.push([Number(xval), Number(yval)]);
                    }
                }

                var scatterFilterData = [];
                var colFilterData = [];
                var colKeyData = [];
                var colorChoiceMap = {};
                var indexVals = [];

                //Enable filtering
                for(var i = 0; i < filter_data.length; i++){
                    if(filter_data[i] == true || filter_data[i] == 1){
                        scatterFilterData.push(scatterData[i]);
                        indexVals.push(i);
                        if(isColorBy){
                            if(colorData[i] === '')
                                colFilterData.push(0);
                            else
                                colFilterData.push(Number(colorData[i]));
                        }
                        else{
                            colFilterData.push(0);
                        }
                    }
                }

                if(isColorBy){
                    var colorChoiceLabels = colorObj.select_choices_or_calculations.split('|');

                    for (var i = 0; i < colorChoiceLabels.length; i++) {
                        var key = colorChoiceLabels[i].split(',')[0].trim();
                        var value = colorChoiceLabels[i].split(',')[1].trim();

                        colorChoiceMap[key] = value;
                    }

                    for(var key in colorChoiceMap){
                        colKeyData.push(key);
                    }
                }
                else{
                    colKeyData = [0];
                }

                scatterObj.data = scatterFilterData;
                scatterObj.colData = colFilterData;
                scatterObj.colKeys = colKeyData;
                scatterObj.label = 'Scatter Plot for selected fields';
                scatterObj.indexVals = indexVals;
                scatterObj.originalData = scatterData;

                scatterObjectArr.push(scatterObj);
            }

            scatterView.update(scatterObjectArr);

        }

        var _color = function(d){
            return d._children ? "#000000" : d.children ? "#000000" : "#FFFFFF";
        }

        var _selectFields = function(_data, _params, selection){
            data = _data
            axis = selection;
            var formattedData = varPanel.wrangleData(data, _params);

            if(data != null){
                var form = formattedData;

                form.x0 = 0;
                form.y0 = 0;
                _buildTree(root = form);
            }

            root = form;
        };

        var _buildTree = function(source){

            var nodes = tree.nodes(root);

            var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

            //this will update the hieght of the tree
            fieldsContainer.attr("height", height);

            // Compute the "layout".
            nodes.forEach(function(n, i) {
                n.x = i * barHeight;
            });

            // Update the nodes…
            var node = svgElement.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .style("opacity", 1e-6)
                .on("mouseenter",function(d){
                    //only for the leaves


                })
                .on("mouseleave",function(d){
                    d3.select(this).select(".selection").remove();
                })


            // Enter any new nodes at the parent's previous position.
            nodeEnter.append("rect")
                .attr("y", -barHeight / 2)
                .attr("height", barHeight)
                .attr("width", barWidth)
                .style("fill", _color)
                .on("click", _click)
                .on("mouseover",function(d){
                    if(d.parent !== null && d.parent.Name === "Selected Variables") {
                        d3.select(this).style("fill","red");
                    }
                })
                .on("mouseout",function(d){
                    if(d.parent != null && d.parent.Name === "Selected Variables") {
                        d3.select(this).style("fill","white");
                    }
                });

            nodeEnter.append("text")
                .attr("dy", 0)
                .attr("dx", 5)
                .text(function(d) { return  d.Name.substring(0,500) +  (d.Name.length > 550 ? "..." : ""); });

            nodeEnter.append("g")
                .attr("transform", "translate(" + 5 + "," + 5 + ")")
                .each(function(d){
                    if (d.type === "text" && d.validation === "integer" ) {
                        flag = false;
                        rugPlotHandler.create(d3.select(this), d.data);
                    }
                    else if( d.type === "text" && d.validation === "number" ) {
                        flag = false;
                        rugPlotHandler.create(d3.select(this), d.data);
                    }
                    else if( d.type === "text" && d.validation.match(/^date_/) ) {
                        flag = false;
                        rugPlotHandler.create(d3.select(this), d.data);
                    }
                    else if(d.type === "dropdown" ||d.type === "radio" ){

                        var keyValuePair = {};
                        var formName = d.form;
                        var varName = d.variable;
                        var varObj = data[formName].fields[varName].obj;
                        var varData = data[formName].fields[varName].data;
                        var categories = varObj.select_choices_or_calculations.split("|");

                        //
                        categories.forEach(function(cat){
                            var pair = cat.split(",");
                            var key = pair[0].trim();
                            var value = pair[1].trim();

                            //this will store the key
                            //value pair
                            keyValuePair[key] = {
                                value: value, //category
                                count: 0      //counter
                            }
                        });

                        //add extra handling for empty fields
                        keyValuePair[""] = {
                            value: "",
                            count: 0
                        }

                        //increment the counter for all
                        varData.forEach(function(data){
                            keyValuePair[data].count++;
                        })
                        categoryPlotHndlr.create(d3.select(this), d3.values(keyValuePair));
                    }
                });

            // Transition nodes to their new position.
            nodeEnter.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + parseInt(d.y) + "," + d.x + ")"; })
                .style("opacity", 1);

            node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1)
                .select("rect")
                .style("fill", _color);

            // Transition exiting nodes to the parent's new position.
            node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .style("opacity", 1e-6)
                .remove();


            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        //Initializing the Scatterplot controls
        var _init = function(_data, _selectedParams){
            var self = this;
            xValues = 0;
            yValues = 0;

            xLabel = '';
            yLabel = '';

            self.surveyData = _data;
            self.params = _selectedParams;

            var scatterDiv = document.getElementById("scatterPlot");

            var controlsDiv = document.createElement("div");

            controlsDiv.appendChild(document.createTextNode('X-Axis - '));
            var xaxis = document.createElement("button");
            xaxis.setAttribute("type", "button");
            xaxis.setAttribute("class", "btn btn-primary btn-xs");
            xaxis.setAttribute("id", "scatterX");
            xaxis.setAttribute("data-toggle", "modal");
            xaxis.setAttribute("data-target", "#selectField");
            xaxis.appendChild(document.createTextNode("Select a Field"));
            controlsDiv.appendChild(xaxis);

            controlsDiv.appendChild(document.createTextNode('\u00A0\u00A0'));

            controlsDiv.appendChild(document.createTextNode('Y-Axis - '));
            var yaxis = document.createElement("button");
            yaxis.setAttribute("type", "button");
            yaxis.setAttribute("class", "btn btn-primary btn-xs");
            yaxis.setAttribute("id", "scatterY");
            yaxis.setAttribute("data-toggle", "modal");
            yaxis.setAttribute("data-target", "#selectField");
            yaxis.appendChild(document.createTextNode("Select a Field"));
            controlsDiv.appendChild(yaxis);

            controlsDiv.appendChild(document.createTextNode('\u00A0\u00A0'));
            controlsDiv.appendChild(document.createTextNode('\u00A0\u00A0'));

            var close_button = document.createElement("button");
            close_button.setAttribute("type", "button");
            close_button.setAttribute("class", "btn btn-primary btn-xs");
            close_button.setAttribute("id", "scatterClose");
            close_button.appendChild(document.createTextNode("Close"));
            controlsDiv.appendChild(close_button);

            scatterDiv.appendChild(controlsDiv);

            $('#selectField').on('shown.bs.modal', function (e) {
                if(e.relatedTarget.id === 'scatterX'){
                    _selectFields(self.surveyData, self.params, 'x');
                }
                else if(e.relatedTarget.id === 'scatterY'){
                    _selectFields(self.surveyData, self.params, 'y');
                }
                // do something...
            })

            $('#scatterClose').click(function(){
                $('#scatterPlot').html('');
                $('#createScatter').prop('disabled', false);
                require("view").reset();
            });



            scatterView.init(xValues, yValues);
        }

        //public functions of this class
        return {
            init: _init,
            create: _createContainer
        }
    });
