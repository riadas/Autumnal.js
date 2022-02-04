from flask import Flask, send_file, render_template, request, jsonify, send_from_directory

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("pedrotsividis.com/vgdl-games/games/gvgai_aliens/0.html")  # "<p>Hello, World!</p>"

@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('templates/pedrotsividis.com/vgdl-games', path)
