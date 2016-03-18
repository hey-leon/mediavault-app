(function() {
  'use strict';

  angular
    .module('Mediavault')
    .controller('BrowserController', BrowserController);

  BrowserController.$inject = [
                                '$scope', '$filter', '$mdSidenav', '$mdToast',
                                'GoogleAuth', 'Vault', 'Data', 'File', 'Uploader'
                              ];

  function BrowserController($scope, $filter, $mdSidenav, $mdToast, GoogleAuth, Vault, Data, File, Uploader){
    let ctrl = this;

    /*  bindings  */
    ctrl.toggleMenu = toggleMenu;
    ctrl.signOut = GoogleAuth.signOut;

    ctrl.upload = upload;
    ctrl.action = action;
    ctrl.download = download;
    ctrl.delete = deletefile;

    ctrl.navigateTo = navigateTo;
    ctrl.filterImages = filterImages;
    ctrl.noProp = noProp;

    ctrl.tabs = [
      {title: 'home', content: 'tabs/home.tpl.html'},
      {title: 'music', content: 'tabs/audio.tpl.html'},
      {title: 'video', content: 'tabs/video.tpl.html'},
      {title: 'images', content: 'tabs/images.tpl.html'},
      {title: 'files', content: 'tabs/files.tpl.html'}
    ];

    ctrl.currentTab = 1;
    ctrl.showTabs = true;
    ctrl.showInfo = false;
    ctrl.showSettings = false;

    ctrl.collection = { audio: [], video: [], images: [], files: [] };
    ctrl.user = {};


    /*  methods  */
    let filter = { images: false };


    /*
     toggles if the menu is open (on sml screens)
     */
    function toggleMenu() {
      event.stopPropagation();
      $mdSidenav('menu').toggle()
    }


    /*
     changes the current tab of the browser
     */
    function navigateTo(newTab){
      event.stopPropagation();
      ctrl.currentTab = newTab;
      toggleMenu()
    }


    /*
     adds a file to the upload que in the uploader
     */
    function upload(){
      event.stopPropagation();

      let fileBrowser = document.createElement('input');
          fileBrowser.setAttribute('type', 'file');
          fileBrowser.setAttribute('multiple', 'true');
          fileBrowser.addEventListener('change', () => Uploader.add(fileBrowser.files));
          fileBrowser.click();

    }


    /*
     tells the file service that a file needs to be passed an actioned to a listener
     */
    function action(file, action){
      event.stopPropagation();
      File.execute(file, action)
    }


    /*
     starts the download of a file
     */
    function download(file){
      event.stopPropagation();
      let download = document.createElement('a');
          download.href = file.url + user.token;
          download.setAttribute('download', file.title);
          download.setAttribute('type', file.mimetype);
          download.click()
    }


    /*
     deletes a users file
     */
    function deletefile(file){
      event.stopPropagation();
      Vault.delete(file.id)
    }


    /*
     changes the current filter to the images tab
     */
    function filterImages(){
      filter.images = !filter.images;
      Data.images.filter('orderBy', 'title', filter.images)
    }


    /*
     stops event propogation
     */
    function noProp(){ event.stopPropagation() }


    /*
     updates the audio collection
     */
    function updateAudio(){ ctrl.collection.audio = Data.audio.get() }


    /*
     updates the video collection
     */
    function updateVideo(){ ctrl.collection.video = Data.video.get() }


    /*
     updates the image collection
     */
    function updateImages(){ ctrl.collection.images = Data.images.get() }


    /*
     updates the misc file collection
     */
    function updateFiles(){ ctrl.collection.files = Data.files.get() }


    /*
     updates the user details
     */
    function updateUser(){ ctrl.user = Data.user.get() }


    /*  Init  */
    Data.audio.listen(updateAudio);
    Data.video.listen(updateVideo);
    Data.images.listen(updateImages);
    Data.files.listen(updateFiles);
    Data.user.listen(updateUser)

  }

}());
