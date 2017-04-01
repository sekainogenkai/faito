import BABYLON from 'babylonjs';
import MapLoader from '../mapLoader.js';
import MenuCamera from './MenuCamera';

export default function loadMenuScene (game) {
  // clear current scene
  game.scene.dispose();

  // Initialize camera
  var camera = new MenuCamera(game);

  // Set lights
  var dirLight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -1, 0), game.scene);
  let dirLightStrength = 1;
  dirLight.diffuse = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);
  dirLight.specular = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);

  // Make lighting look better for the shadows at different angles.
  var dirLight2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(.5, -1, 1), game.scene);
  dirLightStrength = .25;
  dirLight2.diffuse = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);
  dirLight2.specular = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);

  // Add shadow generator
  game.scene.shadowGenerator = new BABYLON.ShadowGenerator(Math.pow(2,11), dirLight);
  game.scene.shadowGenerator.setDarkness(.3);
  game.scene.shadowGenerator.usePoissonSampling = true;

  game.scene.enablePhysics(
    new BABYLON.Vector3(0, -10, 0),
    new BABYLON.CannonJSPlugin());
  // Add collision groups, groups must be powers of 2: http://schteppe.github.io/cannon.js/demos/collisionFilter.html
  game.scene.collisionGroupNormal = 2;
  game.scene.collisionGroupGround = 1;
  game.scene.collisionGroupFall = 4;

  game.mapLoader = new MapLoader('test1', game);
}
