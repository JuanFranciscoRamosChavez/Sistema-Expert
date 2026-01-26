"""
Script de Validación - Migración de Componentes a Serverside
Sprint 2: TimelineView y TransparencyView

Compara versiones OLD (client-side) vs V2 (serverside)
"""

import os
from pathlib import Path

def count_lines(file_path):
    """Cuenta líneas de código (sin comentarios ni vacías)"""
    if not os.path.exists(file_path):
        return 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    code_lines = 0
    for line in lines:
        stripped = line.strip()
        # Ignora líneas vacías y comentarios
        if stripped and not stripped.startswith('//') and not stripped.startswith('/*') and not stripped.startswith('*'):
            code_lines += 1
    
    return code_lines

def search_pattern(file_path, patterns):
    """Busca patrones en un archivo"""
    if not os.path.exists(file_path):
        return []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    findings = []
    for pattern, description in patterns:
        if pattern in content:
            count = content.count(pattern)
            findings.append((description, count))
    
    return findings

def main():
    base_path = Path(__file__).parent.parent / 'src' / 'components' / 'views'
    
    print("=" * 70)
    print("VALIDACIÓN: MIGRACIÓN DE COMPONENTES A SERVERSIDE")
    print("=" * 70)
    print()
    
    # ============== TIMELINEVIEW ==============
    print("📊 TIMELINEVIEW.TSX")
    print("-" * 70)
    
    timeline_old = base_path / 'TimelineView.OLD.tsx'
    timeline_new = base_path / 'TimelineView.tsx'
    
    old_lines = count_lines(timeline_old)
    new_lines = count_lines(timeline_new)
    
    print(f"Líneas de código (OLD): {old_lines}")
    print(f"Líneas de código (V2):  {new_lines}")
    
    if old_lines > 0:
        reduction = ((old_lines - new_lines) / old_lines) * 100
        print(f"✅ Reducción:           {reduction:.1f}% (-{old_lines - new_lines} líneas)")
    
    print()
    print("Patrones eliminados (lógica client-side):")
    old_patterns = [
        ('parseFlexibleDate', '  ❌ parseFlexibleDate()'),
        ('useMemo', '  ❌ useMemo'),
        ('.filter(', '  ❌ .filter()'),
        ('.reduce(', '  ❌ .reduce()'),
    ]
    
    for pattern, desc in old_patterns:
        old_file = open(timeline_old, 'r', encoding='utf-8').read() if os.path.exists(timeline_old) else ''
        new_file = open(timeline_new, 'r', encoding='utf-8').read() if os.path.exists(timeline_new) else ''
        
        old_count = old_file.count(pattern)
        new_count = new_file.count(pattern)
        
        if old_count > new_count:
            print(f"{desc:40} {old_count} → {new_count}")
    
    print()
    print("Hooks serverside añadidos:")
    new_patterns = [
        ('useUpcomingProjects', '  ✅ useUpcomingProjects'),
        ('useProjectsByYear', '  ✅ useProjectsByYear'),
        ('useMilestoneProjects', '  ✅ useMilestoneProjects'),
    ]
    
    for pattern, desc in new_patterns:
        new_file = open(timeline_new, 'r', encoding='utf-8').read() if os.path.exists(timeline_new) else ''
        count = new_file.count(pattern)
        if count > 0:
            print(f"{desc:40} {count}x")
    
    print()
    print("=" * 70)
    
    # ============== TRANSPARENCYVIEW ==============
    print("💰 TRANSPARENCYVIEW.TSX")
    print("-" * 70)
    
    transparency_old = base_path / 'TransparencyView.OLD.tsx'
    transparency_new = base_path / 'TransparencyView.tsx'
    
    old_lines = count_lines(transparency_old)
    new_lines = count_lines(transparency_new)
    
    print(f"Líneas de código (OLD): {old_lines}")
    print(f"Líneas de código (V2):  {new_lines}")
    
    if old_lines > 0:
        reduction = ((old_lines - new_lines) / old_lines) * 100
        if reduction > 0:
            print(f"✅ Reducción:           {reduction:.1f}% (-{old_lines - new_lines} líneas)")
        else:
            print(f"⚠️  Ligero aumento:      {abs(reduction):.1f}% (+{new_lines - old_lines} líneas)")
            print("   (Por añadir estados de carga y manejo de errores)")
    
    print()
    print("Patrones eliminados (lógica client-side):")
    old_patterns = [
        ('mockProjects.reduce', '  ❌ mockProjects.reduce()'),
        ('mockProjects.filter', '  ❌ mockProjects.filter()'),
        ('mockProjects.slice', '  ❌ mockProjects.slice()'),
    ]
    
    for pattern, desc in old_patterns:
        old_file = open(transparency_old, 'r', encoding='utf-8').read() if os.path.exists(transparency_old) else ''
        new_file = open(transparency_new, 'r', encoding='utf-8').read() if os.path.exists(transparency_new) else ''
        
        old_count = old_file.count(pattern)
        new_count = new_file.count(pattern)
        
        if old_count > new_count:
            print(f"{desc:40} {old_count} → {new_count}")
    
    print()
    print("Hooks serverside añadidos:")
    new_patterns = [
        ('useBudgetByDirection', '  ✅ useBudgetByDirection'),
        ('useFilteredProjects', '  ✅ useFilteredProjects'),
    ]
    
    for pattern, desc in new_patterns:
        new_file = open(transparency_new, 'r', encoding='utf-8').read() if os.path.exists(transparency_new) else ''
        count = new_file.count(pattern)
        if count > 0:
            print(f"{desc:40} {count}x")
    
    print()
    print("=" * 70)
    
    # ============== RESUMEN FINAL ==============
    print("📈 RESUMEN DE IMPACTO")
    print("-" * 70)
    
    timeline_old_lines = count_lines(timeline_old)
    timeline_new_lines = count_lines(timeline_new)
    transparency_old_lines = count_lines(transparency_old)
    transparency_new_lines = count_lines(transparency_new)
    
    total_old = timeline_old_lines + transparency_old_lines
    total_new = timeline_new_lines + transparency_new_lines
    
    print(f"Total líneas ANTES:     {total_old}")
    print(f"Total líneas DESPUÉS:   {total_new}")
    
    if total_old > 0:
        total_reduction = ((total_old - total_new) / total_old) * 100
        print(f"✅ Reducción total:     {total_reduction:.1f}%")
    
    print()
    print("🎯 BENEFICIOS:")
    print("  • Sin lógica pesada client-side (filtros, sorts, reduce)")
    print("  • Cache inteligente con TanStack Query")
    print("  • Paginación serverside (menos RAM)")
    print("  • Actualizaciones automáticas (stale-while-revalidate)")
    print("  • Mejor experiencia de usuario (spinners de carga)")
    print()
    print("=" * 70)

if __name__ == '__main__':
    main()
