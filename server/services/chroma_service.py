import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import json
from config import Config
import datetime

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
        """Search for relevant rules based on query, combining chunks into readable content"""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            # Group chunks by rule name
            rule_groups = {}
            for i in range(len(results['documents'][0])):
                metadata = results['metadatas'][0][i]
                rule_name = metadata.get('rule_name', 'Unknown')
                distance = results['distances'][0][i] if 'distances' in results else None
                
                if rule_name not in rule_groups:
                    rule_groups[rule_name] = {
                        'chunks': [],
                        'metadata': metadata,
                        'distance': distance,
                        'ids': []
                    }
                
                rule_groups[rule_name]['chunks'].append({
                    'content': results['documents'][0][i],
                    'chunk_index': metadata.get('chunk_index', 0),
                    'id': results['ids'][0][i] if 'ids' in results else None
                })
                if 'ids' in results:
                    rule_groups[rule_name]['ids'].append(results['ids'][0][i])
            
            # Combine chunks and format results
            formatted_results = []
            for rule_name, rule_data in rule_groups.items():
                # Sort chunks by index to maintain order
                sorted_chunks = sorted(rule_data['chunks'], key=lambda x: x['chunk_index'])
                
                # Combine all chunks into one readable content
                combined_content = '\n\n'.join(chunk['content'] for chunk in sorted_chunks)
                
                # Get the first chunk's metadata for the main rule info
                first_chunk = sorted_chunks[0]
                metadata = rule_data['metadata']
                
                formatted_result = {
                    'rule_name': rule_name,
                    'description': metadata.get('description', ''),
                    'content': combined_content,
                    'total_chunks': len(sorted_chunks),
                    'chunk_ids': rule_data['ids'],
                    'first_chunk_id': first_chunk['id'],
                    'relevance_score': 1.0 - (rule_data['distance'] or 0) if rule_data['distance'] is not None else None
                }
                
                formatted_results.append(formatted_result)
            
            # Sort by relevance score if available
            if any(r.get('relevance_score') is not None for r in formatted_results):
                formatted_results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            
            return formatted_results
            
        except Exception as e:
            return []
    
    def get_all_rules(self) -> List[Dict[str, Any]]:
        """Get all rules from the database, combining chunks into readable content"""
        try:
            results = self.collection.get()
            
            # Group chunks by rule name
            rule_groups = {}
            for i in range(len(results['documents'])):
                metadata = results['metadatas'][i]
                rule_name = metadata.get('rule_name', 'Unknown')
                
                if rule_name not in rule_groups:
                    rule_groups[rule_name] = {
                        'chunks': [],
                        'metadata': metadata,
                        'ids': []
                    }
                
                rule_groups[rule_name]['chunks'].append({
                    'content': results['documents'][i],
                    'chunk_index': metadata.get('chunk_index', 0),
                    'id': results['ids'][i]
                })
                rule_groups[rule_name]['ids'].append(results['ids'][i])
            
            # Combine chunks and format results
            formatted_results = []
            for rule_name, rule_data in rule_groups.items():
                # Sort chunks by index to maintain order
                sorted_chunks = sorted(rule_data['chunks'], key=lambda x: x['chunk_index'])
                
                # Combine all chunks into one readable content
                combined_content = '\n\n'.join(chunk['content'] for chunk in sorted_chunks)
                
                # Get the first chunk's metadata for the main rule info
                first_chunk = sorted_chunks[0]
                metadata = rule_data['metadata']
                
                formatted_results.append({
                    'rule_name': rule_name,
                    'description': metadata.get('description', ''),
                    'content': combined_content,
                    'total_chunks': len(sorted_chunks),
                    'chunk_ids': rule_data['ids'],
                    'first_chunk_id': first_chunk['id']
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
        
    def delete_rule_by_id(self, rule_id: str) -> Dict[str, Any]:
        """Delete a specific rule by its ID with enhanced validation and error handling"""
        try:
            # Input validation
            if not rule_id or not isinstance(rule_id, str):
                return {
                    "success": False,
                    "message": "Invalid rule ID provided",
                    "rule_id": rule_id,
                    "error_type": "validation_error"
                }
            
            # Check if the rule exists and get its details before deletion
            try:
                rule_data = self.collection.get(ids=[rule_id])
                if not rule_data['ids']:
                    return {
                        "success": False,
                        "message": f"Rule with ID '{rule_id}' not found",
                        "rule_id": rule_id,
                        "error_type": "not_found"
                    }
                
                # Get rule details for audit trail
                rule_metadata = rule_data['metadatas'][0] if rule_data['metadatas'] else {}
                rule_name = rule_metadata.get('rule_name', 'Unknown')
                rule_description = rule_metadata.get('description', 'No description')
                chunk_index = rule_metadata.get('chunk_index', 0)
                total_chunks = len(rule_data['ids'])
                
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Error checking rule existence: {str(e)}",
                    "rule_id": rule_id,
                    "error_type": "check_error"
                }
            
            # Delete the rule
            try:
                self.collection.delete(ids=[rule_id])
                
                # Return success with rule details for audit trail
                return {
                    "success": True,
                    "message": f"Rule '{rule_name}' (ID: {rule_id}) deleted successfully",
                    "rule_id": rule_id,
                    "rule_name": rule_name,
                    "rule_description": rule_description,
                    "chunk_index": chunk_index,
                    "total_chunks": total_chunks,
                    "deleted_at": str(datetime.datetime.now())
                }
                
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Error during deletion: {str(e)}",
                    "rule_id": rule_id,
                    "error_type": "deletion_error"
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error: {str(e)}",
                "rule_id": rule_id,
                "error_type": "unexpected_error"
            }
    
    def delete_rules_by_ids(self, rule_ids: List[str]) -> Dict[str, Any]:
        """Delete multiple rules by their IDs with bulk operation support"""
        try:
            # Input validation
            if not rule_ids or not isinstance(rule_ids, list):
                return {
                    "success": False,
                    "message": "Invalid rule IDs provided - must be a list",
                    "rule_ids": rule_ids,
                    "error_type": "validation_error"
                }
            
            if len(rule_ids) == 0:
                return {
                    "success": False,
                    "message": "No rule IDs provided",
                    "rule_ids": rule_ids,
                    "error_type": "validation_error"
                }
            
            # Validate each ID
            invalid_ids = [rid for rid in rule_ids if not isinstance(rid, str) or not rid.strip()]
            if invalid_ids:
                return {
                    "success": False,
                    "message": f"Invalid rule IDs found: {invalid_ids}",
                    "rule_ids": rule_ids,
                    "invalid_ids": invalid_ids,
                    "error_type": "validation_error"
                }
            
            # Check which rules exist and get their details
            existing_rules = []
            non_existing_ids = []
            
            try:
                # Get all rules to check existence
                all_rules = self.collection.get()
                existing_ids = set(all_rules['ids'])
                
                for rule_id in rule_ids:
                    if rule_id in existing_ids:
                        # Find the rule details
                        idx = all_rules['ids'].index(rule_id)
                        metadata = all_rules['metadatas'][idx]
                        existing_rules.append({
                            'id': rule_id,
                            'name': metadata.get('rule_name', 'Unknown'),
                            'description': metadata.get('description', 'No description'),
                            'chunk_index': metadata.get('chunk_index', 0)
                        })
                    else:
                        non_existing_ids.append(rule_id)
                
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Error checking rule existence: {str(e)}",
                    "rule_ids": rule_ids,
                    "error_type": "check_error"
                }
            
            # Delete existing rules
            if existing_rules:
                try:
                    existing_ids = [rule['id'] for rule in existing_rules]
                    self.collection.delete(ids=existing_ids)
                    
                    # Return success with detailed results
                    return {
                        "success": True,
                        "message": f"Successfully deleted {len(existing_rules)} rules",
                        "total_requested": len(rule_ids),
                        "successfully_deleted": len(existing_rules),
                        "not_found": len(non_existing_ids),
                        "deleted_rules": existing_rules,
                        "not_found_ids": non_existing_ids,
                        "deleted_at": str(datetime.datetime.now())
                    }
                    
                except Exception as e:
                    return {
                        "success": False,
                        "message": f"Error during bulk deletion: {str(e)}",
                        "rule_ids": rule_ids,
                        "error_type": "deletion_error"
                    }
            else:
                return {
                    "success": False,
                    "message": "No existing rules found to delete",
                    "rule_ids": rule_ids,
                    "not_found_ids": non_existing_ids,
                    "error_type": "not_found"
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error: {str(e)}",
                "rule_ids": rule_ids,
                "error_type": "unexpected_error"
            }
    
    def delete_rules_by_name(self, rule_name: str) -> bool:
        """Delete all chunks of a rule by rule name"""
        try:
            # Get all rules with the specified name
            results = self.collection.get(
                where={"rule_name": rule_name}
            )
            
            if not results['ids']:
                return False
            
            # Delete all chunks of the rule
            self.collection.delete(ids=results['ids'])
            return True
        except Exception as e:
            print(f"Error deleting rules with name {rule_name}: {e}")
            return False
    
    def get_rule_by_name(self, rule_name: str) -> Optional[Dict[str, Any]]:
        """Get a single rule by name with combined content"""
        try:
            results = self.collection.get(
                where={"rule_name": rule_name}
            )
            
            if not results['ids']:
                return None
            
            # Sort chunks by index to maintain order
            chunks_with_index = []
            for i in range(len(results['documents'])):
                chunks_with_index.append({
                    'content': results['documents'][i],
                    'chunk_index': results['metadatas'][i].get('chunk_index', 0),
                    'id': results['ids'][i]
                })
            
            sorted_chunks = sorted(chunks_with_index, key=lambda x: x['chunk_index'])
            
            # Combine all chunks into one readable content
            combined_content = '\n\n'.join(chunk['content'] for chunk in sorted_chunks)
            
            # Get the first chunk's metadata for the main rule info
            first_chunk = sorted_chunks[0]
            metadata = results['metadatas'][0]
            
            return {
                'rule_name': rule_name,
                'description': metadata.get('description', ''),
                'content': combined_content,
                'total_chunks': len(sorted_chunks),
                'chunk_ids': results['ids'],
                'first_chunk_id': first_chunk['id']
            }
        except Exception as e:
            print(f"Error getting rule by name {rule_name}: {e}")
            return None
