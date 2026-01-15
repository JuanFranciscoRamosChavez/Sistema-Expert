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
	Endpoint optimizado para KPIs del Dashboard.
	"""
	def get(self, request):
		# 1. Total Proyectos
		total_proyectos = Obra.objects.count()

		# 2. Presupuesto Total y Beneficiarios (Aggregation)
		agregados = Obra.objects.aggregate(
			presupuesto_total=Sum(
				Case(
					When(presupuesto_modificado__gt=0, then=F('presupuesto_modificado')),
					default=F('anteproyecto_total'),
					output_field=DecimalField()
				)
			),
			total_beneficiarios=Sum('beneficiarios_num')
		)
		
		presupuesto_total = agregados['presupuesto_total'] or 0
		total_beneficiarios = agregados['total_beneficiarios'] or 0

		# 3. Atención Requerida (Riesgo Alto o Semáforos Rojos)
		proyectos_riesgo = Obra.objects.filter(
			Q(riesgo_nivel__gte=4) |
			Q(viabilidad_tecnica_semaforo='ROJO') |
			Q(viabilidad_presupuestal_semaforo='ROJO') |
			Q(viabilidad_juridica_semaforo='ROJO')
		).count()

		# 4. En Ejecución (Avance Financiero > 0)
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