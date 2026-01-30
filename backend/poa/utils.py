import pandas as pd
import numpy as np
import re

# ==================== CATÁLOGO DE ESCALAS ====================
# Mapeo completo de todas las variantes textuales a valores numéricos 1-5
CATALOGO_ESCALAS = {
	# Escala 1: Muy Bajo
	"1": 1,
	"muy bajo": 1,
	"muy baja": 1,
	"minimo": 1,
	"minima": 1,
	"1 - muy bajo": 1,
	"1-muy bajo": 1,
	
	# Escala 2: Bajo
	"2": 2,
	"bajo": 2,
	"baja": 2,
	"2 - bajo": 2,
	"2-bajo": 2,
	
	# Escala 3: Regular/Medio
	"3": 3,
	"regular": 3,
	"medio": 3,
	"media": 3,
	"moderado": 3,
	"moderada": 3,
	"3 - regular": 3,
	"3-regular": 3,
	
	# Escala 4: Alto
	"4": 4,
	"alto": 4,
	"alta": 4,
	"4 - alto": 4,
	"4-alto": 4,
	
	# Escala 5: Muy Alto
	"5": 5,
	"muy alto": 5,
	"muy alta": 5,
	"critico": 5,
	"critica": 5,
	"crítico": 5,
	"crítica": 5,
	"maximo": 5,
	"maxima": 5,
	"urgente": 5,
	"5 - muy alto": 5,
	"5-muy alto": 5,
}

def clean_money(valor, es_mdp=True):
	"""
	Limpia y estandariza montos financieros.
	
	Args:
		valor: Valor a limpiar (puede ser número, string con símbolos, etc)
		es_mdp: Si True, asume que el valor está en Millones De Pesos (MDP)
		        y multiplica por 1,000,000. Default: True
	
	Ejemplos:
		clean_money(428.0948343, es_mdp=True) -> 428094834.30  (428.09 MDP)
		clean_money("$ 1,990.6", es_mdp=True) -> 1990600000.00 (1,990.6 MDP)
		clean_money("2,569.1", es_mdp=True)   -> 2569100000.00 (2,569.1 MDP)
		clean_money(410.47, es_mdp=False)     -> 410.47        (valor directo)
	"""
	if pd.isna(valor): return 0.0
	
	# Convertir a string, quitar símbolos de moneda y comas
	val_str = str(valor).replace('$', '').replace(',', '').strip()
	
	try:
		# Convertir a float
		numero = float(val_str)
		
		# Si es MDP, multiplicar por 1 millón
		if es_mdp:
			numero = numero * 1_000_000
		
		# Redondear a 2 decimales estrictos (regla financiera)
		return round(numero, 2)
	except:
		return 0.0

def clean_percentage(valor):
	"""
	Normaliza porcentajes a escala 0-100.
	- Entrada "100%" o 100 -> Salida 100.0
	- Entrada "1" o 1.0    -> Salida 100.0 (Asume formato decimal)
	- Entrada "0.5"        -> Salida 50.0
	- Entrada "50"         -> Salida 50.0
	"""
	if pd.isna(valor): return 0.0
	
	# Limpiar símbolos
	val_str = str(valor).replace('%', '').strip()
	
	try:
		num = float(val_str)
		
		# Lógica de detección de escala:
		# Si el número es <= 1.0 y mayor a 0, asumimos que es formato decimal (ej. 0.5 = 50%, 1 = 100%)
		# Excepción: Si es exactamente 0, es 0%.
		if 0 < num <= 1.0:
			return num * 100
			
		return num
	except:
		return 0.0

def interpretar_escala_flexible(valor):
	"""
	Interpreta cualquier formato de escala 1-5 y retorna un valor numérico.
	
	Soporta:
	- Números directos: 1, 2, 3, 4, 5
	- Texto completo: "5 - Muy alto", "4 - Alto", "3 - Regular", etc.
	- Texto simple: "muy alto", "bajo", "regular", etc.
	- Variantes: "critico", "urgente", "moderado", etc.
	
	Args:
		valor: Valor de la celda (puede ser int, float, str, None)
	
	Returns:
		int: Valor entre 1 y 5 (default: 1 si no se puede interpretar)
	
	Ejemplos:
		interpretar_escala_flexible(5) -> 5
		interpretar_escala_flexible("5 - Muy alto") -> 5
		interpretar_escala_flexible("Muy alto") -> 5
		interpretar_escala_flexible("Alto") -> 4
		interpretar_escala_flexible("Regular") -> 3
		interpretar_escala_flexible(None) -> 1
	"""
	# Caso 1: Valor nulo o vacío
	if pd.isna(valor) or valor == '':
		return 1
	
	# Caso 2: Ya es un número entero válido (1-5)
	if isinstance(valor, (int, np.integer)) and 1 <= valor <= 5:
		return int(valor)
	
	# Caso 3: Es un float que representa un entero
	if isinstance(valor, (float, np.floating)):
		valor_int = int(round(valor))
		if 1 <= valor_int <= 5:
			return valor_int
		# Si el float está fuera de rango, intentar como texto
	
	# Caso 4: Convertir a string y limpiar
	val_str = str(valor).strip().lower()
	
	# Remover caracteres especiales comunes
	val_str = val_str.replace('–', '-').replace('—', '-').replace('_', ' ')
	
	# Caso 5: Buscar número explícito (1-5) al inicio o entre delimitadores
	# Patrón: busca 1, 2, 3, 4, o 5 como palabra completa o al inicio
	match = re.search(r'^([1-5])\b', val_str)
	if match:
		return int(match.group(1))
	
	# Caso 6: Buscar en el catálogo de escalas textuales
	for clave, numero in CATALOGO_ESCALAS.items():
		if clave in val_str:
			return numero
	
	# Caso 7: Buscar cualquier dígito 1-5 en el string
	match = re.search(r'\b([1-5])\b', val_str)
	if match:
		return int(match.group(1))
	
	# Caso 8: Default (no se pudo interpretar)
	return 1

def calcular_puntuacion_ponderada(alineacion, impacto, urgencia, viabilidad, recursos, riesgo, dependencias):
	"""
	Calcula la puntuación ponderada final de un proyecto.
	
	Promedio simple de los 7 criterios de priorización (escala 1-5).
	Todos los criterios tienen el mismo peso (1/7).
	
	✅ ESCALA UNIFORME PARA TODOS LOS CRITERIOS:
	- 1 = Muy bajo / Mínimo (peor)
	- 2 = Bajo
	- 3 = Regular / Medio
	- 4 = Alto
	- 5 = Muy alto / Máximo (mejor)
	
	Esto aplica para TODOS los criterios incluyendo RIESGO y DEPENDENCIAS:
	- RIESGO: 1=muy bajo riesgo (mejor), 5=muy alto riesgo (peor en realidad, pero se califica alto)
	- DEPENDENCIAS: 1=muy bajo nivel de dependencias, 5=muy alto nivel de dependencias
	
	Args:
		alineacion: Alineación estratégica (1-5)
		impacto: Impacto social (1-5)
		urgencia: Nivel de urgencia (1-5)
		viabilidad: Viabilidad de ejecución (1-5)
		recursos: Recursos disponibles (1-5)
		riesgo: Nivel de riesgo (1-5)
		dependencias: Nivel de dependencias (1-5)
	
	Returns:
		float: Puntuación entre 1.0 y 5.0 (redondeado a 2 decimales)
	
	Rangos de prioridad:
		- 4.5 - 5.0: Crítica
		- 3.5 - 4.4: Muy Alta
		- 2.5 - 3.4: Alta
		- 1.5 - 2.4: Media
		- 1.0 - 1.4: Baja
	
	Ejemplo:
		calcular_puntuacion_ponderada(5, 5, 5, 5, 5, 5, 5) -> 5.0 (Crítica)
		calcular_puntuacion_ponderada(3, 3, 3, 3, 3, 3, 3) -> 3.0 (Alta)
		calcular_puntuacion_ponderada(1, 1, 1, 1, 1, 1, 1) -> 1.0 (Baja)
	"""
	criterios = [alineacion, impacto, urgencia, viabilidad, recursos, riesgo, dependencias]
	
	# Asegurar que todos los valores sean válidos (1-5)
	# Si es None o 0, usar 1 como default
	validos = []
	for c in criterios:
		if c is None or c == 0:
			validos.append(1)
		elif 1 <= c <= 5:
			validos.append(c)
		else:
			# Si está fuera de rango, ajustar
			validos.append(max(1, min(5, c)))
	
	# Calcular promedio simple (SIN inversión)
	promedio = sum(validos) / 7
	
	# Redondear a 2 decimales
	return round(promedio, 2)

def obtener_etiqueta_prioridad(puntuacion):
	"""
	Convierte una puntuación numérica en etiqueta de prioridad.
	
	Args:
		puntuacion: Puntuación entre 1.0 y 5.0
	
	Returns:
		str: 'critica', 'muy_alta', 'alta', 'media', o 'baja'
	"""
	if puntuacion >= 4.5:
		return 'critica'
	elif puntuacion >= 3.5:
		return 'muy_alta'
	elif puntuacion >= 2.5:
		return 'alta'
	elif puntuacion >= 1.5:
		return 'media'
	else:
		return 'baja'
def calcular_viabilidad_global(obra):
	"""
	Calcula la viabilidad global de un proyecto basado en los 5 semáforos.
	
	Reglas:
	- 1+ semáforo ROJO → Viabilidad BAJA
	- 2+ semáforos AMARILLOS → Viabilidad MEDIA
	- Resto (todos verdes/grises) → Viabilidad ALTA
	
	Args:
		obra: Instancia del modelo Obra
	
	Returns:
		str: 'alta', 'media', 'baja'
	"""
	semaforos = [
		(obra.viabilidad_tecnica_semaforo or '').upper(),
		(obra.viabilidad_presupuestal_semaforo or '').upper(),
		(obra.viabilidad_juridica_semaforo or '').upper(),
		(obra.viabilidad_temporal_semaforo or '').upper(),
		(obra.viabilidad_administrativa_semaforo or '').upper()
	]
	
	rojos = sum(1 for s in semaforos if s == 'ROJO')
	amarillos = sum(1 for s in semaforos if s == 'AMARILLO')
	
	if rojos >= 1:
		return 'baja'
	if amarillos >= 2:
		return 'media'
	return 'alta'

def calcular_estatus_proyecto(obra):
	"""
	Calcula el estatus de un proyecto según reglas de negocio.
	
	Orden jerárquico de evaluación:
	1. Completado: Avance físico = 100%
	2. En Riesgo: Campo riesgo > 3 (Alto/Muy Alto)
	3. Retrasado: Fecha inicio real pasada pero sin avance físico
	4. En Ejecución: Avance físico > 0 pero < 100%
	5. Planificado: Sin fecha de inicio real o fecha futura
	
	Args:
		obra: Instancia del modelo Obra
	
	Returns:
		str: 'completado', 'en_riesgo', 'retrasado', 'en_ejecucion', 'planificado'
	"""
	from datetime import date
	
	avance_fisico = obra.avance_fisico_pct or 0
	riesgo = obra.riesgo_nivel or 0
	fecha_inicio_real = obra.fecha_inicio_real
	
	# 1. Completado: Avance físico al 100%
	if avance_fisico >= 100:
		return 'completado'
	
	# 2. En Riesgo: Puntuación de riesgo > 3 (4 o 5 = Alto/Muy Alto)
	if riesgo > 3:
		return 'en_riesgo'
	
	# 3. Retrasado: Tiene fecha de inicio real pasada pero sin avance
	if fecha_inicio_real and fecha_inicio_real <= date.today():
		if avance_fisico == 0:
			return 'retrasado'
	
	# 4. En Ejecución: Tiene avance físico pero no está completo
	if avance_fisico > 0:
		return 'en_ejecucion'
	
	# 5. Planificado: Sin fecha de inicio real o fecha futura
	return 'planificado'
def clean_beneficiarios_advanced(valor):
	"""
	Limpia texto de beneficiarios detectando magnitudes y abreviaturas.
	Soporta:
	- "1M", "1.5 M", "2.5 millones" -> * 1,000,000
	- "10k", "10 K", "144 mil" -> * 1,000
	- "1.2 miles de millones" -> * 1,000,000,000
	- "500 personas" -> * 1 (Ignora texto que no sea de magnitud)
	"""
	if pd.isna(valor): return 0
	
	# 1. Normalización: minúsculas, sin comas
	text = str(valor).lower().replace(',', '').replace('ó', 'o').strip()
	
	multiplier = 1
	
	# 2. Detección de Multiplicadores por prioridad (Mayor a menor)
	
	# Billones / Miles de millones
	if 'miles de millones' in text or 'billones' in text or 'mmd' in text:
		multiplier = 1_000_000_000
		
	# Millones (Palabra completa o abreviatura "1m", "1 m")
	# Regex: Busca un número seguido opcionalmente de espacio y una 'm' sola al final de palabra
	elif 'millon' in text or re.search(r'\d+\s*m\b', text):
		multiplier = 1_000_000
		
	# Miles (Palabra completa o abreviatura "10k", "10 k")
	elif 'mil' in text or re.search(r'\d+\s*k\b', text):
		multiplier = 1_000
		
	# 3. Extracción del número (soporta decimales "1.5")
	match = re.search(r'(\d+(\.\d+)?)', text)
	
	if match:
		try:
			numero = float(match.group(1))
			return int(numero * multiplier)
		except ValueError:
			return 0
	
	# Si no se encontró ningún número, retornar 0
	return 0


# ==================== NORMALIZACIÓN DE TEXTO (para búsquedas) ====================

def normalizar_texto(texto):
	"""
	Normaliza texto removiendo acentos, ñ->n, y convirtiendo a minúsculas.
	Útil para búsquedas flexibles que ignoren tildes y diéresis.
	
	Ejemplos:
		'Línea de Conducción' -> 'linea de conduccion'
		'Niño' -> 'nino'
		'Área' -> 'area'
	"""
	import unicodedata
	
	if not texto:
		return ''
	
	# Convertir a minúsculas
	texto = str(texto).lower()
	
	# Remover acentos/tildes usando NFD (Normalization Form Decomposition)
	# Esto separa caracteres acentuados en base + acento
	texto_nfd = unicodedata.normalize('NFD', texto)
	
	# Filtrar solo caracteres que NO sean marcas diacríticas (acentos)
	texto_sin_acentos = ''.join(
		char for char in texto_nfd 
		if unicodedata.category(char) != 'Mn'  # Mn = Marca No espaciadora (tildes)
	)
	
	# Normalizar ñ -> n (opcional, algunos prefieren mantenerla)
	# texto_sin_acentos = texto_sin_acentos.replace('ñ', 'n')
	
	return texto_sin_acentos


def capitalizar_texto(texto, siglas=None):
	"""
	Capitaliza texto de forma inteligente para presentación en UI.
	- Primera letra de cada palabra en mayúscula
	- Mantiene siglas conocidas en mayúsculas
	- Maneja preposiciones y artículos correctamente
	
	Args:
		texto: Texto a capitalizar
		siglas: Set de siglas a mantener en mayúsculas (opcional)
	
	Ejemplos:
		"CDMX" -> "CDMX"
		"CALLE 1" -> "Calle 1"
		"libertad" -> "Libertad"
		"av. insurgentes sur" -> "Av. Insurgentes Sur"
		"sistema de agua potable" -> "Sistema de Agua Potable"
	"""
	if not texto or texto == '':
		return None
	
	# Convertir a string y limpiar espacios extras
	text = str(texto).strip()
	
	if not text:
		return None
	
	# Lista de siglas comunes que deben mantenerse en mayúsculas
	if siglas is None:
		siglas = {
			'CDMX', 'MX', 'USA', 'EU', 'CFE', 'IMSS', 'ISSSTE', 
			'UNAM', 'IPN', 'UAM', 'SEP', 'INEGI', 'SAT',
			'CDMX', 'BRT', 'POA', 'ODS', 'ONU'
		}
	
	# Lista de palabras que van en minúsculas (preposiciones, artículos, conjunciones)
	minusculas = {
		'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 
		'unos', 'unas', 'y', 'e', 'o', 'u', 'en', 'a', 'con', 
		'por', 'para', 'sin', 'sobre', 'bajo', 'entre', 'hacia'
	}
	
	# Dividir en palabras
	words = text.split()
	capitalized_words = []
	
	for i, word in enumerate(words):
		# Limpiar puntuación al inicio/final para análisis
		clean_word = word.strip('.,;:()[]{}')
		
		# Caso 1: Si es una sigla conocida, mantenerla
		if clean_word.upper() in siglas:
			capitalized_words.append(word.upper())
		# Caso 2: Si es la primera palabra, siempre capitalizar
		elif i == 0:
			capitalized_words.append(word.capitalize())
		# Caso 3: Si es preposición/artículo, dejar en minúsculas
		elif clean_word.lower() in minusculas:
			capitalized_words.append(word.lower())
		# Caso 4: Palabra normal, capitalizar
		else:
			capitalized_words.append(word.capitalize())
	
	return ' '.join(capitalized_words)


def obtener_valor_por_defecto(campo_nombre, valor_actual):
	"""
	Retorna un valor por defecto apropiado según el tipo de campo.
	
	Args:
		campo_nombre: Nombre del campo
		valor_actual: Valor actual del campo
		
	Returns:
		Valor por defecto apropiado o el valor actual si existe
	"""
	if valor_actual and str(valor_actual).strip():
		return valor_actual
	
	# Mapeo de campos a valores por defecto contextuales
	defaults = {
		# Identificación y categorización
		'programa': 'Por Definir',
		'area_responsable': 'Por Asignar',
		'eje_institucional': 'Por Clasificar',
		'tipo_obra': 'Por Clasificar',
		'tipo_recurso': 'Por Definir',
		'fuente_financiamiento': 'Por Definir',
		'alcance_territorial': 'Por Determinar',
		'etapa_desarrollo': 'Por Determinar',
		'estatus_general': 'Por Revisar',
		
		# Responsables y ejecución
		'responsable_operativo': 'Por Asignar',
		'contratista': 'Por Contratar',
		
		# Ubicación
		'alcaldias': 'Por Determinar',
		'ubicacion_especifica': 'Por Definir',
		
		# Descripciones y observaciones
		'impacto_social_desc': 'Sin Descripción',
		'observaciones': 'Sin Observaciones',
		'problema_resuelve': 'Por Documentar',
		'solucion_ofrece': 'Por Documentar',
		'beneficiarios_directos': 'Por Identificar',
		
		# Riesgos y gestión
		'problemas_identificados': 'Sin Problemas Identificados',
		'acciones_correctivas': 'Sin Acciones Definidas',
		'riesgos': 'Sin Riesgos Identificados',
		'permisos_requeridos': 'Por Revisar',
		'estatus_permisos': 'Por Revisar',
		
		# Fechas y plazos (estos se manejan como None típicamente)
		'fecha_inicio_prog': None,
		'fecha_termino_prog': None,
		'fecha_inicio_real': None,
		'fecha_termino_real': None,
		
		# Valores numéricos (estos ya tienen defaults en el modelo)
		'duracion_meses': None,
		'multianualidad': 'Por Definir',
		
		# Comunicación
		'hitos_comunicacionales': 'Sin Hitos Definidos',
	}
	
	return defaults.get(campo_nombre, 'Por Definir')