from rest_framework import serializers
from .models import Obra

class ObraSerializer(serializers.ModelSerializer):
	# Campos calculados
	semaforo = serializers.SerializerMethodField()
	presupuesto_final = serializers.SerializerMethodField()
	monto_ejecutado = serializers.SerializerMethodField()

	# Campos de Texto para Escalas (MethodFields)
	urgencia = serializers.SerializerMethodField()
	impacto_social_nivel = serializers.SerializerMethodField()
	alineacion_estrategica = serializers.SerializerMethodField()
	complejidad_tecnica = serializers.SerializerMethodField()
	riesgo_nivel = serializers.SerializerMethodField()

	# Datos crudos numéricos para lógica de negocio
	urgencia_num = serializers.IntegerField(source='urgencia', read_only=True)
	riesgo_nivel_num = serializers.IntegerField(source='riesgo_nivel', read_only=True)
	impacto_social_num = serializers.IntegerField(source='impacto_social_nivel', read_only=True)

	class Meta:
		model = Obra
		fields = '__all__'

	def get_presupuesto_final(self, obj):
		return obj.presupuesto_modificado if obj.presupuesto_modificado > 0 else obj.anteproyecto_total

	def get_monto_ejecutado(self, obj):
		presupuesto = self.get_presupuesto_final(obj)
		return presupuesto * (obj.avance_financiero_pct / 100.0)

	def get_semaforo(self, obj):
		# Lógica de semáforo unificado
		if obj.riesgo_nivel >= 4: return "ROJO"
		# Si hay poco avance y mucha urgencia
		if obj.avance_fisico_pct < 20 and obj.urgencia >= 4: return "ROJO"
		# Si algún semáforo específico está en rojo
		if "ROJO" in [obj.viabilidad_tecnica_semaforo, obj.viabilidad_presupuestal_semaforo]: return "ROJO"
		
		if obj.riesgo_nivel == 3: return "AMARILLO"
		return "VERDE"

	def _to_text(self, valor):
		textos = {1: "1 - Muy Bajo", 2: "2 - Bajo", 3: "3 - Regular", 4: "4 - Alto", 5: "5 - Muy Alto"}
		return textos.get(valor, f"{valor} - Definido")

	def get_urgencia(self, obj): return self._to_text(obj.urgencia)
	def get_impacto_social_nivel(self, obj): return self._to_text(obj.impacto_social_nivel)
	def get_alineacion_estrategica(self, obj): return self._to_text(obj.alineacion_estrategica)
	def get_complejidad_tecnica(self, obj): return self._to_text(obj.complejidad_tecnica)
	def get_riesgo_nivel(self, obj): return self._to_text(obj.riesgo_nivel)