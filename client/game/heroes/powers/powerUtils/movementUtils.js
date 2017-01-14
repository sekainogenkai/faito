'use strict';

import BABYLON from 'babylonjs';


var freezeHero = function(hero) {
    hero.moveBool = false;
}


module.exports = {'freezeHero': freezeHero,
                 };