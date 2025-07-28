from django.core.management.base import BaseCommand
import os

class Command(BaseCommand):
    help = 'Start Celery beat scheduler'
    
    def handle(self, *args, **options):
        os.system('celery -A central beat --loglevel=info')