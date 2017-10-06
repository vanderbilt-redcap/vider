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
            instance.baseURL = window.location.href.split('?')[0];

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

            //get the site name
            //instance.baseURL = "http://"+ extractDomain(window.location.href) + "/redcap/plugins/vider/public_html";
        }
        return instance;
    };

    /**
     *
     * @returns {*}
     */
    Global.prototype.getPID = function(){
        console.log(instance.pid)
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



