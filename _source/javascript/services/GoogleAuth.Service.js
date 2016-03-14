/**
 * @name GoogleAuth.Service
 * @desc ###TODO###
 *
 * @author Leon Pearce
 */
(function() {

  'use strict';

  angular
    .module('Mediavault')
    .service('GoogleAuth', GoogleAuth)


  function GoogleAuth() {
    let service = this


    /*  accessors  */

    service.listen = listen

    service.signInBtn = signInBtn

    service.signOut = signOut




    /*  methods  */

    const CLIENT_ID = '458427276391-0dtgnnbr7nukg6gvn91vqcmfumhvfcob.apps.googleusercontent.com'

    const SCOPES = 'email profile'

    let client,
        user

    let signedIn = false

    let onSignIn = [],
        onSignOut = []


    /**
     * assigns listener cb's for sign in and sign out events
     */
    function listen(signInCB, signOutCB){

      if(typeof signInCB === 'function') {

        onSignIn.push(signInCB)

        if (signedIn) signInCB()

      }

      if(typeof signOutCB === 'function') {

        onSignOut.push(signOutCB)

        if (!signedIn) signOutCB()

      }

    }


    /**
     * assigns the api's sign in method to the given element
     */
    function signInBtn(id) {
      gapi.signin2.render(id, {
      'scope': SCOPES,
      'width': '192',
      'longtitle': true,
      'theme': 'dark'
      })
    }


    /**
     * assigns the api's sign out method to the given element
     */
    function signOut() {   client.signOut() }


    /**
     * listens for sign out
     */
    function sessionStateChanged(sessionState) {

      signedIn = sessionState

      if (!signedIn) { user = {}; broadcast(onSignOut); console.log('signed out') }

    }


    /**
     * listens for sign in
     */
    function userChanged(newUser) {
      if(newUser.hg){
        user = {
          name: newUser.wc.wc,
          email: newUser.wc.hg,
          image: newUser.wc.Ph,
          token: newUser.hg.id_token
        }

        broadcast(onSignIn)

      }
    }


    /**
     * broadcast to listeners
     */
    function broadcast(listeners){
      for(let CB of listeners) CB(user)
    }


    /*  init  */

    gapi.load('auth2', () => {

      client = gapi.auth2.init({ client_id: CLIENT_ID, scope: SCOPES })

      client.isSignedIn.listen(sessionStateChanged)

      client.currentUser.listen(userChanged)

      signInBtn('gSignIn')

    })


  }

}());
