(function() {
  'use strict';

  angular
    .module('Mediavault')
    .service('Data', Data);

  Data.$inject = ['$filter', 'Vault'];

  function Data($filter, Vault) {
    let service = this;

    /*  accessors  */
    service.audio = { listen: listenAudio, get: getAudio };
    service.video = { listen: listenVideo, get: getVideo };
    service.images = { listen: listenImages, get: getImages, filter: filterImages };
    service.files = { listen: listenFiles, get: getFiles };
    service.user = { listen: listenUser, get: getUser };


    /*  methods  */
    let data = { audio: [], video: [], images: [], files: [], user: {} },
        listeners = { audio: [], video: [], images: [], files: [], user: [] };


    /*
     audio methods
    */
    function listenAudio(CB) {
      if (typeof CB === 'function')
        listeners.audio.push(CB);
      if (data.audio.length > 0)
        CB()
    }
    function getAudio(CB) { return data.audio }


    /*
     video methods
    */
    function listenVideo(CB) {
      if (typeof CB === 'function')
        listeners.video.push(CB);
      if (data.video.length > 0)
        CB()
    }
    function getVideo(CB) { return data.video }


    /*
     image methods
    */
    function listenImages(CB) {
      if (typeof CB === 'function')
        listeners.images.push(CB);
      if (data.images.length > 0)
        CB()
    }
    function getImages(CB) { return data.images }
    function filterImages(filterType, expression, comparator) {
        data.images = $filter(filterType)(data.images, expression, comparator);
        broadcast([listeners.images])
    }


    /*
     file methods
    */
    function listenFiles(CB) {
      if (typeof CB === 'function')
        listeners.files.push(CB);
      if (data.files.length > 0)
        CB()
    }
    function getFiles(CB) { return data.files }


    /*
     user methods
    */
    function listenUser(CB) {
      if (typeof CB === 'function')
        listeners.user.push(CB)
      if (Object.keys(data.user).length > 0)
        CB()
    }
    function getUser(CB) { return data.user }


    /*
     updates the users collections, then broadcasts to 'all' listeners
     */
    function updateData(newUser, files) {
      for(let collection in data)
        data[collection].length = 0

      data.user = newUser

      for(let file of files){
        if (file.mimetype.search('audio') !== -1)
          addAudio(file);
        else if (file.mimetype.search('video') !== -1)
          addVideo(file);
        else if (file.mimetype.search('image') !== -1)
          addImage(file);
        else if (file.mimetype.search('application') !== -1)
          addFile(file);
      }

      broadcast([
        listeners.user, listeners.audio, listeners.video,
        listeners.images, listeners.files
      ]);

      console.log(data)
    }


    /*
     adds a misc file to the 'audio' collection
     */
    function addAudio(blob) {
      let meta = ('meta' in blob)? JSON.parse(blob.meta) : {};

      let file = {
        'id': blob._id,
        'url': `http://localhost:3000/${blob.uri}?id_token=`,
        'mimetype': blob.mimetype,
        'title': meta.title || blob.name,
        'album': meta.album || 'unknown',
        'artist': meta.artist || 'unknown'
      };

      if ('thumburi' in blob)
        file.thumburl = `http://localhost:3000/${blob.thumburi}?id_token=${data.user.token}`;
      else
        file.thumburl = './resources/images/album_bg.png';

      data.audio.push(file)
    }


    /*
     adds a misc file to the 'video' collection
     */
    function addVideo(blob) {
      let file = {
        'id': blob._id,
        'url': `http://localhost:3000/${blob.uri}?id_token=`,
        'mimetype': blob.mimetype,
        'title': blob.name
      };

      if ('thumburi' in blob)
        file.thumburl = `http://localhost:3000/${blob.thumburi}?id_token=${data.user.token}`;

      data.video.push(file)
    }


    /*
     adds a misc file to the 'image' collection
     */
    function addImage(blob) {
      let file = {
        'id': blob._id,
        'url': `http://localhost:3000/${blob.uri}?id_token=`,
        'mimetype': blob.mimetype,
        'title': blob.name
      };

      if ('thumburi' in blob)
        file.thumburl = `http://localhost:3000/${blob.thumburi}?id_token=${data.user.token}`;

      data.images.push(file)
    }


    /*
    adds a misc file to the 'file' collection
     */
    function addFile(blob) {
      let file = {
        'id': blob._id,
        'url': `http://localhost:3000/${blob.uri}?id_token=`,
        'mimetype': blob.mimetype,
        'title': blob.name
      };

      if ('thumburi' in blob)
        file.thumburl = `http://localhost:3000/${blob.thumburi}?id_token=${data.user.token}`;
      else
        file.thumburl = './resources/images/file_bg.png';

      data.files.push(file)
    }


    /*
     broadcast file changes to the collections listeners
     */
    function broadcast(dataListeners) {
      for (let listeners of dataListeners) {
        for (let CB of listeners) CB()
      }
    }


    /*  init  */
    Vault.listen(updateData)

  }

}());
