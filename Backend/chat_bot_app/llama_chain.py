import os
from langchain_community.chat_models import ChatOllama
from langchain.chains import ConversationChain, RetrievalQA
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from .models import ChatThread

chat_chains = {}

def get_chain(thread_id):

    if thread_id in chat_chains:
        return chat_chains[thread_id]

    try:
        thread = ChatThread.objects.get(id=thread_id)
    except ChatThread.DoesNotExist:
        raise Exception("Thread not found")

    messages = thread.messages.all().order_by("timestamp")
    memory = ConversationBufferMemory(
        return_messages=False,
        memory_key="history",
        input_key="input"
    )

    for msg in messages:
        if msg.sender == "user":
            memory.chat_memory.add_user_message(msg.content)
        else:
            memory.chat_memory.add_ai_message(msg.content)

    prompt = PromptTemplate.from_template("""
    You are a helpful assistant. Keep answers clear and relevant.

    {history}
    User: {input}
    Assistant:""")

    chain = ConversationChain(
        llm=ChatOllama(model="llama2"),
        memory=memory,
        prompt=prompt,
        verbose=False
    )

    chat_chains[thread_id] = chain
    return chain


def query_llama_chain(thread_id, user_input):
   
    try:
        chain = get_chain(thread_id)
        vs_path = f"rag_store/thread_{thread_id}"

        if os.path.exists(vs_path):
            embeddings = OllamaEmbeddings(model="nomic-embed-text")
            vectordb = Chroma(persist_directory=vs_path, embedding_function=embeddings)
            retriever = vectordb.as_retriever(search_kwargs={"k": 3})

            rag_chain = RetrievalQA.from_chain_type(
                llm=ChatOllama(model="llama2"),
                retriever=retriever
            )

            result = rag_chain.invoke({"query": user_input})
            return result["result"].strip()

        return chain.run(user_input).strip()

    except Exception as e:
        return f"Error during response: {e}"
