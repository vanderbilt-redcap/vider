/**
 * Created by sunny on 10/10/16.
 */
define(["stateScatterData"],function(stateScatterData){

    //here goes the private variable
    //if required

    //protected function

    /**
     * this will set the state of the data
     * accordingly
     * @param index
     * @param _data
     * @private
     */
    var _add =  function(_index,_data,_param){
        //todo this functino will modify the data
        //and save the state corresponding to the index

        //modify the data is required
        stateScatterData.pushState(_index,_data,_param);
    }

    /**
     * this function will return the state of the object
     * @param index
     * @returns {*}
     */
    var _get = function(_index){

        return stateScatterData.get(_index);
    }

    return {
        add: _add,
        get: _get
    }
})