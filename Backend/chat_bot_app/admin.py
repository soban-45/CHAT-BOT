from django.contrib import admin
from .models import *

admin.site.register(ChatThread)
admin.site.register(Message)
admin.site.register(UploadedDocument)