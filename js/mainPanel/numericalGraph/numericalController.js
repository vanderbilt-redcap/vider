/**
 * Created by sunny on 2/23/16.
 */
define(["numericalView", "dataWrapper", "filterData","rebinning"],
    function (numericalView, dataWrapper, filterData,rebinning) {
        //global declaration goes over here
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
        var getNumericalCategories = function (data, obj, validation) {
            var max = Math.max.apply(Math, data);
            console.log("min 1: "+Math.min.apply(Math, data));
            console.log("data 1: "+JSON.stringify(data));
            var domain = d3.scale.linear()
                .domain([Math.min.apply(Math, data), max]);

            var yTotalData = d3.layout.histogram()
                .bins(domain.ticks(10))//this will take the partitions
                (data);

            return yTotalData;
        }


        /**
         *
         * @param origKeyValuePair
         */
        var generateNominalStructure = function (origKeyValuePair) {
            self.categories = self.varObj.select_choices_or_calculations.split("|");
            self.categories.forEach(function (cat) {
                var pair = cat.split(",");
                var key = pair[0].trim();
                var value = pair[1].trim();

                //todo make this similar to colorByObj
                //event object
                var eventObj = {};
                if (!self.redCapEventObj.hasOwnProperty("error")) {
                    for (var d in self.redCapEventObj) {
                        var obj = self.redCapEventObj[d];
                        if (obj.status == true) {
                            eventObj[obj.eventObj.unique_event_name] = {
                                label: obj.eventObj.event_name,
                                count: 0
                            }
                        }
                    }
                }

                //this will store the key
                //value pair
                origKeyValuePair[key] = {
                    form: self.formName,
                    variable: self.varName,
                    x: 0,
                    y: 0,
                    key: key,
                    value: value, //category
                    originalCount: 0,   //counter
                    queryCount: 0,
                    hoverCount: 0,
                    totalCount: 0,
                    event: eventObj,
                    colorByObj: {}
                }

                createColorObj(origKeyValuePair[key].colorByObj);
            });


            //adding extra handling for the empty string
            var eventObj = {};
            if (!self.redCapEventObj.hasOwnProperty("error")) {
                for (var d in self.redCapEventObj) {
                    var obj = self.redCapEventObj[d];
                    if (obj.status == true) {
                        eventObj[obj.eventObj.unique_event_name] = {
                            label: obj.eventObj.event_name,
                            count: 0
                        }
                    }
                }
            }
            origKeyValuePair[""] = {
                form: self.formName,
                variable: self.varName,
                x: 0,
                y: 0,
                key: "",
                value: "Empty",
                originalCount: 0,      //counter
                queryCount: 0,
                hoverCount: 0,
                totalCount: 0,
                event: eventObj,
                colorByObj: {}
            }

            createColorObj(origKeyValuePair[""].colorByObj);
        }

        /**
         *
         * @param origKeyValuePair
         */
        var generateNumericalStructure = function (origKeyValuePair, validation) {

            if(rebinning.check(self.formName,self.varName)) {
                self.categories = d3.values(rebinning.get(self.formName,self.varName))[0];
            }
            else{
                console.log("min 2: "+Math.min.apply(Math, self.varData));
                var domain = d3.scale.linear()
                    .domain([Math.min.apply(Math, self.varData),
                        Math.max.apply(Math, self.varData)]);
                var yTotalData = d3.layout.histogram()
                    .bins(domain.ticks(10))//this will take the partitions
                    (self.varData);
                self.categories = yTotalData;
            }

            var keyIndex = 0;
            self.categories.forEach(function (cat) {
                var key = cat.x;
                var value = cat.x + " - " + (cat.x + cat.dx);
                if (validation.match(/^date/)) {
                    value = getFormattedDate(cat.x, validation) + " - " + getFormattedDate(cat.x + cat.dx, validation);
                }

                //event object
                var eventObj = {};
                if (!self.redCapEventObj.hasOwnProperty("error")) {
                    for (var d in self.redCapEventObj) {
                        var obj = self.redCapEventObj[d];
                        if (obj.status == true) {
                            eventObj[obj.eventObj.unique_event_name] = {
                                label: obj.eventObj.event_name,
                                count: 0
                            }
                        }
                    }
                }

                //this will store the key
                //value pair
                origKeyValuePair[key] = {
                    form: self.formName,
                    variable: self.varName,
                    x: 0,
                    y: 0,
                    key: key,
                    value: value, //category
                    originalCount: 0,      //counter
                    queryCount: 0,
                    hoverCount: 0,
                    totalCount: 0,
                    event: eventObj,
                    obj: {x: cat.x, dx:cat.dx},
                    colorByObj: {},
                    index: keyIndex++
                }
                createColorObj(origKeyValuePair[key].colorByObj);
            });

            //adding extra handling for the empty string
            var eventObj = {};
            if (!self.redCapEventObj.hasOwnProperty("error")) {
                for (var d in self.redCapEventObj) {
                    var obj = self.redCapEventObj[d];
                    if (obj.status == true) {
                        eventObj[obj.eventObj.unique_event_name] = {
                            label: obj.eventObj.event_name,
                            count: 0
                        }
                    }
                }
            }
            origKeyValuePair[""] = {
                form: self.formName,
                variable: self.varName,
                x: 0,
                y: 0,
                key: "",
                value: "Empty",
                originalCount: 0,      //counter
                queryCount: 0,
                hoverCount: 0,
                totalCount: 0,
                event: eventObj,
                obj: {x: "", dx:""},
                colorByObj: {}
            }
            createColorObj(origKeyValuePair[""].colorByObj);
        }


        /**
         *
         * @param value
         * @returns {number}
         */
        var getKey = function (value) {
            var key = null;
            if (value === "") {
                return "";
            }
            if (self.type == 1) {
                for (var i = 0; i < self.categories.length; i++) {
                    var d = self.categories[i];
                    if (d.x <= value && value < (d.x + d.dx)) {
                        key = d.x;
                        break;
                    }
                }
            }
            else if (self.type == 2) {
                key = value;
            }
            return key;
        }

        /**
         *
         * @param colorDataObj
         */
        var createColorObj = function (colorDataObj) {
            var self = this;

            var isColorBy = filterData.getColorBy().isColorBy;
            if (isColorBy) {
                var colorBy = filterData.getColorBy();
                var colorData = self.data[colorBy.form].fields[colorBy.variable].data;
                var colorObj = self.data[colorBy.form].fields[colorBy.variable].obj;
                var fieldType = colorObj.field_type;
                var validationType = colorObj.text_validation_type_or_show_slider_number;

                if (fieldType == "text" && (validationType === "number" || validationType === "integer" || validationType.match(/^date/))) {
                    var categories = getNumericalCategories(colorData, colorObj, validationType);
                    categories.forEach(function (cat) {
                        var key = cat.x;
                        var value = {
                            x: cat.x,
                            y: cat.y,
                            dx: cat.dx
                        };

                        if (!colorDataObj.hasOwnProperty(key)) {
                            colorDataObj[key] = {
                                key: key,
                                value: value.x + " - " + value.dx,
                                obj: value,
                                count: 0,
                                total: 0,
                                dataType: "NUMERICAL"
                            }
                            if (validationType.match(/^date/)) {
                                colorDataObj[key]['value'] = getFormattedDate(cat.x, validationType) + " - " + getFormattedDate(cat.x + cat.dx, validationType);
                            }
                        }
                    });

                    colorDataObj[""] = {
                        key: "",
                        value: "Empty",
                        obj: "",
                        count: 0,
                        total: 0,
                        dataType: "NUMERICAL"
                    }
                }
                else if (fieldType === "dropdown" || fieldType === "radio") {
                    var categories = colorObj.select_choices_or_calculations.split("|");
                    categories.forEach(function (cat) {
                        var catPair = cat.split(",");
                        var key = catPair[0].trim();
                        var value = catPair[1].trim();

                        colorDataObj[key] = {
                            key: key,
                            value: value,
                            count: 0,
                            total: 0,
                            dataType: "CATEGORICAL"
                        }
                    });
                    colorDataObj[""] = {
                        key: "",
                        value: "Empty",
                        count: 0,
                        total: 0,
                        dataType: "CATEGORICAL"
                    }
                }
            }
            else {
                colorDataObj = null;
            }
        }

        /**
         *
         * @param obj
         * @returns {*}
         */
        var getDataType = function(obj){
            var fieldType = obj.field_type;
            var validationType = obj.text_validation_type_or_show_slider_number;
            if (fieldType == "text" && (validationType === "number" || validationType === "integer" || validationType.match(/^date/))) {
                return "NUMERICAL";
            }
            else if (fieldType === "dropdown" || fieldType === "radio") {
                return "CATEGORICAL";
            }
            return null;
        }

        /**
         *
         * @param stratCategories
         * @param stratDataObj
         */
        var createNominalStratObj = function(stratCategories , stratDataObj){
            var strat = filterData.getStrat();
            var isStrat = strat.isStrat;

            //increment the counter for all
            var filtering = require("filterData").getQuery();
            var filterCount = 0;
            for (var i = 0; i < self.varData.length; i++) {
                if ((null == filtering || true == filtering[i])){
                    filterCount++;
                }
            }

            stratCategories.forEach(function (strat) {

                var stratPair = strat.split(",");
                var stratKey = stratPair[0].trim();
                var stratValue = stratPair[1].trim();

                //key value pair for the original data
                var origKeyValuePair = {};

                //call the function and generate the structure
                //for each category
                var fieldType = self.varObj.field_type;
                var validationType = self.varObj.text_validation_type_or_show_slider_number;
                if (fieldType == "text" && (validationType === "number" || validationType === "integer" || validationType.match(/^date/))) {
                    self.type = 1; //one for numerical
                    if (validationType.match(/^date/)) {
                        self.varData = transformForDate(self.varData, validationType);
                    }
                    generateNumericalStructure(origKeyValuePair, validationType);
                }
                else if (fieldType === "dropdown" || fieldType === "radio") {
                    self.type = 2; //two for nominal
                    generateNominalStructure(origKeyValuePair);
                }

                //increment the counter for all
                var filtering = require("filterData").getQuery();

                //this will contain the filtered data on hover
                var filterHover = filterData.getHoverArr();
                var isHovered = (filterHover != null && filterHover.length > 0);

                for (var i = 0; i < self.varData.length; i++) {

                    //this key is good for nominal data
                    var key = getKey(varData[i]);

                    //set the total length
                    origKeyValuePair[key].totalCount = filterCount;//self.varData.length;

                    if(key == null) continue;

                    if (!self.isQueried) {
                        origKeyValuePair[key].originalCount++;

                        //if color by obj
                        var colorBy = filterData.getColorBy();
                        var isColorBy = colorBy.isColorBy;
                        if (isColorBy) {
                            var colorData = self.data[colorBy.form].fields[colorBy.variable].data;
                            var colorByObj = self.data[colorBy.form].fields[colorBy.variable].obj;
                            var dataType = getDataType(colorByObj);

                            if(dataType === "NUMERICAL"){
                                var listObj = origKeyValuePair[key].colorByObj;
                                for(col in listObj){
                                    if(listObj[col].obj.x <= colorData[i]
                                        && colorData[i] < (listObj[col].obj.x + listObj[col].obj.dx)){
                                        listObj[col].count++;
                                        break;
                                    }
                                }
                            }
                            else if( dataType === "CATEGORICAL" ) {
                                if (origKeyValuePair[key].colorByObj.hasOwnProperty(colorData[i])) {
                                    origKeyValuePair[key].colorByObj[colorData[i]].count++;
                                }
                            }
                        }
                    }

                    if ((null == filtering || true == filtering[i]) && ( !isStrat || stratKey == self.stratData[i] )) {
                        if (self.isQueried) {
                            origKeyValuePair[key].originalCount++;

                            //if color by obj
                            var colorBy = filterData.getColorBy();
                            var isColorBy = colorBy.isColorBy;
                            if (isColorBy) {
                                var colorData = self.data[colorBy.form].fields[colorBy.variable].data;
                                var colorByObj = self.data[colorBy.form].fields[colorBy.variable].obj;
                                var dataType = getDataType(colorByObj);

                                if(dataType === "NUMERICAL"){
                                    var listObj = origKeyValuePair[key].colorByObj;
                                    for(col in listObj){
                                        if(listObj[col].obj.x <= colorData[i]
                                            && colorData[i] < (listObj[col].obj.x + listObj[col].obj.dx)){
                                            listObj[col].count++;
                                            break;
                                        }
                                    }
                                }
                                else if( dataType === "CATEGORICAL" ) {
                                    if (origKeyValuePair[key].colorByObj.hasOwnProperty(colorData[i])) {
                                        origKeyValuePair[key].colorByObj[colorData[i]].count++;
                                    }
                                }
                            }
                        }
                        origKeyValuePair[key].queryCount++;

                        if (self.eventRecordsObj != null
                            && origKeyValuePair[key].event.hasOwnProperty(self.eventRecordsObj[i])) {
                            origKeyValuePair[key].event[self.eventRecordsObj[i]].count++;
                        }
                    }

                    //this will contain the filtered value of the hovere data
                    if ((null != filterHover && true == filterHover[i])
                        && ( !isStrat || stratKey == self.stratData[i] )) {

                        origKeyValuePair[key].hoverCount++;
                    }
                }



                //calculate the total and then attach it
                for (var key in origKeyValuePair) {
                    var total = 0;
                    for (var col in origKeyValuePair[key].colorByObj) {
                        var colorBy = origKeyValuePair[key].colorByObj[col];
                        total += colorBy.count;
                    }
                    for (var col in origKeyValuePair[key].colorByObj) {
                        var colorBy = origKeyValuePair[key].colorByObj[col];
                        colorBy.total = total;
                    }
                    origKeyValuePair[key].colorTotal = total;
                }

                //create the structure required for the
                //creation of the stratified data
                if (!stratDataObj.hasOwnProperty(stratValue)) {
                    stratDataObj[stratValue] = {
                        label: stratValue,
                        original: origKeyValuePair
                    }
                }
            });
        }

        /**
         *
         * @param stratCategories
         * @param stratDataObj
         */
        var createNumericalStratObj = function(stratCategories, stratDataObj){
            var isStrat = filterData.getStrat().isStrat;
            //increment the counter for all
            var filtering = require("filterData").getQuery();
            var filterCount = 0;
            for (var i = 0; i < self.varData.length; i++) {
                if ((null == filtering || true == filtering[i])){
                    filterCount++;
                }
            }

            stratCategories.forEach(function (strat) {

                //create label
                var stratValue;
                if(isStrat){
                    stratValue = strat.x + " - " + (strat.x + strat.dx);
                }
                else{
                    stratValue = "";
                }

                //key value pair for the original data
                var origKeyValuePair = {};

                //call the function and generate the structure
                //for each category

                var fieldType = self.varObj.field_type;
                var validationType = self.varObj.text_validation_type_or_show_slider_number;
                if (fieldType == "text" && (validationType === "number" || validationType === "integer" || validationType.match(/^date/))) {
                    self.type = 1; //one for numerical
                    if (validationType.match(/^date/)) {
                        self.varData = transformForDate(self.varData, validationType);
                    }
                    generateNumericalStructure(origKeyValuePair, validationType);
                }
                else if (fieldType === "dropdown" || fieldType === "radio") {
                    self.type = 2; //two for nominal
                    generateNominalStructure(origKeyValuePair);
                }

                //increment the counter for all
                var filtering = require("filterData").getQuery();
                //this will contain the filtered data on hover
                var filterHover = filterData.getHoverArr();
                var isHovered = (filterHover != null && filterHover.length > 0);

                for (var i = 0; i < self.varData.length; i++) {
                    //this key is good for nominal data
                    var key = getKey(self.varData[i]);

                    if( key == null) continue;

                    //this will set the total count of the data
                    origKeyValuePair[key].totalCount = filterCount;//self.varData.length;

                    if (!self.isQueried) {
                        origKeyValuePair[key].originalCount++;

                        //if color by obj
                        var colorBy = filterData.getColorBy();
                        var isColorBy = colorBy.isColorBy;
                        if (isColorBy) {
                            var colorData = self.data[colorBy.form].fields[colorBy.variable].data;
                            var colorByObj = self.data[colorBy.form].fields[colorBy.variable].obj;
                            var dataType = getDataType(colorByObj);

                            if(dataType === "NUMERICAL"){
                                var listObj = origKeyValuePair[key].colorByObj;
                                for(col in listObj){
                                    if(listObj[col].obj.x <= colorData[i]
                                        && colorData[i] < (listObj[col].obj.x + listObj[col].obj.dx)){
                                        listObj[col].count++;
                                        break;
                                    }
                                }
                            }
                            else if( dataType === "CATEGORICAL" ) {
                                if (origKeyValuePair[key].colorByObj.hasOwnProperty(colorData[i])) {
                                    origKeyValuePair[key].colorByObj[colorData[i]].count++;
                                }
                            }
                        }
                    }

                    var value = self.stratData == null ? null : Number(self.stratData[i]);

                    if ((null == filtering || true == filtering[i])
                        && ( !isStrat || (strat.x <= value && value  < strat.x + strat.dx ))) {

                        if (self.isQueried) {
                            origKeyValuePair[key].originalCount++;

                            //if color by obj
                            var colorBy = filterData.getColorBy();
                            var isColorBy = colorBy.isColorBy;
                            if (isColorBy) {
                                var colorData = self.data[colorBy.form].fields[colorBy.variable].data;
                                var colorByObj = self.data[colorBy.form].fields[colorBy.variable].obj;
                                var dataType = getDataType(colorByObj);

                                if(dataType === "NUMERICAL"){
                                    var listObj = origKeyValuePair[key].colorByObj;
                                    for(col in listObj){
                                        if(listObj[col].obj.x <= colorData[i]
                                            && colorData[i] < (listObj[col].obj.x + listObj[col].obj.dx)){
                                            listObj[col].count++;
                                            break;
                                        }
                                    }
                                }
                                else if( dataType === "CATEGORICAL" ) {
                                    if (origKeyValuePair[key].colorByObj.hasOwnProperty(colorData[i])) {
                                        origKeyValuePair[key].colorByObj[colorData[i]].count++;
                                    }
                                }
                            }
                        }

                        origKeyValuePair[key].queryCount++;
                        if (self.eventRecordsObj != null && origKeyValuePair[key].event.hasOwnProperty(self.eventRecordsObj[i])) {
                            origKeyValuePair[key].event[self.eventRecordsObj[i]].count++;
                        }
                    }

                    if ((null != filterHover && true == filterHover[i])
                        && ( !isStrat || (strat.x <= value && value  < strat.x + strat.dx ))) {
                        origKeyValuePair[key].hoverCount++;
                    }
                }

                //calculate the total and then attach it
                for (var key in origKeyValuePair) {
                    var total = 0;
                    for (var col in origKeyValuePair[key].colorByObj) {
                        var colorBy = origKeyValuePair[key].colorByObj[col];
                        total += colorBy.count;
                    }
                    for (var col in origKeyValuePair[key].colorByObj) {
                        var colorBy = origKeyValuePair[key].colorByObj[col];
                        colorBy.total = total;
                    }
                    origKeyValuePair[key].colorTotal = total;
                }

                //create the structure required for the
                //creation of the stratified data
                if (!stratDataObj.hasOwnProperty(stratValue)) {
                    stratDataObj[stratValue] = {
                        label: stratValue,
                        original: origKeyValuePair
                    }
                }
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
            self.formName = _obj.formName;
            self.varName = _obj.variableName;
            self.varData = _data[self.formName].fields[self.varName].data;
            self.varObj = _data[self.formName].fields[self.varName].obj;
            self.eventRecordsObj = dataWrapper.getEventRecords();
            self.redCapEventObj = filterData.getEventData();

            //Stratified Data
            var stratDataObj = {};
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
                    stratCategories = getNumericalCategories(self.stratData, stratObj, validationType);
                    createNumericalStratObj(stratCategories,stratDataObj);
                }
                else if (fieldType === "dropdown" || fieldType === "radio") {
                    stratCategories = getStratCategories(stratObj);
                    createNominalStratObj(stratCategories,stratDataObj);
                }
            }
            else {
                createNumericalStratObj(stratCategories,stratDataObj);
            }

            //this will print the nominal graph
            numericalView.create(_container,
                self.formName,
                self.varName,
                self.varObj.field_label,
                d3.values(stratDataObj));
        }

        //public functions of this class
        return {
            create: _create
        }
    });
