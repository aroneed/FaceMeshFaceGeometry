# FaceMeshFaceGeometry

### Description

Three.js helper for FaceMesh https://github.com/tensorflow/tfjs-models/tree/master/facemesh

It's forked from https://github.com/spite/FaceMeshFaceGeometry



## Getting Started
### Prerequisites

(TBD)


### How to use

Create __'WebcamHelper(webcam.js)'__ object to grab frame from webcam,
and use __'MaskHelper(mask.js)'__ for overlap mask and 3D object on your face.

You can simply apply it using above 2 class, and output should be on HTML5 canvas.
Please check sample code from `examples/mask/main.js`


### APIs (MaskHelper)

_NOTE: All toggle functions also can be a setter, if you specify the flag(true/false)._


```
#### constructor(av, canvas, assetPath, debugFunc=null)

You can create mask-helper with input(av), output source(canvas) and path(assetPath) for texture & 3d objects.
also you set function for debug(debugFunc), it will be callback with debug message.


#### toggleMask(flag=null)

Toggle(Activate/deactivate) mask engine.


#### toggleDebug(flag=null)

Toggle(draw/undraw) face detection/facial landmark detection result. 


#### togglePerformance(flag=null)

Toggle(check/uncheck) masking engine's performance (elapsed time, FPS)


#### resizeRender()

Resize rendering area on screen. please enroll this function to browser window's event listener. 

```

