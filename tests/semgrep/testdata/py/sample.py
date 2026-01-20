# Test file for Python patterns
def test_function():
    print("Debug message")
    print("Another debug")
    return True

def dangerous_function():
    password = "hardcoded_password"
    query("SELECT * FROM users WHERE id = " + user_input)
    return None

def api_function():
    requests.get("https://api.example.com", verify=False)
    requests.post("https://api.example.com/data")
    return None

def error_handling():
    try:
        result = dangerous_call()
    except:
        pass
    return result

def assignment_test():
    x = 10
    x = 20
    return x

def exit_test():
    exit(1)
    return

import old_module
from old_module import something

def old_func(x):
    return x

def old_func2(y):
    return y

def func_with_args(a, b):
    return a + b

old_func(10)
old_func2(20)
func(1, 2, 3)
func_with_args(1, 2)
func_with_args(3, 4)
