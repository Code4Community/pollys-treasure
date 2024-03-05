import Phaser from "phaser";

import parrotImg from "../assets/parrot.png";
import grassImg from "../assets/grassNew.png";
import stoneImg from "../assets/stoneNew.png";
import treeImg from "../assets/treeNew2.png";
import treasureImg from "../assets/treasure.png";
import mapPieceImg from "../assets/pieceOfMap.png";
import waterImg from "../assets/waterNew.png";
import sandImg from "../assets/sandNew.png";
import cannonballImg from "../assets/cannonball.png"
import blankImg from "../assets/blank.png"
import gameOverImg from "../assets/gameOver.png"

import level1JSON from "../assets/levels/level1.json";
import level2JSON from "../assets/levels/level2.json";
import level3JSON from "../assets/levels/level3.json";

import C4C from "c4c-lib";


import { GenerateSceneFromLevelData } from "../level.js";
import Buttons from "../Buttons";
import Entity from "../entity";
import Treasure from "../Treasure";
import PieceOfMap from "../PieceOfMap";
import InteractionsManager from "../interactions";
import Parrot from "../Parrot.js";
import Emitter from "../Emitter.js";
import Cannonball from "../Cannonball.js";
import Barrier from "../Barrier.js";

//Button Hovering
function enterButtonHoverState(btn) {
  btn.setStyle({ fill: "#ff0" });
}

function enterButtonRestState(btn) {
  btn.setStyle({ fill: "#fff" });
}

const TILE_SIZE = 30;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("Example");
    // Buttons ;
    // Buttons.constructor()
    this.level = 1;
    this.levelJSONs = [level1JSON, level1JSON, level2JSON, level3JSON];
  }

  setLevel(level) {
    var level = document.getElementById('dropdownMenuButton').value;
    this.level = level;
    this.currentStep = 0;
  }

  //Load in images || TODO: move to own file
  preload() {
    // this.load.image("logo", logoImg);
    this.load.image("parrot", parrotImg);
    this.load.image("grass", grassImg);
    this.load.image("stone", stoneImg);
    this.load.image("tree", treeImg);
    this.load.image("treasure", treasureImg);
    this.load.image("mapPiece", mapPieceImg);
    this.load.image("water", waterImg);
    this.load.image("sand", sandImg);
    this.load.image("cannonball", cannonballImg);
    this.load.image("mapPiece", mapPieceImg);
    this.load.image("none", blankImg);
    this.load.image("gameOver", gameOverImg);
  }

  // Create Scene
  create() {
    // Initialize editor window
    C4C.Editor.Window.init(this);
    C4C.Editor.Window.open();
    C4C.Editor.setText(`moveRight(1)`);

    let NumTilesX = 30;
    let NumTilesY = 30;
    this.tiles = [];
    this.entities = [];

    this.splash = null;

    this.loadScene();

    const updateAll = () => {
      this.entities.forEach((e) => e.update());
    };

    // Intepreter Movement Commands
    C4C.Interpreter.define("moveRight", (x_dist) => {
      this.parrot.x += x_dist;
      
      console.log("block ON : ",this.parrot.peekAt(this, 0, 0));
      console.log("block right : ",this.parrot.peekAt(this, 1, 0));
      console.log("block below : ",this.parrot.peekAt(this, 0, 1));
      console.log("block left : ",this.parrot.peekAt(this, -1, 0));
      console.log("block above : ",this.parrot.peekAt(this, 0, -1));
      
      updateAll();
      this.interactionsManager.checkInteractions(
        this.entities.filter((e) => e.alive)
      );
    });

    C4C.Interpreter.define("moveLeft", (x_dist) => {
      this.parrot.x -= x_dist;
      updateAll();
      this.interactionsManager.checkInteractions(
        this.entities.filter((e) => e.alive)
      );
    });

    C4C.Interpreter.define("moveDown", (y_dist) => {
      this.parrot.y += y_dist;
      updateAll();
      this.interactionsManager.checkInteractions(
        this.entities.filter((e) => e.alive)
      );
    });

    C4C.Interpreter.define("moveUp", (y_dist) => {
      this.parrot.y -= y_dist;
      updateAll();
      this.interactionsManager.checkInteractions(
        this.entities.filter((e) => e.alive)
      );
    });

    //Define interactions

    this.interactionsManager = new InteractionsManager();

    this.interactionsManager.addInteraction(
      [Parrot, PieceOfMap],
      (_, pieceOfMap) => {
        pieceOfMap.destroy();
      }
    );

    this.interactionsManager.addInteraction(
      [Parrot, Treasure],
      (_, treasure) => {
        treasure.destroy();
      }
    );

    this.interactionsManager.addInteraction(
      [Parrot, Barrier],
      (p, _) => {
        p.destroy();
        this.splash = this.add.sprite(450,450,"gameOver");
        C4C.Editor.Window.close();
        this.buttons = new Buttons(this);
      }
    );

    this.interactionsManager.addInteraction(
      [Parrot, Cannonball],
      (p, _) => {
        p.destroy();
      }
    );
  }

  update() {
    if (Date.now() - this.lastUpdate > 1000) {
      const programText = C4C.Editor.getText();
      const res = C4C.Interpreter.stepRun(programText, [this.loc]);
      this.loc = res[1];
      this.interactionsManager.checkInteractions(
        this.entities.filter((e) => e.alive)
      );
      this.lastUpdate = Date.now();
    }
    this.entities.forEach((entity) => {
      entity.visualUpdate();
    });
  }

  loadScene(){

    if(this.splash !== null){
      this.splash.destroy();
    }

    this.entities.forEach((e) => e.destroy(true));
    this.tiles.forEach((row) => row.forEach((t) => t.destroy(true)));

    // Set tile layout
    this.tiles = [];
    this.entities = [];

    GenerateSceneFromLevelData(this.levelJSONs[this.level],this,TILE_SIZE);

    for (let x = 4; x < 20; x++) {
      if (Math.random() < 0.5) {
        this.entities.push(new PieceOfMap(x, 0, TILE_SIZE));
      } else {
        this.entities.push(new Treasure(x, 0, TILE_SIZE));
      }
    }

    this.entities.forEach((e) => e.initialize(this));

    // Create some interface to running the interpreter:
    this.buttons = new Buttons(this);
  }
}
