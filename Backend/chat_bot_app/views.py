from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser

from .models import ChatThread, Message, UploadedDocument
from .serializers import ChatThreadSerializer, MessageSerializer
from .llama_chain import query_llama_chain
from .rag_utils import extract_text_from_pdf, chunk_text, embed_and_store


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        if User.objects.filter(email=data['email']).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=user_obj.username, password=password)
        if not user:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'is_authenticated': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username
        })


class CreateChatThread(APIView):
    
    def post(self, request):
        title = request.data.get("title", "")
        thread = ChatThread.objects.create(user=request.user, title=title)
        return Response(ChatThreadSerializer(thread).data, status=status.HTTP_201_CREATED)


class ListChatThreads(APIView): 

    def get(self, request):
        threads = ChatThread.objects.filter(user=request.user)
        return Response(ChatThreadSerializer(threads, many=True).data)


class ThreadMessages(APIView):
    
    def get(self, request):
        thread_id = request.query_params.get("thread_id")
        thread = ChatThread.objects.filter(id=thread_id, user=request.user).first()
        if not thread:
            return Response({"error": "Thread not found"}, status=status.HTTP_404_NOT_FOUND)

        messages = thread.messages.all()
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request):
        thread_id = request.query_params.get("thread_id")
        content = request.data.get("content")

        try:
            thread = ChatThread.objects.get(id=thread_id, user=request.user)
        except ChatThread.DoesNotExist:
            return Response({"error": "Thread not found"}, status=status.HTTP_404_NOT_FOUND)

        user_msg = Message.objects.create(thread=thread, sender='user', content=content)
        bot_response = query_llama_chain(thread_id, content)
        bot_msg = Message.objects.create(thread=thread, sender='bot', content=bot_response)

        return Response({
            "user_message": MessageSerializer(user_msg).data,
            "bot_reply": MessageSerializer(bot_msg).data
        }, status=status.HTTP_201_CREATED)


class UploadDocumentView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        thread_id = request.query_params.get('thread_id')
        if not thread_id:
            return Response({"error": "Missing thread_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            thread = ChatThread.objects.get(id=thread_id, user=request.user)
        except ChatThread.DoesNotExist:
            return Response({"error": "Thread not found"}, status=status.HTTP_404_NOT_FOUND)

        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        doc = UploadedDocument.objects.create(user=request.user, thread=thread, file=file)

        pages = extract_text_from_pdf(doc.file.path)
        chunks = chunk_text(pages)
        embed_and_store(chunks, persist_directory=f"rag_store/thread_{thread.id}")

        return Response({"message": "Document uploaded and embedded successfully"}, status=status.HTTP_201_CREATED)
