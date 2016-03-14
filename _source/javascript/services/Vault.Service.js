(function() {
  'use strict';

  angular
    .module('Mediavault')
    .service('Vault', Vault);

  Vault.$inject = ['GoogleAuth'];

  function Vault(GoogleAuth){
    let service = this;

    /* Accessors */
    service.upload = upload;
    service.update = update;
    service.delete = deletefile;
    service.listen = listen;

    service.API = 'http://localhost:3000/api/file';


    /* Methods */
    let files = [],
        listeners = [],
        user;


    /*
     adds a file to the users account
    */
    function upload(file) {
      return new Promise((resolve) => {
        let data = new FormData();
            data.append('file', file);

        let filesReq = new XMLHttpRequest();

        filesReq.addEventListener('readystatechange', () => {
          if (filesReq.readyState === 4){
            console.log(JSON.parse(filesReq.responseText));
            resolve();
            syncVault()
          }
        });

        filesReq.withCredentials = true;
        filesReq.open('POST', service.API);
        filesReq.setRequestHeader('authorization', user.token);
        filesReq.send(data)

      })
    }


    /*
     updates a files meta
    */
    function update(id, data) {
      let body = new FormData();

      for(let name in data){ body.append(name, data[name]) }

      let filesReq = new XMLHttpRequest();

      filesReq.addEventListener("readystatechange", () => {
        if (filesReq.readyState === 4){
          console.log(JSON.parse(filesReq.responseText));
          syncVault()
        }
      });

      filesReq.withCredentials = true;
      filesReq.open('PATCH', `${service.API}/${id}`);
      filesReq.setRequestHeader('authorization', user.token);

      filesReq.send(body)
    }


    /*
     delete a users file from account
    */
    function deletefile(id) {
      let filesReq = new XMLHttpRequest();

      filesReq.addEventListener("readystatechange", () => {
        if (filesReq.readyState === 4){
          syncVault()
        }
      });

      filesReq.withCredentials = true;
      filesReq.open('Delete', `${service.API}/${id}`);
      filesReq.setRequestHeader('authorization', user.token);

      filesReq.send()
    }


    /*
     listen for changes to collection
    */
    function listen(CB) { if(typeof CB === 'function') listeners.push(CB) }


    /*
     listen for changes to collection
    */
    function broadcast() { listeners.forEach((CB) => { CB(user, files) }) }

    /*
     gets all users file meta data then broadcasts to listeners
     */
    function syncVault(){
      let filesReq = new XMLHttpRequest();

      filesReq.addEventListener("readystatechange", () => {
        if (filesReq.readyState === 4){
          files = JSON.parse(filesReq.responseText);
          broadcast()
        }
      });

      filesReq.withCredentials = true;
      filesReq.open('GET', service.API);
      filesReq.setRequestHeader('authorization', user.token);
      filesReq.send()
    }

    /*
     called on sign in. gets users details and starts vault sync
     */
    function onSignIn(newUser){
      user = newUser;
      syncVault()
    }

    /*
     called on sign out. empties user details and file metadata, then broadcasts to listeners
     */
    function onSignOut(){
      user = {};
      files.length = 0;
      broadcast()
    }


    /*  init  */
    GoogleAuth.listen(onSignIn, onSignOut)

  }

}());
