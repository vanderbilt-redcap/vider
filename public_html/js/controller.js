/**
 * Created by sunny on 2/15/16.
 */
define(["jquery","d3","dataWrapper","loadData","url","stateCtrl","view","filterData","rebinning"],
    function ($,d3,dataWrapper,loadData,url,stateCtrl,view,filterData,rebinning) {

        /**
         * This class is responsible for the modifiying the intruments
         * on the ui
         * @type {null}
         */


        var self = this;
        var instance = null;

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function Controller() {
            var self = this;

            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one Controller, use Controller.getInstance()");
            }
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        Controller.getInstance = function () {
            var self = this;

            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new Controller();
            }
            return instance;
        };

        /**
         * call back when data gets loaded
         * @param _instance
         */
        Controller.prototype.onDataLoadCallback = function(_instance){
            var self = _instance;

            //load the data from the redcap
            //server and create the wrapper
            //with some modification of the
            //structures
            dataWrapper.init();

            //state the state mgmt with the
            //default redcap data and then
            //look for the URL for the operations
            //it wants to perform
            stateCtrl.init();

            //initialize the filter panel
            filterData.init();

            //rebinning
            rebinning.init();

            //reading the current URL
            stateCtrl.readCurrentURL();

            //this will initialize the event handler
            //which will take care if the states gets
            //changed
            self.stateEventHndlr = d3.dispatch("stateChanged");
            self.stateEventHndlr.on("stateChanged",self.newState);

            //this will initialize the view with
            //the event handler
            view.init(self.stateEventHndlr);

            //loading screen finished
            loading_screen.finish();
        }

        /**
         * main controller class for ths whole
         */
        Controller.prototype.init = function () {
            var self = this;

            //d3.select("#varPanel").selectAll("*").remove();
            d3.select(".dataDistPanel").selectAll("*").remove();
            d3.select(".stratAndColFilter").selectAll("*").remove();
            d3.select("#filterTable").selectAll("*").remove();
            d3.select(".fieldsContainer").selectAll("*").remove();
            d3.select(".table-responsive").selectAll("*").remove();
            d3.select("#comparisionPanel").selectAll("*").remove();

            loadData.init(self.onDataLoadCallback, this);

            //five second timeout if nothing no response is received
            setTimeout(function(){
                loading_screen.updateLoadingHtml("<div><p class='loading-message'>Please login to your REDCap instance ...</p></div>");
            }, 5000);

            window.addEventListener("popstate", function(e) {

                //state the state mgmt with the
                //default redcap data and then
                //look for the URL for the operations
                //it wants to perform
                //stateCtrl.init();

                //reading the current URL
                stateCtrl.readCurrentURL();

                //initialize the filter panel
                filterData.init();

                //this will initialize the event handler
                //which will take care if the states gets
                //changed
                self.stateEventHndlr = d3.dispatch("stateChanged");
                self.stateEventHndlr.on("stateChanged",self.newState);

                //this will initialize the view with
                //the event handler
                view.init(self.stateEventHndlr);
            });

        }

        /**
         * this will take the action for the new state
         * @param _urlParam
         */
        Controller.prototype.newState = function(_urlParam){
	    alert(_urlParam);
            var self = this;

            // update the url as per the
            // new state
            url.updateURL(_urlParam);

            // add latest parameter to the
            // state control
            stateCtrl.add(_urlParam);

            //update the view with the top
            //state data
            view.update();
        }

        return Controller.getInstance();

    });
