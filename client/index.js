'use strict';

const BABYLON = require('babylonjs');

const engine = new BABYLON.Engine(document.getElementById('render-canvas'), true);
window.addEventListener('resize', () => engine.resize());
const scene = new BABYLON.Scene(engine);

scene.enablePhysics(
  new BABYLON.Vector3(0, -9.81, 0),
  new BABYLON.OimoJSPlugin());
for (var x in [0,1]) {
require('../models/bumi.blend').Append(BABYLON.SceneLoader, scene, loadedScene => {
  /*onsuccess*/
  new BABYLON.PhysicsImpostor(loadedScene.meshes[x], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, }, scene);
}, x => {/*onprogress*/}, ex => {/*onerror*/});
}

engine.runRenderLoop(() => scene.render());
