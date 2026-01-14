import Carousel from "./ux/carousel.mjs";
import { HTMLMultiSelectElement, HTMLMultiCheckboxElement } from "./ux/multi-select.mjs";

globalThis.ui = {};

window.addEventListener("DOMContentLoaded", async function() {
  Carousel.initializePage();
});


// Register Custom Elements
window.customElements.define("multi-select", HTMLMultiSelectElement);
window.customElements.define("multi-checkbox", HTMLMultiCheckboxElement);
