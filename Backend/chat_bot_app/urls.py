from django.urls import path
from .views import *
from rest_framework_simplejwt.views import  TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),

    path('thread/', CreateChatThread.as_view()),
    path('thread_list/', ListChatThreads.as_view()),

    path('thread_message/', ThreadMessages.as_view()),
    path('upload_document/', UploadDocumentView.as_view(), name='upload-document'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    
]
