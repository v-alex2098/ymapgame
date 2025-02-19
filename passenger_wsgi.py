import sys

import os

# это - требование размещения на хостинге reg.ru домена vorontsva.fun

INTERP = os.path.expanduser("/var/www/u2975509/data/flaskenv/bin/python")
if sys.executable != INTERP:
   os.execl(INTERP, INTERP, *sys.argv)

sys.path.append(os.getcwd())

from app import application
