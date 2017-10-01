/**
 * Created by sunny on 2/11/16.
 */
// class instance initialized to null
define(function () {

        var instance = null;

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function REDCapData() {
            var self = this;
            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one REDCap Data, use REDCap.getInstance()");
            }
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        REDCapData.getInstance = function () {
            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new REDCapData();
            }
            return instance;
        };


        //setter
        REDCapData.prototype.setInstrumentJSON = function (_instrumentJSON) {
            var self = this;
            self.instrumentJSON = _instrumentJSON;

        }
        REDCapData.prototype.setRecordsJSON = function (_recordsJSON) {
            var self = this;
            self.recordsJSON = _recordsJSON;
        }
        REDCapData.prototype.setMetadataJSON = function (_metadataJSON) {
            var self = this;
            self.metadataJSON = _metadataJSON;
        }
        REDCapData.prototype.setEventJSON = function (_eventJSON) {
            var self = this;
            self.eventJSON = _eventJSON;
        }

        //getter
        REDCapData.prototype.getInstrumentJSON = function () {
            var self = this;
            return self.instrumentJSON;
        }
        REDCapData.prototype.getRecordsJSON = function () {
            var self = this;
            return self.recordsJSON;
        }
        REDCapData.prototype.getMetadataJSON = function () {
            var self = this;
            return self.metadataJSON;
        }
        REDCapData.prototype.getEventJSON = function () {
            var self = this;
            return self.eventJSON;
        }

        return REDCapData.getInstance();

    });