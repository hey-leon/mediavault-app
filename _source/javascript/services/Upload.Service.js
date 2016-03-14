(function() {
  'use strict';

  angular
    .module('Mediavault')
    .service('Uploader', Uploader);

  Uploader.$inject = ['Vault'];

  function Uploader(Vault) {
    let service = this;

    /*  accessors  */
    service.add = add;


    /*  methods  */
    let queue = [],
        uploading = false;


    /**
     * add files to queue, start if not already started
     */
    function add(files) {
      Object.keys(files).forEach((file) => {
        queue.push(files[file])
      });

      if (!uploading) {
        uploading = true;
        upload()
      }

    }


    /**
     * manages selecting upload fn by mimeType of file from queue recursively
     * @async
     */
    function upload() {
      let file = queue[0];

      Vault.upload(file).then(() => {
        queue.splice(0, 1);
        if (queue.length > 0)
          upload();
        else
          uploading = false
      })
    }


  }

}());
