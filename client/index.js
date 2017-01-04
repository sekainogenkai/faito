'use strict';

const BABYLON = require('babylonjs');

const engine = new BABYLON.Engine(document.getElementById('render-canvas'), true);
window.addEventListener('resize', () => engine.resize());
const scene = new BABYLON.Scene(engine);

const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
camera.setTarget(new BABYLON.Vector3.Zero());

const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

scene.enablePhysics(
  new BABYLON.Vector3(0, -9.81, 0),
  new BABYLON.OimoJSPlugin());
for (var x in [0,1]) {
require('../models/omi.blend').Append(BABYLON.SceneLoader, scene, loadedScene => {
  /*onsuccess*/
//  new BABYLON.PhysicsImpostor(loadedScene.meshes[x], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, }, scene);
  loadedScene.beginAnimation(scene.skeletons[x], 0, 60, true, 2);
}, x => {/*onprogress*/}, ex => {/*onerror*/});
}

engine.runRenderLoop(() => scene.render());
