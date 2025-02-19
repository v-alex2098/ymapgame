from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

# структура базы данных вынесена в отдельный файл

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    login = db.Column(db.String(25), unique=True, nullable=False)
    password = db.Column(db.String(25), nullable=False)
    
class Region(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    iso_code = db.Column(db.String(10), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='unselected')  # соответствует значениям 'unselected', 'success1', 'success2', 'failed1', 'failed2'
    attempts = db.Column(db.Integer, default=0)
    session_id = db.Column(db.String(50), nullable=False)
    attractions = db.Column(db.String(1500), nullable=True)
    
class GameSession(db.Model):
    id = db.Column(db.String(50), primary_key=True)  # соответствует session ID (UUID)
    user_login = db.Column(db.String(25), nullable=False)
    user_name = db.Column(db.String(100), nullable=False)
    total_regions = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    first_try_regions = db.Column(db.Integer, default=0)
    second_try_regions = db.Column(db.Integer, default=0)
   # failed_regions = db.Column(db.Integer, default=0) # можно как разницу посчитать

    
class StatsTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_login = db.Column(db.String(100), nullable=False)
    user_name = db.Column(db.String(100), nullable=False)
    total_regions = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    start_time_ftd = db.Column(db.String(20), nullable=False)
    end_time_ftd = db.Column(db.String(20), nullable=False)
    delta_time_ftd = db.Column(db.String(10), nullable=False)
    first_try_regions = db.Column(db.Integer, default=0)
    second_try_regions = db.Column(db.Integer, default=0)
    failed_regions = db.Column(db.Integer, default=0)  


