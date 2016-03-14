(function() {
  'use strict';

  angular
    .module('Mediavault')
    .controller('ImageViewer', ImageViewer)


  ImageViewer.$inject = ['$interval', 'Vault', 'File', 'Data']


  function ImageViewer($interval, Vault, File, Data){
    var ctrl = this


    /*  bindings  */

    ctrl.open = false

    ctrl.controls = false

    ctrl.next = next

    ctrl.download = download

    ctrl.delete = deletefile

    ctrl.last = last

    ctrl.close = close

    ctrl.mouseMoved = mouseMoved

    ctrl.controlEnter = controlEnter

    ctrl.controlLeave = controlLeave

    ctrl.image = ''

    ctrl.title = ''




    /*  methods  */
    let user = {},
        queue = [],
        index = 0

    let imageViewer

    let controlHover = false,
        controlTimeShowing = 0


    $interval( () => { if (ctrl.controls && !controlHover) controlsTimeout() }, 10)


    function next(){
      index++
      index = (index === queue.length)? 0 : index
      resetSource()
    }

    function download(){
      event.stopPropagation()
      console.log(index)
      let download = document.createElement('a')
          download.href = queue[index].url + user.token
          download.setAttribute('download', queue[index].title)
          download.setAttribute('type', queue[index].mimetype)
          download.click()
    }

    function deletefile(){
      event.stopPropagation()
      Vault.delete(queue[index].id)
    }


    function last(){
      index--
      index = (index < 0)? queue.length - 1 : index
      resetSource()
    }


    function mouseMoved(){
      ctrl.controls = true
      imageViewer.style.cursor = 'auto'
    }


    function controlEnter(){
      controlHover = true
      controlTimeShowing = 0
    }


    function controlLeave(){
      controlHover = false
    }


    function controlsTimeout(){
      controlTimeShowing++
      if (controlTimeShowing == 300){
        controlTimeShowing = 0
        ctrl.controls = false
        imageViewer.style.cursor = 'none'
      }
    }

    function resetSource(){
      ctrl.image = queue[index].url + user.token
      ctrl.title = queue[index].title
    }


    function open(file){
      index = queue.indexOf(file)
      resetSource()
      ctrl.controls = true
    }


    function action(file, action){
      ctrl.open = true
      switch (action) {
        case 'open':
          open(file)
          break
      }
    }


    function close(){ ctrl.open = false }


    function init(){ imageViewer = document.getElementById('imageViewer') }

    function updateUser(){ user = Data.user.get() }
    function updateImages(){ queue = Data.images.get() }


    /*  init  */

    Data.user.listen(updateUser)
    Data.images.listen(updateImages)

    File.listen('image', action, close)

    init()


  }

}());
