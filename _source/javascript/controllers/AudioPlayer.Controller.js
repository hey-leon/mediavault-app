( function () {
  'use strict';

  angular
    .module ('Mediavault')
    .controller ('AudioPlayer', AudioPlayer)


  AudioPlayer.$inject = ['$interval', 'File', 'Data']


  function AudioPlayer ($interval, File, Data) {
    let ctrl = this

    /**************************************************************************/
    /*                           AudioPlayer Bindings                         */
    /**************************************************************************/

    ctrl.open = false

    ctrl.fullPlayer = false

    ctrl.toggleFullPlayer = toggleFullPlayer


    ctrl.togglePlay = togglePlay

    ctrl.toggleRepeat = toggleRepeat

    ctrl.toggleShuffle = toggleShuffle

    ctrl.skipForward = skipForward

    ctrl.skipBackward = skipBackward


    ctrl.seekDrag = seekDrag

    ctrl.seekDragging = seekDragging

    ctrl.seekDragged = seekDragged


    ctrl.queue = []

    ctrl.index = 0

    ctrl.track = {}

    ctrl.thumbnail = ''

    ctrl.currentDuration = 0

    ctrl.totalDuration = 0

    ctrl.repeat = false

    ctrl.shuffle = false


    ctrl.playpauseSymbol = 'play_arrow'

    ctrl.repeatClass = 'md-dark md-inactive'

    ctrl.shuffleClass = 'md-dark md-inactive'


    /**************************************************************************/
    /*                        AudioPlayer Implementation                      */
    /**************************************************************************/
    let user = {}

    let audioPlayer,
        audioStream,
        progressBar,
        progress

    let playing = false,
        seeking = false


    $interval( () => { if(playing || seeking) updateProgressBar() }, 10)


    function toggleFullPlayer() {
      event.stopPropagation()
      ctrl.fullPlayer = !ctrl.fullPlayer
      audioPlayer.style.height = (ctrl.fullPlayer)? '100%' : 'auto'
    }


    function togglePlay() {
      event.stopPropagation()
      if(!playing || audioStream.paused){
        audioStream.play()
        ctrl.playpauseSymbol = 'pause'
      }else{
        audioStream.pause()
        playing = false
        ctrl.playpauseSymbol = 'play_arrow'
      }
    }


    function toggleRepeat() {
      event.stopPropagation()
      ctrl.repeat = !ctrl.repeat
      ctrl.repeatClass = (ctrl.repeatClass === 'md-dark md-inactive')? 'md-primary' : 'md-dark md-inactive'
    }


    function toggleShuffle() {
      event.stopPropagation()
      console.log('shuffle not yet implemented');
      ctrl.shuffle = !ctrl.shuffle
      ctrl.shuffleClass = (ctrl.shuffleClass === 'md-dark md-inactive')? 'md-primary' : 'md-dark md-inactive'
    }


    function skipForward() {
      event.stopPropagation()
      if (++ctrl.index === ctrl.queue.length){
        if(ctrl.repeat){
          ctrl.index = 0
          resetSource(ctrl.index)
        } else { close() }

      } else { resetSource(ctrl.index) }

    }


    function skipBackward() {
      event.stopPropagation()
      ctrl.index = (ctrl.index === 0) ? 0 : ctrl.index - 1
      resetSource(ctrl.index)
    }


    function seekDrag(){
      event.stopPropagation()
      seeking = true
      if (playing) audioStream.pause()
      seek()
    }


    function seekDragging(){
      event.stopPropagation()
      if (seeking) seek()
    }


    function seekDragged(){
      event.stopPropagation()
      if (seeking) seeking = false
      if (playing) audioStream.play()
    }


    function seek(){
      audioStream.currentTime = Math.round(event.pageX / progressBar.offsetWidth * audioStream.duration)
    }


    function resetSource(index){
      ctrl.index = index
      ctrl.track = ctrl.queue[index]
      audioStream.src = ctrl.track.url + user.token
      ctrl.currentDuration = 0
      ctrl.totalDuration = 0
      updateProgressBar()
      if (playing) audioStream.play()
    }


    function updateProgressBar(){
      ctrl.currentDuration = audioStream.currentTime
      progress.style.width = ( progressBar.offsetWidth / audioStream.duration * audioStream.currentTime ) + 'px'
    }


    function playFile(file){
      playing = false

      if (ctrl.queue.length === 0)
      { ctrl.queue.push(file) }
      else
      { ctrl.queue.splice(++ctrl.index, 0, file) }

      resetSource(ctrl.index)
      togglePlay()
    }


    function queFile(file){
      ctrl.queue.push(file)
      if(ctrl.queue.length == 1){
        resetSource(ctrl.index)
        togglePlay()
        ctrl.open = true
      }
    }


    function action(file, action){
      switch(action){
        case 'open':
          playFile(file)
          ctrl.open = true
          break
        case 'queue':
          queFile(file)
          ctrl.open = true
          break
      }
    }


    function close(){
      console.log('closed audio player')
      ctrl.open = false
      audioStream.pause()
      playing = false
      ctrl.queue.length = 0
      ctrl.index = 0
    }


    function trackStarted(){ playing = true }


    function trackEnded(){ skipForward() }


    function trackMetaDataLoaded(){ ctrl.totalDuration = event.target.duration }


    function init(){
      audioPlayer = document.getElementById('audio-player')
      audioStream = document.getElementById('audioStream')

      progressBar = document.getElementById('audioProgressBar')
      progress = document.getElementById('audioProgress')

      audioStream.addEventListener('loadedmetadata', trackMetaDataLoaded)
      audioStream.addEventListener('playing', trackStarted)
      audioStream.addEventListener('ended', trackEnded)
    }

    function updateUser(){ user = Data.user.get() }


    /**************************************************************************/
    /*                            Audio Player Init                           */
    /**************************************************************************/


    init()

    File.listen('audio', action, close)

    Data.user.listen(updateUser)


  }

}());
