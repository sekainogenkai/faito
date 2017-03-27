import BaseHero from './baseHero'

import PsychPowerHandler from './powers/heroPowers/psych/aHandler';

export default class Psych extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:9, airSpeed:7, jumpStrength:100, rollGroundSpeed:15, rollAirSpeed:9},
    PsychPowerHandler);
  }
}
