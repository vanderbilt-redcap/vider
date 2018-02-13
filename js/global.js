/**
 * Created by sunny on 8/29/16.
 */
// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
define(["d3","d3-tip","colorbrewer"],function(d3,d3tip,colorbrewer) {


    /**
     * This class is responsible for the modifiying the intruments
     * on the ui
     * @type {null}
     */

    var instance = null;
    var tips = null;
    var pid = null;

    /**
     * 1. Check if instance is null then throw error
     * 2. Calls the load ui related to this class
     * @constructor
     */
    function Global() {
        var self = this;
        //if instance is not null then throw an error
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one DataWrapper, use DataWrapper.getInstance()");
        }
    }

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    /**
     * this function returns the instance of this
     * class if not created
     * @returns {*}
     */
    Global.getInstance = function () {
        // gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new Global();

            //get the site name
            instance.baseURL = window.location.href.split('?')[0]+"?pid="+getParameterByName("pid")+"&id="+getParameterByName("id")+"&page="+getParameterByName("page");

            //store the pid when system initialize
            instance.pid = getParameterByName("pid");

            //this will initialize the tips
            instance.tips = {

                colorByTip : d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-12, 0])
                    .html(function(d) {
                        var per = (d.count / d.total) * 100;
                        return "<strong>"
                            + d.value
                            + " : "
                            + d.count
                            + " ( "
                            + per.toFixed(2)
                            + "% )</strong>"; }),

                tip1 : d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-12, 0])
                    .html(function(d) {
                        return "<strong>"
                            + d.value
                            + ":</strong> <span style='color:white'>"
                            + d.originalCount; }),

                queryTip : d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-12, 0])
                    .html(function(d) {
                        var percentage = (d.queryCount / d.totalCount) * 100;
                        return "<strong>"
                            + d.value
                            + " : </strong>"
                            + d.queryCount
                            + " ( "
                            + percentage.toFixed(2)
                            + "% )</strong>";

                    }),

                textTip : d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-12, 0])
                    .html(function(d) {
                        return d.value;
                    }),

                numTextTip : d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-12, 0])
                    .html(function(d) {
                        return d;
                    }),

                filterTip: d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-12, 0])
                    .html(function(d) {
                        return Math.round(d.percent) + "%";
                    }),

                tip: d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-12, 0])
                    .html(function(d) {
                        return d;
                    })

            }
        }
        return instance;
    };

    /**
     *
     * @returns {*}
     */
    Global.prototype.getPID = function(){
        return instance.pid;
    }

    function extractDomain(url) {
        var domain;
        //find & remove protocol (http, ftp, etc.) and get domain
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        }
        else {
            domain = url.split('/')[0];
        }

        //find & remove port number
        //domain = domain.split(':')[0];

        return domain;
    }

    /**
     *
     * @param name
     * @param url
     * @returns {*}
     */
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;


        name = name.replace(/[\[\]]/g, "\\$;");
        var regex = new RegExp("[?;]" + name + "(=([^;#]*)|;|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }


    return Global.getInstance();
});

function getFormattedDate(unixTs, validation) {
    if (unixTs !== "") {
        var d = new Date(unixTs * 1000);
        var year = d.getFullYear();
        var month = ("0" + (d.getMonth() + 1)).substr(-2);
        var day = ("0" + (d.getDate())).substr(-2);

        var hours = ("0" + d.getHours()).substr(-2);
        var minutes = ("0" + d.getMinutes()).substr(-2);
        var seconds = ("0" + d.getSeconds()).substr(-2);

        if (validation == "date_ymd") {
            return year + "-" + month + "-" + day;
        }
        if (validation == "date_dmy") {
            return day + "-" + month + "-" + year;
        }
        if (validation == "date_mdy") {
            return month + "-" + day + "-" + year;
        }
        if (validation == "datetime_ymd") {
            return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_dmy") {
            return day + "-" + month + "-" + year + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_mdy") {
            return month + "-" + day + "-" + year + " " + hours + ":" + minutes;
        }
        if (validation == "datetime_seconds_ymd") {
            return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        }
        if (validation == "datetime_seconds_dmy") {
            return day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
        }
        if (validation == "datetime_seconds_mdy") {
            return month + "-" + day + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
        }
    }
    return "";
}


// must only be called for date information
function transformForDate(data, validation) {
    for (var i = 0; i < data.length; i++) {
        if (data[i] && isNaN(data[i])) {
            var dateAry = new Array(1970, 1, 1);
            var sections = data[i].split(/\s/);
            var dnodes = sections[0].split(/-/);
            var tnodes = new Array(0, 0, 0);
            if (sections.length >= 2) {
                var mytnodes = sections[1].split(/:/);
                if (mytnodes.length > 0) {
                    tnodes[0] = mytnodes[0];
                }
                if (mytnodes.length > 1) {
                    tnodes[1] = mytnodes[1];
                }
                if (mytnodes.length > 2) {
                    tnodes[2] = mytnodes[2];
                }
            }
            if (validation.match(/_ymd$/)) {
                dateAry = new Array(dnodes[0], dnodes[1], dnodes[2]);
            }
            else if (validation.match(/_mdy$/)) {
                dateAry = new Array(dnodes[2], dnodes[0], dnodes[1]);
            }
            else if (validation.match(/_dmy$/)) {
                dateAry = new Array(dnodes[2], dnodes[1], dnodes[0]);
            }
            var date = new Date(Date.UTC(dateAry[0], dateAry[1], dateAry[2], tnodes[0], tnodes[1], tnodes[2]));
            data[i] = date.getTime() / 1000;
        }
    }
    return data;
}

