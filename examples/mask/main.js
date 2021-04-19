import { MaskHelper } from "../../js/mask.js";

const av = document.querySelector("gum-av");
const canvas = document.querySelector("canvas");
const status = document.querySelector("#status");

av.style.opacity = 0;
status.textContent = "Setting up mask helper...";
let maskHelper = new MaskHelper(av, canvas, "../../assets", function(msg) { status.textContent = msg; });

window.addEventListener("resize", () => {
  maskHelper.resizeRenderer();
});

