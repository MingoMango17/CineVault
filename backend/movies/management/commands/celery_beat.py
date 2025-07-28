from django.core.management.base import BaseCommand
import os

class Command(BaseCommand):
    help = 'Start Celery worker'
    
    def handle(self, *args, **options):
        os.system('celery -A central worker --loglevel=info')