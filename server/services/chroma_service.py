import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any
import json
from config import Config

class ChromaService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=Config.CHROMA_PERSIST_DIRECTORY,
            settings=Settings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name="code_review_rules",
            metadata={"description": "Code review rules and guidelines"}
        )
    
    def add_rules(self, rules_text: str, rule_name: str, description: str) -> bool:
        """Add new rules to the database"""
        try:
            # Split rules text into chunks
            chunks = self._chunk_text(rules_text)
            
            documents = []
            metadatas = []
            ids = []
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{rule_name}_{i}"
                documents.append(chunk)
                metadatas.append({
                    "rule_name": rule_name,
                    "description": description,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                })
                ids.append(chunk_id)
            
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            return True
        except Exception as e:
            print(f"Error adding rules: {e}")
            return False
    
    def search_rules(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant rules based on query"""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            formatted_results = []
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'document': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i] if 'distances' in results else None
                })
            
            return formatted_results
        except Exception as e:
            print(f"Error searching rules: {e}")
            return []
    
    def get_all_rules(self) -> List[Dict[str, Any]]:
        """Get all rules from the database"""
        try:
            results = self.collection.get()
            formatted_results = []
            
            for i in range(len(results['documents'])):
                formatted_results.append({
                    'document': results['documents'][i],
                    'metadata': results['metadatas'][i],
                    'id': results['ids'][i]
                })
            
            return formatted_results
        except Exception as e:
            print(f"Error getting all rules: {e}")
            return []
    
    def _chunk_text(self, text: str, chunk_size: int = 1000) -> List[str]:
        """Split text into chunks for better storage and retrieval"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0
        
        for word in words:
            if current_size + len(word) + 1 > chunk_size:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_size = len(word)
            else:
                current_chunk.append(word)
                current_size += len(word) + 1
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def clear_rules(self) -> bool:
        """Clear all rules from the database"""
        try:
            self.client.delete_collection("code_review_rules")
            self.collection = self.client.create_collection(
                name="code_review_rules",
                metadata={"description": "Code review rules and guidelines"}
            )
            return True
        except Exception as e:
            print(f"Error clearing rules: {e}")
            return False
