import React from 'react';
import {render} from 'react-dom';
import BABYLON from 'babylonjs';
import {BabylonJS} from './react-babylonjs.js';
import Player from './Player';

class Game extends React.Component {
  doRenderLoop() {
    this.scene.render();
  }

  handleEngineCreated(engine) {
    this.engine = engine;
    engine.runRenderLoop(this.handleRenderLoop = () => this.doRenderLoop());
    this.scene = new BABYLON.Scene(engine);

    //controllable camera
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3.Zero(), this.scene);
    camera.setPosition(new BABYLON.Vector3(0, 15, -30));
    camera.attachControl(this.scene.getEngine().getRenderingCanvas(), false);

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this.scene);

    /** SKYBOX **/
    BABYLON.Engine.ShadersRepository = "./shaders/";

    var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, this.scene);

    const shader = new BABYLON.ShaderMaterial("gradient", this.scene, "gradient", {});
    shader.setFloat("offset", 0);
    shader.setFloat("exponent", 0.6);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    shader.backFaceCulling = false;
    skybox.material = shader;

    this.scene.enablePhysics(
      new BABYLON.Vector3(0, -200, 0),
      new BABYLON.OimoJSPlugin());

    var g = BABYLON.Mesh.CreateBox("ground", 400, this.scene);
    g.position.y = -20;
    g.scaling.y = 0.01;
    g.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move:false});

    for (var x in [0,1]) {
      require('../models/omi.blend').Append(BABYLON.SceneLoader, this.scene, loadedScene => {
        /*onsuccess*/
      //  new BABYLON.PhysicsImpostor(loadedScene.meshes[x], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, }, scene);
        loadedScene.beginAnimation(this.scene.skeletons[x], 0, 60, true, 2);
      }, x => {/*onprogress*/}, ex => {/*onerror*/});
    }

    //add a Player
    var player = new Player(this, this.scene, navigator.getGamepads()[0]);
  }

  handleEngineAbandoned(engine) {
    this.engine.stopRenderLoop(this.handleRenderLoop);
    this.handleRenderLoop = null;
    this.engine = null;
  }

  render() {
    return <BabylonJS onEngineCreated={engine => this.handleEngineCreated(engine)} onEngineAbandoned={engine => this.handleEngineAbandoned(engine)}/>;
  }
}

render(<Game/>, document.getElementById("game-container"));
