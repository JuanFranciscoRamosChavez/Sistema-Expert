from rest_framework import serializers
from .models import Obra

class ObraSerializer(serializers.ModelSerializer):
    # --- CAMPOS CALCULADOS (Nuevos) ---
    puntuacion_final_ponderada = serializers.SerializerMethodField()
    prioridad_label = serializers.SerializerMethodField()
    viabilidad_global = serializers.SerializerMethodField()
    estatus_general = serializers.SerializerMethodField()

    # Campos de Semáforo
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

    # --- LÓGICA DE NEGOCIO ---

    def get_puntuacion_final_ponderada(self, obj):
        """Promedio ponderado de las puntuaciones."""
        criterios = [
            obj.alineacion_estrategica,
            obj.impacto_social_nivel,
            obj.urgencia,
            obj.viabilidad_ejecucion,
            obj.recursos_disponibles,
            obj.riesgo_nivel,
            obj.dependencias_nivel
        ]
        # Filtramos None para evitar errores, asumimos 1 si falta dato
        validos = [c if c is not None else 1 for c in criterios]
        return round(sum(validos) / 7, 2)

    def get_prioridad_label(self, obj):
        """Determina etiqueta basada en la puntuación"""
        score = self.get_puntuacion_final_ponderada(obj)
        if score >= 4.5: return 'critica'
        if score >= 3.5: return 'muy_alta'
        if score >= 2.5: return 'alta'
        if score >= 1.5: return 'media'
        return 'baja'

    def get_viabilidad_global(self, obj):
        """Calcula viabilidad contando semáforos rojos y amarillos"""
        sem_list = [
            obj.viabilidad_tecnica_semaforo,
            obj.viabilidad_presupuestal_semaforo,
            obj.viabilidad_juridica_semaforo,
            obj.viabilidad_temporal_semaforo,
            obj.viabilidad_administrativa_semaforo
        ]
        # Normalizar a mayúsculas y contar
        sem_list = [s.upper() if s else 'GRIS' for s in sem_list]
        rojos = sem_list.count('ROJO')
        amarillos = sem_list.count('AMARILLO')

        if rojos >= 1: return 'baja'
        if amarillos >= 2: return 'media'
        return 'alta'

    def get_estatus_general(self, obj):
        """
        Calcula el estado real del proyecto.
        """
        avance = obj.avance_fisico_pct or 0
        riesgo = obj.riesgo_nivel or 0
        
        # 1. Completado
        if avance >= 99.9:
            return 'completado'
            
        # 2. En Riesgo
        if riesgo >= 4 or self.get_semaforo(obj) == 'ROJO':
            return 'en_riesgo'
            
        # 3. En Ejecución
        if avance > 0 or (obj.avance_financiero_pct or 0) > 0:
            return 'en_ejecucion'
            
        return 'planificado'

    # --- HELPERS ---

    def get_presupuesto_final(self, obj):
        return obj.presupuesto_modificado if (obj.presupuesto_modificado or 0) > 0 else (obj.anteproyecto_total or 0)

    def get_monto_ejecutado(self, obj):
        presupuesto = self.get_presupuesto_final(obj)
        return presupuesto * ((obj.avance_financiero_pct or 0) / 100.0)

    def get_semaforo(self, obj):
        if (obj.riesgo_nivel or 0) >= 4: return "ROJO"
        if (obj.avance_fisico_pct or 0) < 20 and (obj.urgencia or 0) >= 4: return "ROJO"
        
        sem_list = [obj.viabilidad_tecnica_semaforo, obj.viabilidad_presupuestal_semaforo]
        # Safe upper check
        sem_upper = [s.upper() for s in sem_list if s]
        if "ROJO" in sem_upper: return "ROJO"
        
        if (obj.riesgo_nivel or 0) == 3: return "AMARILLO"
        return "VERDE"

    def _to_text(self, valor):
        textos = {1: "1 - Muy Bajo", 2: "2 - Bajo", 3: "3 - Regular", 4: "4 - Alto", 5: "5 - Muy Alto"}
        return textos.get(valor, f"{valor} - Definido")

    def get_urgencia(self, obj): return self._to_text(obj.urgencia)
    def get_impacto_social_nivel(self, obj): return self._to_text(obj.impacto_social_nivel)
    def get_alineacion_estrategica(self, obj): return self._to_text(obj.alineacion_estrategica)
    def get_complejidad_tecnica(self, obj): return self._to_text(obj.complejidad_tecnica)
    def get_riesgo_nivel(self, obj): return self._to_text(obj.riesgo_nivel)