import BABYLON from 'babylonjs';
import MapLoader from '../mapLoader.js';
import GameCamera from './gameCamera';

export default function loadGameScene (game, players, map='test1') {
  // clear current scene
  game.scene.dispose();
  // Initialize camera
  var camera = new GameCamera(game);

  // Load sound effects
  game.scene.sound = {
    jump1 : new BABYLON.Sound('jump1', './audio/hero/jump01.ogg', game.scene, null, {loop: false, autoplay: false}),
    jump2 : new BABYLON.Sound('jump2', './audio/hero/jump02.ogg', game.scene, null, {loop: false, autoplay: false}),
    hurt2 : new BABYLON.Sound('hurt2', './audio/hero/hurt02.ogg', game.scene, null, {loop: false, autoplay: false}),
    hurt1 : new BABYLON.Sound('hurt1', './audio/hero/hurt01.ogg', game.scene, null, {loop: false, autoplay: false}),
    hurt3 : new BABYLON.Sound('hurt3', './audio/hero/hurt03.ogg', game.scene, null, {loop: false, autoplay: false}),
    music : new BABYLON.Sound('music', './audio/FaitoBackground.ogg', game.scene, null, {loop: true, autoplay: true, volume: 0.2}),
    jump : [],
    hurt : []
  }
  game.scene.sound.jump = [game.scene.sound.jump1, game.scene.sound.jump2];
  game.scene.sound.hurt = [game.scene.sound.hurt1, game.scene.sound.hurt2, game.scene.sound.hurt3];
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



/*
  var hemLight = new BABYLON.HemisphericLight("dir02", new BABYLON.Vector3(1,1,0), game.scene);
  let hemLightStrength = .2;
  hemLight.diffuse = new BABYLON.Color3(hemLightStrength,hemLightStrength,hemLightStrength);
  hemLight.specular = new BABYLON.Color3(hemLightStrength,hemLightStrength,hemLightStrength);
*/
  // Skybox
  /*
  var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, game.scene);
  var shader = new BABYLON.ShaderMaterial("gradient", game.scene, "gradient", {});
  shader.setFloat("offset", 0);
  shader.setFloat("exponent", 0.6);
  shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
  shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
  shader.backFaceCulling = false;
  skybox.material = shader;
  */
  // post processor
  /*
  var sepiaKernelMatrix =
                    [0, -1, -1,
                       -1, 5.7, -1,
                        -1, -1, 0];
  var postProcess = new BABYLON.ConvolutionPostProcess("Sepia", sepiaKernelMatrix, 1.0, camera.camera, null, game.engine, true);
  camera.camera.attachPostProcess(postProcess, 1);*/
  //var ssao = new BABYLON.SSAORenderingPipeline('ssaopipeline', game.scene, 0.5, camera.camera);

    //var postProcess = new BABYLON.ConvolutionPostProcess("convolution", BABYLON.ConvolutionPostProcess.EmbossKernel, 1.0, camera.camera);


  // Add shadow generator
  game.scene.shadowGenerator = new BABYLON.ShadowGenerator(Math.pow(2,10), dirLight);
  game.scene.shadowGenerator.setDarkness(.3);
  game.scene.shadowGenerator.usePoissonSampling = true;

  game.scene.enablePhysics(
    new BABYLON.Vector3(0, -10, 0),
    new BABYLON.CannonJSPlugin());
  // Add collision groups, groups must be powers of 2: http://schteppe.github.io/cannon.js/demos/collisionFilter.html
  game.scene.collisionGroupNormal = 2;
  game.scene.collisionGroupGround = 1;
  game.scene.collisionGroupFall = 4;

  //load map
  game.mapLoader = new MapLoader(map, game);
}
