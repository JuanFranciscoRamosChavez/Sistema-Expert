import pandas as pd
import os
import datetime

# Definimos las columnas (67 columnas, índices 0-66)
# Usamos una lista vacía para llenar luego, pandas maneja bien esto.
columns = [f"Col_{i}" for i in range(67)]

# --- CASO 1: El Registro Perfecto (Happy Path) ---
# Datos limpios, formatos numéricos correctos, fechas ISO.
caso_perfecto = [
    1, "PROGRAMA A", "DG OBRAS", "EJE 1", "FISCAL", "K001", "6000",
    1000000.00, # 7: Presupuesto (float limpio)
    1000000.00, # 8
    10.0,       # 9: Meta 2025
    0.0, "M2", 100.0, 100.0, "NO",
    "OBRA NUEVA", "ALCALDIA X", "LOCAL", "EJECUCION",
    1,          # 19: Complejidad (Int 1-5)
    "Descripción narrativa del impacto social correcto.", # 20: IMPACTO SOCIAL DESC (Debe ser texto)
    5,          # 21: Alineación
    5,          # 22: IMPACTO SOCIAL NIVEL (Int 1-5)
    1, 1, 1, 1, 1, 5.0, # 23-28
    "VERDE", "VERDE", "VERDE", "VERDE", "VERDE", # 29-33
    "IZTAPALAPA", "CALLE 1", "500", "500",
    "2026-01-01", "2026-12-31", "12", # 38-40: Fechas String
    None, None,
    0.0,        # 43: Avance Fisico (float)
    0.0, "EN TIEMPO", "NINGUNO", "OK",
    "N/A", "JUAN PEREZ", "CONSTRUCTORA X",
    "OBS 1", "PROB 1", "ACCION 1", "2026-01-15",
    "Prob", "Sol", "Ben", "Dato", "Ali", "Pob", "Rel", "Hit", "Men", "Est", "Con", "Not"
]

# --- CASO 2: El Registro "Sucio" (Dirty Data) ---
# Prueba limpieza de dinero ($ ,), porcentajes (%), y escalas en texto ("Alta").
caso_sucio = [
    2, "PROGRAMA B (SUCIO)", "DG OBRAS", "EJE 2", "FEDERAL", "K002", "6000",
    "$ 2,500,000.50", # 7: Presupuesto CON SIMBOLOS
    "1,000",          # 8: Texto con comas
    15, 0, "M2", 
    "$ 500.00",       # 12: Costo unitario sucio
    0, "NO",
    "MANTENIMIENTO", "ALCALDIA Y", "FEDERAL", "PLANEACION",
    "Muy Alta",       # 19: Complejidad (TEXTO -> debe convertir a 5)
    "Impacto narrativo con texto sucio.", # 20: Desc
    "Baja",           # 21: Alineación (TEXTO -> debe convertir a 2)
    "Crítico",        # 22: Impacto Nivel (TEXTO -> debe convertir a 5)
    "Urgente", "Media", "Bajo", "Alto", "Regular", # 23-27: Mix de escalas
    "4.5",            # 28: Puntuación como string
    "ROJO", "AMARILLO", "VERDE", "ROJO", "AMARILLO",
    "BENITO JUAREZ", "AVENIDA 2", "1,000", "1,000",
    45292,            # 38: Fecha tipo EXCEL SERIAL (int) ~2024
    45657,            # 39: Fecha tipo EXCEL SERIAL
    "6 meses", None, None,
    "45.5 %",         # 43: Avance Físico con % y espacio
    "20%",            # 44: Avance Financiero con %
    "RETRASADO", "PERMISO A", "PENDIENTE",
    "REQ", "MARIA", "CONST Y",
    "OBS", "PROB", "ACC", 45600, # Fecha Excel
    "P", "S", "B", "D", "A", "P", "R", "H", "M", "E", "C", "N"
]

# --- CASO 3: El Registro Vacío/Nulo (Null/Edge Cases) ---
# Prueba cómo maneja el sistema los NaNs. Debería poner defaults (0 o 1).
caso_vacio = [
    3, "PROGRAMA C (VACIO)", None, None, None, None, None,
    None, # 7: Presupuesto None -> Debe ser 0.0
    float('nan'), # 8: NaN -> Debe ser 0.0
    None, None, None, None, None, None,
    None, None, None, None,
    None, # 19: Complejidad None -> Default 1
    None, # 20: Desc None
    None, # 21: Alineación None -> Default 1
    None, # 22: Impacto Nivel None -> Default 1
    None, None, None, None, None, None,
    None, None, None, None, None,
    None, None, None, None,
    None, # 38: Fecha None
    None, None, None, None,
    None, # 43: Avance None -> 0.0
    None, None, None, None,
    None, None, None,
    None, None, None, None,
    None, None, None, None, None, None, None, None, None, None, None, None
]

# --- CASO 4: La Prueba de Fuego del PDF (Corrección Col 20/22) ---
# Verifica explícitamente que la col 20 guarde texto y la 22 guarde el número.
caso_pdf = [
    4, "PROGRAMA D (PDF TEST)", "DGCOP", "EJE SOCIAL", "LOCAL", "K004", "6000",
    50000.0, 50000.0, 1, 1, "PZA", 100, 100, "SI",
    "REHABILITACION", "TODAS", "LOCAL", "EJECUCION",
    3, # 19
    "ESTO DEBE SER TEXTO: Se beneficia a población vulnerable.", # 20: COLUMNA CONFLICTIVA
    4, # 21
    5, # 22: COLUMNA DE ESCALA (Debe ser 5)
    4, 4, 4, 4, 4, 4.0,
    "VERDE", "VERDE", "VERDE", "VERDE", "VERDE",
    "TODAS", "CDMX", "1M", "1M",
    "2026-02-01", "2026-11-30", "9", None, None,
    50.0, 50.0, "EN PROCESO", None, None,
    None, "RESP", "CONT",
    None, None, None, None,
    "P", "S", "B", "D", "A", "P", "R", "H", "M", "E", "C", "N"
]

# Rellenar con None si alguna fila quedó corta (seguridad)
def pad_row(row, length=67):
    return row + [None] * (length - len(row))

data = [
    pad_row(caso_perfecto),
    pad_row(caso_sucio),
    pad_row(caso_vacio),
    pad_row(caso_pdf)
]

# Crear DataFrame
df = pd.DataFrame(data, columns=columns)

# Crear directorio si no existe
os.makedirs('data', exist_ok=True)
file_path = os.path.join('data', 'datos.xlsx')

# Guardar incluyendo header (que el script importar_excel salta con iloc[1:])
# Por tanto, necesitamos UNA FILA EXTRA de "falso header" o el script se comerá el caso 1.
# El script importar_excel hace: df = pd.read_excel(..., header=None); df = df.iloc[1:]
# Esto significa que la fila 0 del Excel se descarta.
# Pandas al guardar con header=True pone los nombres de columnas en la fila 0. Perfecto.
df.to_excel(file_path, index=False, header=False) 

print(f"Archivo generado en: {file_path}")
print("NOTA: Se ha generado SIN cabeceras (header=False) para simular que la fila 0 es data bruta o")
print("si tu script espera saltar la primera fila, asegúrate de ajustar el generador o el script de importación.")
print("Para este caso específico, voy a insertar una fila dummy al inicio para que tu script 'df.iloc[1:]' funcione perfecto.")

# Re-guardar con una fila dummy al principio
df_final = pd.DataFrame([["HEADER_DUMMY"]*67], columns=columns)
df_final = pd.concat([df_final, df], ignore_index=True)
df_final.to_excel(file_path, index=False, header=False)
print("¡Listo! Archivo con fila dummy de cabecera generado exitosamente.")