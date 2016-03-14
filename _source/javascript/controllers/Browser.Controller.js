(function() {
  'use strict';

  angular
    .module('Mediavault')
    .controller('BrowserController', BrowserController)


  BrowserController.$inject = [
                                '$scope',
                                '$filter',
                                '$mdSidenav',
                                'GoogleAuth',
                                'Vault',
                                'Data',
                                'File',
                                'Uploader'
                              ]


  function BrowserController($scope, $filter, $mdSidenav, GoogleAuth, Vault, Data, File, Uploader){
    let ctrl = this

    /*  bindings  */

    ctrl.toggleMenu = toggleMenu

    ctrl.signOut = GoogleAuth.signOut

    ctrl.upload = upload

    ctrl.action = action

    ctrl.noProp = noProp

    ctrl.download = download

    ctrl.delete = deletefile

    ctrl.navigateTo = navigateTo

    ctrl.filterImages = filterImages

    ctrl.tabs = [

      {title: 'home', content: 'browser/tabs/home.tpl.html'},
      {title: 'music', content: 'browser/tabs/audio.tpl.html'},
      {title: 'video', content: 'browser/tabs/video.tpl.html'},
      {title: 'images', content: 'browser/tabs/images.tpl.html'},
      {title: 'files', content: 'browser/tabs/files.tpl.html'}

    ]

    ctrl.currentTab = 1

    ctrl.showTabs = true

    ctrl.showInfo = false

    ctrl.showSettings = false

    ctrl.collection = { audio: [], video: [], images: [], files: [] }

    ctrl.user = {}

    /**************************************************************************/
    /*                          Browser Implementation                        */
    /**************************************************************************/

    let filter = { images: false }


    function toggleMenu() { event.stopPropagation(); $mdSidenav('menu').toggle() }

    function navigateTo(newTab){
      event.stopPropagation()
      ctrl.currentTab = newTab
      toggleMenu()
    }

    function upload(){
      event.stopPropagation()

      let fileBrowser = document.createElement('input')
          fileBrowser.setAttribute('type', 'file')
          fileBrowser.setAttribute('multiple', 'true')
          fileBrowser.addEventListener('change', () => Uploader.add(fileBrowser.files))
          fileBrowser.click()

    }

    function action(file, action){
      event.stopPropagation()
      File.execute(file, action)
    }

    function download(file){
      event.stopPropagation()
      let download = document.createElement('a')
          download.href = file.url + user.token
          download.setAttribute('download', file.title)
          download.setAttribute('type', file.mimetype)
          download.click()
    }

    function deletefile(file){ event.stopPropagation(); Vault.delete(file.id) }

    function filterImages(){
      filter.images = !filter.images
      Data.images.filter('orderBy', 'title', filter.images)
    }

    function noProp(){ event.stopPropagation() }

    function updateAudio(){ ctrl.collection.audio = Data.audio.get() }

    function updateVideo(){ ctrl.collection.video = Data.video.get() }

    function updateImages(){ ctrl.collection.images = Data.images.get() }

    function updateFiles(){ ctrl.collection.files = Data.files.get() }

    function updateUser(){ ctrl.user = Data.user.get() }


    /**************************************************************************/
    /*                               Browser Init                             */
    /**************************************************************************/


    Data.audio.listen(updateAudio)
    Data.video.listen(updateVideo)
    Data.images.listen(updateImages)
    Data.files.listen(updateFiles)
    Data.user.listen(updateUser)

  }

}());
