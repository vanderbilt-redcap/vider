/**
 * Created by sunny on 2/8/16.
 */
//todo modify this function to load different
//database data
define(["redCapData"],function(redCapData){

    var instrumentData;
    var recordsData;
    var metadataData;
    var eventData;

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
    function LoadData() {
        var self = this;
        //if instance is not null then throw an error
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one LoadData, use LoadData.getInstance()");
        }
    }

    /**
     * this function returns the instance of this
     * class if not created
     * @returns {*}
     */
    LoadData.getInstance = function () {
        // gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new LoadData();
        }
        return instance;
    };

    /**
     *
     * @param isEvent
     * @param isRecords
     * @param isMetaData
     * @param isInstruments
     */
    LoadData.prototype.actionOnLoad = function(isEvent, isRecords, isMetaData, isInstruments){
        var self = this;

        if(isEvent && isRecords && isMetaData && isInstruments){
            self.registeredCallBack.call(this,self.parentIns);
        }
    }

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;


        name = name.replace(/[\[\]]/g, "\\$;");
        var components = url.split(/\?/);
        if (components.length == 1) {
            return null;
        }
        var paramPairs = components[1].split(/&/);
        var params = {};
        for (var i = 0; i < paramPairs.length; i++) {
            var a = paramPairs[i].split(/=/);
            if (a.length == 2) {
                params[a[0]] = a[1];
            }
        }
	if (typeof params[name] != 'undefined') {
                return decodeURIComponent(params[name].replace(/\+/g, " "));
        }
        return null;
    }

    /**
     *
     */
    LoadData.prototype.init = function(_callback, _instance) {
        var self = this;

        self.isEvent = false;
        self.isRecords = false;
        self.isMetaData = false;
        self.isInstruments = false;
        self.parentIns = _instance;

        //read the url and token from the
        //settings from the modal
        var encodedURL = $("#url").val();
        var token = $("#token").val();
        var pid = getParameterByName("pid")
        var form = getParameterByName("form")
        var event_id = getParameterByName("event_id")
        var suffix = "";
        if (form) {
            suffix += "&form="+form;
        }
        if (event_id) {
            suffix += "&event_id="+event_id;
        }

        console.log(window.location.href, pid);


        //this function will register the call back
        //which will wait for all the functions to
        //get registered
        self.registeredCallBack = _callback;

        //this function will make the AJAX cal to load the data
        //to the javascript library
        var xmlhttpRecData = new XMLHttpRequest();
        xmlhttpRecData.onreadystatechange = function () {
            if (xmlhttpRecData.readyState == 4 && xmlhttpRecData.status == 200) {
                recordsData = xmlhttpRecData.responseText;
                if (recordsData.match(/^</)) {
                    setTimeout(function(){
                        $('#loading-message').html('Please log into REDCap on this instance. Then refresh this page to proceed.');
                    }, 7000);
                } else {
                    redCapData.setRecordsJSON(JSON.parse(recordsData.replace(new RegExp(",,", 'g'), ",")));
                    self.isRecords = true;
                    self.actionOnLoad(self.isEvent,self.isRecords,self.isMetaData,self.isInstruments);
                }
            }
        };
        xmlhttpRecData.open("GET", "../resources/library/redcap/records.php?pid="+pid+suffix, true);
        xmlhttpRecData.send();

        //this function will make the AJAX cal to load the data
        //to the javascript library
        var xmlhttpMetData = new XMLHttpRequest();
        xmlhttpMetData.onreadystatechange = function () {
            if (xmlhttpMetData.readyState == 4 && xmlhttpMetData.status == 200) {
                metadataData = xmlhttpMetData.responseText;
                if (!metadataData.match(/^</)) {
                    redCapData.setMetadataJSON(JSON.parse(metadataData));
                    self.isMetaData = true;
                    self.actionOnLoad(self.isEvent,self.isRecords,self.isMetaData,self.isInstruments);
                }
            }
        };
        xmlhttpMetData.open("GET", "../resources/library/redcap/metadata.php?pid="+pid+suffix, true);
        xmlhttpMetData.send();

        //this function will make the AJAX cal to load the data
        //to the javascript library
        var xmlhttpInstData = new XMLHttpRequest();
        xmlhttpInstData.onreadystatechange = function () {
            if (xmlhttpInstData.readyState == 4 && xmlhttpInstData.status == 200) {
                instrumentData = xmlhttpInstData.responseText;
                if (!instrumentData.match(/^</)) {
                    redCapData.setInstrumentJSON(JSON.parse(instrumentData));
                    self.isInstruments = true;
                    self.actionOnLoad(self.isEvent,self.isRecords,self.isMetaData,self.isInstruments);
                }
            }
        };
        xmlhttpInstData.open("GET", "../resources/library/redcap/instruments.php?pid="+pid+suffix, true);
        xmlhttpInstData.send();

        //this function will make the AJAX cal to load the data
        //to the javascript library
        var xmlhttpEvntData = new XMLHttpRequest();
        xmlhttpEvntData.onreadystatechange = function () {
            if (xmlhttpEvntData.readyState == 4 && xmlhttpEvntData.status == 200) {
                eventData = xmlhttpEvntData.responseText;
                if (!eventData.match(/^</)) {
                    redCapData.setEventJSON(JSON.parse(eventData));
                    self.isEvent = true;
                    self.actionOnLoad(self.isEvent,self.isRecords,self.isMetaData,self.isInstruments);
                }
            }
        };
        xmlhttpEvntData.open("GET", "../resources/library/redcap/events.php?pid="+pid+suffix, true);
        xmlhttpEvntData.send();
    }

    return LoadData.getInstance();
});
