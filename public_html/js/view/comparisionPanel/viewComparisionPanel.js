/**
 * Created by Sateesh on 3/1/16.
 */

define(["jquery","d3","d3Parsets","filterData"],
    function ($,d3,d3Parsets,filterData) {

        /**
         * This class is responsible for initializing and updating the comparision panel on field selection
         * on the ui
         * @type {null}
         */
        var instance = null;
        var data = [];
        var FILTER ={
            HOVER: 0,
            CLICK: 1,
            SELECTION: 2,
            DEFAULT: 3,
            UNCLICK: 4,
            UNHOVER: 5
        }

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function ViewComparisionPanel() {
            var self = this;
            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one ViewComparisionPanel, use ViewComparisionPanel.getInstance()");
            }
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        ViewComparisionPanel.getInstance = function () {
            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new ViewComparisionPanel();
            }
            return instance;
        };

        /**
         * Modifies the data based on selected param values to the required format
         * for the visualization
         * @param _stateEventHndlr
         */
        ViewComparisionPanel.prototype.wrangleData= function(_data, _filterData){
            var self = this;

            self.compData = _data.data;
            self.compParams = _data.param;
            var dataLength = 0;

            self.dimensions = [];
            self.data = [];
            self.filterData = _filterData;

            var fieldToData = {};

            for(var form in self.compParams){
                var fieldLabel = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].obj.field_label;
                var fieldType = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].obj.field_type;
                var fieldData = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].data;

                dataLength = fieldData.length;

                var dataLabels = [];

                var categories = {};

                if(fieldType == 'dropdown' || fieldType  == 'radio'){
                    var choices = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].obj.select_choices_or_calculations;

                    var choicelabels = choices.split('|');

                    for(var i = 0; i < choicelabels.length; i++){
                        var key = choicelabels[i].split(',')[0].trim();
                        var value = choicelabels[i].split(',')[1].trim();

                        categories[key] = value;
                    }

                    for(var j = 0; j < fieldData.length; j++){
                        if(fieldData[j] in categories)
                            dataLabels.push(categories[fieldData[j]]);
                        else
                            dataLabels.push('NULL');
                    }

                    self.dimensions.push(fieldLabel);

                    fieldToData[fieldLabel] = dataLabels;
                }
                else if(fieldType == 'text'){
                    var x = d3.scale.linear().domain([Math.min.apply(Math,fieldData),Math.max.apply(Math,fieldData)]);
                    var choices = d3.layout.histogram().bins(x.ticks(10))(fieldData);

                    var binSize = 0;

                    for(var i = 0; i < choices.length; i++){
                        var value = choices[i].x + '-' + (choices[i].x + choices[i].dx);
                        binSize = choices[i].dx;

                        categories[i] = value;
                    }

                    for(var j = 0; j < fieldData.length; j++){
                        if(fieldData[j]){
                            var key = Math.floor(fieldData[j]/binSize);
                            dataLabels.push(categories[key]);
                        }
                        else
                            dataLabels.push('NULL');
                    }

                    self.dimensions.push(fieldLabel);

                    fieldToData[fieldLabel] = dataLabels;
                }
                else{
                    console.log('This field type is not numeric or categorical.', fieldType);
                }

            }

            for(var k = 0; k < dataLength; k++){
                if(self.filterData != null)
                if(self.filterData[k] == true || self.filterData[k] == 1){
                    var entry = {};

                    for(var dimension in self.dimensions){
                        entry[self.dimensions[dimension]] = fieldToData[self.dimensions[dimension]][k];
                    }

                    self.data.push(entry);
                }
            }

        }

        /**
         * initialize the view with the
         * state event handler
         * @param _stateEventHndlr
         */
        ViewComparisionPanel.prototype.init= function(){
            var self = this;

            if(self.dimensions.length >= 2){
                d3.select("#comparisionPanel").selectAll("svg").remove();
                //var chart = d3.parsets().dimensions(["Test", "Type", "Medium", "Browser"]);

                var chart = d3.parsets()
                    .dimensions(self.dimensions);

                //var divHeight = chart.height();
                //var divWidth = document.getElementById("comparisionPanel").clientWidth;

                var vis = d3.select("#comparisionPanel").append("svg")
                    .attr("width", chart.width())
                    .attr("height", chart.height());

                //var vis = d3.select("#comparisionPanel").append("svg").attr("width", divWidth).attr("height", divHeight);

                var partition = d3.layout.partition()
                    .sort(null)
                    .size([chart.width(), chart.height() * 5 / 4])
                    .children(function(d) { return d.children ? d3.values(d.children) : null; })
                    .value(function(d) { return d.count; });

                var ice = false;

                function curves() {
                    var t = vis.transition().duration(500);
                    if (ice) {
                        t.delay(1000);
                        icicle();
                    }
                    t.call(chart.tension(this.checked ? .5 : 1));
                }


                vis.datum(self.data).call(chart);

                window.icicle = function() {
                    var newIce = this.checked,
                        tension = chart.tension();
                    if (newIce === ice) return;
                    if (ice = newIce) {
                        var dimensions = [];
                        vis.selectAll("g.dimension")
                            .each(function(d) { dimensions.push(d); });
                        dimensions.sort(function(a, b) { return a.y - b.y; });

                        var root = d3.parsets().tree({children: {}},
                            self.data,
                            dimensions.map(function(d) {
                                /*console.log('inner - ', d);*/
                                return d.name; }),
                            function() { return 1; }),
                          nodes = partition(root),
                            nodesByPath = {};
                        nodes.forEach(function(d) {
                            var path = d.data.name,
                                p = d;
                            while ((p = p.parent) && p.data.name) {
                                path = p.data.name + "\0" + path;
                            }
                            if (path) nodesByPath[path] = d;
                        });
                        var data = [];
                        vis.on("mousedown.icicle", stopClick, true)
                            .select(".ribbon").selectAll("path")
                            .each(function(d) {
                                var node = nodesByPath[d.path],
                                    s = d.source,
                                    t = d.target;
                                s.node.x0 = t.node.x0 = 0;
                                s.x0 = t.x0 = node.x;
                                s.dx0 = s.dx;
                                t.dx0 = t.dx;
                                s.dx = t.dx = node.dx;
                                data.push(d);
                            });
                        iceTransition(vis.selectAll("path"))
                            .attr("d", function(d) {
                                var s = d.source,
                                    t = d.target;
                                return ribbonPath(s, t, tension);
                            })
                            .style("stroke-opacity", 1);
                        iceTransition(vis.selectAll("text.icicle")
                            .data(data)
                            .enter().append("text")
                            .attr("class", "icicle")
                            .attr("text-anchor", "middle")
                            .attr("dy", ".3em")
                            .attr("transform", function(d) {
                                return "translate(" + [d.source.x0 + d.source.dx / 2, d.source.dimension.y0 + d.target.dimension.y0 >> 1] + ")rotate(90)";
                            })
                            .text(function(d) { return d.source.dx > 15 ? d.node.name : null; })
                            .style("opacity", 1e-6))
                            .style("opacity", 1);
                        iceTransition(vis.selectAll("g.dimension rect, g.category")
                            .style("opacity", 1))
                            .style("opacity", 1e-6)
                            .each("end", function() { d3.select(this).attr("visibility", "hidden"); });
                        iceTransition(vis.selectAll("text.dimension"))
                            .attr("transform", "translate(0,-5)");
                        vis.selectAll("tspan.sort").style("visibility", "hidden");
                    } else {
                        vis.on("mousedown.icicle", null)
                            .select(".ribbon").selectAll("path")
                            .each(function(d) {
                                var s = d.source,
                                    t = d.target;
                                s.node.x0 = s.node.x;
                                s.x0 = s.x;
                                s.dx = s.dx0;
                                t.node.x0 = t.node.x;
                                t.x0 = t.x;
                                t.dx = t.dx0;
                            });
                        iceTransition(vis.selectAll("path"))
                            .attr("d", function(d) {
                                var s = d.source,
                                    t = d.target;
                                return ribbonPath(s, t, tension);
                            })
                            .style("stroke-opacity", null);
                        iceTransition(vis.selectAll("text.icicle"))
                            .style("opacity", 1e-6).remove();
                        iceTransition(vis.selectAll("g.dimension rect, g.category")
                            .attr("visibility", null)
                            .style("opacity", 1e-6))
                            .style("opacity", 1);
                        iceTransition(vis.selectAll("text.dimension"))
                            .attr("transform", "translate(0,-25)");
                        vis.selectAll("tspan.sort").style("visibility", null);
                    }
                };
                d3.select("#icicle")
                    .on("change", icicle)
                    .each(icicle);


                function iceTransition(g) {
                    return g.transition().duration(1000);
                }

                function ribbonPath(s, t, tension) {
                    var sx = s.node.x0 + s.x0,
                        tx = t.node.x0 + t.x0,
                        sy = s.dimension.y0,
                        ty = t.dimension.y0;
                    return (tension === 1 ? [
                        "M", [sx, sy],
                        "L", [tx, ty],
                        "h", t.dx,
                        "L", [sx + s.dx, sy],
                        "Z"]
                        : ["M", [sx, sy],
                        "C", [sx, m0 = tension * sy + (1 - tension) * ty], " ",
                        [tx, m1 = tension * ty + (1 - tension) * sy], " ", [tx, ty],
                        "h", t.dx,
                        "C", [tx + t.dx, m1], " ", [sx + s.dx, m0], " ", [sx + s.dx, sy],
                        "Z"]).join("");
                }

                function stopClick() { d3.event.stopPropagation(); }

                // Given a text function and width function, truncates the text if necessary to
                // fit within the given width.
                function truncateText(text, width) {
                    return function(d, i) {
                        var t = this.textContent = text(d, i),
                            w = width(d, i);
                        if (this.getComputedTextLength() < w) return t;
                        this.textContent = "…" + t;
                        var lo = 0,
                            hi = t.length + 1,
                            x;
                        while (lo < hi) {
                            var mid = lo + hi >> 1;
                            if ((x = this.getSubStringLength(0, mid)) < w) lo = mid + 1;
                            else hi = mid;
                        }
                        return lo > 1 ? t.substr(0, lo - 2) + "…" : "";
                    };
                }

                d3.select("#file").on("change", function() {
                    var file = this.files[0],
                        reader = new FileReader;
                    reader.onloadend = function() {
                        var csv = d3.csv.parse(reader.result);
                        vis.datum(csv).call(chart
                            .value(csv[0].hasOwnProperty("Number") ? function(d) { return +d.Number; } : 1)
                            .dimensions(function(d) { return d3.keys(d[0]).filter(function(d) { return d !== "Number"; }).sort(); }));
                    };
                    reader.readAsText(file);
                });
            }
            else{
                //console.log('Less than two fields selected');
            }
        }

        /**
         * update the view with the
         * state event handler
         * @param _stateEventHndlr
         */
        ViewComparisionPanel.prototype.update= function(_data) {
            var self = this;

            var sel_field_label = _data.source.dimension.name;
            var sel_choice_label = _data.source.node.name;
            var sel_form_name = '';
            var sel_field_name = '';
            var sel_key = '';

            for(form in self.compParams) {
                var fieldLabel = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].obj.field_label;
                var fieldType = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].obj.field_type;
                var fieldData = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].data;

                if(fieldLabel === sel_field_label) {
                    sel_form_name = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].obj.form_name;
                    sel_field_name = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].obj.field_name;

                    if (fieldType == 'dropdown' || fieldType == 'radio') {
                        var choices = self.compData[self.compParams[form]['formName']].fields[self.compParams[form]['variableName']].obj.select_choices_or_calculations;

                        var choicelabels = choices.split('|');

                        for (var i = 0; i < choicelabels.length; i++) {
                            var key = choicelabels[i].split(',')[0].trim();
                            var value = choicelabels[i].split(',')[1].trim();

                            if (value === sel_choice_label)
                                sel_key = key;
                        }
                    }
                    else if (fieldType == 'text') {
                        var x = d3.scale.linear().domain([Math.min.apply(Math, fieldData), Math.max.apply(Math, fieldData)]);
                        var choices = d3.layout.histogram().bins(x.ticks(10))(fieldData);

                        var binSize = 0;

                        for (var i = 0; i < choices.length; i++) {
                            var value = choices[i].x + '-' + (choices[i].x + choices[i].dx);

                            if(value === sel_choice_label)
                                sel_key = choices[i].x;
                        }
                    }
                }

            }
            //console.log('Selected fields', sel_form_name, sel_field_name, sel_key);

            //filterData.add(sel_form_name, sel_field_name, sel_key, FILTER.SELECTION);
            require("view").updateNewState(require("stateCtrl").top());
        }



        //return the singleton instance
        return ViewComparisionPanel.getInstance();

    });