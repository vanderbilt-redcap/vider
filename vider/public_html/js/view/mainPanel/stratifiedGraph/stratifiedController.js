/**
 * Created by sunny on 4/7/16.
 */
define([], function(d3){
   
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
    function StratifiedController() {
        var self = this;
        //if instance is not null then throw an error
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one StratifiedController, use StratifiedController.getInstance()");
        }
    }

    /**
     * this function returns the instance of this
     * class if not created
     * @returns {*}
     */
    StratifiedController.getInstance = function () {
        // gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new StratifiedController();
        }
        return instance;
    };

    /**
     * this function will be called at the time
     * of initialization
     */
    StratifiedController.prototype.init = function(data){
        var self = this;

        self.redcapData = data;

        var color = {
            name:"",        //selected category name
            rgb: "",        //rgb of the color
            count: 0        //how many time the category appeared
        };
        var categoryColorBy = {
            colorArr: [],   //contains all the categories
            count: 0        //total count of all the selected values
        };
        var subvariable = {
            id:{
                form:"",
                var:""
            },
            categories: [], //contain categoryColorBy
            count: 0        //total count per variable
        };
        var strat = {
            subvariables: [],   //contain the variables
            count: 0,
            name: ""
        };
        var variable = {
            id:{
                form: "",
                var:""
            },
            strats: {},
            count: 0,
            label:""
        }
        self.graph = {
            label:"",
            strats:[],
            count:0
        };
    }


    /**
     * Add the variable on the main panel
     */
    StratifiedController.prototype.addVariable = function(){
        var self = this;

        if(!self.graph.strats.hasOwnProperty("DEFAULT")){
            self.graph.strats["DEFAULT"] = {
                id: "DEFAULT"
            }
        }
    }

    /**
     * Remove the variable from the main panel
     */
    StratifiedController.prototype.remVariable = function(){
        var self = this;
    }

    /**
     * Add the stratby on the main panel
     */
    StratifiedController.prototype.addStratBy = function(){
        var self = this;
    }

    /**
     * remove the stratby from the main panel
     */
    StratifiedController.prototype.remStratBy = function(){
        var self = this;
    }

    /**
     * add the colorby on the main panel
     */
    StratifiedController.prototype.addColorBy = function(){
        var self = this;
    }

    /**
     * remove the colorby from the main panel
     */
    StratifiedController.prototype.remColorBy = function(){
        var self = this;
    }

    return StratifiedController.getInstance();
})