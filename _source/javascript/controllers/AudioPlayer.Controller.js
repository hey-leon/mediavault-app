( function () {
  'use strict';

  angular
    .module ('Mediavault')
    .controller ('AudioPlayer', AudioPlayer);

  AudioPlayer.$inject = ['$interval', 'File', 'Data'];

  function AudioPlayer ($interval, File, Data) {
    let ctrl = this;


    /*  Bindings  */
    ctrl.open = false;
    ctrl.fullPlayer = false;
    ctrl.toggleFullPlayer = toggleFullPlayer;

    ctrl.togglePlay = togglePlay;
    ctrl.toggleRepeat = toggleRepeat;
    ctrl.toggleShuffle = toggleShuffle;
    ctrl.skipForward = skipForward;
    ctrl.skipBackward = skipBackward;

    ctrl.seekDrag = seekDrag;
    ctrl.seekDragging = seekDragging;
    ctrl.seekDragged = seekDragged;

    ctrl.queue = [];
    ctrl.index = 0;
    ctrl.track = {};
    ctrl.thumbnail = '';
    ctrl.currentDuration = 0;
    ctrl.totalDuration = 0;
    ctrl.repeat = false;
    ctrl.shuffle = false;

    ctrl.playpauseSymbol = 'play_arrow';
    ctrl.repeatClass = 'md-dark md-inactive';
    ctrl.shuffleClass = 'md-dark md-inactive';


    /*  methods  */
    let user = {};

    let audioPlayer,
        audioStream,
        progressBar,
        progress;

    let playing = false,
        seeking = false;


    /*
     if playing pdate the progress bar (every 10ms)
     */
    $interval( () => { if(playing || seeking) updateProgressBar() }, 10);


    /*
     toggles the audio player between fullscreen and mini
     */
    function toggleFullPlayer() {
      event.stopPropagation();
      ctrl.fullPlayer = !ctrl.fullPlayer;
      audioPlayer.style.height = (ctrl.fullPlayer)? '100%' : 'auto'
    }


    /*
     toggles the audio stream
     */
    function togglePlay() {
      event.stopPropagation();
      if(!playing || audioStream.paused){
        audioStream.play();
        ctrl.playpauseSymbol = 'pause'
      }else{
        audioStream.pause();
        playing = false;
        ctrl.playpauseSymbol = 'play_arrow'
      }
    }


    /*
     toggles whether to keep cycling the playlist
     */
    function toggleRepeat() {
      event.stopPropagation();
      ctrl.repeat = !ctrl.repeat;
      ctrl.repeatClass = (ctrl.repeatClass === 'md-dark md-inactive')? 'md-primary' : 'md-dark md-inactive'
    }


    /*
     toggles whether to play in shuffle mode or in order
     */
    function toggleShuffle() {
      event.stopPropagation();
      console.log('shuffle not yet implemented');
      ctrl.shuffle = !ctrl.shuffle;
      ctrl.shuffleClass = (ctrl.shuffleClass === 'md-dark md-inactive')? 'md-primary' : 'md-dark md-inactive'
    }


    /*
     skip to next track in playlist
     */
    function skipForward() {
      event.stopPropagation();
      if (++ctrl.index === ctrl.queue.length){
        if(ctrl.repeat){
          ctrl.index = 0;
          resetSource(ctrl.index)
        } else
          close()
      } else
        resetSource(ctrl.index)
    }


    /*
     skip to previous track in playlist. does not skip back past track[0]
     */
    function skipBackward() {
      event.stopPropagation();
      ctrl.index = (ctrl.index === 0) ? 0 : ctrl.index - 1;
      resetSource(ctrl.index)
    }


    /*
     start seeking new spot in the stream. pause if playing.
     */
    function seekDrag(){
      event.stopPropagation();
      seeking = true;
      if (playing)
        audioStream.pause();
      seek()
    }


    /*
     keep seeking new spot in stream
     */
    function seekDragging(){
      event.stopPropagation();
      if (seeking) seek()
    }


    /*
     finish seeking new spot in stream. keep playing if was playing.
     */
    function seekDragged(){
      event.stopPropagation();
      if (seeking)
        seeking = false;
      if (playing)
        audioStream.play()
    }


    /*
     computes where the place in stream based on the scrubber position
     */
    function seek(){
      audioStream.currentTime = Math.round(event.pageX / progressBar.offsetWidth * audioStream.duration)
    }


    /*
     resets the source of the audio player
     */
    function resetSource(index){
      ctrl.index = index;
      ctrl.track = ctrl.queue[index];
      audioStream.src = ctrl.track.url + user.token;
      ctrl.currentDuration = 0;
      ctrl.totalDuration = 0;
      updateProgressBar();
      if (playing) audioStream.play()
    }


    /*
    updates the progressbar/scrubber according to current duration played
     */
    function updateProgressBar(){
      ctrl.currentDuration = audioStream.currentTime;
      progress.style.width = ( progressBar.offsetWidth / audioStream.duration * audioStream.currentTime ) + 'px'
    }


    /*
     starts playing a track.
     */
    function playFile(file){
      playing = false;

      if (ctrl.queue.length === 0)
      { ctrl.queue.push(file) }
      else
      { ctrl.queue.splice(++ctrl.index, 0, file) }

      resetSource(ctrl.index);
      togglePlay()
    }


    /*
     adds a song to the current playlist. at the bottom...
     */
    function queFile(file){
      ctrl.queue.push(file);
      if(ctrl.queue.length == 1){
        resetSource(ctrl.index);
        togglePlay();
        ctrl.open = true
      }
    }


    /*
     handles selecting the correct action for a file passed to the audio player
     */
    function action(file, action){
      switch(action){
        case 'open':
          playFile(file);
          ctrl.open = true;
          break;
        case 'queue':
          queFile(file);
          ctrl.open = true;
          break
      }
    }


    /*
     close the audio player
     */
    function close(){
      console.log('closed audio player');
      ctrl.open = false;
      audioStream.pause();
      playing = false;
      ctrl.queue.length = 0;
      ctrl.index = 0
    }


    /*
     updates the player state when stream starts
     */
    function trackStarted(){ playing = true }


    /*
    updates player state on stream end
     */
    function trackEnded(){ skipForward() }


    /*
    updates the stream meta data on load
     */
    function trackMetaDataLoaded(){ ctrl.totalDuration = event.target.duration }


    /*
     updates user details
     */
    function updateUser(){ user = Data.user.get() }


    /*  Init  */
    audioPlayer = document.getElementById('audio-player');
    audioStream = document.getElementById('audioStream');
    progressBar = document.getElementById('audioProgressBar');
    progress = document.getElementById('audioProgress');

    audioStream.addEventListener('loadedmetadata', trackMetaDataLoaded);
    audioStream.addEventListener('playing', trackStarted);
    audioStream.addEventListener('ended', trackEnded);

    File.listen('audio', action, close);

    Data.user.listen(updateUser)
  }

}());
