(function() {
  'use strict';

  angular
    .module('Mediavault')
    .service('Uploader', Uploader);

  Uploader.$inject = ['$mdToast', 'Vault'];

  function Uploader($mdToast, Vault) {
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
        startUpload()
      }

    }

    /**
     * start upload toasts the user and then toasts on completion
     */
    function startUpload(){
      $mdToast.show({
        'templateUrl': 'toasts/uploading.tpl.html',
        'hideDelay': false
      }).then(() => {
        $mdToast.show({
          'templateUrl': 'toasts/upload-success.tpl.html'
        })
      });

      upload(() => { $mdToast.hide() })
    }


    /**
     * uploads files recursively from que
     * @async
     */
    function upload(CB) {
        let file = queue[0];

        Vault.upload(file).then(() => {
          queue.splice(0, 1);
          if (queue.length > 0) {
            upload(CB)
          } else {
            uploading = false;
            CB()
          }
        })
    }


  }

}());
