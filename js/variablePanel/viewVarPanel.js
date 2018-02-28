/**
 * Created by sunny on 2/14/16.
 */
define(["require","d3","d3-tip","rugPlotHandler","categoryPlotHndlr","global","filterData"],
    function(require,d3,d3tip,rugPlotHandler,categoryPlotHndlr, global, filterData){
        /**
         * Declare all the local variables here.
         * @type {{}}
         * @type other
         */

        var margin = {top: 30, right: 0,
                      bottom: 30, left: 0},
            width = 410 - margin.left - margin.right,
            barHeight = 55,
            barWidth = width * 0.9;

        var varPanel = d3.select("#varPanel");
        $("#left-top").prepend("<div id='scatterPlot'><a data-toggle='modal' data-target='#scatterPlotModal'>Add a Scatter Plot</a></div>");
        $("#left-bottom").prepend("<h3 style='margin-top: 0px;'>Filter Changes</h3>");
        var dataPanel = document.getElementById("dataPanel");

        var svgElement = varPanel.attr("width", "100%")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var i = 0,
            duration = 0,
            root;

        var tree = d3.layout.tree()
            .nodeSize([0, 0]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var params;

        var data;

        /**
         * This function is used to wrangle the raw data and format it
         * into the appropriate structure
         * @param _data
         * @private
         * @returns {}
         */

        var _wrangleData = function(_data,_selVars){
            data = _data;

            var selectedVariable ={};
            var variablePanelData = {};
            var formChildren = [];
            //variablePanelData['Name'] = 'Forms';
            variablePanelData['Name'] = '';
            variablePanelData['empty'] = true;

            for (var form in _data) {
                var formData={};
                if (_data.hasOwnProperty(form)) {
                    formData['Name'] = _data[form].label;
                    formData['id'] = form;

                    var fieldChildren = [];
                    for(var field in _data[form].fields){
                        var fieldData = {};
                        if(_data[form].fields.hasOwnProperty(field)){

                            //over here check for the data type
                            //if the data is numerical go for the
                            //histogram
                            var fieldType = data[form].fields[field].obj.field_type;
                            var validationType = data[form].fields[field].obj.text_validation_type_or_show_slider_number;

                            if ((fieldType === "text" && (validationType === "number" || validationType === "integer" || validationType.match(/^date/)))
                                || (fieldType === "dropdown" || fieldType === "radio" || fieldType == "checkbox")
                                || fieldType === "text") {

                                fieldData['form'] = form;
                                fieldData['variable'] = _data[form].fields[field].obj.field_name;
                                fieldData['type'] = _data[form].fields[field].obj.field_type;
                                fieldData['validation'] = _data[form].fields[field].obj.text_validation_type_or_show_slider_number;
                                fieldData['chart'] = ''; 
                                if (fieldData['type'] === "text" && (fieldData['validation'] === "number" || fieldData['validation'] === "integer") || fieldData['validation'].match(/^date/)) {
                                    fieldData['chart'] = '(View Histogram)'; 
                                }
                                else if (fieldData['type'] === "dropdown" || fieldType === "radio") {
                                    fieldData['chart'] = '(View Bar Chart)'; 
                                }
                                else if (fieldData['type'] === "checkbox") {
                                    fieldData['chart'] = '(View Bar Chart)'; 
                                }
                                else if(fieldData['type'] === "text"){
                                    fieldData['chart'] = '(View Word Cloud)'; 
                                }
                                fieldData['Name'] = _data[form].fields[field].obj.field_label;
                                fieldData['id'] = field;
                                fieldData['data'] = _data[form].fields[field].data;
                                fieldData["isSelected"] = false;
                                fieldData["empty"] = false;
                                fieldData["isTopLevel"] = false;
                                //add the

                                //add the field for the selected variable
                                _selVars.forEach(function (sel) {
                                    if (sel["formName"] == fieldData['form']) {
                                        if (sel["variableName"] == fieldData['variable']) {
                                            fieldData["isSelected"] = true;
                                        }
                                    }
                                })

                                fieldChildren.push(fieldData);
                            }
                        }
                    }
                    formData['children'] = fieldChildren;
                }
                formChildren.push(formData);
            }
            variablePanelData['children'] = formChildren;

            var selectedVariableChildren = [];

           _selVars.forEach(function(d){

                //check whether you have inserted the same children already
                //if yes then do nothing
                var flag = true;
                for(var obj in selectedVariableChildren){
                    if(selectedVariableChildren[obj].form === d.formName
                        && selectedVariableChildren[obj].variable === d.variableName ){
                        flag = false;
                    }
                }

                if(flag) {
                    var fieldData = {};
                    formData['Name'] = _data[d.formName].label;

                    fieldData['form'] = d.formName;
                    fieldData['variable'] = _data[d.formName].fields[d.variableName].obj.field_name;
                    fieldData['type'] = _data[d.formName].fields[d.variableName].obj.field_type;
                    fieldData['validation'] = _data[d.formName].fields[d.variableName].obj.text_validation_type_or_show_slider_number;
                    fieldData['chart'] = 'ABCD'; 
                    if (fieldData['type'] === "text" && (fieldData['validation'] === "number" || fieldData['validation'] === "integer") || fieldData['validation'].match(/^date/)) {
                        fieldData['chart'] = '(Histogram)'; 
                    }
                    else if (fieldData['type'] === "dropdown" || fieldType === "radio") {
                        fieldData['chart'] = '(Bar Chart)'; 
                    }
                    else if (fieldData['type'] === "checkbox") {
                        fieldData['chart'] = '(Bar Chart)'; 
                    }
                    else if(fieldData['type'] === "text"){
                        fieldData['chart'] = '(Word Cloud)'; 
                    }
                    fieldData['Name'] = _data[d.formName].fields[d.variableName].obj.field_label;
                    fieldData['id'] = "sel" + d.variableName;
                    fieldData['data'] = _data[d.formName].fields[d.variableName].data;
                    fieldData["isSelected"] = true;
                    fieldData["isTopLevel"] = true;
                    fieldData["empty"] = false;

                    selectedVariableChildren.push(fieldData);
                }
            })
            selectedVariable["Name"] = "Selected Variables";
            selectedVariable["children"] = selectedVariableChildren;

            var parentChildren = [];

            if( selectedVariableChildren.length > 0 ) {
                parentChildren.push(selectedVariable);
            }
            parentChildren.push(variablePanelData);

            var parentVarPanel = {};
            //parentVarPanel["Name"] = "REDCap Project";
            parentVarPanel["Name"] = "";
            parentVarPanel["empty"] = true;
            parentVarPanel["children"] = parentChildren;

            return parentVarPanel;
        }


        /**
         * This function is used to initialize the var panel in the main page.
         * @param data
         * @private
         */

        var _initPanel =  function(_data){

            params = [];

            if(_data != null){
                var form = _data;

                form.x0 = 0;
                form.y0 = 0;
                _update(root = form);
            }
            else{
                console.log("Error with the variable panel data");
            }
        }


        /**
         * This function is used to Update the visualization.
         * @param source
         * @private
         */
        var flag = true;
        var _update = function(source){
            // Compute the flattened node list. TODO use d3.layout.hierarchy.
            var nodes = tree.nodes(root);

            var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);
            //textTip = d3tip().attr('class', 'd3-tip').offset([-12, 0]).html(function(d) { return "<p>" + d.Name + "</p>"; });
            //varPanel.call(textTip);


            //this will update the hieght of the tree
            varPanel.attr("height", height);

            // Compute the "layout".
            nodes.forEach(function(n, i) {
                n.x = i * barHeight;
            });

            // Update the nodes…
            var node = svgElement.selectAll("g.node")
                .data(nodes, function(d) {

                    return d.id || (d.id = ++i);
                });


            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .on("click", function(d) {
                    if(d.children || d._children) {
                        _click(d)
                    }
                })
                .on("mouseenter",function(d){

                    //visible
                    d3.select(this)
                        .select(".varPlotGraphDisplay")
                        .style("visibility","visible");

                    //only for the leaves
                    if(d.children == null && d._children == null ){

                        var select = d3.select(this)
                            .append("g")
                            .classed("selection", true)
                           .attr("transform", "translate(" + (barWidth - 140) + "," + ((-barHeight / 2) + 10) + ")");

                        if(!d.isSelected || d.isTopLevel) {

                            var fo = select.append("foreignObject")
                                .attr("width", 140)
                                .attr("height", 30)
                                .style("float", "left");

                            if(d.type == "checkbox"){
                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns fa-2x')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns fa-2x')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');
                            }
                            else if(!(d.type == "text" && d.validation == "")){

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns fa-2x')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns fa-2x')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');


                                fo.append("xhtml:a")
                                    .attr("data-toggle","tooltip")
                                    .attr("title","Color partitions in all graphs by this variable")
                                    .append("xhtml:i")
                                        .attr("class", 'fa fa-tint fa-2x')
                                        //.style("font-size", "25")
                                        .attr("aria-hidden", 'true')
                                        .on("click", function (d) {
                                            require("filterData").setColorBy(d.form, d.variable);
                                            require("view").updateNewState(require("stateCtrl").top());
                                        });
                            }
                            else{
                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns fa-2x')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns fa-2x')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');

                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-columns')
                                    .attr("aria-hidden", 'true')
                                    .style("visibility", 'hidden');
                            }


                            //these are
                            fo.append("xhtml:i")
                                .attr("class", 'fa fa-columns')
                                .attr("aria-hidden", 'true')
                                .style("visibility", 'hidden');

                            if (d.parent !== null && d.parent.Name === "Selected Variables") {
                                fo.append("xhtml:i")
                                    .attr("class", 'fa fa-minus fa-2x')
                                    .attr("aria-hidden", 'true')
                                    .on("click", _click)
                            }
                            else {
                                fo.append("xhtml:a")
                                    .attr("data-toggle","tooltip")
                                    .attr("title","Add a visualization")
                                    .append("xhtml:i")
                                        .attr("class", 'fa fa-plus fa-2x')
                                        .attr("aria-hidden", 'true')
                                        .on("click", _click)
                            }
                        }
                    }

                })
                .on("mouseleave",function(d){
                    //hide plot
                    d3.select(this)
                        .select(".varPlotGraphDisplay")
                        .style("visibility","hidden");
                    d3.select(this).select(".selection").remove();
                })
                .on("click",_click);



            // Enter any new nodes at the parent's previous position.
            nodeEnter.append("rect")
                .attr("y", -barHeight / 2)
                .attr("height", function(d){
                    if(d.empty) {
                        return 5;
                    }

                    //default return
                    return barHeight-5
                })
                .attr("width", barWidth)
                .classed("menu-node",true)
                .style("fill", function(d,i){
                    return _color(d,i);
                })
                .style("stroke-width", function(d){
                    if(d.empty){
                        return 0;
                    }
                    return 0.2
                })
                .on("mouseover",function(d){
                    if(!d.children && !d._children) { // only for leave nodes
                        d._color = d3.select(this).style("fill");

                        if(!d.isSelected) {
                            d3.select(this).style("fill", "darkgrey");
                        }
                    }
                })
                .on("mouseout",function(d){
                    if(!d.children && !d._children) {
                        d3.select(this).style("fill", d._color);
                    }
                    global.tips.numTextTip.hide();
                });

            /*<i class="fa fa-camera-retro fa-lg"></i>*/
            nodeEnter.append("polygon")
                    .attr("points", function(d){
                            if(d.children) {
                                return "2 0, 6 6, 10 0";
                            }
                            else if(d._children){
                                return "2 -2, 8 2, 2 6";
                            }
                    })
                    .attr("fill", "#FFF5EE");

            nodeEnter.append("text")
                .attr("dy", function(d){
                    if(d.children) {
                        return 5;
                    }
                    return -5;
                })
                .attr("dx", function(d){
                    if(d.children) {
                        return 20;
                    }
                    return 5;
                })
                .style("font-size",function(d){
                    if(d.children || d._children){
                        return 17;
                    }
                    else{
                        return 15;
                    }
                })
                .style("fill",function(d){
                    if(d.children || d._children){
                        return "#FFF5EE"
                    }
                    else{
                        return "black"
                    }
                })
                .text(function(d){
                    var name = stripHtml(d.Name);
                    var prefix = "";
                    var suffix = "";
                    var suffix2 = "";
                    if (name && name != 'Selected Variables' && !d.variable) {
                        // form
                        prefix = "Fields for Form ";
                        suffix2 = "(Click Variable[s])";
                    }
                    if (name == 'Selected Variables') {
                        suffix2 = "(Click Variable)";
                    }
                    if (d.chart) {
                        suffix = " " + d.chart;
                    }
                    return prefix + name.substring(0,25) +  (name.length > 25 ? "..." : "") + suffix + suffix2;
                });

            nodeEnter.append("g")
                .classed("varPlotGraphDisplay",true)
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
                    else if( d.type === "text" && d.validation.match(/^date/) ) {
                        flag = false;
                        for (var i = 0; i < d.data.length; i++) {
                            if (d.data[i] && isNaN(d.data[i])) {
                                var dateAry = new Array(1970, 1, 1);
                                var sections = String(d.data[i]).split(/\s/);
                                var dnodes = sections[0].split(/-/);
                                var tnodes = new Array(0, 0, 0);
                                if (sections.length >= 2) {
                                    var mytnodes = sections[1].split(/:/);
                                    if (mytnodes.length > 0) {
                                        tnodes[0] = mytnodes[0];
                                    }
                                    if (mytnodes.length > 1) {
                                        tnodes[1] = mytnodes[1];
                                    }
                                    if (mytnodes.length > 2) {
                                        tnodes[2] = mytnodes[2];
                                    }
                                }
                                if (d.validation.match(/_ymd$/)) {
                                    dateAry = new Array(dnodes[0], dnodes[1], dnodes[2]);
                                }
                                else if (d.validation.match(/_mdy$/)) {
                                    dateAry = new Array(dnodes[2], dnodes[0], dnodes[1]);
                                }
                                else if (d.validation.match(/_dmy$/)) {
                                    dateAry = new Array(dnodes[2], dnodes[1], dnodes[0]);
                                }
                                var date = new Date(Date.UTC(dateAry[0], dateAry[1], dateAry[2], tnodes[0], tnodes[1], tnodes[2]));  
                                d.data[i] = date.getTime() / 1000;
                            }
                        }
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
                //.style("opacity", 1e-6)
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        /**
         * This function is invoked on click of an item
         * @param d
         */
        function _click(d) {

            if(!d.empty) {

                var curStateData = require("stateCtrl").top();
                if (d.parent !== null && d.parent.Name === "Selected Variables") {
                    curStateData.mainPanel.param = curStateData.mainPanel.param.filter(function (el) {
                        return !(el.formName === d.form && el.variableName === d.variable);
                    })
                    require("view").updateNewState(curStateData);
                }
                else if (d.children) {
                    d._children = d.children;
                    d.children = null;

                    d3.select(this.parentNode).select("polygon").remove();
                    d3.select(this.parentNode)
                        .append("polygon")
                        .attr("points", "2 -2, 8 2, 2 6")
                        .attr("fill", "#FFF5EE");

                }
                else {

                    if (d.depth != 3) {
                        d.children = d._children;
                        d._children = null;

                        d3.select(this.parentNode).select("polygon").remove();
                        d3.select(this.parentNode)
                            .append("polygon")
                            .attr("points", "2 0, 6 6, 10 0")
                            .attr("fill", "#FFF5EE");
                    }
                }

                //check for the leaves and then perform operation
                //addition on main panel
                if (d.depth == 3) {
                    var param = {};
                    param['formName'] = d.parent.id;
                    param['variableName'] = d.id;
                    param["projectID"] = 0;
                    curStateData.mainPanel.param.push(param);
                    require("view").updateNewState(curStateData);
                }

                _update(d);
            }
        }

        /**
         * this function will return the state
         * of the main panel
         * @param d
         * @returns {*}
         * @private
         */
        var _color = function(d,i){
            if(d.empty){
                return "#FFFFFF";
            }
            else if(d.isSelected){
                return "#8199C9";
            }
            return d._children ? "#122f6a" : d.children ? "#122f6a" : i % 2  ? "#FFFFFF" : "#d3d3d3";
        }


        /**
         * This is a dummy function to represent the data
         * @param data
         */

        function _updateDataPanel(_data){
            dataPanel.innerHTML = "";
            if(_data){
                for (i = 0; i < _data.length; i++) {
                    var tr = document.createElement('TR');
                    var td = document.createElement('TD')
                    td.appendChild(document.createTextNode(_data[i]));
                    tr.appendChild(td)
                    dataPanel.appendChild(tr);
                }
            }
        }

        return {
            wrangleData: _wrangleData,
            initPanel: _initPanel
        }
    })
