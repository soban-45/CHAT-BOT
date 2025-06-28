from rest_framework import serializers
from .models import *

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class ChatThreadSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChatThread
        fields = '__all__'
        read_only_fields = ['user']

class UploadedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedDocument
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_at']