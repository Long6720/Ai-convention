#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
This is a deliberately bad Python file with many coding violations
to test the AI code review agent's ability to detect issues.
"""

import os, sys, glob, re  # Multiple imports on one line - BAD
from os import *  # Wildcard import - BAD
import time as t  # Unclear alias - BAD

# Global variables - BAD
global_var = "I'm a global variable"
another_global = 42
BAD_CONSTANT = "This should be lowercase"

# Unused imports and variables
unused_var = "I'm never used"
import json  # Imported but never used

def bad_function_name():  # Should be snake_case
    """This function has no docstring and bad naming."""
    x = 1  # Single letter variable - BAD
    y = 2
    z = x + y
    return z

def another_bad_function():
    print("No return statement")  # Function should return something
    
def function_with_too_many_parameters(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z):
    """Function with too many parameters - violates PEP 8."""
    pass

def function_with_mixed_case_parameters(Param1, param2, PARAM3):
    """Function with inconsistent parameter naming."""
    pass

# Magic numbers everywhere - BAD
def calculate_something():
    result = 42 * 3.14159 + 1000 / 7
    if result > 500:
        return True
    elif result < 100:
        return False
    else:
        return None

# Hardcoded strings - BAD
def process_data():
    data = "hardcoded_string_here"
    if data == "hardcoded_string_here":
        print("Found hardcoded string")
    
    # Multiple if-elif chains - could be simplified
    value = 5
    if value == 1:
        result = "one"
    elif value == 2:
        result = "two"
    elif value == 3:
        result = "three"
    elif value == 4:
        result = "four"
    elif value == 5:
        result = "five"
    else:
        result = "unknown"
    
    return result

# Nested functions - can cause issues
def outer_function():
    def inner_function():
        def even_deeper_function():
            return "Too many levels of nesting"
        return even_deeper_function()
    return inner_function()

# Exception handling anti-patterns
def bad_exception_handling():
    try:
        result = 10 / 0
    except:  # Bare except - BAD
        print("Something went wrong")
    
    try:
        result = int("not_a_number")
    except Exception as e:  # Too broad exception
        print(f"Error: {e}")
    
    # Exception without proper handling
    try:
        raise ValueError("This is a test error")
    except:
        pass  # Silent exception handling - BAD

# Unused code and dead code
def dead_code_function():
    if False:  # This will never execute
        print("This will never be printed")
        return "dead code"
    
    if True:  # This will always execute
        return "always returns this"
    
    print("This will never be reached")  # Dead code
    return "unreachable"

# Inconsistent indentation (mixing tabs and spaces)
def function_with_bad_indentation():
	# This line uses tabs
    # This line uses spaces
	return "mixed indentation"

# Long lines that exceed PEP 8 limit
def function_with_very_long_lines():
    very_long_string = "This is a very long string that exceeds the recommended line length limit of 79 characters according to PEP 8 style guidelines"
    another_long_string = "Another very long string that should be broken into multiple lines for better readability and maintainability"
    return very_long_string + another_long_string

# Complex expressions that should be broken down
def complex_expression():
    result = (a + b * c / d ** e) % f + g - h * i / j ** k % l + m - n * o / p ** q % r + s - t * u / v ** w % x + y - z
    return result

# Unused loop variables
def loop_with_unused_variables():
    for i in range(10):  # 'i' is never used
        print("Hello")
    
    for _ in range(5):  # Better - use underscore for unused variables
        print("World")

# Inefficient string concatenation
def inefficient_string_operations():
    result = ""
    for i in range(1000):
        result += str(i)  # Creates new string each iteration - BAD
    
    # Better approach would be:
    # result = "".join(str(i) for i in range(1000))
    return result

# Mutable default arguments - BAD
def function_with_mutable_defaults(items=[]):  # This is dangerous!
    items.append("new_item")
    return items

# Class with bad practices
class BadClass:  # Should inherit from object in Python 2, but this is Python 3
    class_variable = "I'm a class variable"  # Shared across all instances
    
    def __init__(self):
        self.instance_var = "instance variable"
    
    def method_with_side_effects(self):
        global global_var  # Modifying global variables - BAD
        global_var = "modified"
        return self.instance_var
    
    def method_that_returns_nothing(self):
        print("I don't return anything")
        # Missing return statement

# Main execution block without proper guard
if __name__ == "__main__":
    # Create multiple instances without using them
    obj1 = BadClass()
    obj2 = BadClass()
    obj3 = BadClass()
    
    # Call functions without storing results
    bad_function_name()
    another_bad_function()
    process_data()
    
    # Print statements in production code - BAD
    print("This should use proper logging")
    print("Multiple print statements")
    print("Without proper formatting")
    
    # Exit without proper cleanup
    sys.exit(0)  # Hard exit - BAD

# Variables defined after use (in some cases)
def function_that_uses_undefined_variables():
    try:
        result = undefined_variable + 5  # This will cause NameError
    except NameError:
        pass
    
    # Using variables before definition
    print(later_defined_variable)  # This will fail
    later_defined_variable = "defined after use"

# Inconsistent naming conventions
class badClassName:  # Should be PascalCase
    def methodName(self):  # Should be snake_case
        localVariable = "should be snake_case"  # Should be snake_case
        return localVariable

# Magic methods without proper implementation
class IncompleteClass:
    def __init__(self):
        pass
    
    # Missing __str__, __repr__, __eq__, etc.
    # This class is incomplete and not very useful

# Function with too many return statements
def function_with_many_returns(value):
    if value < 0:
        return "negative"
    elif value == 0:
        return "zero"
    elif value < 10:
        return "small"
    elif value < 100:
        return "medium"
    elif value < 1000:
        return "large"
    else:
        return "very large"

# Unreachable code
def function_with_unreachable_code():
    return "This function always returns here"
    print("This will never execute")  # Unreachable
    return "This is also unreachable"

# Bad variable names
def function_with_bad_names():
    l = [1, 2, 3]  # Single letter variable - BAD
    O = "letter O"  # Looks like zero
    I = "letter I"  # Looks like one
    return l, O, I

# Complex nested conditions
def complex_nested_conditions(a, b, c, d, e):
    if a > 0:
        if b > 0:
            if c > 0:
                if d > 0:
                    if e > 0:
                        return "all positive"
                    else:
                        return "e not positive"
                else:
                    return "d not positive"
            else:
                return "c not positive"
        else:
            return "b not positive"
    else:
        return "a not positive"

# This file intentionally contains many coding violations
# to test the AI code review agent's ability to detect issues.
