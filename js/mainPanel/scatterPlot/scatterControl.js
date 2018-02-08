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

        self.eventArr = dataWrapper.getEventRecords();
        self.recordArr = dataWrapper.getRecordId();

        //actual data points
        self.datax = [];
        self.datay = [];

        for(var qIndex = 0 ; qIndex < query.length ; qIndex++){
            if ( true == query[qIndex] || 1 == query[qIndex]){
                self.datax.push(objx.data[qIndex]);
                self.datay.push(objy.data[qIndex]);
            }
        }

        var dataLen = self.datax.length < self.datay.length
            ? self.datax.length : self.datay.length;

        //hover data points
        self.hoverDataX = [];
        self.hoverDataY = [];

        for(var hIndex = 0 ; hIndex < self.hover.length ; hIndex++){
            self.hoverDataX.push(objx.data[hIndex]);
            self.hoverDataY.push(objy.data[hIndex]);
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
                visData.push({
                    x: Number(self.datax[index]),
                    y: Number(self.datay[index]),
                    c: self.colorByArr[index],
                    r: record,
                    e: event,
                    index: index
                });
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
