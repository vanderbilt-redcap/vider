/**
 * Created by sunny on 10/11/16.
 */
define(["stateBinData"],function(stateBinData){

    //protected function

    /**
     * this will set the state of the data
     * accordingly
     * @param index
     * @param _data
     * @private
     */
    var _add =  function(_index,_data, _param){
        //modify the data and save the state
        //corresponding to the index

        //modify the data is required
        stateBinData.pushState(_index,_data,_param);
    }

    /**
     * this function will return the state of the object
     * @param index
     * @returns {*}
     */
    var _get = function(_index){

        //this will return the state
        return stateBinData.get(_index);
    }

    return {
        add: _add,
        get: _get
    }
})