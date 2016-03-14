(function() {
  'use strict';

  angular
    .module('Mediavault')
    .controller('VideoPlayer', VideoPlayer)


  VideoPlayer.$inject = ['$interval', 'File', 'Data']


  function VideoPlayer($interval, File, Data) {
    let ctrl = this

    /*  bindings */

    ctrl.open = false

    ctrl.controls = false


    ctrl.togglePlay = togglePlay

    ctrl.toggleSound = toggleSound

    ctrl.close = close


    ctrl.seekDrag = seekDrag

    ctrl.seekDragged = seekDragged


    ctrl.mouseMoved = mouseMoved

    ctrl.controlEnter = controlEnter

    ctrl.controlLeave = controlLeave


    ctrl.currentVideo = {}

    ctrl.currentDuration = 0

    ctrl.totalDuration = 0


    ctrl.playpauseSymbol = 'play_arrow'

    ctrl.muteSymbol = 'volume_up'




    /*  methods  */
    let user = {}

    let videoPlayer,
        videoStream,
        progressBar,
        progress

    let playing = false,
        seeking = false,
        volumeAdjust = false

    let controlHover = false,
        controlTimeShowing = 0


    $interval( () => {
      if (playing || seeking) updateProgressBar()
      if (ctrl.controls && !controlHover) controlsTimeout()
    }, 10)


    function togglePlay() {
      event.stopPropagation()
      if(videoStream.paused){
        videoStream.play()
        ctrl.playpauseSymbol = 'pause'
      }else{
        videoStream.pause()
        playing = false
        ctrl.playpauseSymbol = 'play_arrow'
      }
    }


    function toggleSound() {
      event.stopPropagation()
      if(videoStream.volume > 0){
        videoStream.volume = 0
        ctrl.muteSymbol = 'volume_mute'
      }else{
        videoStream.volume = 1
        ctrl.muteSymbol = 'volume_up'
      }
    }


    function seekDrag(){
      event.stopPropagation()
      seeking = true
      if (playing) audioStream.pause()
      seek()
    }


    function seekDragged(){
      event.stopPropagation()
      if (seeking) seeking = false
      if (playing) videoStream.play()
    }


    function controlsTimeout(){
      controlTimeShowing++
      if (controlTimeShowing == 300){
        controlTimeShowing = 0
        ctrl.controls = false
        videoPlayer.style.cursor = 'none'
      }
    }

    function mouseMoved(){
      if (seeking) seek()
      ctrl.controls = true
      videoPlayer.style.cursor = 'auto'
    }

    function controlEnter(){
      controlHover = true
      controlTimeShowing = 0
    }

    function controlLeave(){
      controlHover = false
    }


    function seek(){
      videoStream.currentTime = Math.round(event.pageX / progressBar.offsetWidth * videoStream.duration)
    }


    function updateProgressBar(){
      ctrl.currentDuration = videoStream.currentTime
      progress.style.width = ( progressBar.offsetWidth / videoStream.duration * videoStream.currentTime ) + 'px'
    }

    function play(file){
      videoStream.src = file.url + user.token
      ctrl.currentVideo = file
      ctrl.controls = true
      togglePlay()
    }


    function action(file, action){
      switch(action){
        case 'open':
          if(!ctrl.open) ctrl.open = true
          play(file)
          break
        case 'fullscreen':
          play(file)
          break
      }
    }


    function close(){
      ctrl.open = false
      videoStream.pause()
      playing = false
    }


    function videoStarted(){ playing = true }


    function trackMetaDataLoaded(){ ctrl.totalDuration = event.target.duration }


    function init(){
      videoPlayer = document.getElementById('videoPlayer')
      videoStream = document.getElementById('videoStream')
      progressBar = document.getElementById('videoProgressBar')
      progress = document.getElementById('videoProgress')

      videoStream.addEventListener('loadedmetadata', trackMetaDataLoaded)
      videoStream.addEventListener('playing', videoStarted)
      videoStream.addEventListener('ended', close)
    }

    function updateUser(){ user = Data.user.get() }



    /*  init  */

    init()

    File.listen('video', action, close)
    Data.user.listen(updateUser)

  }


}());
