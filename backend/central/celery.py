import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "central.settings")

app = Celery("central")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
