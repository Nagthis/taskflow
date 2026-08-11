import { PILL, PRIO } from './estilos';

// Describe una fila de historial_tareas como { antes, despues } para
// renderizar: <b>Nombre</b> {antes} <objeto>Tarea</objeto>{despues}
export function describirActividad(item) {
  switch (item.accion) {
    case 'creada':
      return { antes: 'creó', despues: '' };
    case 'estado':
      return item.valorNuevo === 'completada'
        ? { antes: 'completó', despues: '' }
        : { antes: 'movió', despues: ` a ${PILL[item.valorNuevo]?.label || item.valorNuevo}` };
    case 'prioridad':
      return { antes: 'cambió la prioridad de', despues: ` a ${PRIO[item.valorNuevo]?.label || item.valorNuevo}` };
    case 'reasignada':
      return { antes: 'reasignó', despues: item.valorNuevo ? ` a ${item.valorNuevo}` : '' };
    case 'editada':
      return { antes: 'editó', despues: '' };
    case 'eliminada':
      return { antes: 'eliminó', despues: '' };
    default:
      return { antes: 'actualizó', despues: '' };
  }
}

// Compatibilidad: solo el verbo, para quien no necesite el detalle.
export function verboDe(item) {
  return describirActividad(item).antes;
}
