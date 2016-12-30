'use strict';

const BABYLON = require('babylonjs');

const engine = new BABYLON.Engine(document.getElementById('render-canvas'), true);
const scene = new BABYLON.Scene(engine);

scene.enablePhysics(
  new BABYLON.Vector3(0, -9.81, 0),
  new BABYLON.OimoJSPlugin());
require('../models/simple.blend').Append(BABYLON.SceneLoader, scene, loadedScene => {
  /*onsuccess*/
  new BABYLON.PhysicsImpostor(loadedScene.meshes[0], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, }, scene);
}, x => {/*onprogress*/}, ex => {/*onerror*/});

engine.runRenderLoop(() => scene.render());
