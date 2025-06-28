from django.db import models
from django.contrib.auth.models import User

class ChatThread(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_threads')
    title = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"Thread {self.id}"

class Message(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=[('user', 'User'), ('bot', 'Bot')])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.content[:30]}"


class UploadedDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} for Thread {self.thread.id}"
