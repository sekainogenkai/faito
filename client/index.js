import EventEmitter from 'events';
import {Buttons, Manager as InputManager} from './game/input';
import {LocalPlayer} from './game/player';
import React from 'react';
import {render} from 'react-dom';
import BABYLON from 'babylonjs';
import {BabylonJS} from './react-babylonjs.js';
import Hero from './game/heroes/baseHero';
import Menu from './menu/Menu';

class Game extends EventEmitter {
  constructor() {
    super();
    this.players = [];
    this.heroes = [];
    this.on('playerschanged', () => this.handlePlayersChanged());
  }

  addInput(input) {
    const i = this.players.concat(undefined).indexOf(undefined);
    const player = this.players[i] = new LocalPlayer(`Player ${i}`, input);
    console.log(`Added player ${player.name} (${input.name})`);
    player.on('end', () => {
      this.players[i] = undefined;
      player.destroy();
      this.emit('playerschanged');
    });
    // TODO: Need to decide how to do routing of input when menu is
    // shown. E.g., joystick should control menu and not heroes when
    // menu is shown and switch back. Maybe instead of having heroes
    // bind to the inputs directly we could just have an input router
    // which just forwards the events to whatever is active at the
    // moment. Could even just pass the player a faked out
    // router-controlled input which the router forwards to. But the
    // levels of indirection!
    player.input.on('buttondown', button => {
      console.log(`input emitted ${button}`);
      if (button === Buttons.Menu) {
        this.setState({menu: true,});
      }
    });
    this.emit('playerschanged');
  }

  doRenderLoop() {
    this.scene.render();
  }

  handlePlayersChanged() {
    // For now, create a hero now. In the future, hero creation will
    // be up to the current game mode (no such thing exists yet
    // though).
    for (const i in this.players) {
      const player = this.players[i];
      if (player) {
        // Assert hero.
        if (!this.heroes[i]) {
          const hero = this.heroes[i] = new Hero(this, `${player.name}のヒーロー`);
          hero.setPlayer(player);
        }
      } else { // if (player)
        // Assert no hero.
        const hero = this.heroes[i];
        if (hero) {
          hero.destory();
          this.heroes[i] = undefined;
        }
      }
    }
  }

  setEngine(engine) {
    this.engine = engine;
    engine.runRenderLoop(this.handleRenderLoop = () => this.doRenderLoop());
    this.scene = new BABYLON.Scene(engine);

    // Controllable camera
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3.Zero(), this.scene);
    camera.setPosition(new BABYLON.Vector3(0, 15, -30));
    camera.attachControl(engine.getRenderingCanvas(), false);

    this.light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -2, 0), this.scene);

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
      new BABYLON.Vector3(0, -10, 0),
      new BABYLON.CannonJSPlugin());

    // Add ground
    this.ground = BABYLON.Mesh.CreateGround("ground", 2500, 2500, 20, this.scene);
    var material = new BABYLON.StandardMaterial("green", this.scene);
    material.diffuseColor = BABYLON.Color3.FromInts(31, 158, 69);
    this.ground.material = material;
    this.ground.position.y = -10;
    this.ground.scaling.y = 0.001;
    this.ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move:false});
    BABYLON.Tags.EnableFor(this.ground);
    BABYLON.Tags.AddTagsTo(this.ground, "checkJump");

    for (var x in [0,1]) {
      require('../models/heroes/omi.blend').Append(BABYLON.SceneLoader, this.scene, loadedScene => {
        /*onsuccess*/
      //  new BABYLON.PhysicsImpostor(loadedScene.meshes[x], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, }, scene);
        loadedScene.beginAnimation(this.scene.skeletons[x], 0, 120, true, 2);
      }, x => {/*onprogress*/}, ex => {/*onerror*/});
    }

    // Add shadow generator
    this.shadowGenerator = new BABYLON.ShadowGenerator(Math.pow(2,9), this.light);
    // Just add the mesh
    this.shadowGenerator.getShadowMap().renderList.push(this.scene.meshes[2]);
    this.ground.receiveShadows = true;

    new InputManager(this);
  }

  abandonEngine(engine) {
    this.engine.stopRenderLoop(this.handleRenderLoop);
    this.handleRenderLoop = null;
    this.engine = null;
  }
}

class Ui extends React.Component {
  constructor() {
    super();
    this.state = {
      menu: false,
    };
  }

  handleEngineCreated(engine) {
    this.props.game.setEngine(engine);
  }

  handleEngineAbandoned(engine) {
    this.props.game.abandonEngine(engine);
  }

  render() {
    return <div style={{width: '100%', height: '100%',}}>
        <BabylonJS onEngineCreated={engine => this.handleEngineCreated(engine)} onEngineAbandoned={engine => this.handleEngineAbandoned(engine)}/>
        {this.state.menu ? <Menu onHide={() => this.setState({menu: false,})}/> : []}
      </div>;
  }
}

render(<Ui game={new Game()}/>, document.getElementById("game-container"));
