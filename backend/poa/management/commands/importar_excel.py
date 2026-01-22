from django.core.management.base import BaseCommand
from poa.models import Obra
from poa.utils import clean_money, clean_percentage, interpretar_escala_flexible, clean_beneficiarios_advanced
import pandas as pd
import os
from datetime import datetime, timedelta

class Command(BaseCommand):
	help = 'Importa datos aplicando reglas de negocio avanzadas para beneficiarios. Soporta .xlsx y .csv'

	def handle(self, *args, **kwargs):
		# Intenta localizar el archivo de datos (Excel o CSV)
		base_dir = 'data'
		xlsx_path = os.path.join(base_dir, 'datos.xlsx')
		csv_path = os.path.join(base_dir, 'datos.csv')
		
		# Verificamos qué archivo existe (priorizando Excel si ambos existen)
		if os.path.exists(xlsx_path):
			file_path = xlsx_path
			self.stdout.write(f"Leyendo Excel desde {file_path}...")
			df = pd.read_excel(file_path, header=None)
		elif os.path.exists(csv_path):
			file_path = csv_path
			self.stdout.write(f"Leyendo CSV desde {file_path}...")
			# header=None para coincidir con la lógica original de saltar la fila 0 manualmente
			df = pd.read_csv(file_path, header=None) 
		else:
			# Intento de fallback para nombres generados como "datos.xlsx - Sheet1.csv"
			# Busca cualquier archivo csv en la carpeta data
			files = [f for f in os.listdir(base_dir) if f.endswith('.csv')]
			if files:
				file_path = os.path.join(base_dir, files[0])
				self.stdout.write(f"Archivo estándar no encontrado. Usando: {file_path}...")
				df = pd.read_csv(file_path, header=None)
			else:
				self.stdout.write(self.style.ERROR("No se encontró 'datos.xlsx' ni 'datos.csv' en la carpeta data."))
				return

		# Ajuste para saltar encabezados dummy si es necesario (según código original)
		df = df.iloc[1:]

		obras_batch = []
		
		def safe_str(val):
			return str(val).strip() if pd.notna(val) else None

		def parse_date(val):
			try:
				if pd.isna(val) or val == '': return None
				
				# Manejo de fecha serial de Excel (enteros/floats)
				if isinstance(val, (int, float)):
					return (datetime(1899, 12, 30) + timedelta(days=val)).date()
				
				# Convertir a string para análisis de texto
				val_str = str(val).strip()
				
				# Meses en español
				meses = {
					'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
					'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
					'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
				}
				
				# Formato: "abril 2026", "mayo 2026" (solo mes y año)
				import re
				match_mes_anio = re.match(r'(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})', val_str, re.IGNORECASE)
				if match_mes_anio:
					mes_nombre = match_mes_anio.group(1).lower()
					anio = int(match_mes_anio.group(2))
					mes = meses[mes_nombre]
					return datetime(anio, mes, 1).date()  # Día 1 del mes
				
				# Formato: "28 de noviembre de 2025" (día completo)
				match_completo = re.match(r'(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})', val_str, re.IGNORECASE)
				if match_completo:
					dia = int(match_completo.group(1))
					mes_nombre = match_completo.group(2).lower()
					anio = int(match_completo.group(3))
					mes = meses[mes_nombre]
					return datetime(anio, mes, dia).date()
				
				# Fallback: intentar parsing automático de pandas
				return pd.to_datetime(val).date()
			except Exception as e:
				# Si falla, retornar None (log opcional para debug)
				return None

		for _, row in df.iterrows():
			try:
				obra = Obra(
					# Identificación
					id_excel=row[0],
					programa=safe_str(row[1]),
					area_responsable=safe_str(row[2]),
					eje_institucional=safe_str(row[3]),
					
					# Presupuesto
					tipo_recurso=safe_str(row[4]),
					concentrado_programas=safe_str(row[5]),
					capitulo_gasto=safe_str(row[6]),
					presupuesto_modificado=clean_money(row[7]),
					anteproyecto_total=clean_money(row[8]),
					meta_2025=clean_money(row[9]),
					meta_2026=clean_money(row[10]),
					unidad_medida=safe_str(row[11]),
					costo_unitario=clean_money(row[12]),
					proyecto_presupuesto=clean_money(row[13]),
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
					puntuacion_final_ponderada=clean_money(row[28]),

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
					beneficiarios_num=clean_beneficiarios_advanced(row[36]),
					poblacion_objetivo_num=safe_str(row[37]),

					# Fechas
					fecha_inicio_prog=parse_date(row[38]),
					fecha_termino_prog=parse_date(row[39]),
					duracion_meses=safe_str(row[40]),
					fecha_inicio_real=parse_date(row[41]),
					fecha_termino_real=parse_date(row[42]),

					# Estatus y Textos
					avance_fisico_pct=clean_percentage(row[43]),
					avance_financiero_pct=clean_percentage(row[44]),
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
					
					# Narrativa
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