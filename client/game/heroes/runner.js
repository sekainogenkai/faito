import BaseHero from './baseHero'

import RunnerPowerHandler from './powers/heroPowers/runner/aHandler';

export const heroName = 'Runner';
export default class Runner extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, heroName,
    {speed:13, airSpeed:10, jumpStrength:200, rollGroundSpeed:20, rollAirSpeed:25},
    {maxHealth:400, maxMana:5000, manaGain:20},
    RunnerPowerHandler);
  }
}
