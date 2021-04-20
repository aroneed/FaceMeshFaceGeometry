import {
  WebGLRenderer,
  PCFSoftShadowMap,
  sRGBEncoding,
  Scene,
  SpotLight,
  PerspectiveCamera,
  HemisphereLight,
  AmbientLight,
  IcosahedronGeometry,
  OrthographicCamera,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  MeshStandardMaterial,
  Texture, 
  MeshLambertMaterial,
  PlaneGeometry,
  VideoTexture,
  LinearFilter,
  LinearEncoding,
} from "../third_party/three.module.js";
import { FaceMeshFaceGeometry } from "./face.js";

class MaskHelper {
  // WebGL env
  renderer;
  scene;
  camera;
  
  // Screen and objects size & scale
  width = 0;
  height = 0;
  curScale = 20;
  curArea = 0;
  
  // Textures & Objects
  videoTexture;  // Texture for webcam 
  mask;
  nose;  
  
  // Geometry helper
  faceGeometry; 
  
  // Flags & function for debug
  debugFunc;  // Debug function (as callback)   
  flipCamera = true;  // Defines if the source should be flipped horizontally.
  wireframe = false;  // Enable wireframe to debug the mesh on top of the material.
  activateMask = true;  // Enable/disable mask
  checkPerformance = true;  // Check and print performance information
  
  // FPS
  times = []; 
  fps = 0;


  constructor(av, canvas, assetPath, debugFunc = null) {
    this.debugFunc = debugFunc;
        
    // Set a background color, or change alpha to false for a solid canvas.
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    //this.renderer.outputEncoding = sRGBEncoding;

    // Create scene and camera
    this.scene = new Scene();
    this.camera = new OrthographicCamera(1, 1, 1, 1, -1000, 1000);

    // Add light & objects to 3d environment
    this.addFaceMask(assetPath);
    this.addLight();

    // Initialize engine & video, start to render
    this.initAndRender(av, debugFunc);
  }
  
  debugMsg(msg) {
    if (this.debugFunc != null) {
      this.debugFunc(msg);
    } else {
      console.log(msg);
    }
  }
  
  toggleMasking(flag = null) {
    if (flag != null) {
      this.activateMask = flag;
    } else {
      this.activateMask = !this.activateMask;
    }
  }
  
  toggleDebug(flag = null) {
    if (flag != null) {
      this.wireframe = flag;
    } else {
      this.wireframe = !this.wireframe;
    }
  }
  
  togglePerformance(flag = null) {
    if (flag != null) {
      this.checkPerformance = flag;
    } else {
      this.checkPerformance = !this.checkPerformance;
    }
  }
  
  resizeRenderer() {
    const videoAspectRatio = this.width / this.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;    
    const windowAspectRatio = windowWidth / windowHeight;
    let adjustedWidth;
    let adjustedHeight;
    if (videoAspectRatio > windowAspectRatio) {
      adjustedWidth = windowWidth;
      adjustedHeight = windowWidth / videoAspectRatio;
    } else {
      adjustedWidth = windowHeight * videoAspectRatio;
      adjustedHeight = windowHeight;
    }
    
    this.renderer.setSize(adjustedWidth, adjustedHeight);
  }
  
  setVideoTexture(videoSource) {
  	this.videoTexture = new Texture(videoSource);
    this.videoTexture.minFilter = LinearFilter;
    this.videoTexture.magFilter = LinearFilter;
    this.videoTexture.encoding = LinearEncoding;
    
    var materialVid   = new MeshBasicMaterial({	
  	  map: this.videoTexture, 
  	  side: DoubleSide,
  	  opacity: 1.0,
  	  transparent: true,
  	});
  	materialVid.map.encoding = LinearEncoding;

  	var geometry	= new PlaneGeometry(500, 500, 1);
  	var avScreen = new Mesh(geometry, materialVid);	
  	avScreen.position.set(0, 0, -30);
  	avScreen.scale.x = -1;
  	this.scene.add(avScreen);
  }
  
  addFaceMask(assetPath) {
    // Load textures
    const colorTexture = new TextureLoader().load(assetPath + "/mesh_map.jpg");
    const aoTexture = new TextureLoader().load(assetPath + "/ao.jpg");
    const alphaTexture = new TextureLoader().load(assetPath + "/mask.png");
    
    // Create a new geometry helper.
    this.faceGeometry = new FaceMeshFaceGeometry();
    
    // Create wireframe material for debugging.
    const wireframeMaterial = new MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
    });
    
    // Create material for mask.
    const material = new MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.8,
      metalness: 0.1,
      alphaMap: alphaTexture,
      aoMap: aoTexture,
      map: colorTexture,
      roughnessMap: colorTexture,
      transparent: true,
      side: DoubleSide,
    });
    
    // Create mask mesh.
    this.mask = new Mesh(this.faceGeometry, material);
    this.mask.receiveShadow = this.mask.castShadow = true;
    this.scene.add(this.mask);
    
    
    // Create a red material for the nose.
    const noseMaterial = new MeshStandardMaterial({
      color: 0xff2010,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
    });

    this.nose = new Mesh(new IcosahedronGeometry(1, 3), noseMaterial);
    this.nose.castShadow = this.nose.receiveShadow = true;
    this.nose.scale.setScalar(20);
    this.scene.add(this.nose);    
  }
  
  addLight() { 
    const spotLight = new SpotLight(0xffffbb, 1);
    spotLight.position.set(0.5, 0.5, 1);
    spotLight.position.multiplyScalar(400);
    this.scene.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 200;
    spotLight.shadow.camera.far = 800;

    spotLight.shadow.camera.fov = 40;

    spotLight.shadow.bias = -0.001125;

    this.scene.add(spotLight);

    const hemiLight = new HemisphereLight(0xffffbb, 0x080820, 0.25);
    this.scene.add(hemiLight);

    const ambientLight = new AmbientLight(0x404040, 0.25);
    this.scene.add(ambientLight);
  }
  
  async render(model, av) {
    // Wait for video to be ready (loadeddata).
    await av.ready();

    // Flip video element horizontally if necessary.
    av.video.style.transform = this.flipCamera ? "scaleX(-1)" : "scaleX(1)";

    // Resize orthographic camera to video dimensions if necessary.
    if (this.width !== av.video.videoWidth || this.height !== av.video.videoHeight) {
      const w = av.video.videoWidth;
      const h = av.video.videoHeight;
      
      this.camera.left = -0.5 * w;
      this.camera.right = 0.5 * w;
      this.camera.top = 0.5 * h;
      this.camera.bottom = -0.5 * h;
      this.camera.updateProjectionMatrix();
      this.width = w;
      this.height = h;
      
      this.resizeRenderer();
      this.faceGeometry.setSize(w, h);
    }

    if (av.video.readyState === av.video.HAVE_ENOUGH_DATA) {
  	  if (this.videoTexture && this.videoTexture.image != undefined) {
  	    this.videoTexture.needsUpdate = true;
  	  }
  	}
  	
  	let elapsed = 0;
  	if (this.activateMask) {
  	  this.mask.visible = true;
  	  this.nose.visible = true;
  	  
  	  let sTime = performance.now();
  	  // Wait for the model to return a face.
      const faces = await model.estimateFaces(av.video, false, this.flipCamera);
      let eTime = performance.now();
      elapsed = eTime - sTime;
      
      if (this.checkPerformance) {
        this.debugMsg("Done. start to rendering");
      }

      // There's at least one face.
      if (faces.length > 0) {
        // Update face mesh geometry with new data.
        this.faceGeometry.update(faces[0], this.flipCamera);
        
        // Modify nose position and orientation.
        const track = this.faceGeometry.track(5, 45, 275);      
        this.nose.position.copy(track.position);
        this.nose.rotation.setFromRotationMatrix(track.rotation);
        
        this.faceGeometry.computeBoundingBox();
        let area = (this.faceGeometry.boundingBox.max.x - this.faceGeometry.boundingBox.min.x) * 
                  (this.faceGeometry.boundingBox.max.z - this.faceGeometry.boundingBox.min.z); // NOTE: NOT y axis.
                  
        if (this.curArea != 0) {
          let scale = area / this.curArea;
          
          this.curScale = this.curScale * scale;
          this.nose.scale.setScalar(this.curScale);
        }
        
        this.curArea = area;
      }
  	} else {
  	  this.mask.visible = false;
  	  this.nose.visible = false;
  	}
    
    if (this.wireframe) {
      // Render the mask.
      this.renderer.render(this.scene, this.camera);
      // Prevent renderer from clearing the color buffer.
      this.renderer.autoClear = false;
      this.renderer.clear(false, true, false);
      this.mask.material = wireframeMaterial;
      // Render again with the wireframe material.
      this.renderer.render(this.scene, this.camera);
      this.mask.material = material;
      this.renderer.autoClear = true;
    } else {
      // Render the scene normally.
      this.renderer.render(this.scene, this.camera);
    }
    
    if (this.checkPerformance) {
      const now = performance.now();
      while (this.times.length > 0 && this.times[0] <= now - 1000) {
        this.times.shift();
      }
      this.times.push(now);
      this.fps = this.times.length;
      
      let fpsInfo = this.fps + " FPS ";
      let elapsedInfo = "";
      
      if (elapsed != 0) {
        elapsedInfo = "(DL inference elaped : " + elapsed.toFixed(4) + "ms)";
      }
      this.debugMsg(fpsInfo + elapsedInfo);
    }

    requestAnimationFrame(() => this.render(model, av));
  }

  // Init the TF backend and video, load model and render.
  async initAndRender(av, debugFunc) {
    await Promise.all([av.ready(), tf.setBackend("webgl")]);
    this.setVideoTexture(av.video);
    
    this.debugMsg("Loading model...");
    const model = await facemesh.load({ maxFaces: 1 });
    this.debugMsg("Done. start to rendering");
            
    await this.render(model, av);
  }
}

export { MaskHelper };

