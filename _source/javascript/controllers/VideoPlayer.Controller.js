(function() {
  'use strict';

  angular
    .module('Mediavault')
    .controller('VideoPlayer', VideoPlayer);

  VideoPlayer.$inject = ['$interval', 'File', 'Data'];

  function VideoPlayer($interval, File, Data) {
    let ctrl = this;

    /*  bindings */
    ctrl.open = false;
    ctrl.controls = false;

    ctrl.togglePlay = togglePlay;
    ctrl.toggleSound = toggleSound;
    ctrl.close = close;

    ctrl.seekDrag = seekDrag;
    ctrl.seekDragged = seekDragged;

    ctrl.mouseMoved = mouseMoved;
    ctrl.controlEnter = controlEnter;
    ctrl.controlLeave = controlLeave;

    ctrl.currentVideo = {};
    ctrl.currentDuration = 0;
    ctrl.totalDuration = 0;

    ctrl.playpauseSymbol = 'play_arrow';
    ctrl.muteSymbol = 'volume_up';


    /*  methods  */
    let user = {};

    let videoPlayer,
        videoStream,
        progressBar,
        progress;

    let playing       = false,
        seeking       = false;

    let controlHover        = false,
        controlTimeShowing  = 0;


    /*
     on 10ms interval manage controls' & progress bar state
     */
    $interval( () => {
      if (playing || seeking)
        updateProgressBar();
      if (ctrl.controls && !controlHover)
        controlsTimeout()
    }, 10);


    /*
     handles play and pause functionality
     */
    function togglePlay() {
      event.stopPropagation();
      if(videoStream.paused){
        videoStream.play();
        ctrl.playpauseSymbol = 'pause'
      }else{
        videoStream.pause();
        playing = false;
        ctrl.playpauseSymbol = 'play_arrow'
      }
    }


    /*
     handles sound toggling
     */
    function toggleSound() {
      event.stopPropagation();
      if(videoStream.volume > 0){
        videoStream.volume = 0;
        ctrl.muteSymbol = 'volume_mute'
      }else{
        videoStream.volume = 1;
        ctrl.muteSymbol = 'volume_up'
      }
    }


    /*
     hides controls when they have been showing or 3s and mouse has not moved.
     */
    function controlsTimeout(){
      controlTimeShowing++;
      if (controlTimeShowing == 300){
        controlTimeShowing = 0;
        ctrl.controls = false;
        videoPlayer.style.cursor = 'none'
      }
    }


    /*
     on mouse move, checks if user is seeking, and makes sure controls are visible
     */
    function mouseMoved(){
      if (seeking)
        seek();
      ctrl.controls = true;
      videoPlayer.style.cursor = 'auto'
    }


    /*
     resets the duration controls are visible, and pauses timer.
     */
    function controlEnter(){
      controlHover = true;
      controlTimeShowing = 0
    }


    /*
     restarts the control timeout timer
     */
    function controlLeave(){ controlHover = false }


    /*
     initiates seeking, if video is streaming, pauses stream.
     */
    function seekDrag(){
      event.stopPropagation();
      seeking = true;
      if (playing)
        videoStream.pause();

      seek()
    }


    /*
     finishes seeking, if video was streaming, starts stream (from new point)
     */
    function seekDragged(){
      event.stopPropagation();
      if (seeking)
        seeking = false;
      if (playing)
        videoStream.play()
    }


    /*
     computes where the scrubber represents in the duration of the video
     */
    function seek(){
      videoStream.currentTime = Math.round(event.pageX / progressBar.offsetWidth * videoStream.duration)
    }


    /*
     visually updates the scrubber/progressbar
     */
    function updateProgressBar(){
      ctrl.currentDuration = videoStream.currentTime;
      progress.style.width = ( progressBar.offsetWidth / videoStream.duration * videoStream.currentTime ) + 'px'
    }


    /*
     sets the source of the video streamer, and starts the stream
     */
    function play(file){
      videoStream.src = file.url + user.token;
      ctrl.currentVideo = file;
      ctrl.controls = true;
      togglePlay()
    }


    /*
     handles selecting the correct action for files that are sent to the audio player
     */
    function action(file, action){
      switch(action){
        case 'open':
          if(!ctrl.open) ctrl.open = true;
          play(file);
          break;
        case 'fullscreen':
          play(file);
          break
      }
    }


    /*
     closes the audio player
     */
    function close(){
      ctrl.open = false;
      videoStream.pause();
      playing = false
    }


    /*
     updates the track metadata
     */
    function trackMetaDataLoaded() { ctrl.totalDuration = event.target.duration }


    /*
     update the state of the player on stream start
     */
    function videoStarted() { playing = true }

    /*
     updates user metadata
     */
    function updateUser() { user = Data.user.get() }


    /*  init  */
    videoPlayer = document.getElementById('videoPlayer');
    videoStream = document.getElementById('videoStream');
    progressBar = document.getElementById('videoProgressBar');
    progress = document.getElementById('videoProgress');

    videoStream.addEventListener('loadedmetadata', trackMetaDataLoaded);
    videoStream.addEventListener('playing', videoStarted);
    videoStream.addEventListener('ended', close);

    File.listen('video', action, close);
    Data.user.listen(updateUser)

  }


}());
