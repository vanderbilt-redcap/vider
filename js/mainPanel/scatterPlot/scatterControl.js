/**
 * Created by sunny on 10/10/16.
 */
define(["d3","scatterViewer", "dataWrapper", "filterData","colorbrewer"], function (d3, scatterViewer, dataWrapper, filterData, colorbrewer) {


    var self = this;

    /**
     *
     * @param stratObj
     * @returns {Array}
     */
    var getStratCategories = function (stratObj) {
        var obj = stratObj.select_choices_or_calculations;
        var str = obj.substring(0, obj.length);
        return str.split("|");
    }

    /**
     *
     * @param data
     * @param obj
     */
    var getNumericalCategories = function (data, obj) {

        var domain = d3.scale.linear()
            .domain([Math.min.apply(Math, data),
                Math.max.apply(Math, data)]);

        var yTotalData = d3.layout.histogram()
            .bins(domain.ticks(10))//this will take the partitions
            (data);

        return yTotalData;
    }

    var generateScatterStructure  = function(origDataPair){
        //origDataPair = {
        //    ma
        //
        //}
    }

    var transformForDate = function (data, validation) {
        for (var i = 0; i < data.length; i++) {
            if (data[i] && isNaN(data[i])) {
                var dateAry = new Array(1970, 1, 1);
                var sections = data[i].split(/\s/);
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
                if (validation.match(/_ymd$/)) {
                    dateAry = new Array(dnodes[0], dnodes[1], dnodes[2]);
                }
                else if (validation.match(/_mdy$/)) {
                    dateAry = new Array(dnodes[2], dnodes[0], dnodes[1]);
                }
                else if (validation.match(/_dmy$/)) {
                    dateAry = new Array(dnodes[2], dnodes[1], dnodes[0]);
                }
                var date = new Date(Date.UTC(dateAry[0], dateAry[1], dateAry[2], tnodes[0], tnodes[1], tnodes[2]));
                data[i] = date.getTime() / 1000;
            }
        }
        return data;
    };

    var getFormattedDate = function (unixTs, validation) {
        var d = new Date(unixTs * 1000);
        var year = d.getFullYear();
        var month = ("0" + (d.getMonth() + 1)).substr(-2);
        var day = ("0" + (d.getDate())).substr(-2);

        var hours = ("0" + d.getHours()).substr(-2);
        var minutes = ("0" + d.getMinutes()).substr(-2);
        var seconds = ("0" + d.getSeconds()).substr(-2);

        if (validation == "date_ymd") {
            return year + "-" + month + "-" + day;
        }
        if (validation == "date_dmy") {
            return day + "-" + month + "-" + year;
        }
        if (validation == "date_mdy") {
            return month + "-" + day + "-" + year;
        }
        if (validation == "datetime_ymd") {
            return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_dmy") {
            return day + "-" + month + "-" + year + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_mdy") {
            return month + "-" + day + "-" + year + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_seconds_ymd") {
            return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        }
        if (validation == "datetime_seconds_dmy") {
            return day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
        }
        if (validation == "datetime_seconds_mdy") {
            return month + "-" + day + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
        }
    };

    /**
     *
     * @param stratCategories
     * @param stratDataObj
     */
    var createNominalStratObj =  function(stratCategories,stratDataObj){
        var isStrat = filterData.getStrat().isStrat;
        stratCategories.forEach(function (strat) {
            var stratPair = strat.split(",");
            var stratKey = stratPair[0].trim();
            var stratValue = stratPair[1].trim();

            var visData = [];
            var visHoverData = [];

            for(var index = 0 ; index < self.datax.length ; index++){
                if(self.stratData[index] == stratKey) {
                    var record = "";
                    var event = "";
                    if(self.recordArr != null){
                        record = recordArr[index];
                    }
                    if(self.eventArr != null){
                        event = eventArr[index];
                    }

                    visData.push({
                        x: Number(self.datax[index]),
                        y: Number(self.datay[index]),
                        c: self.colorByArr[index],
                        r: record,
                        e: event,
                        index: index
                    });
                    if ( true == self.hover[index] || 1 == self.hover[index] ) {
                        visHoverData.push({
                            x: Number(self.hoverDataX[index]),
                            y: Number(self.hoverDataY[index]),
                            r: record,
                            e: event,
                            index: index
                        });
                    }
                }
            }


            //key value pair for the original data
            var origDataPair = {
                label: stratValue,
                data: visData,
                hoverData: visHoverData
            };
            //generateScatterStructure(origDataPair);

            self.stratDataObj.push(origDataPair);

        });
    }

    /**
     *
     * @param _obj
     * @param _data
     * @param _container
     * @param _isQueried
     * @private
     */
    var _create = function (_obj, _data, _container, _isQueried) {

        //Fetch all the global variables
        self.isQueried = _isQueried;
        self.data = _data;
        self.obj = _obj;
        self.container = _container;

        var objx = self.data[self.obj.form1].fields[self.obj.var1];
        var objy = self.data[self.obj.form2].fields[self.obj.var2];
        var query = filterData.getQuery();
        self.hover = filterData.getHoverArr();

        console.log("objx: "+JSON.stringify(objx));
        console.log("objy: "+JSON.stringify(objy));


        self.eventArr = dataWrapper.getEventRecords();
        self.recordArr = dataWrapper.getRecordId();

        //actual data points
        self.datax = [];
        self.datay = [];

        self.validation_x = objx.obj['text_validation_type_or_show_slider_number'];
        self.validation_y = objy.obj['text_validation_type_or_show_slider_number'];
	var objx_data = objx.data;
        var objy_data = objy.data;
        if (validation_x.match(/^date_/)) {
            objx_data = transformForDate(objx_data, validation_x);
        }
        if (validation_y.match(/^date_/)) {
            objy_data = transformForDate(objy_data, validation_y);
        }
        for(var qIndex = 0 ; qIndex < query.length ; qIndex++){
            if ( true == query[qIndex] || 1 == query[qIndex]){
                self.datax.push(objx_data[qIndex]);
                self.datay.push(objy_data[qIndex]);
            }
        }

        var dataLen = self.datax.length < self.datay.length
            ? self.datax.length : self.datay.length;

        //hover data points
        self.hoverDataX = [];
        self.hoverDataY = [];

        for(var hIndex = 0 ; hIndex < self.hover.length ; hIndex++){
            self.hoverDataX.push(objx_data[hIndex]);
            self.hoverDataY.push(objy_data[hIndex]);
        }
        var hoverDataLen = self.hoverDataX.length < self.hoverDataY.length
            ? self.hoverDataX.length : self.hoverDataY.length;

        var colorObj = filterData.getColorBy();
        self.colorByArr = [];
        if(colorObj.isColorBy == true || colorObj.isColorBy == 1) {
            var cobj = self.data[colorObj.form].fields[colorObj.variable];
            var colorData = cobj.data;
            var color;
            var obj = cobj.obj;
            var colorKeys = [];
            if(obj.field_type === "dropdown" || obj.field_type === "radio"){
                var colorCat = obj.select_choices_or_calculations.split("|");
                colorCat.forEach(
                    function (cat) {
                        var pair = cat.split(",");
                        var key = pair[0].trim();
                        colorKeys.push(key);
                    }
                );
                colorKeys.push("");
                color = d3.scale.ordinal().domain(colorKeys).range(colorbrewer.Set1[colorKeys.length % 11]);
            }

            for(var index = 0 ; index < colorData.length ; index++){
                self.colorByArr[index] = color(colorData[index]);
            }
        }


        //Stratified Data
        self.stratDataObj = [];
        var strat = filterData.getStrat();
        var isStrat = strat.isStrat;
        var stratCategories = [","]; //this is the default selection
        var stratObj;

        if (isStrat) {
            stratObj = _data[strat.form].fields[strat.variable].obj;
            self.stratData = _data[strat.form].fields[strat.variable].data;

            var fieldType = stratObj.field_type;
            var validationType = stratObj.text_validation_type_or_show_slider_number;
            if (fieldType == "text" && (validationType === "number" || validationType === "integer" || validationType.match(/^date/))) {
                //stratCategories = getNumericalCategories(self.stratData, stratObj);
                ////createNumericalStratObj(stratCategories,stratDataObj);
            }
            else if (fieldType === "dropdown" || fieldType === "radio") {
                stratCategories = getStratCategories(stratObj);
                createNominalStratObj(stratCategories,stratDataObj);
            }
        }
        else {
            //createNominalStratObj(stratCategories,stratDataObj);

            var visData = [];
            for(var index = 0 ; index < dataLen ; index++){
                var record = "";
                var event = "";
                if(self.recordArr != null){
                    record = recordArr[index];
                }
                if(self.eventArr != null){
                    event = eventArr[index];
                }
                var datum = {
                    x: Number(self.datax[index]),
                    y: Number(self.datay[index]),
                    c: self.colorByArr[index],
                    r: record,
                    e: event,
                    index: index
                };
                visData.push(datum);
            }

            var visHoverData = [];
            for(var index = 0 ; index < hoverDataLen ; index++){
                if ( true == self.hover[index] || 1 == self.hover[index] ) {
                    var record = "";
                    var event = "";
                    if(self.recordArr != null){
                        record = recordArr[index];
                    }
                    if(self.eventArr != null){
                        event = eventArr[index];
                    }

                    visHoverData.push({
                        x: Number(self.hoverDataX[index]),
                        y: Number(self.hoverDataY[index]),
                        r: record,
                        e: event,
                        index: index
                    });
                }
            }

            //key value pair for the original data
            var origDataPair = {
                label: "",
                data: visData,
                hoverData:visHoverData
            };

            self.stratDataObj.push(origDataPair);
        }

        scatterViewer.create(_container, self.stratDataObj, _isQueried, objx.obj.field_label, objy.obj.field_label);
    }


    //public functions of this class
    return {
        create: _create
    }

})
