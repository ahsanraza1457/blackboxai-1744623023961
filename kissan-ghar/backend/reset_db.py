from app import app, db
import os

# Remove existing database
db_path = os.path.join(app.instance_path, 'kissan_ghar.db')
if os.path.exists(db_path):
    os.remove(db_path)

# Create new database with updated schema
with app.app_context():
    db.create_all()
    print("Database successfully recreated with updated schema")
