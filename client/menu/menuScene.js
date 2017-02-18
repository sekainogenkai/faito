import BABYLON from 'babylonjs';
import MapLoader from '../mapLoader.js';

export default function loadMenuScene (game) {
  // Initialize camera
  var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3.Zero(), game.scene);
  camera.setPosition(new BABYLON.Vector3(0, 40, -40));
  camera.attachControl(game.engine.getRenderingCanvas(), false);

  var dirLight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -1, 0), game.scene);
  let dirLightStrength = 1;
  dirLight.diffuse = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);
  dirLight.specular = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);
  var hemLight = new BABYLON.HemisphericLight("dir02", new BABYLON.Vector3(0,1,0), game.scene);
  let hemLightStrength = .7;
  hemLight.diffuse = new BABYLON.Color3(hemLightStrength,hemLightStrength,hemLightStrength);
  hemLight.specular = new BABYLON.Color3(hemLightStrength,hemLightStrength,hemLightStrength);
  // Skybox
  var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, game.scene);

  var shader = new BABYLON.ShaderMaterial("gradient", game.scene, "gradient", {});
  shader.setFloat("offset", 0);
  shader.setFloat("exponent", 0.6);
  shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
  shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
  shader.backFaceCulling = false;
  skybox.material = shader;

  // Add shadow generator
  game.scene.shadowGenerator = new BABYLON.ShadowGenerator(Math.pow(2,10), dirLight);
  game.scene.shadowGenerator.setDarkness(0);
  //this.shadowGenerator.bias = 0.01;

  game.scene.enablePhysics(
    new BABYLON.Vector3(0, -10, 0),
    new BABYLON.CannonJSPlugin());
  // Add collision groups, groups must be powers of 2: http://schteppe.github.io/cannon.js/demos/collisionFilter.html
  game.scene.collisionGroupNormal = 2;
  game.scene.collisionGroupGround = 1;
  game.scene.collisionGroupFall = 4;

  game.mapLoader = new MapLoader('test1', game);
}
