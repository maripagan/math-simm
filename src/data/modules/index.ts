import { ClassroomModule } from '../../classroom/schemas';
import { carnotModule } from './carnot';
import { faradayModule } from './faraday';
import { keplerModule } from './kepler';
import { projectileModule } from './projectile';
import { snellModule } from './snell';

export const CLASSROOM_MODULES: ClassroomModule[] = [
  carnotModule,
  snellModule,
  faradayModule,
  keplerModule,
  projectileModule,
];

export function getClassroomModuleById(
  id: string,
): ClassroomModule | undefined {
  return CLASSROOM_MODULES.find((m) => m.id === id);
}
