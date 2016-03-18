(function() {
  'use strict';

  angular
    .module('templates', []);

  angular
    .module('Mediavault', ['templates', 'ngMaterial'])

    .config(($mdThemingProvider) => {
      $mdThemingProvider.theme('default')
      .primaryPalette('deep-orange', {
        'hue-1': '50'
      })
      .accentPalette('green')
    })

}());
