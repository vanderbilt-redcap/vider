/**
 * Created by sunny on 2/13/16.
 *
 * Following will be the URL:
 * http://localhost:1024/public_html?@fv:form0,var0,var1,var2;@fv:form1,var3,var4;@f0;@f1;@v0;@v1;@o0,v1,v2;@o1,v3,v4;
 *
 * Following two lines will refer form and variables
 * to perform operation
 * ----------------------------------------------
 * @fv:form0,var0,var1,var2;
 * @fv:form1,var3,var4;
 *
 * variable panel - 1 (@f0;@f1;)
 * -------------------
 * @f0 - expand form 1
 * @f1 - expand form 2
 *
 * main panel - 1 (display variable 1 - @v0;)
 * -----------------------------------
 * @v0 - refer var 1
 *
 * main panel - 2 (display intersection operation - @o,@v1,v2;)
 * ------------------------------------------------
 * @v1 - refer var 2
 * @v2 - refer var 3
 * @o0 - intersection operation
 *
 * main panel - 3 (display union operation - @o1,v3,v4;)
 * ------------------------------------------
 * @v3 - refer var 4
 * @v4 - refer var 5
 * @o1 - union operation
 *
 * multiple operations on the url can be achieved by fixing the operations
 * operation format:
 * -----------------------------------------------------------------------
 * @fv     one form and mutliple variable names
 * @f      form name
 * @v      variable name
 * @v0     refer variable 1
 * @v1     refer variable 2
 * @v2     refer variable 3
 * @v3     refer variable 4
 * @o0     add
 * @o1     not
 * @o2     or
 *
 * defination for merging multiple categories together
 * ---------------------------------------------------
 * @
 * and many more operations
 *
 *
 * IMPORTANT: PID there is hack ;)
 * -----------------------------------------------------
 * stored in the global when the system start and gets
 * modified from the url modifier
 */

define(["urlModifier","urlReader"],
    function(urlModifier,urlReader){

        /**
         * This class is responsible for the URL operations
         * @type {null}
         */

        var instance = null;

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function URL() {
            var self = this;
            //if instance is not null then throw an error
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one URL, use URL.getInstance()");
            }

            self.init();
        }

        /**
         * this function returns the instance of this
         * class if not created
         * @returns {*}
         */
        URL.getInstance = function () {
            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new URL();
            }
            return instance;
        };

        /**
         * on url class initialization init function
         * is called
         */
        URL.prototype.init = function(){
            var self = this;
        }

        /**
         * this function will set all the parameter as
         * per the protocol
         * @param _param
         */
        URL.prototype.updateURL = function(_param){
            urlModifier.updateParameter(_param);
        }

        /**
         * this function will return an array of parameter
         */
        URL.prototype.getParameters = function(){
           return urlReader.getParameter();
        }

        return URL.getInstance();
    });