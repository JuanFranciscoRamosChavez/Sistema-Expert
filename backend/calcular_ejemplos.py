#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para calcular la puntuación de los proyectos de la imagen
considerando las escalas inversas de RIESGO y DEPENDENCIAS.
"""

from poa.utils import interpretar_escala_flexible, calcular_puntuacion_ponderada, obtener_etiqueta_prioridad

# Proyectos de la imagen (fila por fila)
proyectos = [
    {
        "nombre": "Proyecto 1",
        "alineacion": "4 - Alto",
        "impacto": "5 - Muy alto",
        "urgencia": "5 - Muy alto",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "5 - Regular",  # INVERSA: 5 = muy bajo riesgo (bueno)
        "dependencias": "5 - Muy alto"  # INVERSA: 5 = muy autónomo (bueno)
    },
    {
        "nombre": "Proyecto 2",
        "alineacion": "4 - Alto",
        "impacto": "5 - Muy alto",
        "urgencia": "5 - Muy alto",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "3 - Regular",  # INVERSA
        "dependencias": "5 - Muy alto"  # INVERSA
    },
    {
        "nombre": "Proyecto 3 (Regular)",
        "alineacion": "Regular",
        "impacto": "5 - Muy alto",
        "urgencia": "4 - Alto",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "2 - Bajo",  # INVERSA: 2 = alto riesgo (malo)
        "dependencias": "1 - Muy bajo"  # INVERSA: 1 = muy dependiente (malo)
    },
    {
        "nombre": "Proyecto 4 (Muy)",
        "alineacion": "Muy",
        "impacto": "5 - Muy alto",
        "urgencia": "3 - Regular",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "2 - Bajo",  # INVERSA
        "dependencias": "5 - Muy alto"  # INVERSA
    },
    {
        "nombre": "Proyecto 5 (Muy)",
        "alineacion": "Muy",
        "impacto": "5 - Muy alto",
        "urgencia": "4 - Alto",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "3 - Regular",  # INVERSA
        "dependencias": "5 - Muy alto"  # INVERSA
    },
    {
        "nombre": "Proyecto 6 (Muy)",
        "alineacion": "Muy",
        "impacto": "5 - Muy alto",
        "urgencia": "3 - Regular",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "2 - Bajo",  # INVERSA
        "dependencias": "3 - Regular"  # INVERSA
    },
    {
        "nombre": "Proyecto 7 (Muy)",
        "alineacion": "Muy",
        "impacto": "5 - Muy alto",
        "urgencia": "3 - Regular",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "2 - Bajo",  # INVERSA
        "dependencias": "3 - Regular"  # INVERSA
    },
    {
        "nombre": "Proyecto 8 (Muy)",
        "alineacion": "Muy",
        "impacto": "5 - Muy alto",
        "urgencia": "3 - Regular",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "2 - Bajo",  # INVERSA
        "dependencias": "3 - Regular"  # INVERSA
    },
    {
        "nombre": "Proyecto 9 (Muy)",
        "alineacion": "Muy",
        "impacto": "5 - Muy alto",
        "urgencia": "5 - Muy alto",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "3 - Regular",  # INVERSA
        "dependencias": "2 - Bajo"  # INVERSA: 2 = dependiente (malo)
    },
    {
        "nombre": "Proyecto 10 (4-Alto)",
        "alineacion": "4 - Alto",
        "impacto": "5 - Muy alto",
        "urgencia": "5 - Muy alto",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "3 - Regular",  # INVERSA
        "dependencias": "5 - Muy alto"  # INVERSA
    },
    {
        "nombre": "Proyecto 11 (Muy)",
        "alineacion": "Muy",
        "impacto": "5 - Muy alto",
        "urgencia": "4 - Alto",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "3 - Regular",  # INVERSA
        "dependencias": "5 - Muy alto"  # INVERSA
    },
    {
        "nombre": "Proyecto 12 (Muy)",
        "alineacion": "Muy",
        "impacto": "5 - Muy alto",
        "urgencia": "5 - Muy alto",
        "viabilidad": "4 - Alto",
        "recursos": "5 - Muy alto",
        "riesgo": "3 - Regular",  # INVERSA
        "dependencias": "5 - Muy alto"  # INVERSA
    },
]

print("=" * 100)
print("ANÁLISIS DE PROYECTOS CON ESCALAS INVERSAS (RIESGO Y DEPENDENCIAS)")
print("=" * 100)
print()

# Contadores por prioridad
conteo = {
    'critica': [],
    'muy_alta': [],
    'alta': [],
    'media': [],
    'baja': []
}

for proyecto in proyectos:
    # Interpretar escalas
    alineacion = interpretar_escala_flexible(proyecto['alineacion'])
    impacto = interpretar_escala_flexible(proyecto['impacto'])
    urgencia = interpretar_escala_flexible(proyecto['urgencia'])
    viabilidad = interpretar_escala_flexible(proyecto['viabilidad'])
    recursos = interpretar_escala_flexible(proyecto['recursos'])
    riesgo = interpretar_escala_flexible(proyecto['riesgo'])
    dependencias = interpretar_escala_flexible(proyecto['dependencias'])
    
    # Calcular puntuación (la función ya invierte riesgo y dependencias)
    puntuacion = calcular_puntuacion_ponderada(
        alineacion, impacto, urgencia, viabilidad, 
        recursos, riesgo, dependencias
    )
    
    # Obtener etiqueta
    prioridad = obtener_etiqueta_prioridad(puntuacion)
    
    # Agregar a conteo
    conteo[prioridad].append(proyecto['nombre'])
    
    # Calcular valores invertidos para mostrar
    riesgo_inv = 6 - riesgo
    dep_inv = 6 - dependencias
    
    # Determinar icono
    if prioridad == 'critica':
        icono = "🔴"
    elif prioridad == 'muy_alta':
        icono = "🟠"
    elif prioridad == 'alta':
        icono = "🟡"
    elif prioridad == 'media':
        icono = "🟢"
    else:
        icono = "⚪"
    
    print(f"{icono} {proyecto['nombre']}")
    print(f"   Criterios: A={alineacion}, I={impacto}, U={urgencia}, V={viabilidad}, R={recursos}")
    print(f"   Riesgo: {riesgo} → invertido: {riesgo_inv} (1={riesgo} es muy alto riesgo)")
    print(f"   Dependencias: {dependencias} → invertido: {dep_inv} (1={dependencias} es muy dependiente)")
    print(f"   Puntuación Final: {puntuacion}")
    print(f"   Prioridad: {prioridad.upper().replace('_', ' ')}")
    print()

print("=" * 100)
print("RESUMEN POR PRIORIDAD")
print("=" * 100)
print()

print(f"🔴 CRÍTICA (4.5-5.0): {len(conteo['critica'])} proyectos")
for p in conteo['critica']:
    print(f"   • {p}")
print()

print(f"🟠 MUY ALTA (3.5-4.49): {len(conteo['muy_alta'])} proyectos")
for p in conteo['muy_alta']:
    print(f"   • {p}")
print()

print(f"🟡 ALTA (2.5-3.49): {len(conteo['alta'])} proyectos")
for p in conteo['alta']:
    print(f"   • {p}")
print()

print(f"🟢 MEDIA (1.5-2.49): {len(conteo['media'])} proyectos")
for p in conteo['media']:
    print(f"   • {p}")
print()

print(f"⚪ BAJA (1.0-1.49): {len(conteo['baja'])} proyectos")
for p in conteo['baja']:
    print(f"   • {p}")
print()

print("=" * 100)
print("INTERPRETACIÓN DE ESCALAS INVERSAS")
print("=" * 100)
print()
print("RIESGO (escala inversa):")
print("  • 1 = Muy alto riesgo (MALO) → se invierte a 5 (penaliza mucho)")
print("  • 2 = Alto riesgo (MALO) → se invierte a 4")
print("  • 3 = Riesgo medio (NEUTRAL) → se invierte a 3")
print("  • 4 = Bajo riesgo (BUENO) → se invierte a 2")
print("  • 5 = Muy bajo riesgo (BUENO) → se invierte a 1 (beneficia)")
print()
print("DEPENDENCIAS (escala inversa):")
print("  • 1 = Muy dependiente (MALO) → se invierte a 5 (penaliza mucho)")
print("  • 2 = Dependiente (MALO) → se invierte a 4")
print("  • 3 = Neutral → se invierte a 3")
print("  • 4 = Poco dependiente (BUENO) → se invierte a 2")
print("  • 5 = Muy autónomo (BUENO) → se invierte a 1 (beneficia)")
print()
