'use strict';

import BABYLON from 'babylonjs';


var freezeHero = function(hero) {
    hero.body.velocity = new BABYLON.Vector3(0,0,0);
}


module.exports = {'freezeHero': freezeHero,
                 };