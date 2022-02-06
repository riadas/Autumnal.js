from flask import Flask, send_file, render_template, request, jsonify, send_from_directory
import json 
from datetime import datetime
import os 

app = Flask(__name__)

@app.route("/")
def hello_world():
  return render_template("pedrotsividis.com/vgdl-games/games/gvgai_aliens/0.html")  # "<p>Hello, World!</p>"

@app.route('/<path:path>')
def send_js(path):
  return send_from_directory('templates/pedrotsividis.com/vgdl-games', path)

@app.route("/users/<user_id>", methods=["POST"])
def save(user_id):
  print("request.json")
  print(request.json)
  with open('json_data.json', 'w') as outfile:
    directory = "traces/user_"+str(user_id)
    if not os.path.isdir(directory):
      os.mkdir(directory)  
    json.dump(json.dumps(request.json), directory + "/" + "TIME_" + str(datetime.now()))