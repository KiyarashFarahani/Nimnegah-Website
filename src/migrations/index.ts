import * as migration_20260616_065447 from './20260616_065447';
import * as migration_20260708_000000 from './20260708_000000';
import * as migration_20260709_000000 from './20260709_000000';

export const migrations = [
  {
    up: migration_20260616_065447.up,
    down: migration_20260616_065447.down,
    name: '20260616_065447'
  },
  {
    up: migration_20260708_000000.up,
    down: migration_20260708_000000.down,
    name: '20260708_000000'
  },
  {
    up: migration_20260709_000000.up,
    down: migration_20260709_000000.down,
    name: '20260709_000000'
  },
];
