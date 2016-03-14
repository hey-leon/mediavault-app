(function() {
  'use strict';

  angular
    .module('Mediavault')
    .service('Data', Data)


  Data.$inject = ['$filter', 'Vault']


  function Data($filter, Vault) {
    let service = this


    /*  accessors  */

    service.audio = { listen: listenAudio, get: getAudio }

    service.video = { listen: listenVideo, get: getVideo }

    service.images = { listen: listenImages, get: getImages, filter: filterImages }

    service.files = { listen: listenFiles, get: getFiles }

    service.user = { listen: listenUser, get: getUser }




    /*  methods  */

    let data = { audio: [], video: [], images: [], files: [], user: {} },

        listeners = { audio: [], video: [], images: [], files: [], user: [] }



    /*  audio methods  */

    function listenAudio(CB) {
      if (typeof CB === 'function')
        listeners.audio.push(CB)
      if (data.audio.length > 0)
        CB()
    }

    function getAudio(CB) { return data.audio }



    /*  video methods  */

    function listenVideo(CB) {

      if (typeof CB === 'function') listeners.video.push(CB)

      if (data.video.length > 0) CB()

    }

    function getVideo(CB) {
      return data.video
    }



    /*  image methods  */

    function listenImages(CB) {

      if (typeof CB === 'function') listeners.images.push(CB)

      if (data.images.length > 0) CB()

    }

    function getImages(CB) {
      return data.images
    }

    function filterImages(filterType, expression, comparator) {
        data.images = $filter(filterType)(data.images, expression, comparator)
        broadcast([listeners.images])
    }


    /*  file methods  */

    function listenFiles(CB) {

      if (typeof CB === 'function') listeners.files.push(CB)

      if (data.files.length > 0) CB()

    }

    function getFiles(CB) {
      return data.files
    }



    /*  user methods  */

    function listenUser(CB) {

      if (typeof CB === 'function') listeners.user.push(CB)

      if (Object.keys(data.user).length > 0) CB()

    }

    function getUser(CB) {
      return data.user
    }



    /*  update methods  */

    function updateData(newUser, files) {

      for(let collection in data) data[collection].length = 0

      data.user = newUser

      for(let file of files){

      if (file.mimetype.search('audio') !== -1) addAudio(file)

      else if (file.mimetype.search('video') !== -1) addVideo(file)

      else if (file.mimetype.search('image') !== -1) addImage(file)

      else if (file.mimetype.search('application') !== -1) addFile(file)

      }

      broadcast([
        listeners.user,
        listeners.audio,
        listeners.video,
        listeners.images,
        listeners.files
      ])

      console.log(data)

    }

    function addAudio(blob) {
      let meta = ('meta' in blob)? JSON.parse(blob.meta) : {}

      let file = {
        'id': blob._id,
        'url': `http://localhost:3000/${blob.uri}?id_token=`,
        'mimetype': blob.mimetype,
        'title': meta.title || blob.name,
        'album': meta.album || 'unknown',
        'artist': meta.artist || 'unknown'
      }

      if ('thumburi' in blob)
        file.thumburl = `http://localhost:3000/${blob.thumburi}?id_token=${data.user.token}`
      else
        file.thumburl = './resources/images/album_bg.png'

      data.audio.push(file)
    }

    function addVideo(blob) {

      let thumburl
      if ('thumburi' in blob) {
        thumburl = `http://localhost:3000/${blob.thumburi}?id_token=${data.user.token}`
      }

      let file = {
        'id': blob._id,
        'url': `http://localhost:3000/${blob.uri}?id_token=`,
        'mimetype': blob.mimetype,
        'title': blob.name,
        'thumburl': thumburl
      }

      data.video.push(file)

    }

    function addImage(blob) {

      let thumburl
      if ('thumburi' in blob) {
        thumburl = `http://localhost:3000/${blob.thumburi}?id_token=${data.user.token}`
      }

      let file = {
        'id': blob._id,
        'url': `http://localhost:3000/${blob.uri}?id_token=`,
        'mimetype': blob.mimetype,
        'title': blob.name,
        'thumburl': thumburl
      }

      data.images.push(file)

    }

    function addFile(blob) {

      let thumburl
      if ('thumburi' in blob)
        thumburl = `http://localhost:3000/${blob.thumburi}?id_token=${data.user.token}`
      else
        thumburl = './resources/images/file_bg.png'

      let file = {
        'id': blob._id,
        'url': `http://localhost:3000/${blob.uri}?id_token=`,
        'mimetype': blob.mimetype,
        'title': blob.name,
        'thumburl': thumburl
      }

      data.files.push(file)

    }

    function broadcast(dataListeners) {
      for (let listeners of dataListeners) {
        for (let CB of listeners) CB()
      }
    }




    /*  init  */

    Vault.listen(updateData)

  }

}());
