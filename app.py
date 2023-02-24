from flask import Flask, send_file, render_template, request, jsonify, send_from_directory, redirect, url_for
import json 
from datetime import datetime
import os 

app = Flask(__name__)

@app.route("/")
def hello_world():
  return redirect(url_for('empa'))  # "<p>Hello, World!</p>"

@app.route("/empa.html")
def empa():
  return render_template("pedrotsividis.com/vgdl-games/games/gvgai_aliens/0.html")  # "<p>Hello, World!</p>"

@app.route("/cisc.html")
def cisc():
  return render_template("pedrotsividis.com/vgdl-games/games/gvgai_aliens/index.html")  # "<p>Hello, World!</p>"

@app.route('/<path:path>')
def send_js(path):
  return send_from_directory('templates/pedrotsividis.com/vgdl-games', path)

# @app.route("/users/<user_id>", methods=["POST"])
# def save(user_id):
#   print("request.json")
#   print(request)
#   data = json.loads(request.data, strict=False)
#   print(data)
#   directory = "traces/user_"+str(user_id)
#   if not os.path.isdir(directory):
#     os.mkdir(directory)  
#   with open(directory + "/TIME_" + str(datetime.now()) + ".json", 'w') as outfile:
#     json.dump(json.dumps(data), outfile)
#   return "True"

@app.route("/users/<user_id>", methods=["POST"])
def save(user_id):
  print("request.json")
  print(request)
  data = json.loads(request.data, strict=False)
  print(data)

  game_name = data["game_name"]

  directory = "october_traces/"+game_name # new_traces
  if not os.path.isdir(directory):
    os.mkdir(directory)  
  with open(directory + "/TIME_" + str(datetime.now()) + ".json", 'w') as outfile:
    json.dump(json.dumps(data), outfile)
  return "True"