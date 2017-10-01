/**
 * Created by sunny on 3/7/16.
 */
define(["jquery","d3","dataWrapper","filterData"],
    function ($,d3,dataWrapper,filterData) {

        /**
         * This class is responsible for the modifiying the intruments
         * on the ui
         * @type {null}
         */
        var instance = null;
        var data = [];

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function ViewEventPanel() {
            var self = this;
            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one ViewEventPanel, use ViewEventPanel.getInstance()");
            }
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        ViewEventPanel.getInstance = function () {
            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new ViewEventPanel();
            }
            return instance;
        };

        /**
         * initialize the view with the
         * state event handler
         * @param _stateEventHndlr
         */
        ViewEventPanel.prototype.init= function(){
            var self = this;

            self.buttonGrp = d3.select(".eventPanel")
                .append("div")
                .attr("class","btn-group")
                .attr("data-toggle","buttons")
                .style("float","left");

            //todo this will be the all button
/*            var allBtn = d3.select(".eventPanel")
                .append("div")
                .attr("class","btn-group")
                .attr("data-toggle","buttons")
                .style("float","left")
                .append("label")
                .attr("class","btn  btn-default btn-xs")
                //.text("ALL")//todo
                .on("click",function(d){
                    //call the filter data with the timepoint fitering
                    filterData.toggleAllEventStatus();
                    //add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top())
                });

            allBtn.append("input").attr("type","checkbox");*/
    }

        /**
         * update the view with the
         * state event handler
         * @param _stateEventHndlr
         */
        ViewEventPanel.prototype.update= function() {
            var self = this;

            var button= self.buttonGrp.selectAll("label")
                .data(d3.values(filterData.getEventData()));

            var inp = button.attr("class",function(d){
                    if(d.status) {
                        return "btn  btn-default btn-xs active";}
                    else{
                        return "btn  btn-default btn-xs";
                    }
                })
                .text(function(d){return d.eventObj.event_name})
                .on("click",function(d){
                    //call the filter data with the timepoint fitering
                    filterData.toggleEventStatus(d.eventObj.unique_event_name);
                    //add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top())
                });

            inp = button.enter().append("label")
                .attr("class",function(d){
                    if(d.status) {
                        return "btn  btn-default btn-xs active";}
                    else{
                        return "btn  btn-default btn-xs";
                    }
                })
                .text(function(d){return d.eventObj.event_name})
                .on("click",function(d){
                    //call the filter data with the timepoint fitering
                    filterData.toggleEventStatus(d.eventObj.unique_event_name);
                    //add filter data int this data so that
                    require("view").updateNewState(require("stateCtrl").top())
                });
            inp.append("input").attr("type","checkbox");

            button.exit().remove();


        }

        //return the singleton instance
        return ViewEventPanel.getInstance();

    });