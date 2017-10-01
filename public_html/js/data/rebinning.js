/**
 * Created by sunny on 2/11/16.
 */

// class instance initialized to null
define(["require","redCapData"], function (require,redCapData) {

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
    function Rebinning() {
        var self = this;
        //if instance is not null then throw an error
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one Rebinning, use Rebinning.getInstance()");
        }
    }

    /**
     * this function returns the instance of this
     * class if not created
     * @returns {*}
     */
    Rebinning.getInstance = function () {
        // gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new Rebinning();
        }
        return instance;
    };

    /**
     * Called on the initialization of th class
     */
    Rebinning.prototype.init = function () {
        var self = this
        self.forms = {};
    };

    /**
     *
     * @param _formName
     * @param _varName
     * @param _bins
     */
    Rebinning.prototype.add = function(_formName, _varName, _bins){
        var self = this;

        if(!self.forms.hasOwnProperty(_formName)) {
            self.forms[_formName] = {
                variables: {}
            }
        }
        if(!self.forms[_formName].variables.hasOwnProperty(_varName)) {
            self.forms[_formName].variables[_varName] ={
                bin : ""
            }
        }

        var categories = [];
        var bins = _bins.split(",");
        bins.forEach(function(bin){
            var cat = bin.split("-");
            var x = Number(cat[0].trim());
            var dx = Number(cat[1].trim()) - x;
            categories.push({x:x, dx:dx});
        })


        self.forms[_formName].variables[_varName].bin = categories;
    }

    /**
     *
     * @param _formName
     * @param _varName
     * @returns {boolean}
     */
    Rebinning.prototype.get = function(_formName, _varName){
        var self = this;

        if(self.forms.hasOwnProperty(_formName)){
            if(self.forms[_formName].variables.hasOwnProperty(_varName)){
                return self.forms[_formName].variables[_varName];
            }
        }
        return null;
    }

    /**
     *
     * @param _formName
     * @param _varName
     * @returns {boolean}
     */
    Rebinning.prototype.check = function(_formName, _varName){
        var self = this;

        if(self.forms.hasOwnProperty(_formName)){
            if(self.forms[_formName].variables.hasOwnProperty(_varName)){
                return true;
            }
        }

        return false;
    }

    /**
     *
     * @param _formName
     * @param _varName
     */
    Rebinning.prototype.remove = function(_formName, _varName){
        var self = this;

        //delete the variable from the form object
        delete self.forms[_formName].variables[_varName];
        if(Object.keys(self.forms[_formName].variables).length == 0)
            delete self.forms[_formName];
    }

    return Rebinning.getInstance();
});