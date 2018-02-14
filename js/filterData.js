/**
 * Created by sunny on 3/5/16.
 */
define(["require","stateCtrl" , "dataWrapper"],function(require,stateCtrl,dataWrapper){

    var instance = null;
    var NUMERICAL = 0;
    var CATEGORICAL = 1;
    var CHECKBOX_CATEGORICAL = 2;
    var AND = 0;
    var OR = 2;
    var NOT = 3;
    var FILTER ={
        HOVER: 0,
        CLICK: 1,
        SELECTION: 2,
        DEFAULT: 3,
        UNCLICK: 4,
        UNHOVER: 5,
        NONE:6,
        CTRLCLICK:7
    }

    /**
     * 1. Check if instance is null then throw error
     * 2. Calls the load ui related to this class
     * @constructor
     */
    function FilterData() {
        var self = this;
        //if instance is not null then throw an error
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one FilterData, use FilterData.getInstance()");
        }
    }

    /**
     * this function returns the instance of this
     * class if not created
     * @returns {*}
     */
    FilterData.getInstance = function () {
        // gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new FilterData();
        }
        return instance;
    };

    /**
     * This will be called on the initialization
     * of the class
     */
    FilterData.prototype.init = function(){
        var self = this;

        self.systemState = -99;
        self.clicked = false;
        self.forms = {};
        self.isStrat = false;
        self.isColorBy = false;
        self.stratFormName = "";
        self.stratVarName = "";
        self.filterOpr = {
            "and" : [],
            "or" : [],
            "not":[]
        }
        self.colorByMap = {};

        //todo: temp
        self.isSelection = false;

        //data on which all the filtration options will be performed

        self.data = stateCtrl.top().mainPanel.data;

        //fetch the length of the data
        var firstForm = self.data[Object.keys(self.data)[0]].fields;
        var firstVar = firstForm[Object.keys(firstForm)[0]];
        self.nDataLen = firstVar.data.length;

        //This will contain the fileQueryOutput
        //which will be requested by the
        self.finalQueryOutput = [];
        for(var i = 0 ; i < self.nDataLen ; i++){
            self.finalQueryOutput[i] = true;
        }

        //load the redcap data from the the data wrapper
        //turn it to the specified format required byte
        self.eventStatus = {};
        var redCapEventObj = dataWrapper.getEventData();
        if(!redCapEventObj.hasOwnProperty("error")) {
            redCapEventObj.forEach(function (obj) {
                if (!self.eventStatus.hasOwnProperty(obj.unique_event_name)) {
                    self.eventStatus[obj.unique_event_name] = {
                        eventObj: obj, //attaching the event obj
                        status: false  //default status of the application
                    }
                }
            });
        }

        //flag for all event status
        self.allEventStatus = false;

        //
        //This will contain the fileQueryOutput
        //which will be requested by the
        self.finalQueryOutput = [];
        for(var i = 0 ; i < self.nDataLen ; i++){
            self.finalQueryOutput[i] = true;
        }

        //this will contain the queired data
        self.selQueriedArray = [];
        for(var i = 0 ; i < self.nDataLen ; i++){
            self.selQueriedArray[i] = true;
        }

        //this will contain the hovered data
        self.selHoverArray = [];

        //contain the array clicked
        self.arrClickedItems = [];
    }

    /**
     * This will toggle event status of the application
     * @param _uniqueEventName
     */
    FilterData.prototype.toggleEventStatus = function(_uniqueEventName){
        var self = this;

        if(self.eventStatus[_uniqueEventName].status){
            self.eventStatus[_uniqueEventName].status = false;
        }
        else{
            self.eventStatus[_uniqueEventName].status = true;
        }
    }

    /**
     * This will toggle event status of the application
     * @param _uniqueEventName
     */
    FilterData.prototype.toggleAllEventStatus = function(){
        var self = this;
        if(self.allEventStatus){
            self.allEventStatus = false;
        }
        else{
            self.allEventStatus = true;
        }

        for(var event in self.eventStatus){
            self.eventStatus[event].status = self.allEventStatus;
        }
    }

    /**
     * This will toggle event status of the application
     * @param _uniqueEventName
     */
    FilterData.prototype.getEventData = function(_uniqueEventName){
        var self = this;

        return self.eventStatus;
    }

    /**
     *
     */
    FilterData.prototype.update = function(_formName, _varName, _selection){
        var self = this;

        //OR Operations on all the selected data
        var filterForms = self.forms;
        for (var form in self.forms) {
            for (var variable in self.forms[form].variables) {


                //declare and initialize the map
                for (var i = 0; i < self.nDataLen; i++) {
                    self.forms[form].variables[variable].queryData[i] = false;
                }

                //this will contain the filter data which needed to be compared
                var filterData = self.data[form].fields[variable].data;

                switch (self.forms[form].variables[variable].type) {

                    //for numerical data
                    case NUMERICAL:
                        //this will create the OR query of the data selected

                        for (var indFilter = 0; indFilter < self.nDataLen; indFilter++) {
                            for (var sel in self.forms[form].variables[variable].selections) {
                                var opr = self.forms[form].variables[variable].selections[sel].opr;
                                var selectionVal = self.forms[form].variables[variable].selections[sel].data;

                                switch(opr) {
                                    case AND:
                                        if (selectionVal.x <= filterData[indFilter] && filterData[indFilter] < (selectionVal.x + selectionVal.dx))
                                        {
                                            self.forms[form].variables[variable].queryData[indFilter] = true;
                                        }
                                        break;

                                    case NOT:
                                        if (!(selectionVal.x <= filterData[indFilter] && filterData[indFilter] < (selectionVal.x + selectionVal.dx)))
                                        {
                                            self.forms[form].variables[variable].queryData[indFilter] = true;
                                        }
                                        break;
                                }
                            }
                        }


                        break;

                    //for categorical data
                    case CATEGORICAL:

                        //this will create the OR query of the data selected
                        for (var indFilter = 0; indFilter < self.nDataLen; indFilter++) {
                            for (var sel in self.forms[form].variables[variable].selections) {
                                var opr = self.forms[form].variables[variable].selections[sel].opr;
                                var selectionVal = self.forms[form].variables[variable].selections[sel].value;
                                switch(opr) {
                                    case AND:
                                        if (filterData[indFilter] == selectionVal) {
                                            self.forms[form].variables[variable].queryData[indFilter] = true;
                                        }
                                        break;

                                    case NOT:
                                        if (filterData[indFilter] != selectionVal) {
                                            self.forms[form].variables[variable].queryData[indFilter] = true;
                                        }
                                        break;
                                }

                            }
                        }

                        break;

                    //for checkbox categorical data
                    case CHECKBOX_CATEGORICAL:

                        //this will create the OR query of the data selected
                        for (var indFilter = 0; indFilter < self.nDataLen; indFilter++) {
                            for (var sel in self.forms[form].variables[variable].selections) {
                                var opr = self.forms[form].variables[variable].selections[sel].opr;
                                var selectionVal = self.forms[form].variables[variable].selections[sel].value;
                                switch(opr) {
                                    case AND:
                                        if (1 == filterData[indFilter][selectionVal]) {
                                            self.forms[form].variables[variable].queryData[indFilter] = true;
                                        }
                                        break;

                                    case NOT:
                                        if (1 == filterData[indFilter][selectionVal]) {
                                            self.forms[form].variables[variable].queryData[indFilter] = true;
                                        }
                                        break;
                                }

                            }
                        }

                        break;
                }
            }
        }

        //This will contain the fileQueryOutput
        //which will be requested by the
        self.finalQueryOutput = [];
        for(var i = 0 ; i < self.nDataLen ; i++){
            self.finalQueryOutput[i] = true;
        }

        //This will perform the AND query on
        //of the graph
        for(form in self.forms){
            for(variable in self.forms[form].variables){
                for(var i = 0 ; i < self.nDataLen ; i++){
                    self.finalQueryOutput[i] &= self.forms[form].variables[variable].queryData[i];
                }
            }
        }

        ////////////////////////////////////////////////////////////////
        /// STATE MANAGEMENT
        ////////////////////////////////////////////////////////////////

        switch (self.operation){
            //whenever this will gets selected means
            //final filter query is performed
            case FILTER.SELECTION:

                self.isSelection = true;

                // this will read all the clicked items and
                // add to the filter data structure self.forms

                self.selQueriedArray = self.selHoverArray;
                self.selHoverArray = [];
                self.beforeHover = [];
                self.arrClickedItems = [];
                d3.selectAll("foreignObject").remove();

                for (var localForm in self.forms) {
                    for (var localVar in self.forms[localForm].variables) {
                        for (var localSelection in self.forms[localForm].variables[localVar].selections) {
                            if (self.forms[localForm].variables[localVar].selections[localSelection].filterOperation == FILTER.CTRLCLICK) {
                                self.forms[localForm].variables[localVar].selections[localSelection].filterOperation = FILTER.SELECTION;
                            }
                        }
                    }
                }

                break;

            //this is only at the time of hover it gets performed
            //mouse is hovered on the element
            case FILTER.HOVER:

                self.isSelection = false;

                //before hover
                if(self.selHoverArray == null) {
                    self.beforeHover = [];
                }
                else{
                    self.beforeHover = self.selHoverArray.slice();
                }

                //not equal to num is for defensive programming
                if(self.selHoverArray == null || (self.selHoverArray.length != self.finalQueryOutput.length)){
                    self.selHoverArray = self.finalQueryOutput.slice();
                }
                else{
                    for( var i = 0 ; i < self.finalQueryOutput.length ; i++) {
                        self.selHoverArray[i] |= self.finalQueryOutput[i];
                    }
                }
                break;

            case FILTER.CTRLCLICK:

                if(!self.isSelection) {


                    //not equal to num is for defensive programming
                    if (self.selHoverArray == null || (self.selHoverArray.length != self.finalQueryOutput.length)) {
                        self.selHoverArray = self.finalQueryOutput.slice();
                    }
                    else {
                        for (var i = 0; i < self.finalQueryOutput.length; i++) {
                            self.selHoverArray[i] = self.selHoverArray[i] | self.finalQueryOutput[i];
                        }
                    }
                    self.beforeHover = self.selHoverArray.slice();

                    //add to the click item
                    if (self.arrClickedItems == null) {
                        self.arrClickedItems = [];
                    }
                    self.arrClickedItems.push({form: _formName, var: _varName, selection: _selection});
                }
                else{
                    d3.selectAll("foreignObject").remove();
                }

                break;

            case FILTER.CLICK:

                self.arrClickedItems = [];
                if(!self.isSelection) {

                    self.selHoverArray = self.finalQueryOutput.slice();
                    self.beforeHover = self.selHoverArray.slice();

                    //add to the click item
                    if (self.arrClickedItems == null) {
                        self.arrClickedItems = [];
                    }
                    self.arrClickedItems.push({form: _formName, var: _varName, selection: _selection});
                }
                else{
                    d3.selectAll("foreignObject").remove();
                }

                break;

            case FILTER.UNCLICK:

                self.arrClickedItems = [];
                self.selHoverArray = [];
                self.arrClickedItems = [];
                d3.selectAll("foreignObject").remove();

                for (var localForm in self.forms) {
                    for (var localVar in self.forms[localForm].variables) {
                        for (var localSelection in self.forms[localForm].variables[localVar].selections) {

                            //this will check from the FILTER.CLICK
                            if (self.forms[localForm].variables[localVar].selections[localSelection].filterOperation == FILTER.CLICK
                                || self.forms[localForm].variables[localVar].selections[localSelection].filterOperation == FILTER.HOVER) {
                                delete self.forms[localForm].variables[localVar].selections[localSelection];
                                if (Object.keys(self.forms[localForm].variables[localVar].selections).length == 0)
                                    delete self.forms[localForm].variables[localVar];
                                if (Object.keys(self.forms[localForm].variables).length == 0)
                                    delete self.forms[localForm];
                            }
                        }
                    }
                }

                break;

            case FILTER.UNHOVER:

                //this will get the before hover
                if(self.beforeHover != null) { //being defensive
                    self.selHoverArray = self.beforeHover.slice();
                }
                break;

            case FILTER.DEFAULT:

                self.selQueriedArray = self.finalQueryOutput.slice();
                //self.selHoverArray = self.selQueriedArray;
                break;

            default:

        }
    }

    /**
     *
     * @param _formName
     * @param _varName
     * @param _selection
     * @param _operation
     */
    FilterData.prototype.add = function(_formName, _varName, _selection, _operation){

        var self = this;


        //get the latest data
        self.data = stateCtrl.top().mainPanel.data;
        self.operation = _operation;

        if(self.operation == FILTER.SELECTION){

            for (var localForm in self.forms) {
                for (var localVar in self.forms[localForm].variables) {
                    for (var localSelection in self.forms[localForm].variables[localVar].selections) {
                        if (self.forms[localForm].variables[localVar].selections[localSelection].filterOperation == FILTER.CLICK
                            || self.forms[localForm].variables[localVar].selections[localSelection].filterOperation == FILTER.HOVER) {
                            self.forms[localForm].variables[localVar].selections[localSelection].filterOperation = FILTER.SELECTION;
                        }
                    }
                }
            }

            //read all the clicked item and add it to the filter
            for( var clickedIemIdx = 0; clickedIemIdx < self.arrClickedItems.length; clickedIemIdx++) {

                _formName = self.arrClickedItems[clickedIemIdx].form;
                _varName = self.arrClickedItems[clickedIemIdx].var;
                _selection = self.arrClickedItems[clickedIemIdx].selection;

                self.addFilter(_formName, _varName, _selection, _operation);
            }
        }
        else if(self.operation != FILTER.UNCLICK) {
             self.addFilter(_formName, _varName, _selection, _operation);
        }


        if(self.operation != FILTER.NONE) {
            //this will update the filtering
            self.update(_formName, _varName, _selection);//categorical data
        }
    }

    /**
     *
     * @param _formName
     * @param _varName
     * @param _selection
     */
    FilterData.prototype.addFilter = function(_formName, _varName, _selection, _filterOperation){

        var self = this;

        //this will help identify the data type
        var fieldType = self.data[_formName].fields[_varName].obj.field_type;
        var validationType = self.data[_formName].fields[_varName].obj.text_validation_type_or_show_slider_number;

        if (fieldType === "text" && (validationType.match(/^date/))) {
            if (!self.forms.hasOwnProperty(_formName)) {
                self.forms[_formName] = {
                    "label": self.data[_formName].label,
                    "variables": {}
                };
            }

            if (!self.forms[_formName].variables.hasOwnProperty(_varName)) {
                console.log("field_label: "+self.data[_formName].fields[_varName].obj.field_label),
                self.forms[_formName].variables[_varName] = {
                    "label": self.data[_formName].fields[_varName].obj.field_label,
                    "form": _formName,
                    "var": _varName,
                    "type": NUMERICAL,
                    "selections": [],
                    "queryData": []
                }
            }

            var operation = AND;
            if (event.altKey) {
                operation = NOT;
            }

            if (!self.forms[_formName].variables[_varName].selections.hasOwnProperty(_selection.x)) {
                var v = {
                    "form": _formName,
                    "var": _varName,
                    "value": _selection.x,
                    "data": _selection,
                    "label": (_selection.x).toString() + " - " + (_selection.x + _selection.dx).toString(),//this will contain the label for filtering information
                    "opr": operation,
                    "state": -1,
                    "filterOperation": _filterOperation

                };
                if (validationType.match(/^date/)) {
                    v["label"] = getFormattedDate((_selection.x).toString(), validationType) + " - " + getFormattedDate((_selection.x + _selection.dx).toString(), validationType);
                }
                self.forms[_formName].variables[_varName].selections[_selection.x] = v;
            }

            //this will manage the state
            var state = self.forms[_formName].variables[_varName].selections[_selection.x].state;
            state = state < self.operation ? self.operation : state;
            self.forms[_formName].variables[_varName].selections[_selection.x].state = state;
	}
        else if (fieldType === "text" && (validationType === "number" || validationType === "integer")) {
            if (!self.forms.hasOwnProperty(_formName)) {
                self.forms[_formName] = {
                    "label": self.data[_formName].label,
                    "variables": {}
                };
            }

            if (!self.forms[_formName].variables.hasOwnProperty(_varName)) {
                self.forms[_formName].variables[_varName] = {
                    "label": self.data[_formName].fields[_varName].obj.field_label,
                    "form": _formName,
                    "var": _varName,
                    "type": NUMERICAL,
                    "selections": [],
                    "queryData": []
                }
            }

            var operation = AND;
            if (event.altKey) {
                operation = NOT;
            }

            if (!self.forms[_formName].variables[_varName].selections.hasOwnProperty(_selection.x)) {
                self.forms[_formName].variables[_varName].selections[_selection.x] = {
                    "form": _formName,
                    "var": _varName,
                    "value": _selection.x,
                    "data": _selection,
                    "label": (_selection.x).toString() + " - " + (_selection.x + _selection.dx).toString(),//this will contain the label for filtering information
                    "opr": operation,
                    "state": -1,
                    "filterOperation": _filterOperation

                }
            }

            //this will manage the state
            var state = self.forms[_formName].variables[_varName].selections[_selection.x].state;
            state = state < self.operation ? self.operation : state;
            self.forms[_formName].variables[_varName].selections[_selection.x].state = state;
        }
        else if (fieldType === "dropdown" || fieldType === "radio") {


            //////////////////////////use less code add it in proper location//////////////
            //todo best location is to change it data wrapper
            //add object with string
            var varObj = self.data[_formName].fields[_varName].obj;
            var varData = self.data[_formName].fields[_varName].data;
            var origKeyValuePair = {};
            var categories = varObj.select_choices_or_calculations.split("|");
            categories.forEach(function (cat) {
                var pair = cat.split(",");
                var key = pair[0].trim();
                var value = pair[1].trim();

                //this will store the key
                //value pair
                origKeyValuePair[key] = {
                    key: key,
                    value: value //category
                }
            });
            origKeyValuePair[""] = {
                key: "",
                value: "empty" //category
            }

            //////////////////////////////////////////////////////////////////////////////

            if (!self.forms.hasOwnProperty(_formName)) {
                self.forms[_formName] = {
                    "label": self.data[_formName].label,
                    "variables": {}
                };
            }

            if (!self.forms[_formName].variables.hasOwnProperty(_varName)) {
                self.forms[_formName].variables[_varName] = {
                    "label": self.data[_formName].fields[_varName].obj.field_label,
                    "form": _formName,
                    "var": _varName,
                    "type": CATEGORICAL,
                    "selections": [],
                    "queryData": []
                }
            }

            var operation = AND;
            if (event.altKey) {
                operation = NOT;
            }

            if (!self.forms[_formName].variables[_varName].selections.hasOwnProperty(_selection)) {
                self.forms[_formName].variables[_varName].selections[_selection] = {
                    "form": _formName,
                    "var": _varName,
                    "value": _selection,
                    "label": origKeyValuePair[_selection].value,
                    "opr": operation,
                    "state": -1,
                    "filterOperation": _filterOperation
                }
            }

            //this will manage the state
            var state = self.forms[_formName].variables[_varName].selections[_selection].state;
            state = state < self.operation ? self.operation : state;
            self.forms[_formName].variables[_varName].selections[_selection].state = state;
        }
        else if (fieldType === "checkbox") {


            //////////////////////////use less code add it in proper location//////////////
            //todo best location is to change it data wrapper
            //add object with string
            var varObj = self.data[_formName].fields[_varName].obj;
            var varData = self.data[_formName].fields[_varName].data;
            var origKeyValuePair = {};
            var categories = varObj.select_choices_or_calculations.split("|");
            categories.forEach(function (cat) {
                var pair = cat.split(",");
                var key = pair[0].trim();
                var value = pair[1].trim();

                //this will store the key
                //value pair
                origKeyValuePair[key] = {
                    key: key,
                    value: value //category
                }
            });
            origKeyValuePair[""] = {
                key: "",
                value: "empty" //category
            }

            //////////////////////////////////////////////////////////////////////////////

            if (!self.forms.hasOwnProperty(_formName)) {
                self.forms[_formName] = {
                    "label": self.data[_formName].label,
                    "variables": {}
                };
            }

            if (!self.forms[_formName].variables.hasOwnProperty(_varName)) {
                self.forms[_formName].variables[_varName] = {
                    "label": self.data[_formName].fields[_varName].obj.field_label,
                    "form": _formName,
                    "var": _varName,
                    "type": CHECKBOX_CATEGORICAL,
                    "selections": [],
                    "queryData": []
                }
            }

            var operation = AND;
            if (event.altKey) {
                operation = NOT;
            }

            if (!self.forms[_formName].variables[_varName].selections.hasOwnProperty(_selection)) {
                self.forms[_formName].variables[_varName].selections[_selection] = {
                    "form": _formName,
                    "var": _varName,
                    "value": _selection,
                    "label": origKeyValuePair[_selection].value,
                    "opr": operation,
                    "state": -1,
                    "filterOperation": _filterOperation
                }
            }

            //this will manage the state
            var state = self.forms[_formName].variables[_varName].selections[_selection].state;
            state = state < self.operation ? self.operation : state;
            self.forms[_formName].variables[_varName].selections[_selection].state = state;
        }
    }

    /**
     *
     * @param _formName
     * @param _varName
     * @param _selection
     * @param _operation
     */
    FilterData.prototype.numericalAdd = function(_formName, _varName, _selection, _operation){

        var self = this;
        self.operation = _operation;

        if(!self.forms.hasOwnProperty(_formName)){
            self.forms[_formName] = {
                "label":self.data[_formName].label,
                "variables": {}
            };
        }

        if(!self.forms[_formName].variables.hasOwnProperty(_varName)){
            self.forms[_formName].variables[_varName] = {
                "label": self.data[_formName].fields[_varName].obj.field_label,
                "form"  :   _formName,
                "var"   :   _varName,
                "type"  :   NUMERICAL,
                "selections": [],
                "queryData":[]
            }
        }

        var operation = AND;
        if(event.altKey){
            operation = NOT;
        }

        if(!self.forms[_formName].variables[_varName].selections.hasOwnProperty(_selection.x)){
            self.forms[_formName].variables[_varName].selections[_selection.x] = {
                "form"  :   _formName,
                "var"   :   _varName,
                "value" :   _selection.x,
                "data"  :   _selection,
                "label" :   (_selection.x).toString() + " < " + (_selection.x + _selection.dx).toString(),//this will contain the label for filtering information
                "opr"   :   operation,
                "state" :   -1
            }
        }


        //this will update the filtering
        self.update(0); //numerical data
    }

    /**
     *
     * @param _formName
     * @param _varName
     * @param _selection
     * @param _operation
     */
    FilterData.prototype.remove = function(_formName, _varName, _selection, _operation){

        var self = this;

        //filter the operations
        self.operation = _operation;

        if (!self.forms.hasOwnProperty(_formName)) {
            self.forms[_formName] = {
                "variables": {}
            };
        }

        if (!self.forms[_formName].variables.hasOwnProperty(_varName)) {
            self.forms[_formName].variables[_varName] = {
                "selections": [],
                "queryData": []
            }
        }

        var sel = self.forms[_formName].variables[_varName].selections[_selection];
        if(_operation == 8){
            self.clicked = false;
            self.selHoverArray = [];
            self.operation = FILTER.DEFAULT;
        }


        if(sel.state == FILTER.HOVER || sel.state == FILTER.CLICK || _operation == 8) {
            delete self.forms[_formName].variables[_varName].selections[_selection];

            if (Object.keys(self.forms[_formName].variables[_varName].selections).length == 0)
                delete self.forms[_formName].variables[_varName];

            if (Object.keys(self.forms[_formName].variables).length == 0)
                delete self.forms[_formName];

        }

        //this will update the filtering
        self.update();

    }

    /**
     *
     * @param _formName
     * @param _varName
     */
    FilterData.prototype.removeVar = function(_formName, _varName){
        var self = this;

        //delete the variable from the form object
        delete self.forms[_formName].variables[_varName];
        if(Object.keys(self.forms[_formName].variables).length == 0)
            delete self.forms[_formName];

        //this will update the filtering
        self.update();

    }

    /**
     * this will return the collection
     * @returns {{}|*|HTMLCollection}
     */
    FilterData.prototype.getQueryVarMap = function(){
        var self = this;

        return self.forms;
    }

    /**
     * This will be called by the UI class
     *
     * @returns {Array}
     */
    FilterData.prototype.getQuery = function(){
        var self = this;

        //this will return the filter data
        return self.selQueriedArray;
    }

    /**
     * This will be called by the UI class
     *
     * @returns {Array}
     */
    FilterData.prototype.getHoverArr = function(){
        var self = this;

        //this will return the filter data
        return self.selHoverArray;
    }

    /**
     *
     * @param formName
     * @param varName
     */
    FilterData.prototype.setAllHoverToFalse = function(){
        var self = this;
        for(var index = 0 ; index < self.selHoverArray.length ; index++){
            self.selHoverArray[index] = false;
        }
    }

    /**
     *
     * @param formName
     * @param varName
     */
    FilterData.prototype.setHoverIndexToTrue = function(index){
        var self = this;

        self.selHoverArray[index] = true;
    }

    /**
     *
     * @param formName
     * @param varName
     */
    FilterData.prototype.setStrat = function(formName, varName){
        var self = this;

        self.stratFormName = formName;
        self.stratVarName = varName;
        self.isStrat = true;
    }

    /**
     *
     * @returns {{form: *, variable: *, isStrat: boolean}}
     */
    FilterData.prototype.getStrat = function(){
        var self = this;

        return {
            form: self.stratFormName,
            variable: self.stratVarName,
            isStrat: self.isStrat
        };
    }

    FilterData.prototype.removeStrat = function(){
        var self = this;

        self.isStrat = false;
    }

    /**
     *
     * @param formName
     * @param varName
     */
    FilterData.prototype.setColorBy = function(formName, varName){
        var self = this;

        self.colorByFormName = formName;
        self.colorByVarName = varName;
        self.isColorBy = true;
    }

    /**
     *
     * @returns {{form: *, variable: *, isStrat: boolean}}
     */
    FilterData.prototype.getColorBy = function(){
        var self = this;


        return {
            form: self.colorByFormName,
            variable: self.colorByVarName,
            isColorBy: self.isColorBy
        };
    }

    /**
     * this function will called by the nominal view
     * and numerical view to set the map of color scale
     */
    FilterData.prototype.setColorByScale = function(map){
        var self = this;

        self.colorByMap = map;
    }


    /**
     * this function returns the color scale map
     */
    FilterData.prototype.getColorByScale = function(){
        var self = this;
        return self.colorByMap;
    }

    /**
     *
     */
    FilterData.prototype.remColorBy = function(){
        var self = this;

        self.isColorBy = false;
    }

    //this will return the instance
    return FilterData.getInstance();

});
