/**
 * Created by sunny on 10/11/16.
 */
define(function(){
    var stateToBinDataMap = {};

    /**
     * this function will maintain the
     * state of the main panel in
     * the stateToDataMap
     * @param index
     * @param data
     * @private
     */
    var _pushState =  function(_index, _data,_param){
        //todo check with hasOwnProperty if similar
        //index appeard then throw error
        stateToBinDataMap[_index] = {
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
        return stateToBinDataMap[_index];
    }

    return {
        pushState: _pushState,
        get: _get
    }
})