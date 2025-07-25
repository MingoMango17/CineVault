from django.contrib import admin
from .models import Movie

# Register your models here.
@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_fields = ("title", "date_added")
    readonly_fields = ("date_added",)
