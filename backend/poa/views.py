from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Q, F, Case, When, DecimalField
from .models import Obra
from .serializers import ObraSerializer

class ObraViewSet(viewsets.ModelViewSet):
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