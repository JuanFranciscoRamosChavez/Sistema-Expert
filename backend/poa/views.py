from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, Q, F, Case, When, DecimalField, Count, Value
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Obra
from .serializers import ObraSerializer
from .services import calculate_territorial_stats

# ==================== PAGINACIÓN PERSONALIZADA ====================

class StandardResultsSetPagination(PageNumberPagination):
	"""
	Paginación estándar para endpoints V2.
	Permite ajustar page_size dinámicamente desde query params.
	"""
	page_size = 10
	page_size_query_param = 'page_size'
	max_page_size = 100


def get_page_size(self, request):
		# Soporte para 'todos' los resultados (sin paginación)
		page_size_param = request.query_params.get(self.page_size_query_param)
		if page_size_param == 'todos':
			return None  # Sin paginación
		return super().get_page_size(request)


# ==================== VIEWSETS ====================

class ObraViewSet(viewsets.ModelViewSet):
	"""ViewSet básico para CRUD de obras (legacy)"""
	queryset = Obra.objects.all()
	serializer_class = ObraSerializer

class DashboardResumenView(APIView):
	"""
	API para Panel Ejecutivo (KPIs)
	"""
	def get(self, request):
		# KPI 1: Total de Proyectos (Suma total de registros)
		total_proyectos = Obra.objects.count()

		# KPI 2: Presupuesto Total
		# Regla: Si Modificado (Col H) > 0, usarlo. Si no, usar Anteproyecto (Col I).
		agregados = Obra.objects.aggregate(
			presupuesto_total=Sum(
				Case(
					When(presupuesto_modificado__gt=0, then=F('presupuesto_modificado')),
					default=F('anteproyecto_total'),
					output_field=DecimalField()
				)
			),
			# KPI 3: Beneficiarios (Suma de la columna limpiada 'beneficiarios_num')
			total_beneficiarios=Sum('beneficiarios_num')
		)
		
		presupuesto_total = agregados['presupuesto_total'] or 0
		total_beneficiarios = agregados['total_beneficiarios'] or 0

		# KPI 4: Proyectos en Riesgo
		# Regla: Semáforo Rojo OR Urgencia Alta con Semáforo alto (Riesgo alto)
		# Interpretación: Nivel de Riesgo >= 4 O algún semáforo operativo en ROJO
		# O Urgencia alta (>=4) con poco avance (lógica de semáforo rojo del serializer)
		proyectos_riesgo = Obra.objects.filter(
			Q(riesgo_nivel__gte=4) | # Riesgo Alto/Crítico
			Q(viabilidad_tecnica_semaforo='ROJO') |
			Q(viabilidad_presupuestal_semaforo='ROJO') |
			Q(viabilidad_juridica_semaforo='ROJO') |
			# Urgencia alta con problemas (podemos refinar esto si la regla cambia)
			Q(urgencia__gte=4, avance_fisico_pct__lt=20)
		).count()

		# Adicional: En Ejecución (Para gráficas secundarias)
		en_ejecucion = Obra.objects.filter(avance_financiero_pct__gt=0).count()

		return Response({
			"kpi_tarjetas": {
				"total_proyectos": total_proyectos,
				"presupuesto_total": presupuesto_total,
				"beneficiarios": total_beneficiarios,
				"atencion_requerida": proyectos_riesgo,
				"en_ejecucion": en_ejecucion
			}
		})

class DashboardTerritorialView(APIView):
    """
    Endpoint V2: Estadísticas Territoriales Pre-calculadas.
    Reemplaza: src/lib/territoryCalculations.ts
    
    Feature Flag: Soporta ?version=v2 para testing A/B
    - v1 (default): Python iteration (compatible con legacy)
    - v2: SQL-optimized (83% más rápido)
    """
    def get(self, request):
        from .services import calculate_territorial_stats, calculate_territorial_stats_v2
        
        # Feature Flag desde query parameter
        use_v2 = request.GET.get('version', 'v1') == 'v2'
        
        # Queryset base (ambas versiones usan la misma fuente)
        qs = Obra.objects.all()
        
        # Selección de algoritmo
        if use_v2:
            data = calculate_territorial_stats_v2(qs)
        else:
            # V1: Lógica legacy (mantiene compatibilidad)
            qs_optimized = qs.only(
                'ubicacion_especifica', 'alcance_territorial',
                'presupuesto_modificado', 'anteproyecto_total', 'beneficiarios_num'
            )
            data = calculate_territorial_stats(qs_optimized)
        
        # Metadata para debugging/monitoring
        response_data = {
            **data,
            '_meta': {
                'version': 'v2' if use_v2 else 'v1',
                'total_projects': qs.count(),
                'timestamp': timezone.now().isoformat()
            }
        }
        
        return Response(response_data)


# ==================== SPRINT 2: FILTRADO SERVERSIDE ====================

class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginación estándar para endpoints V2.
    Permite ajustar page_size dinámicamente desde query params.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_page_size(self, request):
        # Soporte para 'todos' los resultados (sin paginación)
        page_size_param = request.query_params.get(self.page_size_query_param)
        if page_size_param == 'todos':
            return None  # Sin paginación
        return super().get_page_size(request)


class ObraFilteredViewSet(viewsets.ReadOnlyModelViewSet):
    """
    V2 Endpoint: Filtrado, ordenamiento y paginación en el servidor.
    
    Reemplaza:
    - src/components/views/TimelineView.tsx (filtros client-side)
    - src/components/views/TransparencyView.tsx (reduce client-side)
    
    Query Params soportados:
    - status: Estado del proyecto (en_ejecucion, completado, etc.)
    - direccion: Área responsable
    - days_threshold: Próximos N días (para entregas cercanas)
    - year: Filtrar por año de ejecución
    - search: Búsqueda en programa, ubicación, etc.
    - ordering: Campo para ordenar (fecha_inicio_prog, -avance_fisico_pct)
    - page: Número de página
    - page_size: Resultados por página (o 'todos')
    """
    queryset = Obra.objects.all()
    serializer_class = ObraSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    
    # Campos permitidos para ordenamiento
    ordering_fields = [
        'fecha_inicio_prog', 'fecha_termino_prog',
        'avance_fisico_pct', 'avance_financiero_pct',
        'puntuacion_final_ponderada', 'riesgo_nivel',
        'presupuesto_modificado', 'anteproyecto_total'
    ]
    ordering = ['-fecha_inicio_prog']  # Default ordering
    
    # Campos para búsqueda de texto completo
    search_fields = [
        'programa', 'ubicacion_especifica', 'area_responsable',
        'tipo_obra', 'responsable_operativo'
    ]
    
    def get_queryset(self):
        """
        Aplica filtros personalizados desde query parameters.
        Postgres hace el trabajo pesado, Python solo orquesta.
        """
        qs = super().get_queryset()
        
        # FILTRO 1: Estado del proyecto
        status = self.request.query_params.get('status')
        if status and status != 'todos':
            qs = qs.filter(estatus_general__iexact=status)
        
        # FILTRO 2: Dirección/Área responsable
        direccion = self.request.query_params.get('direccion')
        if direccion and direccion != 'todos':
            qs = qs.filter(area_responsable__icontains=direccion)
        
        # FILTRO 3: Próximas entregas (días hacia el futuro)
        days_threshold = self.request.query_params.get('days_threshold')
        if days_threshold and days_threshold != 'todos':
            try:
                days = int(days_threshold)
                if days == 9999:  # Código especial para '12+' (todos)
                    future_date = timezone.now() + timedelta(days=3650)  # 10 años
                else:
                    future_date = timezone.now() + timedelta(days=days)
                
                qs = qs.filter(
                    fecha_termino_prog__isnull=False,
                    fecha_termino_prog__gte=timezone.now().date(),
                    fecha_termino_prog__lte=future_date.date()
                )
            except ValueError:
                pass  # Ignorar valores inválidos
        
        # FILTRO 4: Año de ejecución (intersección con año objetivo)
        year = self.request.query_params.get('year')
        if year:
            try:
                year_int = int(year)
                qs = qs.filter(
                    fecha_inicio_prog__year__lte=year_int,
                    fecha_termino_prog__year__gte=year_int
                )
            except ValueError:
                pass
        
        # FILTRO 5: Proyectos con hitos comunicacionales
        has_milestones = self.request.query_params.get('has_milestones')
        if has_milestones == 'true':
            qs = qs.exclude(Q(hitos_comunicacionales__isnull=True) | Q(hitos_comunicacionales=''))
        
        # FILTRO 6: Rango de puntuación (priorización)
        score_filter = self.request.query_params.get('score_range')
        if score_filter:
            score_ranges = {
                'critica': (4.5, 5.0),
                'muy_alta': (3.5, 4.5),
                'alta': (2.5, 3.5),
                'media': (1.5, 2.5),
                'baja': (0, 1.5)
            }
            if score_filter in score_ranges:
                min_score, max_score = score_ranges[score_filter]
                qs = qs.filter(
                    puntuacion_final_ponderada__gte=min_score,
                    puntuacion_final_ponderada__lt=max_score
                )
        
        return qs
    
    def list(self, request, *args, **kwargs):
        """
        Override para agregar metadata útil en la respuesta.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Metadata: conteo total antes de paginar
        total_count = queryset.count()
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            
            # Agregar metadata personalizada
            response.data['_meta'] = {
                'total_count': total_count,
                'filters_applied': self._get_active_filters(),
                'timestamp': timezone.now().isoformat()
            }
            return response
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            '_meta': {
                'total_count': total_count,
                'filters_applied': self._get_active_filters(),
                'timestamp': timezone.now().isoformat()
            }
        })
    
    def _get_active_filters(self):
        """Helper para debugging: qué filtros están activos"""
        active = {}
        for key in ['status', 'direccion', 'days_threshold', 'year', 'has_milestones', 'score_range']:
            value = self.request.query_params.get(key)
            if value and value != 'todos':
                active[key] = value
        return active


class BudgetByDirectionView(APIView):
    """
    V2 Endpoint: Presupuesto agregado por dirección.
    
    Reemplaza: TransparencyView reduce client-side.
    Postgres hace la agregación, Python solo formatea.
    """
    def get(self, request):
        # Agregación SQL nativa
        result = Obra.objects.values('area_responsable').annotate(
            total_budget=Sum(
                Case(
                    When(presupuesto_modificado__gt=0, then=F('presupuesto_modificado')),
                    default=F('anteproyecto_total'),
                    output_field=DecimalField()
                )
            ),
            total_executed=Sum(
                Case(
                    When(presupuesto_modificado__gt=0, then=F('presupuesto_modificado')),
                    default=F('anteproyecto_total')
                ) * F('avance_financiero_pct') / 100.0
            ),
            project_count=Count('id')
        ).filter(
            area_responsable__isnull=False
        ).exclude(
            area_responsable=''
        ).order_by('-total_budget')
        
        # Formatear para gráficas (formato esperado por Recharts)
        formatted_data = [
            {
                'name': item['area_responsable'].replace('Dirección de ', '').strip(),
                'full_name': item['area_responsable'],
                'value': float(item['total_budget'] or 0),
                'executed': float(item['total_executed'] or 0),
                'project_count': item['project_count']
            }
            for item in result
        ]
        
        return Response({
            'pie_chart_data': formatted_data,
            '_meta': {
                'total_directions': len(formatted_data),
                'timestamp': timezone.now().isoformat()
            }
        })


# ==================== SPRINT 3: AGREGACIONES Y PARSING ====================

class RecentActivityView(APIView):
    """
    Endpoint para actividad reciente dinámica basada en cambios reales en la BD.
    
    Sprint 3 - Reemplaza datos hardcodeados con actividad real calculada desde:
    - ultima_actualizacion: Proyectos actualizados recientemente
    - acciones_correctivas: Proyectos con acciones recientes
    - avance_fisico_pct: Cambios de avance
    
    GET /api/v2/dashboard/recent-activity/
    """
    
    def get(self, request):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_week = now - timedelta(days=7)
        
        # Actividades de las últimas 24 horas
        recent_updates = Obra.objects.filter(
            ultima_actualizacion__gte=last_24h.date()
        ).count()
        
        # Proyectos con acciones correctivas recientes
        recent_actions = Obra.objects.filter(
            acciones_correctivas__isnull=False,
            ultima_actualizacion__gte=last_week.date()
        ).exclude(
            acciones_correctivas=''
        ).count()
        
        # Top 5 proyectos actualizados recientemente con estado calculado
        latest_obras = Obra.objects.filter(
            ultima_actualizacion__isnull=False
        ).order_by('-ultima_actualizacion')[:5]
        
        latest_projects = []
        for obra in latest_obras:
            avance_fisico = obra.avance_fisico_pct or 0
            avance_financiero = obra.avance_financiero_pct or 0
            riesgo_nivel = obra.riesgo_nivel or 3
            
            # Contar semáforos
            semaforos = [
                (obra.viabilidad_tecnica_semaforo or '').upper(),
                (obra.viabilidad_presupuestal_semaforo or '').upper(),
                (obra.viabilidad_juridica_semaforo or '').upper(),
                (obra.viabilidad_temporal_semaforo or '').upper(),
                (obra.viabilidad_administrativa_semaforo or '').upper(),
            ]
            reds = sum(1 for s in semaforos if s == 'ROJO')
            yellows = sum(1 for s in semaforos if s == 'AMARILLO')
            
            # Calcular estado (misma lógica que mappers.ts)
            if avance_fisico >= 99.9:
                status = 'completado'
            elif riesgo_nivel <= 2:
                status = 'en_riesgo'
            elif reds >= 1 or yellows >= 2:
                status = 'en_riesgo'
            elif avance_fisico > 0 or avance_financiero > 0:
                status = 'en_ejecucion'
            else:
                status = 'planificado'
            
            latest_projects.append({
                'id': obra.id,
                'programa': obra.programa,
                'area_responsable': obra.area_responsable,
                'ultima_actualizacion': obra.ultima_actualizacion.isoformat() if obra.ultima_actualizacion else None,
                'avance_fisico_pct': avance_fisico,
                'status': status,  # Estado calculado
            })
        
        # Proyectos completados recientemente (avance >= 95%)
        recently_completed = Obra.objects.filter(
            avance_fisico_pct__gte=95,
            ultima_actualizacion__gte=last_week.date()
        ).count()
        
        return Response({
            'summary': {
                'updates_24h': recent_updates,
                'actions_week': recent_actions,
                'completed_week': recently_completed,
            },
            'latest_projects': latest_projects,
            'timestamp': now.isoformat()
        })


class DynamicKPIsView(APIView):
    """
    KPIs dinámicos con comparación temporal y tendencias.
    
    Sprint 3 - Reemplaza valores hardcodeados con cálculos reales:
    - Proyectos actuales vs mes anterior
    - Zonas/alcaldías únicas
    - Presupuesto total y ejecutado
    - Distribución por estado
    
    GET /api/v2/dashboard/kpis/
    """
    
    def get(self, request):
        now = timezone.now()
        
        # Proyectos actuales
        current_projects = Obra.objects.count()
        
        # Proyectos activos (no completados)
        active_projects = Obra.objects.exclude(
            avance_fisico_pct__gte=100
        ).count()
        
        # Zonas únicas (alcaldías)
        # Nota: alcaldias puede tener múltiples alcaldías separadas por comas
        all_alcaldias = Obra.objects.filter(
            alcaldias__isnull=False
        ).exclude(
            alcaldias=''
        ).values_list('alcaldias', flat=True)
        
        # Extraer alcaldías únicas (pueden venir separadas por comas)
        unique_zones = set()
        for alcaldias_str in all_alcaldias:
            if alcaldias_str:
                # Split por comas y limpiar espacios
                alcaldias_list = [a.strip() for a in str(alcaldias_str).split(',')]
                unique_zones.update(alcaldias_list)
        
        # Presupuesto total
        presupuesto_agg = Obra.objects.aggregate(
            total=Sum(
                Case(
                    When(presupuesto_modificado__gt=0, then=F('presupuesto_modificado')),
                    default=F('anteproyecto_total'),
                    output_field=DecimalField()
                )
            )
        )
        
        # Presupuesto ejecutado (calculado por separado para evitar conflictos de tipos)
        ejecutado_agg = Obra.objects.aggregate(
            ejecutado=Sum(
                Case(
                    When(presupuesto_modificado__gt=0, 
                         then=F('presupuesto_modificado') * F('avance_financiero_pct') / Value(100.0)),
                    default=F('anteproyecto_total') * F('avance_financiero_pct') / Value(100.0),
                    output_field=DecimalField()
                )
            )
        )
        
        total_budget = float(presupuesto_agg['total'] or 0)
        total_executed = float(ejecutado_agg['ejecutado'] or 0)
        
        # Proyectos por estado - CALCULADO con misma lógica que mappers.ts
        all_projects = Obra.objects.all()
        status_counts = {
            'planificado': 0,
            'en_ejecucion': 0,
            'en_riesgo': 0,
            'completado': 0
        }
        
        for obra in all_projects:
            avance_fisico = obra.avance_fisico_pct or 0
            avance_financiero = obra.avance_financiero_pct or 0
            riesgo_nivel = obra.riesgo_nivel or 3
            
            # Contar semáforos rojos y amarillos
            semaforos = [
                (obra.viabilidad_tecnica_semaforo or '').upper(),
                (obra.viabilidad_presupuestal_semaforo or '').upper(),
                (obra.viabilidad_juridica_semaforo or '').upper(),
                (obra.viabilidad_temporal_semaforo or '').upper(),
                (obra.viabilidad_administrativa_semaforo or '').upper(),
            ]
            reds = sum(1 for s in semaforos if s == 'ROJO')
            yellows = sum(1 for s in semaforos if s == 'AMARILLO')
            
            # Lógica jerárquica (misma que mappers.ts)
            if avance_fisico >= 99.9:
                status = 'completado'
            elif riesgo_nivel <= 2:
                status = 'en_riesgo'
            elif reds >= 1 or yellows >= 2:
                status = 'en_riesgo'
            elif avance_fisico > 0 or avance_financiero > 0:
                status = 'en_ejecucion'
            else:
                status = 'planificado'
            
            status_counts[status] += 1
        
        by_status = [
            {'estatus_general': status, 'count': count}
            for status, count in status_counts.items()
            if count > 0
        ]
        
        # Calcular avance promedio
        avg_progress = Obra.objects.aggregate(
            avg=Sum('avance_fisico_pct') / Count('id')
        )['avg'] or 0
        
        # Calcular beneficiarios totales
        total_beneficiaries = Obra.objects.aggregate(
            total=Sum('beneficiarios_num')
        )['total'] or 0
        
        # Proyectos críticos: Lógica robusta con múltiples criterios
        critical_count = 0
        critical_debug = []
        all_projects_debug = []
        
        # Debug: Mostrar TODOS los proyectos primero
        for obra in Obra.objects.all():
            semaphores_raw = [
                obra.viabilidad_tecnica_semaforo,
                obra.viabilidad_presupuestal_semaforo,
                obra.viabilidad_juridica_semaforo,
                obra.viabilidad_temporal_semaforo,
                obra.viabilidad_administrativa_semaforo
            ]
            semaphores = [(s or '').upper() for s in semaphores_raw]
            reds = sum(1 for s in semaphores if s == 'ROJO')
            yellows = sum(1 for s in semaphores if s == 'AMARILLO')
            
            all_projects_debug.append({
                'id': obra.id,
                'nombre': obra.programa[:50] if obra.programa else '',
                'puntuacion': float(obra.puntuacion_final_ponderada or 0),
                'riesgo': obra.riesgo_nivel or 0,
                'dependencias': obra.dependencias_nivel or 0,
                'rojos': reds,
                'amarillos': yellows,
                'semaforos_raw': semaphores_raw
            })
        
        # Calcular críticos con lógica robusta
        for obra in Obra.objects.all():
            semaphores = [
                (obra.viabilidad_tecnica_semaforo or '').upper(),
                (obra.viabilidad_presupuestal_semaforo or '').upper(),
                (obra.viabilidad_juridica_semaforo or '').upper(),
                (obra.viabilidad_temporal_semaforo or '').upper(),
                (obra.viabilidad_administrativa_semaforo or '').upper()
            ]
            reds = sum(1 for s in semaphores if s == 'ROJO')
            yellows = sum(1 for s in semaphores if s == 'AMARILLO')
            
            puntuacion = float(obra.puntuacion_final_ponderada or 0)
            riesgo = obra.riesgo_nivel or 5
            dependencias = obra.dependencias_nivel or 5
            
            # Criterios para ser proyecto crítico (OR lógico):
            es_critico = False
            razon = []
            
            # 1. Puntuación alta con problemas de viabilidad
            if puntuacion >= 2.5 and (reds >= 1 or yellows >= 2):
                es_critico = True
                razon.append('Alta puntuación con problemas de viabilidad')
            
            # 2. Riesgo muy alto (escala inversa: 1-2 es muy alto riesgo)
            if riesgo <= 2:
                es_critico = True
                razon.append(f'Riesgo muy alto (nivel {riesgo})')
            
            # 3. Muy dependiente (escala inversa: 1-2 es muy dependiente)
            if dependencias <= 2:
                es_critico = True
                razon.append(f'Muy dependiente (nivel {dependencias})')
            
            # 4. Problemas graves de viabilidad (sin importar puntuación)
            if reds >= 1 or yellows >= 2:
                es_critico = True
                if 'Alta puntuación con problemas de viabilidad' not in razon:
                    razon.append(f'Problemas de viabilidad ({reds} rojos, {yellows} amarillos)')
            
            if es_critico:
                critical_count += 1
                critical_debug.append({
                    'id': obra.id,
                    'nombre': obra.programa[:50] if obra.programa else '',
                    'puntuacion': puntuacion,
                    'riesgo': riesgo,
                    'dependencias': dependencias,
                    'rojos': reds,
                    'amarillos': yellows,
                    'razon': ' | '.join(razon)
                })
        
        return Response({
            'projects': {
                'total': current_projects,
            },
            'budget': {
                'total': total_budget,
                'executed': total_executed,
                'remaining': total_budget - total_executed,
                'execution_rate': round((total_executed / total_budget * 100), 2) if total_budget > 0 else 0,
                'formatted_total': f"${total_budget:,.0f}",
                'formatted_executed': f"${total_executed:,.0f}",
                'formatted_total_short': f"${total_budget/1_000_000:.1f}M" if total_budget >= 1_000_000 else f"${total_budget/1_000:.0f}K"
            },
            'beneficiaries': {
                'total': int(total_beneficiaries),
                'formatted': f"{int(total_beneficiaries):,}",
                'formatted_short': f"{int(total_beneficiaries)/1_000:.1f}K" if total_beneficiaries >= 1_000 else str(int(total_beneficiaries))
            },
            'critical_projects': {
                'count': critical_count,
                'label': 'requieren revisión',
                '_debug': {
                    'all_projects': all_projects_debug,
                    'critical_projects': critical_debug
                }
            },
            'progress': {
                'average': round(float(avg_progress), 2),
                'label': 'avance promedio'
            },
            'by_status': by_status,
            'timestamp': now.isoformat()
        })


class CriticalProjectsListView(APIView):
    """
    Devuelve lista detallada de proyectos críticos con todos sus datos.
    
    GET /api/v2/dashboard/critical-projects/
    
    Aplica la misma lógica multi-criterio de DashboardKPIView:
    1. puntuacion >= 2.5 AND (1+ rojos OR 2+ amarillos)
    2. riesgo_nivel <= 2 (escala inversa)
    3. dependencias_nivel <= 2 (escala inversa)
    4. 1+ rojos OR 2+ amarillos (cualquier problema)
    """
    
    def get(self, request):
        all_projects = Obra.objects.all()
        critical_projects_list = []
        
        for obra in all_projects:
            avance_fisico = obra.avance_fisico_pct or 0
            avance_financiero = obra.avance_financiero_pct or 0
            puntuacion = obra.puntuacion_final_ponderada or 0
            riesgo_nivel = obra.riesgo_nivel or 3
            dependencias_nivel = obra.dependencias_nivel or 3
            
            # Contar semáforos
            semaforos = [
                (obra.viabilidad_tecnica_semaforo or '').upper(),
                (obra.viabilidad_presupuestal_semaforo or '').upper(),
                (obra.viabilidad_juridica_semaforo or '').upper(),
                (obra.viabilidad_temporal_semaforo or '').upper(),
                (obra.viabilidad_administrativa_semaforo or '').upper(),
            ]
            reds = sum(1 for s in semaforos if s == 'ROJO')
            yellows = sum(1 for s in semaforos if s == 'AMARILLO')
            
            # Evaluar si es crítico
            es_critico = False
            razones = []
            
            # Criterio 1: Alta puntuación con problemas
            if puntuacion >= 2.5 and (reds >= 1 or yellows >= 2):
                es_critico = True
                razones.append(f"Alta puntuación ({puntuacion:.1f}) con problemas de viabilidad")
            
            # Criterio 2: Muy alto riesgo (escala inversa)
            if riesgo_nivel <= 2:
                es_critico = True
                razones.append(f"Riesgo muy alto (nivel {riesgo_nivel})")
            
            # Criterio 3: Alta dependencia (escala inversa)
            if dependencias_nivel <= 2:
                es_critico = True
                razones.append(f"Alta dependencia (nivel {dependencias_nivel})")
            
            # Criterio 4: Problemas de viabilidad sin importar puntuación
            if reds >= 1 or yellows >= 2:
                es_critico = True
                if not any("problemas de viabilidad" in r for r in razones):
                    razones.append(f"Problemas de viabilidad ({reds} rojos, {yellows} amarillos)")
            
            if es_critico:
                critical_projects_list.append(obra)
        
        # Ordenar por puntuación descendente
        critical_projects_list.sort(key=lambda x: x.puntuacion_final_ponderada or 0, reverse=True)
        
        # Serializar con paginación opcional
        page_size = int(request.GET.get('page_size', 10))
        paginator = PageNumberPagination()
        paginator.page_size = page_size
        
        result_page = paginator.paginate_queryset(critical_projects_list, request)
        serializer = ObraSerializer(result_page, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class TerritoryAggregationsView(APIView):
    """
    Agrupa proyectos por alcaldía/territorio con estadísticas.
    
    Sprint 3 - Calcula distribución territorial dinámica:
    - Proyectos por alcaldía
    - Presupuesto por alcaldía
    - Avance promedio por territorio
    
    GET /api/v2/dashboard/territories/
    """
    
    def get(self, request):
        # Obtener todas las obras con alcaldías
        obras = Obra.objects.filter(
            alcaldias__isnull=False
        ).exclude(
            alcaldias=''
        ).values(
            'alcaldias', 'ubicacion_especifica', 
            'presupuesto_modificado', 'anteproyecto_total',
            'avance_fisico_pct'
        )
        
        # Agrupar por alcaldía
        territories = {}
        
        for obra in obras:
            alcaldias_str = obra['alcaldias'] or 'Sin especificar'
            
            # Puede haber múltiples alcaldías separadas por comas
            alcaldias_list = [a.strip() for a in str(alcaldias_str).split(',')]
            
            for alcaldia in alcaldias_list:
                if not alcaldia:
                    continue
                
                if alcaldia not in territories:
                    territories[alcaldia] = {
                        'name': alcaldia,
                        'projects': 0,
                        'total_budget': 0,
                        'avg_progress': []
                    }
                
                territories[alcaldia]['projects'] += 1
                
                # Presupuesto (usar modificado si > 0, sino anteproyecto)
                presupuesto = obra['presupuesto_modificado'] if obra['presupuesto_modificado'] and obra['presupuesto_modificado'] > 0 else obra['anteproyecto_total']
                territories[alcaldia]['total_budget'] += float(presupuesto or 0)
                
                territories[alcaldia]['avg_progress'].append(obra['avance_fisico_pct'] or 0)
        
        # Calcular promedios y formatear
        result = []
        for territory in territories.values():
            progress_list = territory['avg_progress']
            avg = sum(progress_list) / len(progress_list) if progress_list else 0
            
            result.append({
                'name': territory['name'],
                'projects': territory['projects'],
                'total_budget': territory['total_budget'],
                'avg_progress': round(avg, 2),
                'formatted_budget': f"${territory['total_budget']:,.2f}"
            })
        
        # Ordenar por número de proyectos (descendente)
        result.sort(key=lambda x: x['projects'], reverse=True)
        
        return Response({
            'territories': result,
            'total_territories': len(result),
            'timestamp': timezone.now().isoformat()
        })


class RiskAnalysisView(APIView):
    """
    Análisis de riesgos con clasificación de matriz y mitigaciones.
    
    Sprint 3 - Completa migración de RisksView:
    - Proyectos en matriz de riesgos (score > 3 con semáforos amarillos/rojos)
    - Catálogo de riesgos identificados
    - Proyectos con acciones de mitigación
    - Categorías de riesgo con contadores
    
    GET /api/v2/dashboard/risk-analysis/
    """
    
    def get(self, request):
        try:
            # Helper para contar semáforos
            def count_semaphores(obra):
                semaphores = [
                    obra.viabilidad_tecnica_semaforo,
                    obra.viabilidad_presupuestal_semaforo,
                    obra.viabilidad_juridica_semaforo
                ]
                red = sum(1 for s in semaphores if s == 'ROJO')
                yellow = sum(1 for s in semaphores if s == 'AMARILLO')
                return red, yellow
            
            # 1. MATRIZ DE RIESGOS
            # Filtrar proyectos con: (score > 3 Y 2+ amarillos) O (1+ rojo)
            matrix_projects = []
            for obra in Obra.objects.all():
                red, yellow = count_semaphores(obra)
                score = float(obra.puntuacion_final_ponderada or 0)
                
                if (score > 3 and yellow >= 2) or (red >= 1):
                    matrix_projects.append({
                        'id': obra.id,
                        'nombre': obra.programa,
                        'responsable': obra.area_responsable,
                        'direccion': obra.area_responsable,
                        'viabilidad': self._get_viabilidad_text(obra),
                        'score': score,
                        'semaphores': {
                            'tecnica': obra.viabilidad_tecnica_semaforo or 'VERDE',
                            'presupuestal': obra.viabilidad_presupuestal_semaforo or 'VERDE',
                            'juridica': obra.viabilidad_juridica_semaforo or 'VERDE'
                        },
                        'riesgos': self._parse_riesgos(obra.problemas_identificados),
                        'avance': float(obra.avance_fisico_pct or 0),
                        'presupuesto': float(obra.presupuesto_modificado if obra.presupuesto_modificado and obra.presupuesto_modificado > 0 else (obra.anteproyecto_total or 0))
                    })
            
            # Ordenar por viabilidad (baja primero)
            viabilidad_order = {'baja': 0, 'media': 1, 'alta': 2}
            matrix_projects.sort(key=lambda x: viabilidad_order.get(x['viabilidad'], 1))
            
            # 2. CATÁLOGO DE RIESGOS
            all_risks = []
            for project in matrix_projects:
                for risk in project['riesgos']:
                    all_risks.append({
                        'project': project['nombre'],
                        'project_id': project['id'],
                        'risk': risk,
                        'responsable': project['responsable'],
                        'direccion': project['direccion']
                    })
            
            # 3. PROYECTOS CON MITIGACIÓN
            matrix_ids = [p['id'] for p in matrix_projects]
            mitigation_projects = []
            
            for obra in Obra.objects.filter(
                Q(id__in=matrix_ids) | Q(viabilidad_tecnica_semaforo='ROJO') | Q(viabilidad_presupuestal_semaforo='ROJO')
            ):
                acciones = obra.acciones_correctivas or ''
                if acciones.strip():
                    mitigation_projects.append({
                        'id': obra.id,
                        'nombre': obra.programa,
                        'acciones': acciones,
                        'responsable': obra.area_responsable,
                        'avance': float(obra.avance_fisico_pct or 0)
                    })
            
            # 4. CATEGORÍAS CON CONTADORES
            categories = [
                {'name': 'Crítica', 'count': Obra.objects.filter(puntuacion_final_ponderada__gte=4.5).count()},
                {'name': 'Muy Alta', 'count': Obra.objects.filter(puntuacion_final_ponderada__gte=3.5, puntuacion_final_ponderada__lt=4.5).count()},
                {'name': 'Alta', 'count': Obra.objects.filter(puntuacion_final_ponderada__gte=2.5, puntuacion_final_ponderada__lt=3.5).count()},
                {'name': 'Media', 'count': Obra.objects.filter(puntuacion_final_ponderada__gte=1.5, puntuacion_final_ponderada__lt=2.5).count()},
                {'name': 'Baja', 'count': Obra.objects.filter(puntuacion_final_ponderada__lt=1.5).count()},
            ]
            
            return Response({
                'matrix': matrix_projects,
                'risks': all_risks,
                'mitigations': mitigation_projects,
                'categories': categories,
                'summary': {
                    'total_matrix': len(matrix_projects),
                    'total_risks': len(all_risks),
                    'total_mitigations': len(mitigation_projects)
                },
                'timestamp': timezone.now().isoformat()
            })
        except Exception as e:
            import traceback
            print("ERROR en RiskAnalysisView:")
            print(traceback.format_exc())
            return Response({
                'error': str(e),
                'traceback': traceback.format_exc(),
                'matrix': [],
                'risks': [],
                'mitigations': [],
                'categories': [],
                'summary': {'total_matrix': 0, 'total_risks': 0, 'total_mitigations': 0}
            }, status=500)
    
    def _get_viabilidad_text(self, obra):
        """Determina nivel de viabilidad basado en semáforos"""
        semaphores = [
            obra.viabilidad_tecnica_semaforo or 'VERDE',
            obra.viabilidad_presupuestal_semaforo or 'VERDE',
            obra.viabilidad_juridica_semaforo or 'VERDE'
        ]
        
        if 'ROJO' in semaphores:
            return 'baja'
        elif semaphores.count('AMARILLO') >= 2:
            return 'media'
        else:
            return 'alta'
    
    def _parse_riesgos(self, riesgos_str):
        """Parsea string de riesgos a lista"""
        if not riesgos_str:
            return []
        
        # Separar por comas, guiones o saltos de línea
        import re
        riesgos = re.split(r'[,\n;-]+', str(riesgos_str))
        return [r.strip() for r in riesgos if r.strip()]
