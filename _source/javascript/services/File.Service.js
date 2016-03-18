(function() {
  'use strict';

  angular
    .module('Mediavault')
    .service('File', File);

    function File(){
      var service = this;

      /* accessors */
      service.execute = execute;
      service.listen = listen;

      /* methods */
      var listeners = { audio: [], video: [], image: [] };

      /*
       this method is used to listen for file actions
       */
      function listen(mimeType, CB){
        switch(mimeType){
          case 'audio':
            if(CB !== undefined) listeners.audio.push(CB);
            break;
          case 'video':
            if(CB !== undefined) listeners.video.push(CB);
            break;
          case 'image':
            if(CB !== undefined) listeners.image.push(CB);
            break
        }
      }


      /*
       cb are called for file type; file & action is then passed to the listeners
       */
      function execute(file, action){
        if (file.mimetype.search('audio') != -1) listeners.audio.forEach((CB) => CB(file, action));
        else if (file.mimetype.search('video') != -1) listeners.video.forEach((CB) => CB(file, action));
        else if (file.mimetype.search('image') != -1) listeners.image.forEach((CB) => CB(file, action))
      }

    }

}());
