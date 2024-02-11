from flask import request, jsonify
from . import app, db
from .models import Annotation 

"""
Add an annotation to the database.
This function takes no parameters and returns a JSON object representing the annotation.
"""
@app.route('/annotations', methods=['GET', 'POST'])
def add_annotation():
    if request.method == 'POST':
        data = request.get_json()
        annotation = Annotation(
            modelName=data['modelName'],
            position_x=data['position_x'],
            position_y=data['position_y'],
            position_z=data['position_z']
        )
        db.session.add(annotation)
        db.session.commit()
        return jsonify(annotation.to_dict()), 201
    else:
        annotations = Annotation.query.all()
        return jsonify([annotation.to_dict() for annotation in annotations])

"""
Get all annotations from the database.
This function takes no parameters and returns a JSON object representing the annotations.
"""
@app.route('/annotations', methods=['GET'])
def get_annotations():
    annotations = Annotation.query.all()
    return jsonify([annotation.to_dict() for annotation in annotations])