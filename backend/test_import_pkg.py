import os
import sys
print('cwd=', os.getcwd())
print('sys.path[0]=', sys.path[0])
try:
    import farmfresh_backend
    print('import farmfresh_backend OK')
    print('settings path', farmfresh_backend.__file__)
except Exception as e:
    print('import error', repr(e))
