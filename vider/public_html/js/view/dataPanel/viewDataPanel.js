/**
 * Created by Sateesh on 3/1/16.
 */

define(["dataWrapper"],function(dataWrapper){
        /**
         * Declare all the local variables here.
         * @type {{}}
         * @type other
         */

        var dataPanel = document.getElementById("dataPanel");
        //var dataPanel = document.getElementById("accordion");

        /**
         * This function is used to wrangle the raw data and format it
         * into the appropriate structure
         * @param _data
         * @private
         * @returns {}
         */

        var _wrangleData = function(_data){

            var sampleParam = _data.param;
            var panelData = {};
            var fieldVals = {};
            var primaryVal = {};
            var eventRecords = dataWrapper.getEventRecords();
            var primaryRecords = dataWrapper.getRecordId();

            if( null != primaryRecords ){
                primaryVal['label'] = dataWrapper.getPrimaryRecordsName();
                primaryVal['data'] = primaryRecords;
                primaryVal['parent'] = "Primary";
                primaryVal['parent_label'] = "Primary";
                panelData["primaryRecords"] = primaryVal;
            }

            if(null != eventRecords && eventRecords.length > 0) {
                fieldVals['label'] = "Event Name";
                fieldVals['data'] = eventRecords;
                fieldVals['parent'] = "Event Name";
                fieldVals['parent_label'] = "Label";
                panelData["eventName"] = fieldVals;
            }

            for (var form in sampleParam){
                var dataVals = _data.data[sampleParam[form]['formName']].fields[sampleParam[form]['variableName']].data;
                var dataLabels = [];
                var fieldType = _data.data[sampleParam[form]['formName']].fields[sampleParam[form]['variableName']].obj.field_type;
                var fieldLabel = _data.data[sampleParam[form]['formName']].fields[sampleParam[form]['variableName']].obj.field_label;
                var formName = _data.data[sampleParam[form]['formName']].label;
                var categories = {};
                fieldVals = {};

                if(fieldType == 'dropdown' || fieldType == 'radio'){
                    var choices = _data.data[sampleParam[form]['formName']].fields[sampleParam[form]['variableName']].obj.select_choices_or_calculations;

                    var choicelabels = choices.split('|');

                    for(var i = 0; i < choicelabels.length; i++){
                        var key = choicelabels[i].split(',')[0].trim();
                        var value = choicelabels[i].split(',')[1].trim();

                        categories[key] = value;
                    }

                    for(var j = 0; j < dataVals.length; j++){
                        if(dataVals[j] in categories)
                            dataLabels.push(categories[dataVals[j]]);
                        else
                            dataLabels.push('NULL');
                    }

                }
                else if(fieldType == 'text'){
                    dataLabels = _data.data[sampleParam[form]['formName']].fields[sampleParam[form]['variableName']].data;
                }

                fieldVals['label'] = fieldLabel;
                fieldVals['data'] = dataLabels;
                fieldVals['parent'] = sampleParam[form]['formName'];
                fieldVals['parent_label'] = _data.data[sampleParam[form]['formName']].label;

                panelData[sampleParam[form]['variableName']] = fieldVals;
            }

            return panelData;
        };

        /**
         * This function is used to initialize the data panel in the main page.
         * @param data filterData
         * @private
         */

        var _initPanel =  function(_data, _filterData){

            if (dataPanel) {
                dataPanel.innerHTML = "";
            }

            var dataLength = 0;
            var dataArr = [];

            var navDiv = document.querySelector("#pageNavPosition");
            //var navDiv = document.createElement("div");
            //navDiv.setAttribute("id", "pageNavPosition");

            var dataTable = document.createElement("TABLE");
            dataTable.setAttribute("id", "dataTable");
            dataTable.setAttribute("class", "table table-hover table-condensed");
            dataTable.setAttribute("style", "width 100%");

            /*var exportDiv = document.createElement("div");
            var exportLink = document.createElement("a");
            exportLink.setAttribute("type", "button");
            exportLink.setAttribute("class", "btn btn-sm btn-success");
            exportLink.setAttribute("id", "exportCSV");
            exportLink.setAttribute("onclick", "$('#dataTable').table2CSV()");

            exportLink.appendChild(document.createTextNode('Export CSV'));
            exportDiv.appendChild(exportLink);*/


            if(Object.keys(_data).length > 0){
                //Creating the header row
                var thead = document.createElement('THEAD');
                var hrow = document.createElement('TR');
                hrow.setAttribute("style","backgroud-color: white")
                for (var form in _data) {
                    if(_data.hasOwnProperty(form)){

                        var hcol = document.createElement('TH');

                        hcol.appendChild(document.createTextNode(_data[form].label));
                        dataLength = _data[form].data.length;
                        dataArr.push(_data[form].data);

                        hrow.appendChild(hcol);
                    }
                }

                thead.appendChild(hrow);
                dataTable.appendChild(thead);

                var tbody = document.createElement("TBODY");
                //Creating the table body.
                for(var j = 0; j<dataLength; j++){
                    if(_filterData != null)
                    if((_filterData[j] == true || _filterData[j] == 1)){
                        var tr = document.createElement('TR');

                        //for(var k = 0; k < _data.length; k++){
                        for(var k = 0; k < dataArr.length; k++){
                            var td = document.createElement('TD');

                            var cellVal = dataArr[k][j];
                            if(cellVal){
                                td.appendChild(document.createTextNode(cellVal));
                            }
                            else{
                                td.appendChild(document.createTextNode('\u00A0'));
                            }

                            tr.appendChild(td);
                        }
                        tbody.appendChild(tr);
                    }
                }
                dataTable.appendChild(tbody);

                if (bottomOprPanel) {
                    bottomOprPanel.appendChild(navDiv);
                }
                if (dataPanel) {
                    dataPanel.appendChild(dataTable);
                }

                //var pager = new Pager('dataTable', 15);

                pager.init();
                pager.showPageNav('pager', 'pageNavPosition');
                pager.showPage(1);
            }
            else{
                if (dataPanel) {
                    dataPanel.innerHTML = "";
                }
            }

            //$('#dataTable').paging({limit:5});

        };

        /**
         * This is a dummy function to update the data on filters
         * @param data
         */

        function _updatePanel(_data){

        }

        return {
            wrangleData: _wrangleData,
            initPanel: _initPanel
        }
    })
