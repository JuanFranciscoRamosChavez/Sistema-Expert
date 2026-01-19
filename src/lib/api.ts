import { Project } from './mockData';
import { mapApiToUiProject } from './mappers';
import { APIProject } from '@/types';

const API_URL = 'http://127.0.0.1:8000/api/obras/';

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error conectando con Django');
    
    const data = await response.json();
    
    // Soporte para paginación de Django (results) o array directo
    const results = Array.isArray(data) ? data : data.results || [];

    // REFACTOR: Usamos el mapper centralizado para evitar duplicar lógica.
    // Esto asegura que 'puntajePrioridad' y 'prioridad' se calculen correctamente
    // basándose en los 7 criterios del Bloque 4.
    return results.map((obra: APIProject) => mapApiToUiProject(obra));
    
  } catch (error) {
    console.error("Fallo al cargar proyectos:", error);
    return [];
  }
}