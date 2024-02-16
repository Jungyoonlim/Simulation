from simulation.backend.app.app import app, db
from app.models import Annotation

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Annotation': Annotation}

if __name__ == '__main__':
    app.run(debug=True)