import pandas as pd
import numpy as np
import re

# 1. Catálogo de Escalas
CATALOGO_ESCALAS = {
	"muy bajo": 1, 
	"bajo": 2, 
	"regular": 3, "medio": 3, "media": 3,
	"alto": 4, "alta": 4, 
	"muy alto": 5, "muy alta": 5,
}

def clean_money_vectorized(valor):
	"""
	Limpia y estandariza montos financieros.
	Entrada: 35999.76998888 -> Salida: 35999.77
	Entrada: "$ 1,990.6"    -> Salida: 1990.60
	"""
	if pd.isna(valor): return 0.0
	
	# Convertir a string, quitar símbolos de moneda y comas
	val_str = str(valor).replace('$', '').replace(',', '').strip()
	
	try:
		# Convertir a float
		numero = float(val_str)
		# Redondear a 2 decimales estrictos (regla financiera)
		return round(numero, 2)
	except:
		return 0.0

def clean_percentage_vectorized(valor):
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
	if pd.isna(valor): return 1
	val_str = str(valor).strip().lower()
	match = re.search(r'\b([1-5])\b', val_str)
	if match: return int(match.group(1))
	for key, num in CATALOGO_ESCALAS.items():
		if key in val_str: return num
	return 1

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
			
	return 0