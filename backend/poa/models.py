from django.db import models

class Obra(models.Model):
    # --- BLOQUE 1: Identificación del Proyecto (Cols 0-3) ---
    id_excel = models.IntegerField(null=True)            # col 0: id
    programa = models.TextField(null=True, blank=True)   # col 1
    area_responsable = models.CharField(max_length=255, null=True, blank=True) # col 2
    eje_institucional = models.CharField(max_length=255, null=True, blank=True) # col 3

    # --- BLOQUE 2: Información Presupuestal y de Metas (Cols 4-14) ---
    tipo_recurso = models.CharField(max_length=255, null=True, blank=True)      # col 4
    concentrado_programas = models.CharField(max_length=255, null=True, blank=True) # col 5
    capitulo_gasto = models.CharField(max_length=100, null=True, blank=True)    # col 6
    presupuesto_modificado = models.FloatField(default=0)  # col 7
    anteproyecto_total = models.FloatField(default=0)      # col 8
    meta_2025 = models.FloatField(default=0)               # col 9
    meta_2026 = models.FloatField(default=0)               # col 10
    unidad_medida = models.CharField(max_length=100, null=True, blank=True) # col 11
    costo_unitario = models.FloatField(default=0)          # col 12
    proyecto_presupuesto = models.FloatField(null=True, blank=True) # col 13
    multianualidad = models.CharField(max_length=50, null=True, blank=True) # col 14

    # --- BLOQUE 3: Categorización del Proyecto (Cols 15-20) ---
    tipo_obra = models.CharField(max_length=255, null=True, blank=True)          # col 15
    alcance_territorial = models.TextField(null=True, blank=True)                # col 16
    fuente_financiamiento = models.CharField(max_length=255, null=True, blank=True) # col 17
    etapa_desarrollo = models.CharField(max_length=255, null=True, blank=True)   # col 18
    complejidad_tecnica = models.IntegerField(default=1)    # col 19
    impacto_social_desc = models.TextField(null=True, blank=True)    # col 20 

    # --- BLOQUE 4: Priorización Estratégica (Cols 21-28) ---
    alineacion_estrategica = models.IntegerField(default=1) # col 21
    impacto_social_nivel = models.IntegerField(default=1)   # col 22
    urgencia = models.IntegerField(default=1)               # col 23
    viabilidad_ejecucion = models.IntegerField(default=1)   # col 24
    recursos_disponibles = models.IntegerField(default=1)   # col 25
    riesgo_nivel = models.IntegerField(default=1)           # col 26
    dependencias_nivel = models.IntegerField(default=1)     # col 27
    puntuacion_final_ponderada = models.FloatField(null=True, blank=True) # col 28

    # --- BLOQUE 5: Viabilidad del Proyecto (Cols 29-33) ---
    viabilidad_tecnica_semaforo = models.CharField(max_length=50, null=True, blank=True)       # col 29
    viabilidad_presupuestal_semaforo = models.CharField(max_length=50, null=True, blank=True)  # col 30
    viabilidad_juridica_semaforo = models.CharField(max_length=50, null=True, blank=True)      # col 31
    viabilidad_temporal_semaforo = models.CharField(max_length=50, null=True, blank=True)      # col 32
    viabilidad_administrativa_semaforo = models.CharField(max_length=50, null=True, blank=True)# col 33

    # --- BLOQUE 6: Ubicación e Impacto Territorial (Cols 0-3) ---
    alcaldias = models.TextField(null=True, blank=True)            # col 34
    ubicacion_especifica = models.TextField(null=True, blank=True) # col 35
    beneficiarios_directos = models.CharField(max_length=255, null=True, blank=True) # col 36
    beneficiarios_num = models.BigIntegerField(default=0) # Creación para sumatorias en el Dashboard
    poblacion_objetivo_num = models.CharField(max_length=255, null=True, blank=True) # col 37

    # --- BLOQUE 7: Cronograma y Plazos de Ejecución (Cols 38-42) ---
    fecha_inicio_prog = models.DateField(null=True, blank=True)   # col 38
    fecha_termino_prog = models.DateField(null=True, blank=True)  # col 39
    duracion_meses = models.CharField(max_length=100, null=True, blank=True) # col 40
    fecha_inicio_real = models.DateField(null=True, blank=True)   # col 41
    fecha_termino_real = models.DateField(null=True, blank=True)  # col 42

    # --- BLOQUE 8: Monitoreo de Avance (Cols 43-45) ---
    avance_fisico_pct = models.FloatField(default=0)      # col 43
    avance_financiero_pct = models.FloatField(default=0)  # col 44
    estatus_general = models.CharField(max_length=255, null=True, blank=True) # col 45
    
    # --- BLOQUE 9: Gestión de Permisos y Autorizaciones (Cols 46-48) ---
    permisos_requeridos = models.TextField(null=True, blank=True) # col 46
    estatus_permisos = models.TextField(null=True, blank=True)    # col 47
    requisitos_especificos = models.TextField(null=True, blank=True) # col 48

    # --- BLOQUE 10: Responsables y Ejecución (Cols 49-50) ---
    responsable_operativo = models.CharField(max_length=255, null=True, blank=True) # col 49
    contratista = models.CharField(max_length=255, null=True, blank=True) # col 50

    # --- BLOQUE 11: Seguimiento y Acciones Correctivas (Cols 51-54) ---
    observaciones = models.TextField(null=True, blank=True)       # col 51
    problemas_identificados = models.TextField(null=True, blank=True) # col 52
    acciones_correctivas = models.TextField(null=True, blank=True) # col 53
    ultima_actualizacion = models.DateField(null=True, blank=True) # col 54

    # --- BLOQUE 12: Comunicación y Narrativa Institucional (Cols 55-64) ---
    problema_resuelve = models.TextField(null=True, blank=True)   # col 55
    solucion_ofrece = models.TextField(null=True, blank=True)     # col 56
    beneficio_ciudadania = models.TextField(null=True, blank=True) # col 57
    dato_destacable = models.TextField(null=True, blank=True)     # col 58
    alineacion_gobierno = models.TextField(null=True, blank=True) # col 59
    poblacion_perfil = models.TextField(null=True, blank=True)    # col 60
    relevancia_comunicacional = models.TextField(null=True, blank=True) # col 61
    hitos_comunicacionales = models.TextField(null=True, blank=True)    # col 62
    mensajes_clave = models.TextField(null=True, blank=True)            # col 63
    estrategia_comunicacion = models.TextField(null=True, blank=True)   # col 64
    control_captura = models.TextField(null=True, blank=True)           # col 65
    control_notas = models.TextField(null=True, blank=True)             # col 66

    def __str__(self):
        return str(self.programa)[:50]