import os
print('cwd before', os.getcwd())
os.chdir(r'z:\Code\nwdi\backend')
print('cwd after', os.getcwd())
import sys
print('sys.path[0]', sys.path[0])
try:
    import farmfresh_backend.settings as s
    print('imported farmfresh_backend.settings', s)
except Exception as e:
    print('import error', repr(e))
