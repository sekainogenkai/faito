'use strict';

import React from 'react';
import {render} from 'react-dom';
import BABYLON from 'babylonjs';
import {BabylonJS} from './react-babylonjs.js';
import Hero from './game/heroes/baseHero';
import Menu from './menu/Menu';

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      menu: false,
    };
  }

  doRenderLoop() {
    this.scene.render();
  }

  handleEngineCreated(engine) {
    engine.getRenderingCanvas().focus();
    this.engine = engine;
    engine.runRenderLoop(this.handleRenderLoop = () => this.doRenderLoop());
    this.scene = new BABYLON.Scene(engine);

    // Just a test
    this.hero = null

    this.scene.actionManager = new BABYLON.ActionManager(this.scene);
    this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, e => {
      this.hero.handleKeyDownInput(e);
      switch (e.sourceEvent.key) {
        case 'Escape':
          this.setState({
            menu: true,
          });
          break;
      }
    }));
    this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, e => {
      this.hero.handleKeyUpInput(e);
      switch (e.sourceEvent.key) {
      };
    }));

    // Controllable camera
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3.Zero(), this.scene);
    camera.setPosition(new BABYLON.Vector3(0, 15, -30));
    camera.attachControl(engine.getRenderingCanvas(), false);

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this.scene);

    // Skybox
    BABYLON.Engine.ShadersRepository = "./shaders/";

    var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, this.scene);

    const shader = new BABYLON.ShaderMaterial("gradient", this.scene, "gradient", {});
    shader.setFloat("offset", 0);
    shader.setFloat("exponent", 0.6);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    shader.backFaceCulling = false;
    skybox.material = shader;

    // Fog
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.0018;
    this.scene.fogColor = new BABYLON.Color3(240/255, 240/255, 1);

    this.scene.enablePhysics(
      new BABYLON.Vector3(0, -200, 0),
      new BABYLON.CannonJSPlugin());

    // Add a hero
    this.hero = new Hero(this, 0);

    // Add ground
    this.ground = BABYLON.Mesh.CreateGround("ground", 2500, 2500, 20, this.scene);
    var material = new BABYLON.StandardMaterial("green", this.scene);
    material.diffuseColor = BABYLON.Color3.FromInts(31, 158, 69);
    this.ground.material = material;
    this.ground.position.y = -10;
    this.ground.scaling.y = 0.001;
    this.ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move:false});

    for (var x in [0,1]) {
      require('../models/heroes/omi.blend').Append(BABYLON.SceneLoader, this.scene, loadedScene => {
        /*onsuccess*/
      //  new BABYLON.PhysicsImpostor(loadedScene.meshes[x], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, }, scene);
        loadedScene.beginAnimation(this.scene.skeletons[x], 0, 60, true, 2);
      }, x => {/*onprogress*/}, ex => {/*onerror*/});
    }
  }

  handleEngineAbandoned(engine) {
    this.engine.stopRenderLoop(this.handleRenderLoop);
    this.handleRenderLoop = null;
    this.engine = null;
  }

  render() {
    // Hack to ensure canvas is focused.
    if (!this.state.menu && this.engine) {
      this.engine.getRenderingCanvas().focus();
    }

    return <div style={{width: '100%', height: '100%',}}>
        <BabylonJS onEngineCreated={engine => this.handleEngineCreated(engine)} onEngineAbandoned={engine => this.handleEngineAbandoned(engine)}/>
        {this.state.menu ? <Menu onHide={() => this.setState({menu: false,})}/> : []}
      </div>;
  }
}

render(<Game/>, document.getElementById("game-container"));
