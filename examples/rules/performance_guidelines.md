# Performance Guidelines

## Algorithm Efficiency
- Choose appropriate data structures
- Use efficient algorithms (O(n) vs O(n²))
- Avoid nested loops when possible
- Use caching for expensive operations

## Memory Management
- Avoid memory leaks
- Use appropriate data types
- Minimize object creation in loops
- Use lazy loading when appropriate

## Database Performance
- Use indexes for frequently queried columns
- Avoid N+1 query problems
- Use pagination for large datasets
- Optimize database queries

## Code Optimization
- Profile before optimizing
- Focus on bottlenecks
- Use appropriate data structures
- Avoid premature optimization

## Examples

### Good Performance Practices

#### Python - Efficient List Operations
```python
def find_duplicates_efficient(items):
    seen = set()
    duplicates = set()
    
    for item in items:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    
    return list(duplicates)

# Python - Generator for Large Datasets
def process_large_file(filename):
    with open(filename, 'r') as file:
        for line in file:  # Process line by line, not load entire file
            yield process_line(line)
```

#### JavaScript - Efficient Array Operations
```javascript
function findDuplicatesEfficient(items) {
    const seen = new Set();
    const duplicates = new Set();
    
    for (const item of items) {
        if (seen.has(item)) {
            duplicates.add(item);
        } else {
            seen.add(item);
        }
    }
    
    return Array.from(duplicates);
}

// JavaScript - Debouncing for Performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```

### Bad Performance Practices

#### Python - Inefficient List Operations
```python
def find_duplicates_inefficient(items):
    duplicates = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j] and items[i] not in duplicates:
                duplicates.append(items[i])  # O(n²) complexity
    return duplicates

# Python - Loading Entire File into Memory
def process_large_file_inefficient(filename):
    with open(filename, 'r') as file:
        content = file.read()  # Loads entire file into memory
        lines = content.split('\n')
        return [process_line(line) for line in lines]
```

#### JavaScript - Inefficient Array Operations
```javascript
function findDuplicatesInefficient(items) {
    const duplicates = [];
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            if (items[i] === items[j] && !duplicates.includes(items[i])) {
                duplicates.push(items[i]);  // O(n²) complexity
            }
        }
    }
    return duplicates;
}

// JavaScript - No Debouncing
function handleResize() {
    // This will fire many times during resize
    updateLayout();
}

window.addEventListener('resize', handleResize);
```
