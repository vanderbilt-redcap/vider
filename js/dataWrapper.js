/**
 * Created by sunny on 2/11/16.
 */

// class instance initialized to null
define(["jquery","require","redCapData"], function ($,require,redCapData) {

    /**
     * This class is responsible for the modifiying the intruments
     * on the ui
     * @type {null}
     */

    var instance = null;

    /**
     * 1. Check if instance is null then throw error
     * 2. Calls the load ui related to this class
     * @constructor
     */
    function DataWrapper() {
        var self = this;
        //if instance is not null then throw an error
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one DataWrapper, use DataWrapper.getInstance()");
        }
    }

    /**
     * this function returns the instance of this
     * class if not created
     * @returns {*}
     */
    DataWrapper.getInstance = function () {
        // gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new DataWrapper();
        }
        return instance;
    };

    /**
     * Called on the initialization of th class
     */
    DataWrapper.prototype.init = function () {
        var self = this;

        self.metadataObj    = redCapData.getMetadataJSON();
        self.instrumentObj  = redCapData.getInstrumentJSON();
        self.recordsObj     = redCapData.getRecordsJSON();
        self.eventObj       = redCapData.getEventJSON();

        self.mapInstToFields = {};

        //todo divide the following task into functions
        self.instrumentObj.forEach(function(instrument){
            if(!self.mapInstToFields.hasOwnProperty(instrument.instrument_name)){
                if (typeof instrument.event_name != "undefined") {
                    self.mapInstToFields[instrument.instrument_name] = {
                        "label"     : instrument.instrument_label,
                        "event_id"  : instrument.event_id,
                        "event_name": instrument.event_name,
                        "fields"    : {}
                    };
                } else {
                    self.mapInstToFields[instrument.instrument_name] = {
                        "label"  : instrument.instrument_label,
                        "fields" : {}
                    };
                }
            }
            else{
                //if the two forms of multiple names appear then throw error
                console.log("Error - Forms with multiple names");
            }
        });

        self.fieldToDataMap = {};
        //club all the data under one particular field
        self.recordsObj.forEach(function(record){

            var checkBoxMap = {};
            for(var key in record){
                //these are the check box keys
                if(key.includes("___")){

                    var tokens = key.split("___");
                    var mainKey = tokens[0];
                    var type = tokens[1];
                    var value = record[key];

                    if(!checkBoxMap.hasOwnProperty(mainKey)){
                        checkBoxMap[mainKey] = {};
                    }
                    if(!checkBoxMap.hasOwnProperty(type)){
                        checkBoxMap[mainKey][type] = value;
                    }
                }
                else{
                    if(!self.fieldToDataMap.hasOwnProperty(key)){
                        self.fieldToDataMap[key] = [];
                    }
                    self.fieldToDataMap[key].push(record[key]);
                }
            }

            //once all the keys in the record are identified then
            //add the checkbox key
            for(var key in checkBoxMap){

                if(!self.fieldToDataMap.hasOwnProperty(key)){
                    self.fieldToDataMap[key] = [];
                }
                self.fieldToDataMap[key].push(checkBoxMap[key]);
            }
        });

        //this will set the records id obj
        self.setRecordId(self.metadataObj[0]);

        self.metadataObj.forEach(function(field){
            if(self.mapInstToFields.hasOwnProperty(field.form_name)){
                if(!self.mapInstToFields[field.form_name].fields.hasOwnProperty(field.field_name)){
                    self.mapInstToFields[field.form_name].fields[field.field_name] = {
                        "obj" : field,
                        "data" : self.fieldToDataMap[field.field_name]
                    };
                }
            }
            else{
                if (field.field_name != "record_id") {
                    console.log("Error - Invalid Form name mentioned in the field: "+field.form_name+" for "+field.field_name)
                }
            }
        });

        if(null != self.fieldToDataMap["redcap_event_name"]) {
            var eventNames = self.fieldToDataMap["redcap_event_name"];
            var uEventNames = {};
            var strEvent = "";
            var index = 0;
            for(var eventIndex = 0; eventIndex < eventNames.length ; eventIndex++){
                if(uEventNames.hasOwnProperty(eventNames[eventIndex])){
                    continue;
                }
                uEventNames[eventNames[eventIndex]] = 1;
                strEvent += eventNames[eventIndex] + " , "+ eventNames[eventIndex] + "|";
            }
            strEvent = strEvent.slice(0, -1);

            self.mapInstToFields["event_name_form"] = {
                "label"  : "Event Name 1",
                "fields" : {}
            }
            self.mapInstToFields["event_name_form"].fields["event_name_var"] = {
                "obj" :{
                    field_label: "Event Name 2",
                    field_name:"event_name_var",
                    field_type:"dropdown",
                    form_name:"event_name_form",
                    select_choices_or_calculations:strEvent
                },
                "data" : eventNames
            };
        }
    };

    /**
     * get primary records name
     * @returns {*}
     */
    DataWrapper.prototype.getPrimaryRecordsName = function(){
        var self = this;
        return self.primaryRecName;;
    }

    /**
     *
     * @returns {*}
     */
    DataWrapper.prototype.setRecordId = function( recordIdObj ){
        var self = this;
        self.recordIdObj = recordIdObj;
        self.primaryRecName = recordIdObj.field_label;
    }

    /**
     *
     * @returns {*}
     */
    DataWrapper.prototype.getRecordId = function(  ){
        var self = this;
        return self.fieldToDataMap[self.recordIdObj.field_name];
    }

    /**
     *
     * @returns {*}
     */
    DataWrapper.prototype.getEventData = function(){
        var self = this;

        return self.eventObj;
    }

    /**
     *
     * @returns {*}
     */
    DataWrapper.prototype.getEventRecords = function(){
        var self = this;
        return self.fieldToDataMap["redcap_event_name"];
    }


    /**
     * this function will return the data from
     * the data wrapper class
     * @returns {{}|*}
     */
    DataWrapper.prototype.getData = function(){
        var self = this;


        return $.extend(true, {}, self.mapInstToFields);
    }


    return DataWrapper.getInstance();
});
