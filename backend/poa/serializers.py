from rest_framework import serializers
from .models import Obra
from .utils import (
    calcular_puntuacion_ponderada, 
    obtener_etiqueta_prioridad,
    capitalizar_texto,
    obtener_valor_por_defecto
)

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
        """
        Calcula la puntuación ponderada usando la función centralizada.
        Promedio de los 7 criterios de priorización.
        """
        return calcular_puntuacion_ponderada(
            obj.alineacion_estrategica or 1,
            obj.impacto_social_nivel or 1,
            obj.urgencia or 1,
            obj.viabilidad_ejecucion or 1,
            obj.recursos_disponibles or 1,
            obj.riesgo_nivel or 1,
            obj.dependencias_nivel or 1
        )

    def get_prioridad_label(self, obj):
        """Determina etiqueta basada en la puntuación usando función centralizada"""
        score = self.get_puntuacion_final_ponderada(obj)
        return obtener_etiqueta_prioridad(score)

    def get_viabilidad_global(self, obj):
        """
        Calcula viabilidad usando función centralizada de utils.
        Mantiene consistencia en toda la aplicación.
        """
        from .utils import calcular_viabilidad_global
        return calcular_viabilidad_global(obj)

    def get_estatus_general(self, obj):
        """
        Calcula el estado real del proyecto usando función centralizada.
        """
        from .utils import calcular_estatus_proyecto
        return calcular_estatus_proyecto(obj)

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

    # --- NORMALIZACIÓN Y VALORES POR DEFECTO ---
    
    def to_representation(self, instance):
        """
        Sobrescribe la representación para aplicar capitalización y valores por defecto
        a todos los campos de texto antes de serializarlos.
        """
        data = super().to_representation(instance)
        
        # Campos que siempre van en MAYÚSCULAS (solo dependencias/áreas)
        campos_mayusculas = [
            'area_responsable'
        ]
        
        # Campos que deben capitalizarse normalmente
        campos_a_capitalizar = [
            'programa', 'eje_institucional',
            'tipo_obra', 'tipo_recurso', 'fuente_financiamiento',
            'alcance_territorial', 'etapa_desarrollo', 'estatus_general',
            'responsable_operativo', 'contratista', 'alcaldias',
            'ubicacion_especifica', 'impacto_social_desc', 'observaciones',
            'problema_resuelve', 'solucion_ofrece', 'beneficiarios_directos',
            'problemas_identificados', 'acciones_correctivas', 'riesgos',
            'permisos_requeridos', 'estatus_permisos', 'multianualidad',
            'hitos_comunicacionales', 'concentrado_programas', 'capitulo_gasto',
            'unidad_medida'
        ]
        
        # Aplicar MAYÚSCULAS a campos específicos
        for campo in campos_mayusculas:
            if campo in data:
                valor_actual = data[campo]
                valor_con_default = obtener_valor_por_defecto(campo, valor_actual)
                if valor_con_default and isinstance(valor_con_default, str):
                    data[campo] = valor_con_default.upper()
                else:
                    data[campo] = valor_con_default
        
        # Aplicar capitalización inteligente a otros campos
        for campo in campos_a_capitalizar:
            if campo in data:
                valor_actual = data[campo]
                # Primero obtener valor por defecto si está vacío
                valor_con_default = obtener_valor_por_defecto(campo, valor_actual)
                # Luego capitalizar si hay texto
                if valor_con_default and isinstance(valor_con_default, str):
                    data[campo] = capitalizar_texto(valor_con_default)
                else:
                    data[campo] = valor_con_default
        
        return data