
class WebcamHelper {
  constructor(cam_width=500, cam_height=500) {
    this.invalidateVideoSource();
    console.assert(navigator.webkitGetUserMedia || navigator.mozGetUserMedia)

    // create the video element
    var video   = document.createElement('video');
    video.autoplay  = true;
    video.playsinline = true;
    video.loop  = true;
    video.addEventListener("loadeddata", () => {
      this.resolveLoadedData();
    });

    // expose video as this.video
    this.video = video;

    navigator.getUserMedia  = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;

    const constraints = {
      video: { width: cam_width, height: cam_height },
    };

    if (navigator.getUserMedia) {
      navigator.getUserMedia(constraints, function(stream) {
         video.srcObject = stream;}, function(){});
    }
  }

  invalidateVideoSource() {
    this.videoLoadedData = new Promise((resolve, reject) => {
      this.resolveLoadedData = resolve;
      this.rejectLoadedData = reject;
    });
  }

  async ready() {
    await this.videoLoadedData;
  }

  destroy() {
    this.video.pause()
  }
}

export { WebcamHelper };

