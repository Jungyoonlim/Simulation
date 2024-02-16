from .database import db

# Define the Annotation model  
class User(db.Model):
    __tablename__ = 'user'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=True)
    position_x = db.Column(db.Float, nullable=False)
    position_y = db.Column(db.Float, nullable=False)
    position_z = db.Column(db.Float, nullable=False)
    # timestamp = db.Column(db.DateTime, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def to_dict(self):
        return {
            # 'id': self.id,
            'name': self.name,
            'position_x': self.position_x,
            'position_y': self.position_y,
            'position_z': self.position_z,
            # 'timestamp': self.timestamp
            'user_id': self.user_id
        }
    