import BaseHero from './baseHero'

import PsychPowerHandler from './powers/heroPowers/psych/powerHandler';

export default class physicsMan extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:10, airSpeed:5, jumpStrength:300, rollGroundSpeed:15, rollAirSpeed:9},
    PsychPowerHandler);
  }
}
