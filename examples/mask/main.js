import { MaskHelper } from "../../js/mask.js";
import { WebcamHelper } from "../../js/webcam.js";

//const av = document.querySelector("gum-av");
const av = new WebcamHelper();
const canvas = document.querySelector("canvas");
const status = document.querySelector("#status");

//av.style.opacity = 1;
status.textContent = "Setting up mask helper...";
let maskHelper = new MaskHelper(av, canvas, "../../assets", function(msg) { status.textContent = msg; });

window.addEventListener("resize", () => {
  maskHelper.resizeRenderer();
});

