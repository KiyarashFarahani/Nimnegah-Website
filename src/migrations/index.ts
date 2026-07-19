import * as migration_20260716_145312 from './20260716_145312';
import * as migration_20260719_151954 from './20260719_151954';

export const migrations = [
  {
    up: migration_20260716_145312.up,
    down: migration_20260716_145312.down,
    name: '20260716_145312'
  },
  {
    up: migration_20260719_151954.up,
    down: migration_20260719_151954.down,
    name: '20260719_151954'
  },
];
