/**
 * Created by sunny on 2/13/16.
 */
define(["require"],function(require){

    //here goes the private variable
    //
    //

    //current url
    var currentUrl = location.href;
    var NUMERICAL = 0;
    var CATEGORICAL = 1;
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
        NONE:6
    }


    //protected function
    var _updateParameter =  function(_param){

        //todo this function will update the parameter
        //on the url
        //refer: http://stackoverflow.com/questions/824349/modify-the-url-without-reloading-the-page

        var urlToUpdate = require("global").baseURL + "?";
        var pid = require("global").getPID();
        //check if current url contains www.example.com/ajax/project.aspx
        if (currentUrl.indexOf(require("global").baseURL) != -1 ) {

            if(pid != null && pid.length > 0){
                urlToUpdate += "pid=";
                urlToUpdate += pid
                urlToUpdate += ";";
            }

            _param.mainPanel.param.forEach(function(obj){
                urlToUpdate += "@fv:";
                urlToUpdate += obj.formName;
                urlToUpdate += ",";
                urlToUpdate += obj.variableName;
                urlToUpdate += ";";
            });

            var varIndex = 0;
            _param.mainPanel.param.forEach(function(obj){
                urlToUpdate += "@v";
                urlToUpdate += varIndex++;
                urlToUpdate += ";";
            });

            //BINNNING PANEL
            _param.binPanel.param.forEach(function(d){

                //replace all the spaces and commas with underscore
                d.bin.replaceAll("\\s","_");
                d.bin.replaceAll(",","_");


                //update the url
                urlToUpdate += "@b:";
                urlToUpdate += d.form;
                urlToUpdate += ",";
                urlToUpdate += d.var;
                urlToUpdate += ",";
                urlToUpdate += d.bin;
                d.indexToMerge.forEach(function(index){
                    urlToUpdate += ",";
                    urlToUpdate += index;
                })
                urlToUpdate += ";";
            })

            var filterData = require("filterData").getQueryVarMap();
            for(var form in filterData){
                if (!filterData.hasOwnProperty(form)) continue;

                for(var variable in filterData[form].variables){
                    if (!filterData[form].variables.hasOwnProperty(variable)) continue;

                    for(var sel in filterData[form].variables[variable].selections){
                        if (!filterData[form].variables[variable].selections.hasOwnProperty(sel)) continue;

                        var form = filterData[form].variables[variable].selections[sel].form;
                        var svar = filterData[form].variables[variable].selections[sel].var;
                        var selKey = filterData[form].variables[variable].selections[sel].value;
                        //var opr= filterData[form].variables[variable].selections[sel].opr;
                        var opr= FILTER.DEFAULT;
                        var type = filterData[form].variables[variable].type;

                        if(CATEGORICAL === type){
                            urlToUpdate += "@o:";
                            urlToUpdate += form;
                            urlToUpdate += ",";
                            urlToUpdate += svar;
                            urlToUpdate += ",";
                            urlToUpdate += selKey;
                            urlToUpdate += ",";
                            urlToUpdate += opr;
                            urlToUpdate += ";";
                        }
                        else if(NUMERICAL === type){

                            var data = filterData[form].variables[variable].selections[sel].data;

                            urlToUpdate += "@o:";
                            urlToUpdate += form;
                            urlToUpdate += ",";
                            urlToUpdate += svar;
                            urlToUpdate += ",";
                            urlToUpdate += data.x;
                            urlToUpdate += ",";
                            urlToUpdate += data.dx;
                            urlToUpdate += ",";
                            urlToUpdate += opr;
                            urlToUpdate += ";";
                        }
                    }
                }
            }

            //SCATTER PANEL
            _param.scatterPanel.param.forEach(function(d){
                urlToUpdate += "@sc:";
                urlToUpdate += d.form1;
                urlToUpdate += ",";
                urlToUpdate += d.var1;
                urlToUpdate += ",";
                urlToUpdate += d.form2;
                urlToUpdate += ",";
                urlToUpdate += d.var2;
                urlToUpdate += ";";
            })

            //
            var stratData = require("filterData").getStrat();
            if(stratData.isStrat){
                urlToUpdate += "@s:";
                urlToUpdate += stratData.form;
                urlToUpdate += ",";
                urlToUpdate += stratData.variable;
                urlToUpdate += ";";
            }

            var colorData = require("filterData").getColorBy();
            if(colorData.isColorBy){
                urlToUpdate += "@c:";
                urlToUpdate += colorData.form;
                urlToUpdate += ",";
                urlToUpdate += colorData.variable;
                urlToUpdate += ";";
            }

            history.pushState("check", 'red cap', urlToUpdate);
        }
    }

    return {
        updateParameter: _updateParameter
    }
})
