from flask import Flask

# это - требование размещения на хостинге reg.ru домена vorontsva.fun

application = Flask(__name__)


@application.route("/")
def hello():
   return "<h1 style='color:blue'>Hello There!</h1>"

if __name__ == "__main__":
   application.run(host='0.0.0.0')
   
   