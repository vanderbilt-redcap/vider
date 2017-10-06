/**
 * Created by sunny on 2/13/16.
 */
define(["require"],function(require){

    //private variables
    var queryString;
    var AND = 0;
    var OR = 2;
    var NOT = 3;

    /**
     * read the parameter by name
     * @param name
     * @param url
     * @returns {*}
     */
    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    /**
     * Parse URL and fetch required parameters
     */
    var parseURL = function(){

        var urlParameter = {
            //contains the form name which
            //which to expand the form
            variablePanel:[],

            //contain the variable name or
            //operation between two var
            mainPanel:[],

            //contain the categories name
            //to merge and map to new bin name
            binPanel:[],

            //for the scatter main panel data
            scatterPanel:[],

            //project id
            projectID : 0
        };
        var varIndex = 0;
        var formIndex = 0;
        var formMap = {};
        var varMap = {};
        var referCmdReg= /@fv:(.*?)\;/g;
        var oprCmdReg= /@o:(.*?)\;/g;
        var commaSep = /,\s*/;
        var formReg= /@f([0-9]+);/g;
        var varReg= /@v([0-9]+);/g;
        var stratReg= /@s:(.*?)\;/g;
        var colorReg= /@c:(.*?)\;/g;
        var binCmdReg= /@b:(.*?)\;/g;
        var scCmdReg= /@sc:(.*?)\;/g;

        //var oprReg;

        //create the form and variable map with
        //the indexes
        var references = referCmdReg.exec(queryString);
        while(null != references){

            //divide the references wrt comma
            var refer = references[1].split(commaSep);
            var form = refer[0]; refer.shift(); //take the first element and remove from array
            var vars = refer;

            formMap[formIndex++] = form;
            vars.forEach(function(eachVar){
                varMap[varIndex++] = {formName:form,variableName:eachVar};
            });

            references = referCmdReg.exec(queryString);
        }

        var formIndexes = formReg.exec(queryString);
        while(null != formIndexes){
            //push the form name which are needed expanded
            urlParameter.variablePanel.push(formMap[Number(formIndexes[1])]);
            //look for the new match
            formIndexes = formReg.exec(queryString);
        }

        var varIndexes = varReg.exec(queryString);
        while(null != varIndexes){
            //push the form name which are needed expanded
            urlParameter.mainPanel.push(varMap[Number(varIndexes[1])]);
            //look for the new match
            varIndexes = varReg.exec(queryString);
        }

        var operations = oprCmdReg.exec(queryString);
        while(null != operations){
            var opr =  operations[1].split(commaSep);
            if(opr.length == 4) {
                require("filterData").add(opr[0], opr[1],
                    opr[2], parseInt(opr[3]));
            }
            else if(opr.length == 5){
                require("filterData").add(opr[0], opr[1],
                    {x: parseInt(opr[2]),dx: parseInt(opr[3])},
                    parseInt(opr[4]));
            }
            operations = oprCmdReg.exec(queryString);
        }

        var strat = stratReg.exec(queryString);
        if(null != strat){
            var opr = strat[1].split(commaSep);
            require("filterData").setStrat(opr[0],opr[1]);
        }

        var color = colorReg.exec(queryString);
        if(null != color){
            var opr = color[1].split(commaSep);
            require("filterData").setColorBy(opr[0],opr[1]);
        }


        //create the form and variable map with
        var bin = binCmdReg.exec(queryString);
        while(null != bin){

            //divide the references wrt comma
            var refer = bin[1].split(commaSep);
            var formName = refer[0]; refer.shift();
            var varName = refer[0]; refer.shift();
            var binName = refer[0]; refer.shift();

            urlParameter.binPanel.push({form: formName,
                var: varName,
                bin: binName,
                indexToMerge: refer});

            bin = binCmdReg.exec(queryString);
        }

        //create the form and variable map with
        var sc = scCmdReg.exec(queryString);
        while(null != sc){

            //divide the references wrt comma
            var refer = sc[1].split(commaSep);

            urlParameter.scatterPanel.push({form1: refer[0],
                var1: refer[1],
                form2: refer[2],
                var2: refer[3]});

            sc = scCmdReg.exec(queryString);
        }

        urlParameter.projectID = getParameterByName("pid");
        return urlParameter;
    }

    //protected function
    var _getURLParameter =  function(){
        /* todo this function will be used
         * to read the url parameter and return
         * array of url parameters
         * refer: http://www.sitepoint.com/url-parameters-jquery/
         */
        queryString = window.location.href;
        if(queryString.length == 0){
            console.log("URL not found");
        }
        return parseURL();
    }

    var _getURL =  function(){
        /* todo this function will be used
         * to read the url parameter and return
         * array of url parameters
         * refer: http://www.sitepoint.com/url-parameters-jquery/
         */

        return queryString;
    }

    return {
        getParameter: _getURLParameter,
        getURL: _getURL
    }
})