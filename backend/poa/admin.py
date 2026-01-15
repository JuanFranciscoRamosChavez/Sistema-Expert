# backend/poa/admin.py
from django.contrib import admin
from .models import Obra

@admin.register(Obra)
class ObraAdmin(admin.ModelAdmin):
    list_display = ('id_excel', 'programa', 'presupuesto_modificado', 'urgencia')
    search_fields = ('programa',)