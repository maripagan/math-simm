import { ClassroomModule } from '../../classroom/schemas';
import { carnotModule } from './carnot';
import { dopplerModule } from './doppler';
import { eulerModule } from './euler';
import { faradayModule } from './faraday';
import { keplerModule } from './kepler';
import { mruvModule } from './mruv';
import { parabolaTangentModule } from './parabolaTangent';
import { photoelectricModule } from './photoelectric';
import { projectileModule } from './projectile';
import { snellModule } from './snell';
import { statisticsDispersionModule } from './statistics';

export const CLASSROOM_MODULES: ClassroomModule[] = [
  projectileModule,
  mruvModule,
  keplerModule,
  carnotModule,
  snellModule,
  dopplerModule,
  faradayModule,
  photoelectricModule,
  eulerModule,
  parabolaTangentModule,
  statisticsDispersionModule,
];

export function getClassroomModuleById(
  id: string,
): ClassroomModule | undefined {
  return CLASSROOM_MODULES.find((m) => m.id === id);
}

export function getClassroomModulesByThemeTag(tag: string): ClassroomModule[] {
  const normalized = tag.trim().toLowerCase();
  if (!normalized) return CLASSROOM_MODULES;
  return CLASSROOM_MODULES.filter(
    (m) =>
      m.themeTags.some((t) => t.toLowerCase().includes(normalized)) ||
      m.interdisciplinaryBridges.some((b) =>
        b.themeTag.toLowerCase().includes(normalized),
      ),
  );
}

export {
  carnotModule,
  dopplerModule,
  eulerModule,
  faradayModule,
  keplerModule,
  mruvModule,
  parabolaTangentModule,
  photoelectricModule,
  projectileModule,
  snellModule,
  statisticsDispersionModule,
};
