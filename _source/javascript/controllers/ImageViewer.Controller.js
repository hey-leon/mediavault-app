(function() {
  'use strict';

  angular
    .module('Mediavault')
    .controller('ImageViewer', ImageViewer);

  ImageViewer.$inject = ['$interval', 'Vault', 'File', 'Data'];

  function ImageViewer($interval, Vault, File, Data){
    var ctrl = this;

    /*  bindings  */
    ctrl.open = false;
    ctrl.controls = false;

    ctrl.next       = next;
    ctrl.download   = download;
    ctrl.delete     = deletefile;
    ctrl.last       = last;
    ctrl.close      = close;

    ctrl.mouseMoved   = mouseMoved;
    ctrl.controlEnter = controlEnter;
    ctrl.controlLeave = controlLeave;

    ctrl.image = '';
    ctrl.title = '';


    /*  methods  */
    let user  = {},
        queue = [],
        index = 0;

    let imageViewer;

    let controlHover        = false,
        controlTimeShowing  = 0;


    /*
     on 10ms interval manage controls' state
     */
    $interval( () => {
      if (ctrl.controls && !controlHover)
        controlsTimeout()
    }, 10);


    /*
     displays the next image in the collection
     */
    function next(){
      index++;
      index = (index === queue.length)? 0 : index;
      resetSource()
    }


    /*
     downloads the current image displaying from the collection
     */
    function download(){
      event.stopPropagation();
      console.log(index);
      let download = document.createElement('a');
          download.href = queue[index].url + user.token;
          download.setAttribute('download', queue[index].title);
          download.setAttribute('type', queue[index].mimetype);
          download.click()
    }

    /*
     deletes the current displaying image from the collection
     */
    function deletefile(){
      event.stopPropagation();
      Vault.delete(queue[index].id)
    }


    /*
     displays the previous image in the collection
     */
    function last(){
      index--;
      index = (index < 0)? queue.length - 1 : index;
      resetSource()
    }


    /*
     makes controls visible
     */
    function mouseMoved(){
      ctrl.controls = true;
      imageViewer.style.cursor = 'auto'
    }


    /*
     resets control timeout & and pauses timer
     */
    function controlEnter(){
      controlHover = true;
      controlTimeShowing = 0
    }


    /*
     restarts control timeout timer
     */
    function controlLeave(){
      controlHover = false
    }


    /*
     if the controls have been visible for 3s the controls will be hidden
     */
    function controlsTimeout(){
      controlTimeShowing++;
      if (controlTimeShowing == 300){
        controlTimeShowing = 0;
        ctrl.controls = false;
        imageViewer.style.cursor = 'none'
      }
    }

    /*
     changes the current source of the image viewer
     */
    function resetSource(){
      ctrl.image = queue[index].url + user.token;
      ctrl.title = queue[index].title
    }


    /*
     handles opening a new file passed to the viewer
     */
    function open(file){
      index = queue.indexOf(file);
      resetSource();
      ctrl.controls = true
    }


    /*
     handles selecting the correct action for the file handed to the image viewer
     */
    function action(file, action){
      ctrl.open = true;
      switch (action) {
        case 'open':
          open(file);
          break
      }
    }


    /*
     closes the image viewer
     */
    function close(){ ctrl.open = false }


    /*
     updates user data
     */
    function updateUser(){ user = Data.user.get() }


    /*
     updates image viewers collection
     */
    function updateImages(){ queue = Data.images.get() }


    /*  init  */
    imageViewer = document.getElementById('imageViewer');

    Data.user.listen(updateUser);
    Data.images.listen(updateImages);

    File.listen('image', action, close);

  }

}());
