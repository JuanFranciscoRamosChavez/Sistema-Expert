from django.core.management.base import BaseCommand
from poa.models import Obra
from poa.utils import (
	clean_money, 
	clean_percentage, 
	interpretar_escala_flexible, 
	clean_beneficiarios_advanced,
	calcular_puntuacion_ponderada,
	capitalizar_texto,
	obtener_valor_por_defecto
)
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
			"""Retorna el string limpio o None si está vacío"""
			if pd.isna(val) or val == '':
				return None
			return str(val).strip()
		
		def safe_str_with_default(val, campo_nombre):
			"""Retorna string limpio, capitalizado y con valor por defecto si está vacío"""
			texto = safe_str(val)
			# Obtener valor por defecto si está vacío
			texto_con_default = obtener_valor_por_defecto(campo_nombre, texto)
			# Capitalizar si hay texto
			if texto_con_default and isinstance(texto_con_default, str):
				return capitalizar_texto(texto_con_default)
			return texto_con_default
		
		def safe_str_uppercase(val, campo_nombre):
			"""Retorna string limpio, en MAYÚSCULAS y con valor por defecto si está vacío"""
			texto = safe_str(val)
			# Obtener valor por defecto si está vacío
			texto_con_default = obtener_valor_por_defecto(campo_nombre, texto)
			# Convertir a mayúsculas si hay texto
			if texto_con_default and isinstance(texto_con_default, str):
				return texto_con_default.upper()
			return texto_con_default

		def clean_semaphore(val):
			"""
			Normaliza valores de semáforos a: ROJO, AMARILLO, VERDE.
			Acepta variaciones comunes y retorna el valor estandarizado.
			"""
			if pd.isna(val) or val == '':
				return None
			
			# Convertir a string y limpiar
			v = str(val).strip().upper()
			
			# Mapeo de variaciones comunes
			if v in ['ROJO', 'R', 'RED']:
				return 'ROJO'
			elif v in ['AMARILLO', 'A', 'YELLOW', 'ÁMBAR', 'AMBAR']:
				return 'AMARILLO'
			elif v in ['VERDE', 'V', 'GREEN']:
				return 'VERDE'
			
			# Si no coincide, retornar None para que se trate como GRIS
			return None

		def parse_date(val):
			"""
			Normaliza fechas al formato ISO 8601 (YYYY-MM-DD) con lógica inteligente.
			
			Estrategia de parsing:
			1. Detecta seriales de Excel
			2. Busca año (4 dígitos o 2 dígitos)
			3. Busca mes (1-12 o nombres en español/inglés)
			4. Busca día (1-31, o usa 01 si no encuentra)
			5. Intenta formatos comunes: DD/MM/YYYY, YYYY-MM-DD, etc.
			6. Si falla, prueba orden inverso: YYYY/MM/DD
			
			Returns:
				date object o None si no se puede parsear
			"""
			try:
				if pd.isna(val) or val == '': 
					return None
				
				# 1. Manejo de fecha serial de Excel (enteros/floats)
				if isinstance(val, (int, float)) and not isinstance(val, bool):
					return (datetime(1899, 12, 30) + timedelta(days=val)).date()
				
				# 2. Si ya es un objeto date o datetime, extraer date
				if isinstance(val, datetime):
					return val.date()
				if hasattr(val, 'date'):  # pandas Timestamp
					return val.date()
				
				# 3. Convertir a string para análisis de texto
				val_str = str(val).strip().lower()
				
				import re
				
				# 4. Diccionario de meses (español e inglés)
				meses = {
					'enero': 1, 'ene': 1, 'january': 1, 'jan': 1,
					'febrero': 2, 'feb': 2, 'february': 2,
					'marzo': 3, 'mar': 3, 'march': 3,
					'abril': 4, 'abr': 4, 'april': 4, 'apr': 4,
					'mayo': 5, 'may': 5,
					'junio': 6, 'jun': 6, 'june': 6,
					'julio': 7, 'jul': 7, 'july': 7,
					'agosto': 8, 'ago': 8, 'august': 8, 'aug': 8,
					'septiembre': 9, 'sep': 9, 'september': 9, 'sept': 9,
					'octubre': 10, 'oct': 10, 'october': 10,
					'noviembre': 11, 'nov': 11, 'november': 11,
					'diciembre': 12, 'dic': 12, 'december': 12, 'dec': 12
				}
				
				# 5. ESTRATEGIA 1: Buscar patrón "mes año" (ej: "abril 2026", "mayo 2026")
				for mes_nombre, mes_num in meses.items():
					# Patrón: nombre_mes espacio año(4 dígitos o 2 dígitos)
					match = re.search(rf'\b{mes_nombre}\b\s+(\d{{2,4}})', val_str)
					if match:
						anio_str = match.group(1)
						anio = int(anio_str)
						# Convertir año de 2 dígitos a 4 dígitos
						if anio < 100:
							anio = 2000 + anio if anio < 50 else 1900 + anio
						return datetime(anio, mes_num, 1).date()
				
				# 6. ESTRATEGIA 2: Buscar patrón "día mes año" (ej: "28 de noviembre de 2025")
				for mes_nombre, mes_num in meses.items():
					match = re.search(rf'(\d{{1,2}})\s+(?:de\s+)?{mes_nombre}\b\s+(?:de\s+)?(\d{{2,4}})', val_str)
					if match:
						dia = int(match.group(1))
						anio_str = match.group(2)
						anio = int(anio_str)
						if anio < 100:
							anio = 2000 + anio if anio < 50 else 1900 + anio
						# Validar día
						if 1 <= dia <= 31:
							try:
								return datetime(anio, mes_num, dia).date()
							except ValueError:
								# Día inválido para ese mes, usar día 1
								return datetime(anio, mes_num, 1).date()
				
				# 7. ESTRATEGIA 3: Detectar números y separadores (/, -, .)
				# Extraer todos los números del string
				numeros = re.findall(r'\d+', val_str)
				
				if len(numeros) >= 2:
					# Convertir a enteros
					nums = [int(n) for n in numeros]
					
					# Identificar qué número es qué
					dia, mes, anio = None, None, None
					
					# Buscar año (4 dígitos o 2 dígitos > 31)
					for i, n in enumerate(nums):
						if n > 31:  # Probablemente es un año
							anio = n
							if anio < 100:
								anio = 2000 + anio if anio < 50 else 1900 + anio
							nums[i] = None  # Marcar como usado
							break
					
					# Filtrar números usados
					nums_restantes = [n for n in nums if n is not None]
					
					if len(nums_restantes) >= 1:
						# Buscar mes (1-12)
						for i, n in enumerate(nums_restantes):
							if 1 <= n <= 12:
								mes = n
								nums_restantes[i] = None
								break
						
						# Filtrar nuevamente
						nums_restantes = [n for n in nums_restantes if n is not None]
						
						# El número restante es el día (o None)
						if len(nums_restantes) > 0:
							dia = nums_restantes[0] if 1 <= nums_restantes[0] <= 31 else 1
						else:
							dia = 1  # Día por defecto
					
					# Si tenemos mes y año, construir fecha
					if mes and anio:
						dia = dia or 1
						try:
							return datetime(anio, mes, dia).date()
						except ValueError:
							# Si el día es inválido, usar día 1
							return datetime(anio, mes, 1).date()
				
				# 8. ESTRATEGIA 4: Formatos estándar con separadores
				# ISO: YYYY-MM-DD o YYYY/MM/DD
				if re.match(r'^\d{4}[-/]\d{1,2}[-/]\d{1,2}$', val_str):
					for fmt in ["%Y-%m-%d", "%Y/%m/%d"]:
						try:
							return datetime.strptime(val_str, fmt).date()
						except ValueError:
							continue
				
				# Europeo/Latino: DD/MM/YYYY o DD-MM-YYYY
				if re.match(r'^\d{1,2}[-/]\d{1,2}[-/]\d{4}$', val_str):
					for fmt in ["%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y"]:
						try:
							return datetime.strptime(val_str, fmt).date()
						except ValueError:
							continue
				
				# Americano: MM/DD/YYYY
				if re.match(r'^\d{1,2}[-/]\d{1,2}[-/]\d{4}$', val_str):
					try:
						return datetime.strptime(val_str, "%m/%d/%Y").date()
					except ValueError:
						pass
				
				# 9. ESTRATEGIA 5: Fallback con pandas
				parsed = pd.to_datetime(val, errors='coerce')
				if pd.notna(parsed):
					return parsed.date()
				
				# Si llegamos aquí, no se pudo parsear
				return None
				
			except Exception as e:
				# Si falla, retornar None (log opcional para debug)
				# self.stdout.write(self.style.WARNING(f"No se pudo parsear fecha '{val}': {e}"))
				return None

		for _, row in df.iterrows():
			try:
				# Priorización (interpretamos escalas flexiblemente)
				alineacion = interpretar_escala_flexible(row[21])
				impacto = interpretar_escala_flexible(row[22])
				urgencia = interpretar_escala_flexible(row[23])
				viabilidad = interpretar_escala_flexible(row[24])
				recursos = interpretar_escala_flexible(row[25])
				riesgo = interpretar_escala_flexible(row[26])
				dependencias = interpretar_escala_flexible(row[27])
				
				# Calcular puntuación ponderada automáticamente
				# (ignoramos el valor del Excel en columna 28 si existe)
				puntuacion = calcular_puntuacion_ponderada(
					alineacion, impacto, urgencia, viabilidad, recursos, riesgo, dependencias
				)
				
				obra = Obra(
					# Identificación
					id_excel=row[0],
					programa=safe_str_with_default(row[1], 'programa'),
					area_responsable=safe_str_uppercase(row[2], 'area_responsable'),
					eje_institucional=safe_str_with_default(row[3], 'eje_institucional'),
					
					# Presupuesto (VALORES EN MDP - Millones De Pesos)
					tipo_recurso=safe_str_with_default(row[4], 'tipo_recurso'),
					concentrado_programas=safe_str_with_default(row[5], 'concentrado_programas'),
					capitulo_gasto=safe_str_with_default(row[6], 'capitulo_gasto'),
					presupuesto_modificado=clean_money(row[7], es_mdp=True),  # En MDP
					anteproyecto_total=clean_money(row[8], es_mdp=True),      # En MDP
					meta_2025=clean_money(row[9], es_mdp=False),              # Cantidad de metas (no dinero)
					meta_2026=clean_money(row[10], es_mdp=False),             # Cantidad de metas (no dinero)
					unidad_medida=safe_str_with_default(row[11], 'unidad_medida'),
					costo_unitario=clean_money(row[12], es_mdp=False),        # Costo unitario (no MDP)
					proyecto_presupuesto=clean_money(row[13], es_mdp=False),  # Verificar si este debe ser MDP
					multianualidad=safe_str_with_default(row[14], 'multianualidad'),

					# Categorización
					tipo_obra=safe_str_with_default(row[15], 'tipo_obra'),
					alcance_territorial=safe_str_with_default(row[16], 'alcance_territorial'),
					fuente_financiamiento=safe_str_with_default(row[17], 'fuente_financiamiento'),
					etapa_desarrollo=safe_str_with_default(row[18], 'etapa_desarrollo'),
					complejidad_tecnica=interpretar_escala_flexible(row[19]),
					impacto_social_desc=safe_str_with_default(row[20], 'impacto_social_desc'),

					# Priorización (usando valores ya interpretados)
					alineacion_estrategica=alineacion,
					impacto_social_nivel=impacto,
					urgencia=urgencia,
					viabilidad_ejecucion=viabilidad,
					recursos_disponibles=recursos,
					riesgo_nivel=riesgo,
					dependencias_nivel=dependencias,
					puntuacion_final_ponderada=puntuacion,  # Calculado automáticamente

					# Semáforos
					viabilidad_tecnica_semaforo=clean_semaphore(row[29]),
					viabilidad_presupuestal_semaforo=clean_semaphore(row[30]),
					viabilidad_juridica_semaforo=clean_semaphore(row[31]),
					viabilidad_temporal_semaforo=clean_semaphore(row[32]),
					viabilidad_administrativa_semaforo=clean_semaphore(row[33]),

					# Ubicación y Beneficiarios
					alcaldias=safe_str_with_default(row[34], 'alcaldias'),
					ubicacion_especifica=safe_str_with_default(row[35], 'ubicacion_especifica'),
					beneficiarios_directos=safe_str_with_default(row[36], 'beneficiarios_directos'),
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
					estatus_general=safe_str_with_default(row[45], 'estatus_general'),
					permisos_requeridos=safe_str_with_default(row[46], 'permisos_requeridos'),
					estatus_permisos=safe_str_with_default(row[47], 'estatus_permisos'),
					requisitos_especificos=safe_str(row[48]),
					responsable_operativo=safe_str_with_default(row[49], 'responsable_operativo'),
					contratista=safe_str_with_default(row[50], 'contratista'),
					observaciones=safe_str_with_default(row[51], 'observaciones'),
					problemas_identificados=safe_str_with_default(row[52], 'problemas_identificados'),
					acciones_correctivas=safe_str_with_default(row[53], 'acciones_correctivas'),
					ultima_actualizacion=parse_date(row[54]),
					
					# Narrativa
					problema_resuelve=safe_str_with_default(row[55], 'problema_resuelve'),
					solucion_ofrece=safe_str_with_default(row[56], 'solucion_ofrece'),
					beneficio_ciudadania=safe_str(row[57]),
					dato_destacable=safe_str(row[58]),
					alineacion_gobierno=safe_str(row[59]),
					poblacion_perfil=safe_str(row[60]),
					relevancia_comunicacional=safe_str(row[61]),
					hitos_comunicacionales=safe_str_with_default(row[62], 'hitos_comunicacionales'),
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