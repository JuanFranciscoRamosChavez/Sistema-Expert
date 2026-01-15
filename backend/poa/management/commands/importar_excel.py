from django.core.management.base import BaseCommand
from poa.models import Obra
# Importamos la función actualizada
from poa.utils import clean_money_vectorized, clean_percentage_vectorized, interpretar_escala_flexible, clean_beneficiarios_advanced
import pandas as pd
import os
from datetime import datetime, timedelta

class Command(BaseCommand):
	help = 'Importa datos aplicando reglas de negocio avanzadas para beneficiarios'

	def handle(self, *args, **kwargs):
		file_path = os.path.join('data', 'datos.xlsx')
		self.stdout.write("Leyendo Excel...")
		
		df = pd.read_excel(file_path, header=None)
		df = df.iloc[1:]

		obras_batch = []
		
		def safe_str(val):
			return str(val).strip() if pd.notna(val) else None

		def parse_date(val):
			try:
				if pd.isna(val): return None
				if isinstance(val, (int, float)):
					return (datetime(1899, 12, 30) + timedelta(days=val)).date()
				return pd.to_datetime(val).date()
			except:
				return None

		for _, row in df.iterrows():
			try:
				obra = Obra(
					# Identificación
					id_excel=row[0],
					programa=safe_str(row[1]),
					area_responsable=safe_str(row[2]),
					eje_institucional=safe_str(row[3]),
					tipo_recurso=safe_str(row[4]),
					concentrado_programas=safe_str(row[5]),
					capitulo_gasto=safe_str(row[6]),
					
					# Presupuesto
					presupuesto_modificado=clean_money_vectorized(row[7]),
					anteproyecto_total=clean_money_vectorized(row[8]),
					meta_2025=clean_money_vectorized(row[9]),
					meta_2026=clean_money_vectorized(row[10]),
					unidad_medida=safe_str(row[11]),
					costo_unitario=clean_money_vectorized(row[12]),
					proyecto_presupuesto=clean_money_vectorized(row[13]),
					multianualidad=safe_str(row[14]),

					# Categorización
					tipo_obra=safe_str(row[15]),
					alcance_territorial=safe_str(row[16]),
					fuente_financiamiento=safe_str(row[17]),
					etapa_desarrollo=safe_str(row[18]),
					complejidad_tecnica=interpretar_escala_flexible(row[19]),
					impacto_social_desc=safe_str(row[20]),

					# Priorización
					alineacion_estrategica=interpretar_escala_flexible(row[21]),
					impacto_social_nivel=interpretar_escala_flexible(row[22]),
					urgencia=interpretar_escala_flexible(row[23]),
					viabilidad_ejecucion=interpretar_escala_flexible(row[24]),
					recursos_disponibles=interpretar_escala_flexible(row[25]),
					riesgo_nivel=interpretar_escala_flexible(row[26]),
					dependencias_nivel=interpretar_escala_flexible(row[27]),
					puntuacion_final_ponderada=clean_money_vectorized(row[28]),

					# Semáforos
					viabilidad_tecnica_semaforo=safe_str(row[29]),
					viabilidad_presupuestal_semaforo=safe_str(row[30]),
					viabilidad_juridica_semaforo=safe_str(row[31]),
					viabilidad_temporal_semaforo=safe_str(row[32]),
					viabilidad_administrativa_semaforo=safe_str(row[33]),

					# Ubicación y Beneficiarios
					alcaldias=safe_str(row[34]),
					ubicacion_especifica=safe_str(row[35]),
					beneficiarios_directos=safe_str(row[36]),
					# AQUI SE APLICA LA NUEVA LÓGICA
					beneficiarios_num=clean_beneficiarios_advanced(row[36]),
					
					poblacion_objetivo_num=safe_str(row[37]),

					# Fechas
					fecha_inicio_prog=parse_date(row[38]),
					fecha_termino_prog=parse_date(row[39]),
					duracion_meses=safe_str(row[40]),
					fecha_inicio_real=parse_date(row[41]),
					fecha_termino_real=parse_date(row[42]),

					# Estatus y Textos
					avance_fisico_pct=clean_percentage_vectorized(row[43]),
					avance_financiero_pct=clean_percentage_vectorized(row[44]),
					estatus_general=safe_str(row[45]),
					permisos_requeridos=safe_str(row[46]),
					estatus_permisos=safe_str(row[47]),
					requisitos_especificos=safe_str(row[48]),
					responsable_operativo=safe_str(row[49]),
					contratista=safe_str(row[50]),
					observaciones=safe_str(row[51]),
					problemas_identificados=safe_str(row[52]),
					acciones_correctivas=safe_str(row[53]),
					ultima_actualizacion=parse_date(row[54]),
					problema_resuelve=safe_str(row[55]),
					solucion_ofrece=safe_str(row[56]),
					beneficio_ciudadania=safe_str(row[57]),
					dato_destacable=safe_str(row[58]),
					alineacion_gobierno=safe_str(row[59]),
					poblacion_perfil=safe_str(row[60]),
					relevancia_comunicacional=safe_str(row[61]),
					hitos_comunicacionales=safe_str(row[62]),
					mensajes_clave=safe_str(row[63]),
					estrategia_comunicacion=safe_str(row[64]),
					control_captura=safe_str(row[65]),
					control_notas=safe_str(row[66]),
				)
				obras_batch.append(obra)
			except Exception as e:
				self.stdout.write(self.style.WARNING(f"Error fila {row[0]}: {e}"))

		Obra.objects.all().delete()
		Obra.objects.bulk_create(obras_batch)
		self.stdout.write(self.style.SUCCESS(f'Importación completa. {len(obras_batch)} registros procesados.'))