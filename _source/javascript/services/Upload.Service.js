(function() {
  'use strict';

  angular
    .module('Mediavault')
    .service('Uploader', Uploader)


  Uploader.$inject = ['Vault']


  function Uploader(Vault){
    let service = this

    /*  accessors  */

    service.add = add




    /*  methods  */

    let queue = [],
        uploading = false


    /**
    * add files to queue, start if not already started
    */
    function add(files){
      Object.keys(files).forEach((file) => {
        queue.push(files[file])
      })

      if(!uploading) {
        uploading = true
        upload()
      }

    }


    /**
    * manages selecting upload fn by mimeType of file from queue recursively
    * @async
    */
    function upload(){
      let file = queue[0]

      Vault.upload(file).then(nextUpload)

      /* removes last upload from que, then continues upload if needed */
      function nextUpload(){
        queue.splice(0,1)
        if (queue.length > 0)
          upload()
        else
          uploading = false
      }

    }


    /**
    * uploads audio files with metadata scraped and stored in properties.meta
    * @async
    */
    function uploadAudio(file){
      return new Promise((resolve, reject) => {
        tagReader.read(file, {
          onSuccess: (tag) => {
            tag = tag.tags

            let thumb
            if( 'picture' in tag ) {
              thumb = new File(
                [new Uint8Array(tag.picture.data)],
                `${tag.title}.thumb.${tag.picture.format.replace('image/', '')}`,
                { lastModified: Date.now(), type: tag.picture.format }
              )
            }

            let metadata = {
              'name': file.name.trim() || 'untitled',
              'mimeType': file.type || 'audio/unknown',
              'audiometa': JSON.stringify({
                'title': tag.title,
                'album': tag.album,
                'artist': tag.artist
              })
            }

            Vault.upload(file, metadata, thumb).then(resolve)

          },
          onError: (error) => {
            console.log(error)
            uploadFile(blob)
          }
        })
      })
    }


    /**
    * uploads video files with frame captured for thumbnail. ### TODO - implement thumb scraper. ###
    *
    * @param {blob} file api object to extract info and upload.
    * @return {promise} a promise resolved when the upload has been complete
    *
    * @async
    */
    function uploadVideo(blob) {
      return new Promise((resolve, reject) => {

        let metadata = {
          'name': blob.name.trim()  || 'untitled',
          'mimeType': blob.type || 'video/unknown'
        }

        Vault.upload(blob, metadata).then(resolve)

      })
    }


    /**
    * uploads a file.
    * @async
    */
    function uploadFile(blob) {

    }


  }

}());
