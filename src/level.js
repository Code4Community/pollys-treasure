// @ts-check

import Emitter from "./Emitter";
import Parrot from "./Parrot";
import PieceOfMap from "./PieceOfMap";
import Treasure from "./Treasure";
import Barrier from "./Barrier";
import Entity from "./entity";
import Switch from "./Switch";
import SwitchBarrier from "./SwitchBarrier";

/**
 * @param {LevelData} levelData - the level data.
 * @param {number} tileSize
 */
export const GenerateSceneFromLevelData = (levelData, scene, tileSize) =>{
        
    for(let y = 0; y < levelData.height; y++){
        let row = [];
        for(let x = 0; x < levelData.height; x++){
            
            let texture = "";

            switch(levelData.tiles[y][x]){
                case 1: texture = "grass"; break;
                case 2: texture = "sand";  break;
                case 3: texture = "stone"; 
                    scene.entities.push(new Barrier(x,y,tileSize));
                break;
                case 4: texture = "tree"; 
                    scene.entities.push(new Barrier(x,y,tileSize));
                break;
                case 0: texture = "water"; 
                    scene.entities.push(new Barrier(x,y,tileSize));
                break;
                    
            }

            let tile = scene.add.sprite(
                x * tileSize + tileSize / 2,
                y * tileSize + tileSize / 2,
                texture
            );
            
            tile.width = tileSize;
            tile.displayWidth = tileSize;
            tile.height = tileSize;
            tile.displayHeight = tileSize;
            row.push(tile);
        }
        scene.tiles.push(row);  
    }
    
    for(var i = 0; i < levelData.entities.length; i++){
        let data = levelData.entities[i];
        var entity;
        
        switch(data.texture){
            case "parrot":
                entity = new Parrot(data.x, data.y, data.size);
                scene.parrot = entity;
            break;
            case "mapPiece":            
                entity = new PieceOfMap(data.x, data.y, data.size);
            break;
            case "treasure":
                entity = new Treasure(data.x, data.y, data.size);
            break;
            case "cannon":
                entity = new Emitter(data.x, data.y, data.size, data.vx, data.vy, data.interval, scene, data.timer);
            break;
            case "switch":
                entity = new Switch(data.x, data.y, data.size, scene);
            break;
            case "switchBarrier":
                entity = new SwitchBarrier(data.x, data.y, data.size, scene, data.status);
            break;
            default:
                entity = new Entity(data.x, data.y, data.texture, data.size);
        }

        scene.entities.push(entity);

    }
}

/**
 *
 * @typedef {{
 *      name: string,
 *      width: number,
 *      height: number, 
 *      tiles: number[][],    // indexed by [y][x]
 *      entities: {
 *                  x : number,
 *                  y : number,
 *                  texture: string,
 *                  size : number,
 *                  interval: number,
 *                  vx: number,
 *                  vy: number,
 *                  timer: number,
 *                  status: number
 *                }[], //
 * }} LevelData
 */
