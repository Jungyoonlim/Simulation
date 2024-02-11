from . import db

# Define the Annotation model  
class Annotation(db.model):
    # id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=True)
    position_x = db.Column(db.Float, nullable=False)
    position_y = db.Column(db.Float, nullable=False)
    position_z = db.Column(db.Float, nullable=False)
    # timestamp = db.Column(db.DateTime, index=True)
    # user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def to_dict(self):
        return {
            # 'id': self.id,
            'name': self.modelName,
            'position_x': self.position_x,
            'position_y': self.position_y,
            'position_z': self.position_z,
            # 'timestamp': self.timestamp
        }
    