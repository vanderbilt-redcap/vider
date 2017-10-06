/**
 * Created by sunny on 2/13/16.
 */
define(["url","dataWrapper","stateVarCtrl","stateMainCtrl", "stateBinCtrl", "stateScatterCtrl"],
    function (url, dataWrapper, stateVarCtrl, stateMainCtrl, stateBinCtrl, stateScatterCtrl) {

        /**
         * This class is responsible for the modifiying the intruments
         * on the ui
         * @type {null}
         */

        var instance = null;
        var stateIndex = 0;

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function StateCtrl() {

            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one StateCtrl, use StateCtrl.getInstance()");
            }
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        StateCtrl.getInstance = function () {
            var self = this;

            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new StateCtrl();
            }
            return instance;
        };

        /**
         * todo on loading this will load the data from the
         * these state are marked with index
         * and each internal panel state are
         * also called with the same state
         *
         * this function will control state of
         * all the panels
         */

        StateCtrl.prototype.init = function () {
            var self = this;

            //initialize the default values
            var urlParam = {
                //contains the form name which
                //which to expand the form
                variablePanel:[],

                //contain the variable name or
                //operation between two var
                mainPanel:[],

                //contain the variable to merge
                //to form the new categories
                binPanel: [],

                //contain the two form name and
                //two variable name
                scatterPanel: [],

                //project id
                projectID: 0

            };

            var mapInstToFields = dataWrapper.getData();

            //processing the default state on the variable panel
            stateVarCtrl.add(stateIndex, mapInstToFields, urlParam.variablePanel);
            //processing the default state on the main panel
            stateMainCtrl.add(stateIndex, mapInstToFields, urlParam.mainPanel);
            //processing the state for the re-binning
            stateBinCtrl.add(stateIndex, mapInstToFields, urlParam.binPanel);
            //processing scatter data
            stateScatterCtrl.add(stateIndex, mapInstToFields, urlParam.scatterPanel);

        }

        /**
         * This will update the new data
         * @param mapInstToFields
         * @param urlParam
         * @returns {*}
         */
        StateCtrl.prototype.updateNewData  = function(mapInstToFields, urlBinParam){
            var self = this;

            //read the variable from the link and merge the new data
            urlBinParam.forEach(function(d){

                var formData = mapInstToFields[d.form];
                var varO = formData.fields[d.var];
                var varObj = varO.obj;
                var varData = varO.data;
                var binName = d.bin;
                var arrIndexToMerge  = d.indexToMerge;
                var new_categories = "";
                var maxKey = Number.MIN_VALUE;
                var categories = varObj.select_choices_or_calculations.split("|");
                var isExecuteReplacementLogic = false;

                //this part will decide whether the replacement
                //should be performed or not
                for(var catIndex = 0; catIndex < categories.length; catIndex++) {
                    var pair = categories[catIndex].split(",");
                    var key = Number(pair[0].trim());
                    var value = pair[1].trim();

                    //check if the replacement logic should executed
                    if(arrIndexToMerge.indexOf(key.toString()) !== -1){
                        isExecuteReplacementLogic = true;
                    }

                    //this will update the max key
                    if ( maxKey < key ) {
                        maxKey = key;
                    }
                }
                var strMaxKey = (maxKey + 1).toString();

                //this will get executed on replacement
                if(isExecuteReplacementLogic) {
                    //if yes this part will get executed
                    for (var catIndex = 0; catIndex < categories.length; catIndex++) {
                        var pair = categories[catIndex].split(",");
                        var key = pair[0].trim();
                        var value = pair[1].trim();
                        var isAvailable = true;

                        for (var index = 0; index < arrIndexToMerge.length; index++) {

                            if (arrIndexToMerge[index] === key) {
                                isAvailable = false;

                                //this will merge all the data values
                                for (var i = 0; i < varData.length; i++) {
                                    if (varData[i] == key) {
                                        varData[i] = strMaxKey;
                                    }
                                }
                                break;
                            }
                        }

                        //for the new category and replace the data
                        if (isAvailable) {
                            new_categories += key + ", " + value + ' | ';
                        }
                    }
                    new_categories += strMaxKey + ", " + binName;
                    varObj.select_choices_or_calculations = new_categories;
                }
            })

            return mapInstToFields;
        }

        /**
         * this will read the current url and add the data
         * structure to the state var, main and bin variable
         * used to maintain
         */
        StateCtrl.prototype.readCurrentURL = function () {
            var self = this;

            //initialize the default values
            var urlParam = url.getParameters();

            var mapInstToFields = self.updateNewData(dataWrapper.getData(),urlParam.binPanel);

            //processing the default state on the variable panel
            stateVarCtrl.add(stateIndex, mapInstToFields, urlParam.variablePanel);
            //processing the default state on the main panel
            stateMainCtrl.add(stateIndex, mapInstToFields, urlParam.mainPanel);
            //processing the default state for the re-binning
            stateBinCtrl.add(stateIndex, mapInstToFields, urlParam.binPanel);
            //processing scatter data
            stateScatterCtrl.add(stateIndex, mapInstToFields, urlParam.scatterPanel);
        }

        /**
         * returns the current state
         * @returns {{varPanel: *, mainPanel: *}}
         */
        StateCtrl.prototype.top = function () {

            return {
                varPanel:stateVarCtrl.get(stateIndex),
                mainPanel:stateMainCtrl.get(stateIndex),
                binPanel:stateBinCtrl.get(stateIndex),
                scatterPanel:stateScatterCtrl.get(stateIndex)
            }
        }

        /**
         * this will update the url parameter
         * @param _urlParameter
         */
        StateCtrl.prototype.add = function(_urlParameter){
            var self = this;

            //increase the state index
            stateIndex++;

            var mapInstToFields = self.updateNewData(dataWrapper.getData(), _urlParameter.binPanel.param);

            //processing the default state on the variable panel
            stateVarCtrl.add(stateIndex, mapInstToFields, _urlParameter.varPanel.param);
            //processing the default state on the main panel
            stateMainCtrl.add(stateIndex, mapInstToFields, _urlParameter.mainPanel.param);
            //processing the default state on the bin panel
            stateBinCtrl.add(stateIndex, mapInstToFields, _urlParameter.binPanel.param);
            //processing scatter data
            stateScatterCtrl.add(stateIndex, mapInstToFields, _urlParameter.scatterPanel.param);
        }



        return StateCtrl.getInstance();

    });