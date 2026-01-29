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
from .utils import normalizar_texto

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
    filter_backends = [filters.OrderingFilter]  # Solo ordenamiento, búsqueda manual
    
    # Campos permitidos para ordenamiento
    ordering_fields = [
        'fecha_inicio_prog', 'fecha_termino_prog',
        'avance_fisico_pct', 'avance_financiero_pct',
        'puntuacion_final_ponderada', 'riesgo_nivel',
        'presupuesto_modificado', 'anteproyecto_total'
    ]
    ordering = ['-fecha_inicio_prog']  # Default ordering
    
    def _generate_search_variants(self, term):
        """
        Genera variantes de búsqueda con y sin acentos.
        Ejemplo: "línea" -> ["linea", "línea"]
        """
        variants = [term.strip()]  # Original
        
        # Agregar versión sin acentos
        normalized = normalizar_texto(term)
        if normalized != term.lower():
            variants.append(normalized)
        
        # Agregar variantes comunes de palabras con acentos
        replacements = {
            'a': ['á', 'a'], 'e': ['é', 'e'], 'i': ['í', 'i'],
            'o': ['ó', 'o'], 'u': ['ú', 'ü', 'u'], 'n': ['ñ', 'n']
        }
        
        # Si el término tiene letras que podrían tener acento, agregar esas variantes
        term_lower = term.lower()
        for base, variants_list in replacements.items():
            if base in term_lower:
                # Crear variante con acento
                for variant in variants_list:
                    if variant != base:
                        new_variant = term_lower.replace(base, variant)
                        if new_variant not in variants:
                            variants.append(new_variant)
        
        return list(set(variants))  # Eliminar duplicados
    
    def get_queryset(self):
        """
        Aplica filtros personalizados desde query parameters.
        Incluye búsqueda flexible que ignora acentos y errores ortográficos.
        """
        qs = super().get_queryset()
        
        # BÚSQUEDA FLEXIBLE (antes de otros filtros para optimizar)
        search_term = self.request.query_params.get('search')
        if search_term:
            # Normalizar término de búsqueda (sin acentos, minúsculas)
            search_normalized = normalizar_texto(search_term)
            
            # ESTRATEGIA: Como SQLite no tiene unaccent, buscamos múltiples variantes
            # del término con y sin acentos comunes
            search_variants = self._generate_search_variants(search_term)
            
            # Campos donde buscar
            search_query = Q()
            search_fields = [
                'programa', 'ubicacion_especifica', 'area_responsable',
                'tipo_obra', 'responsable_operativo'
            ]
            
            # Buscar cada variante en cada campo
            for variant in search_variants:
                for field in search_fields:
                    search_query |= Q(**{f'{field}__icontains': variant})
            
            qs = qs.filter(search_query).distinct()
        
        # FILTRO 1: Estado del proyecto
        # IMPORTANTE: Como estatus_general se calcula dinámicamente en el serializer,
        # necesitamos aplicar la misma lógica aquí usando filtros de Django
        status = self.request.query_params.get('status')
        if status and status != 'todos' and status != 'all':
            status_normalized = status.lower().strip().replace(' ', '_')
            
            # Aplicar lógica de cálculo de estatus usando Query expressions
            from datetime import date
            today = date.today()
            
            if status_normalized == 'completado':
                # Avance físico >= 100%
                qs = qs.filter(avance_fisico_pct__gte=100)
            
            elif status_normalized == 'en_riesgo':
                # Riesgo > 3 y no completado
                qs = qs.filter(riesgo_nivel__gt=3, avance_fisico_pct__lt=100)
            
            elif status_normalized == 'retrasado':
                # Fecha inicio real pasada, sin avance, no en riesgo, no completado
                qs = qs.filter(
                    fecha_inicio_real__lte=today,
                    avance_fisico_pct=0,
                    riesgo_nivel__lte=3
                )
            
            elif status_normalized == 'en_ejecucion':
                # Tiene avance > 0, no completado, no en riesgo alto
                qs = qs.filter(
                    avance_fisico_pct__gt=0,
                    avance_fisico_pct__lt=100,
                    riesgo_nivel__lte=3
                )
            
            elif status_normalized == 'planificado':
                # Sin fecha inicio real o fecha futura, sin avance
                qs = qs.filter(
                    Q(fecha_inicio_real__isnull=True) | Q(fecha_inicio_real__gt=today),
                    avance_fisico_pct=0,
                    riesgo_nivel__lte=3
                )
        
        # FILTRO 2: Dirección/Área responsable
        direccion = self.request.query_params.get('direccion')
        if direccion and direccion != 'todos':
            qs = qs.filter(area_responsable__icontains=direccion)
        
        # FILTRO 3: Eje Institucional
        eje_institucional = self.request.query_params.get('eje_institucional')
        if eje_institucional and eje_institucional != 'todos':
            qs = qs.filter(eje_institucional__icontains=eje_institucional)
        
        # FILTRO 4: Próximas entregas (días hacia el futuro)
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
        
        # FILTRO 7: Viabilidad global (baja, media, alta)
        viabilidad_filter = self.request.query_params.get('viabilidad')
        if viabilidad_filter:
            # Soporta múltiples valores separados por coma: "baja,media"
            viabilidades = [v.strip() for v in viabilidad_filter.split(',')]
            
            # Implementación SQL eficiente usando CASE/WHEN
            # Lógica: 1+ rojo = baja, 2+ amarillo = media, else alta
            # (Q ya está importado al inicio del archivo)
            
            viabilidad_conditions = []
            if 'baja' in viabilidades:
                # 1 o más semáforos ROJOS
                viabilidad_conditions.append(
                    Q(viabilidad_tecnica_semaforo__iexact='rojo') |
                    Q(viabilidad_presupuestal_semaforo__iexact='rojo') |
                    Q(viabilidad_juridica_semaforo__iexact='rojo') |
                    Q(viabilidad_temporal_semaforo__iexact='rojo') |
                    Q(viabilidad_administrativa_semaforo__iexact='rojo')
                )
            
            if 'media' in viabilidades:
                # 2+ AMARILLOS y NO ROJOS
                viabilidad_conditions.append(
                    ~Q(viabilidad_tecnica_semaforo__iexact='rojo') &
                    ~Q(viabilidad_presupuestal_semaforo__iexact='rojo') &
                    ~Q(viabilidad_juridica_semaforo__iexact='rojo') &
                    ~Q(viabilidad_temporal_semaforo__iexact='rojo') &
                    ~Q(viabilidad_administrativa_semaforo__iexact='rojo') &
                    (
                        (Q(viabilidad_tecnica_semaforo__iexact='amarillo') & Q(viabilidad_presupuestal_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_tecnica_semaforo__iexact='amarillo') & Q(viabilidad_juridica_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_tecnica_semaforo__iexact='amarillo') & Q(viabilidad_temporal_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_tecnica_semaforo__iexact='amarillo') & Q(viabilidad_administrativa_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_presupuestal_semaforo__iexact='amarillo') & Q(viabilidad_juridica_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_presupuestal_semaforo__iexact='amarillo') & Q(viabilidad_temporal_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_presupuestal_semaforo__iexact='amarillo') & Q(viabilidad_administrativa_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_juridica_semaforo__iexact='amarillo') & Q(viabilidad_temporal_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_juridica_semaforo__iexact='amarillo') & Q(viabilidad_administrativa_semaforo__iexact='amarillo')) |
                        (Q(viabilidad_temporal_semaforo__iexact='amarillo') & Q(viabilidad_administrativa_semaforo__iexact='amarillo'))
                    )
                )
            
            if 'alta' in viabilidades:
                # Todos VERDES (no rojos ni suficientes amarillos)
                viabilidad_conditions.append(
                    ~Q(viabilidad_tecnica_semaforo__iexact='rojo') &
                    ~Q(viabilidad_presupuestal_semaforo__iexact='rojo') &
                    ~Q(viabilidad_juridica_semaforo__iexact='rojo') &
                    ~Q(viabilidad_temporal_semaforo__iexact='rojo') &
                    ~Q(viabilidad_administrativa_semaforo__iexact='rojo') &
                    (
                        # Menos de 2 amarillos
                        ~(
                            (Q(viabilidad_tecnica_semaforo__iexact='amarillo') & Q(viabilidad_presupuestal_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_tecnica_semaforo__iexact='amarillo') & Q(viabilidad_juridica_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_tecnica_semaforo__iexact='amarillo') & Q(viabilidad_temporal_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_tecnica_semaforo__iexact='amarillo') & Q(viabilidad_administrativa_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_presupuestal_semaforo__iexact='amarillo') & Q(viabilidad_juridica_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_presupuestal_semaforo__iexact='amarillo') & Q(viabilidad_temporal_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_presupuestal_semaforo__iexact='amarillo') & Q(viabilidad_administrativa_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_juridica_semaforo__iexact='amarillo') & Q(viabilidad_temporal_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_juridica_semaforo__iexact='amarillo') & Q(viabilidad_administrativa_semaforo__iexact='amarillo')) |
                            (Q(viabilidad_temporal_semaforo__iexact='amarillo') & Q(viabilidad_administrativa_semaforo__iexact='amarillo'))
                        )
                    )
                )
            
            if viabilidad_conditions:
                # Combinar condiciones con OR
                combined_q = viabilidad_conditions[0]
                for condition in viabilidad_conditions[1:]:
                    combined_q |= condition
                qs = qs.filter(combined_q)
        
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
        for key in ['status', 'direccion', 'eje_institucional', 'days_threshold', 'year', 'has_milestones', 'score_range', 'viabilidad']:
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
        from .utils import calcular_estatus_proyecto
        
        latest_obras = Obra.objects.filter(
            ultima_actualizacion__isnull=False
        ).order_by('-ultima_actualizacion')[:5]
        
        latest_projects = []
        for obra in latest_obras:
            status = calcular_estatus_proyecto(obra)
            
            latest_projects.append({
                'id': obra.id,
                'programa': obra.programa,
                'area_responsable': obra.area_responsable,
                'ultima_actualizacion': obra.ultima_actualizacion.isoformat() if obra.ultima_actualizacion else None,
                'avance_fisico_pct': obra.avance_fisico_pct or 0,
                'status': status,
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
        
        # Proyectos por estado - Usando función centralizada
        from .utils import calcular_estatus_proyecto
        
        all_projects = Obra.objects.all()
        status_counts = {
            'planificado': 0,
            'en_ejecucion': 0,
            'en_riesgo': 0,
            'retrasado': 0,
            'completado': 0
        }
        
        for obra in all_projects:
            status = calcular_estatus_proyecto(obra)
            status_counts[status] = status_counts.get(status, 0) + 1
        
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
        
        # Calcular proyectos de atención prioritaria
        # Criterio simplificado: Puntuación > 3 Y Viabilidad Baja o Media
        from .utils import calcular_viabilidad_global
        
        for obra in Obra.objects.all():
            puntuacion = float(obra.puntuacion_final_ponderada or 0)
            viabilidad = calcular_viabilidad_global(obra)
            
            # Criterio de atención prioritaria:
            # Puntuación > 3 (Alta prioridad) Y viabilidad comprometida
            es_critico = False
            razon = []
            
            if puntuacion > 3.0 and viabilidad in ['baja', 'media']:
                es_critico = True
                razon.append(f'Puntuación alta ({puntuacion:.2f}) con viabilidad {viabilidad}')
            
            if es_critico:
                critical_count += 1
                critical_debug.append({
                    'id': obra.id,
                    'nombre': obra.programa[:50] if obra.programa else '',
                    'puntuacion': puntuacion,
                    'viabilidad': viabilidad,
                    'razon': ' | '.join(razon)
                })
        
        return Response({
            'projects': {
                'total': current_projects,
                'active': active_projects,
                'completed': status_counts.get('completado', 0)
            },
            'zones': {
                'total': len(unique_zones),
                'label': 'Alcaldías',
                'list': sorted(list(unique_zones))
            },
            'budget': {
                'total': total_budget,
                'executed': total_executed,
                'remaining': total_budget - total_executed,
                'execution_rate': round((total_executed / total_budget * 100), 2) if total_budget > 0 else 0,
                'formatted_total': f"${total_budget:,.0f}",
                'formatted_executed': f"${total_executed:,.0f}"
            },
            'beneficiaries': {
                'total': int(total_beneficiaries),
                'formatted': f"{int(total_beneficiaries):,}"
            },
            'priority_attention': {
                'count': critical_count,
                'label': 'requieren atención prioritaria',
                '_debug': {
                    'criteria': 'Puntuación > 3 Y Viabilidad Baja o Media',
                    'viability_rules': {
                        'baja': '1+ semáforo rojo',
                        'media': '2+ semáforos amarillos',
                        'alta': 'todos verdes/grises'
                    },
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
    
    Aplica lógica simplificada:
    - Puntuación > 3 Y Viabilidad Baja o Media
    """
    
    def get(self, request):
        from .utils import calcular_viabilidad_global
        
        all_projects = Obra.objects.all()
        critical_projects_list = []
        
        for obra in all_projects:
            puntuacion = float(obra.puntuacion_final_ponderada or 0)
            viabilidad = calcular_viabilidad_global(obra)
            
            # Criterio simplificado: Puntuación > 3 Y Viabilidad comprometida
            if puntuacion > 3.0 and viabilidad in ['baja', 'media']:
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
    - Proyectos por zona geográfica (Norte, Sur, Oriente, Poniente, Centro)
    - Presupuesto prorrateado por zona
    - Beneficiarios por zona
    - Avance promedio por territorio
    
    GET /api/v2/dashboard/territories/
    """
    
    # Mapeo de alcaldías a zonas
    ZONA_MAPPING = {
        'Zona Norte': ['Gustavo A. Madero', 'Azcapotzalco'],
        'Zona Sur': ['Tlalpan', 'Xochimilco', 'Milpa Alta'],
        'Centro Histórico': ['Cuauhtémoc', 'Benito Juárez', 'Coyoacán'],
        'Zona Oriente': ['Iztapalapa', 'Iztacalco', 'Venustiano Carranza', 'Tláhuac'],
        'Zona Poniente': ['Miguel Hidalgo', 'Cuajimalpa de Morelos', 'Álvaro Obregón', 'La Magdalena Contreras']
    }
    
    def get(self, request):
        # Obtener todas las obras
        obras = Obra.objects.all()
        
        # Inicializar estadísticas por zona
        zone_stats = {
            'Zona Norte': {'projects': 0, 'total_budget': 0, 'beneficiaries': 0, 'progress_list': []},
            'Zona Sur': {'projects': 0, 'total_budget': 0, 'beneficiaries': 0, 'progress_list': []},
            'Centro Histórico': {'projects': 0, 'total_budget': 0, 'beneficiaries': 0, 'progress_list': []},
            'Zona Oriente': {'projects': 0, 'total_budget': 0, 'beneficiaries': 0, 'progress_list': []},
            'Zona Poniente': {'projects': 0, 'total_budget': 0, 'beneficiaries': 0, 'progress_list': []}
        }
        
        for obra in obras:
            alcaldias_str = (obra.alcaldias or '').lower().strip()
            alcance = (obra.alcance_territorial or '').lower().strip()
            presupuesto = obra.presupuesto_modificado if obra.presupuesto_modificado and obra.presupuesto_modificado > 0 else (obra.anteproyecto_total or 0)
            beneficiarios = obra.beneficiarios_num or 0
            avance = obra.avance_fisico_pct or 0
            
            # Determinar zonas afectadas usando alcance_territorial
            zonas_afectadas = []
            
            # Caso 1: Toda la ciudad - búsqueda flexible
            # Detecta: "toda la ciudad", "16 alcaldías", "todas", "completa", etc.
            is_toda_ciudad = (
                'toda' in alcance or 
                'toda' in alcaldias_str or 
                '16' in alcance or 
                '16' in alcaldias_str or
                'completa' in alcance or
                'todas' in alcance or
                'todas' in alcaldias_str
            )
            
            if is_toda_ciudad:
                zonas_afectadas = ['Zona Norte', 'Zona Sur', 'Centro Histórico', 'Zona Oriente', 'Zona Poniente']
            # Caso 2: Múltiples alcaldías o una alcaldía - buscar en el texto
            else:
                # Buscar alcaldías en el texto
                for zona, alcaldias in self.ZONA_MAPPING.items():
                    for alcaldia in alcaldias:
                        if alcaldia.lower() in alcaldias_str:
                            if zona not in zonas_afectadas:
                                zonas_afectadas.append(zona)
            
            # Si se encontraron zonas, distribuir (si no, el proyecto no se cuenta)
            if zonas_afectadas:
                # Prorratear entre zonas afectadas
                factor = 1.0 / len(zonas_afectadas)
                for zona in zonas_afectadas:
                    zone_stats[zona]['projects'] += 1
                    zone_stats[zona]['total_budget'] += float(presupuesto) * factor
                    zone_stats[zona]['beneficiaries'] += beneficiarios * factor
                    zone_stats[zona]['progress_list'].append(avance)
        
        # Formatear resultados
        result = []
        for zona_name, stats in zone_stats.items():
            progress_list = stats['progress_list']
            avg_progress = sum(progress_list) / len(progress_list) if progress_list else 0
            
            result.append({
                'name': zona_name,
                'projects': stats['projects'],
                'total_budget': round(stats['total_budget'], 2),
                'beneficiaries': round(stats['beneficiaries']),
                'avg_progress': round(avg_progress, 2),
                'formatted_budget': f"${stats['total_budget']:,.0f}"
            })
        
        return Response({
            'territories': result,
            'total_territories': len(result),
            'timestamp': timezone.now().isoformat()
        })


class RiskAnalysisView(APIView):
    """
    Análisis de riesgos con clasificación de matriz y mitigaciones.
    
    Sprint 3 - Completa migración de RisksView:
    - Proyectos en matriz de riesgos (score >= 3 con viabilidad baja o media)
    - Catálogo de riesgos identificados
    - Proyectos con acciones de mitigación
    - Categorías de riesgo con contadores
    
    GET /api/v2/dashboard/risk-analysis/
    """
    
    def get(self, request):
        try:
            # 1. MATRIZ DE RIESGOS
            # Filtrar proyectos con: (viabilidad baja O media) Y (prioridad >= 3)
            # Usa cálculos centralizados del backend (utils.py)
            from .utils import calcular_viabilidad_global, obtener_etiqueta_prioridad
            
            matrix_projects = []
            for obra in Obra.objects.all():
                score = float(obra.puntuacion_final_ponderada or 0)
                viabilidad_global = calcular_viabilidad_global(obra)
                prioridad_label = obtener_etiqueta_prioridad(score)
                
                # Incluir si: (viabilidad baja O media) Y prioridad >= 3
                if (viabilidad_global in ['baja', 'media']) and score >= 3.0:
                    matrix_projects.append({
                        'id': obra.id,
                        'nombre': obra.programa,
                        'responsable': obra.responsable_operativo or obra.area_responsable,
                        'direccion': obra.area_responsable,
                        'viabilidad': viabilidad_global,
                        'prioridad_label': prioridad_label,
                        'score': score,
                        'semaphores': {
                            'tecnica': obra.viabilidad_tecnica_semaforo or 'VERDE',
                            'presupuestal': obra.viabilidad_presupuestal_semaforo or 'VERDE',
                            'juridica': obra.viabilidad_juridica_semaforo or 'VERDE'
                        },
                        'riesgos': self._parse_riesgos(obra.problemas_identificados),
                        'avance': float(obra.avance_fisico_pct or 0),
                        'avance_financiero': float(obra.avance_financiero_pct or 0),
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
        
        # Separar por múltiples delimitadores: comas, punto y coma, saltos de línea, pipes
        import re
        riesgos = re.split(r'[,;\n\r|]+', str(riesgos_str))
        # Limpiar espacios, eliminar guiones iniciales y filtrar vacíos
        riesgos_limpios = []
        for r in riesgos:
            r = r.strip()
            # Eliminar guiones y numeración al inicio (-, •, -, 1., etc.)
            r = re.sub(r'^[-•\-\d\.\)\s]+', '', r).strip()
            if r and len(r) > 3:  # Ignorar riesgos muy cortos (probablemente basura)
                riesgos_limpios.append(r)
        return riesgos_limpios[:10]  # Limitar a 10 riesgos máximo
