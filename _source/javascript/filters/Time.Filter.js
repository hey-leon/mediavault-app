(function() {
  'use strict';

  angular
    .module('Mediavault')
    .filter('time', TimeFilter)

    function TimeFilter() {

      return function(seconds) {

        let HH = Math.floor(seconds / 3600)
        let MM = Math.floor(seconds / 60) % 60
        let SS = Math.floor(seconds % 60)

        return ((HH > 1 ? HH + ':' : '') + (MM < 10 ? '0' : '') + MM + ':' + (SS < 10 ? '0' : '') + SS)

      }
    }

}());
