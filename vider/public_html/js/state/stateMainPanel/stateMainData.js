/**
 * Created by sunny on 2/13/16.
 */
define(function(){
    var stateToDataMap = {};

    /**
     * this function will maintain the
     * state of the main panel in
     * the stateToDataMap
     * @param index
     * @param data
     * @param param - url parameters
     * @private
     */
    var _pushState =  function(_index, _data, _param){
        stateToDataMap[_index] = {
            data: _data,
            param: _param
        }
    }

    /**
     * this function will return the state
     * of the main panel
     * @param index
     * @returns {*}
     * @private
     */
    var _get = function(_index){
        return stateToDataMap[_index];
    }

    return {
        pushState: _pushState,
        get: _get
    }
})