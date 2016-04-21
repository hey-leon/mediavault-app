(function () {
  'use strict'

  angular
    .module('Mediavault')
    .controller('AuthCtrl', AuthCtrl)

  AuthCtrl.$inject = ['$scope', 'GoogleAuth']

  function AuthCtrl ($scope, GoogleAuth) {
    var ctrl = this
    /*  bindings  */
    ctrl.signedIn = false

    /*  methods  */

    /**
     * user signed in
     */
    function onSignIn () {
      ctrl.signedIn = true
      updatebindings()
    }

    /**
     * user signed out
     */
    function onSignOut () {
      ctrl.signedIn = false
      updatebindings()
    }

    /**
     * apply scopes
     */
    function updatebindings () { if (!$scope.$$phase) $scope.$apply() }

    /*  init  */
    GoogleAuth.listen(onSignIn, onSignOut)
  }
}());
