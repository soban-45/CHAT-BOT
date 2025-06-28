# AI Chatbot with RAG (Retrieval-Augmented Generation)

A ChatGPT-like web application built using Django REST API, React frontend, LangChain, Chroma vector store, and Ollama-powered LLaMA2 models. 
Supports contextual conversations with PDF document upload and retrieval-based response generation.

---

## Features

-  **User Authentication** – Register/Login using email & password (JWT tokens).
-  **Chat Interface** – Create threads and send messages like ChatGPT.
-  **Memory-Based Chat** – Uses LangChain’s memory to maintain context per thread.
-  **Document Upload** – Upload PDFs per thread for context-aware responses.
-  **RAG Integration** – Answers generated using vector-based retrieval from uploaded documents.
-  **Ollama Integration** – Uses `llama2` for LLM and `nomic-embed-text` for embeddings.

---

##  Tech Stack

- **Backend**: Django, Django REST Framework, SimpleJWT
- **AI Stack**: LangChain, Ollama, ChromaDB, PyPDFLoader
- **Frontend**: React (Vite), Material UI (in separate repo/UI)
- **Vector Store**: ChromaDB (stored locally)
- **Embedding Model**: `nomic-embed-text`
- **LLM**: `llama2` via Ollama

---

