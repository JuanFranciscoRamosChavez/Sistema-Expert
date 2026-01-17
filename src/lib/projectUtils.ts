/**
 * Funciones de utilidad para cálculos relacionados con proyectos
 */

import { Project, ProjectStatus } from '@/lib/mockData';

/**
 * Cuenta proyectos completados
 */
export const getCompletedProjectsCount = (projects: Project[]): number => {
	return projects.filter(p => p.status === 'completado').length;
};

/**
 * Calcula el avance promedio de todos los proyectos
 */
export const calculateAverageProgress = (projects:  Project[]): number => {
	if (projects.length === 0) return 0;
	
	const totalProgress = projects.reduce((sum, p) => sum + p.avance, 0);
	return Math.round(totalProgress / projects.length);
};

/**
 * Cuenta proyectos por estado
 */
export const countProjectsByStatus = (projects: Project[], status: ProjectStatus): number => {
	return projects.filter(p => p. status === status).length;
};

/**
 * Obtiene proyectos en riesgo (con underscore según el tipo ProjectStatus)
 */
export const getProjectsAtRisk = (projects: Project[]): Project[] => {
	return projects.filter(p => p. status === 'en_riesgo' || p.status === 'retrasado');
};