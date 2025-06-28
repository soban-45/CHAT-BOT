from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.document_loaders import PyPDFLoader

def extract_text_from_pdf(file_path):
    """
    Extracts text from a PDF file using LangChain's PyPDFLoader.
    Returns a list of Document objects (one per page).
    """
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    return pages


def chunk_text(pages):
    """
    Splits list of Document pages into smaller overlapping chunks
    using RecursiveCharacterTextSplitter for better embedding granularity.
    """
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    documents = splitter.split_documents(pages)
    return documents


def embed_and_store(documents, persist_directory):
    """
    Embeds documents using Ollama embeddings and stores them in a Chroma vector DB.
    The vector store is persisted locally.
    """
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    vectordb = Chroma.from_documents(
        documents,
        embedding=embeddings,
        persist_directory=persist_directory
    )
    vectordb.persist()
