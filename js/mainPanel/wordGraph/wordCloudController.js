/**
 * Created by sunny on 11/07/16.
 */
define(["d3","wordCloudView", "dataWrapper", "filterData","colorbrewer"],
    function (d3, wordCloudView, dataWrapper, filterData, colorbrewer) {


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

            var wordFreqList = {};
            var wordHoverFreqList = {};

            for(var index = 0 ; index < self.stratData.length ; index++){
                if(self.stratData[index] == stratKey) {
                    var words =  self.wordCloudData[index].split(" ");
                    words.forEach(function(d){
                        if(!wordFreqList.hasOwnProperty(d)){
                            wordFreqList[d] = 0;
                        }
                        wordFreqList[d]++;
                    })
                }
            }


            //delete the empty values
            delete wordFreqList[""];
            delete wordHoverFreqList[""];


            //key value pair for the original data
            var origDataPair = {
                label: stratValue,
                data: wordFreqList,
                hoverData: wordHoverFreqList
            };


            //add the data pair to the strat data array
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

        var query = filterData.getQuery();
        var wordCloudObj = _data[_obj.formName].fields[_obj.variableName];
        self.wordCloudData = _data[_obj.formName].fields[_obj.variableName].data;
        var wordFreqList = {};

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
        else{
            //Stratified Data
            self.stratDataObj = [];
            var strat = filterData.getStrat();
            var isStrat = strat.isStrat;
            var stratCategories = [","]; //this is the default selection
            var stratObj;
            var wordHoverFreqList = {};

            for(var index = 0 ; index < query.length ; index++) {
                if ( true == query[index] || 1 == query[index] ) {
                    var words =  self.wordCloudData[index].split(" ");
                    words.forEach(function(d){
                        if(!wordFreqList.hasOwnProperty(d)){
                            wordFreqList[d] = 0;
                        }
                        wordFreqList[d]++;
                    })
                }
            }

            //for(var i = 0; i < self.wordCloudData.length; i++){
            //    var words =  self.wordCloudData[i].split(" ");
            //    words.forEach(function(d){
            //        if(!wordFreqList.hasOwnProperty(d)){
            //            wordFreqList[d] = 0;
            //        }
            //        wordFreqList[d]++;
            //    })
            //
            //    for(var index = 0 ; index < hoverDataLen ; index++) {
            //        if ( true == self.hover[index] || 1 == self.hover[index] ) {
            //        }
            //    }
            //    //if ( true == self.hover[index] || 1 == self.hover[index] ) {
            //    //    var hoverwords =  self.wordCloudData[index].split(" ");
            //    //    hoverwords.forEach(function(d){
            //    //        if(!wordHoverFreqList.hasOwnProperty(d)){
            //    //            wordHoverFreqList[d] = 0;
            //    //        }
            //    //        wordHoverFreqList[d]++;
            //    //    })
            //    //}
            //}

            //this will delete the "" empty values
            delete wordFreqList[""];
            delete wordHoverFreqList[""];


            //key value pair for the original data
            var origDataPair = {
                label: "",
                data: wordFreqList,
                hoverData: wordHoverFreqList
            };

            self.stratDataObj.push(origDataPair);

        }

        //this will initialize the word cloud view
        wordCloudView.create(_container, self.stratDataObj)
    }


    //public functions of this class
    return {
        create: _create
    }

})
