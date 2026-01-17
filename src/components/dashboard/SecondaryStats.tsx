import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Project } from '@/lib/mockData';
import { getCompletedProjectsCount, calculateAverageProgress } from '@/lib/projectUtils';
import { formatPercentage } from '@/lib/formatters';

interface SecondaryStatsProps {
	projects: Project[];
	projectsInExecution: number;
}

/**
 * Componente que muestra las 3 tarjetas de estadísticas secundarias
 * (Completados, En Ejecución, Avance Promedio)
 */
export function SecondaryStats({ projects, projectsInExecution }: SecondaryStatsProps) {
	const completedProjects = getCompletedProjectsCount(projects);
	const avgAdvance = calculateAverageProgress(projects);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
			{/* Completados */}
			<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
				<div className="p-3 rounded-lg bg-success/10">
					<CheckCircle className="h-6 w-6 text-success" />
				</div>
				<div>
					<p className="text-2xl font-display font-bold">{completedProjects}</p>
					<p className="text-sm text-muted-foreground">Completados</p>
				</div>
			</div>

			{/* En Ejecución */}
			<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
				<div className="p-3 rounded-lg bg-info/10">
					<Clock className="h-6 w-6 text-info" />
				</div>
				<div>
					<p className="text-2xl font-display font-bold">{projectsInExecution}</p>
					<p className="text-sm text-muted-foreground">En Ejecución</p>
				</div>
			</div>

			{/* Avance Promedio */}
			<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
				<div className="p-3 rounded-lg bg-primary/10">
					<TrendingUp className="h-6 w-6 text-primary" />
				</div>
				<div>
					<p className="text-2xl font-display font-bold">{formatPercentage(avgAdvance)}</p>
					<p className="text-sm text-muted-foreground">Avance Promedio</p>
				</div>
			</div>
		</div>
	);
}