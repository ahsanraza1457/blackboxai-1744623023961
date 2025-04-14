from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kissan_ghar.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

db = SQLAlchemy(app)

# Product Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    referral_code = db.Column(db.String(20), unique=True)
    points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100))
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    description = db.Column(db.Text)
    features = db.Column(db.Text)
    referral_level_1 = db.Column(db.Float, default=5.0)  # % for level 1
    referral_level_2 = db.Column(db.Float, default=3.0)  # % for level 2
    referral_level_3 = db.Column(db.Float, default=2.0)  # % for level 3
    images = db.Column(db.JSON)  # Store multiple image paths
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, onupdate=db.func.current_timestamp())

class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referrer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    referred_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    level = db.Column(db.Integer)
    points_earned = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    total_amount = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')  # pending, processing, shipped, delivered
    payment_method = db.Column(db.String(50))
    shipping_address = db.Column(db.Text)
    items = db.Column(db.JSON)  # Stores product details
    referral_bonus_applied = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, onupdate=db.func.current_timestamp())

class PointRedemption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    points_used = db.Column(db.Integer)
    reward_type = db.Column(db.String(50))
    reward_value = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

# Initialize Database
with app.app_context():
    db.create_all()

# API Endpoints
@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'description': p.description,
        'company': p.company if hasattr(p, 'company') else None,
        'stock': p.stock if hasattr(p, 'stock') else 0
    } for p in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    new_product = Product(name=data['name'], price=data['price'], description=data['description'], image=data['image'])
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully!'}), 201

@app.route('/api/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.json
    product = Product.query.get(id)
    if product:
        product.name = data['name']
        product.price = data['price']
        product.description = data['description']
        product.image = data['image']
        db.session.commit()
        return jsonify({'message': 'Product updated successfully!'})
    return jsonify({'message': 'Product not found!'}), 404

@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if product:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully!'})
    return jsonify({'message': 'Product not found!'}), 404

# Referral System Endpoints
@app.route('/api/users', methods=['POST'])
def register_user():
    data = request.json
    referral_code = f"KG{random.randint(10000, 99999)}"
    
    new_user = User(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone'),
        referral_code=referral_code
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Apply referral if code was provided
    if 'referral_code' in data:
        referrer = User.query.filter_by(referral_code=data['referral_code']).first()
        if referrer:
            referral = Referral(
                referrer_id=referrer.id,
                referred_id=new_user.id,
                level=1,
                points_earned=0
            )
            db.session.add(referral)
            db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'referral_code': referral_code
    }), 201

@app.route('/api/referrals/<int:user_id>', methods=['GET'])
def get_referrals(user_id):
    referrals = Referral.query.filter_by(referrer_id=user_id).all()
    return jsonify([{
        'id': r.id,
        'referred_user': r.referred_id,
        'level': r.level,
        'points_earned': r.points_earned,
        'date': r.created_at
    } for r in referrals])

@app.route('/api/points/earn', methods=['POST'])
def earn_points():
    data = request.json
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Update user points
    user.points += data['points']
    
    # Update referral points if applicable
    if 'referral_id' in data:
        referral = Referral.query.get(data['referral_id'])
        if referral:
            referral.points_earned = data['points']
    
    db.session.commit()
    return jsonify({'message': 'Points updated successfully'})

@app.route('/api/redemptions', methods=['GET'])
def get_redemptions():
    redemptions = PointRedemption.query.all()
    return jsonify([{
        'id': r.id,
        'user_id': r.user_id,
        'points_used': r.points_used,
        'reward_type': r.reward_type,
        'reward_value': r.reward_value,
        'date': r.created_at
    } for r in redemptions])

@app.route('/api/points/redeem', methods=['POST'])
def redeem_points():
    data = request.json
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.points < data['points']:
        return jsonify({'message': 'Insufficient points'}), 400
    
    # Create redemption record
    redemption = PointRedemption(
        user_id=user.id,
        points_used=data['points'],
        reward_type=data['reward_type'],
        reward_value=data['reward_value']
    )
    
    # Update user points
    user.points -= data['points']
    
    db.session.add(redemption)
    db.session.commit()
    
    return jsonify({
        'message': 'Points redeemed successfully',
        'remaining_points': user.points
    })

@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify([{
        'id': order.id,
        'user_id': order.user_id,
        'total_amount': order.total_amount,
        'status': order.status,
        'created_at': order.created_at
    } for order in orders])

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    try:
        # Calculate total amount
        total = sum(item['price'] * item['quantity'] for item in data['items'])
        
        # Create order
        order = Order(
            user_id=data['user_id'],
            total_amount=total,
            payment_method=data['payment_method'],
            shipping_address=data['shipping_address'],
            items=data['items']
        )
        
        db.session.add(order)
        
        # Update product stock (simplified to only update stock)
        for item in data['items']:
            product = Product.query.get(item['product_id'])
            if product:
                if hasattr(product, 'stock'):
                    product.stock -= item['quantity']
                else:
                    raise ValueError(f"Product {item['product_id']} has no stock attribute")
        
        db.session.commit()
        
        return jsonify({'message': 'Order created successfully!', 'order_id': order.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get(order_id)
    if order:
        return jsonify({
            'id': order.id,
            'user_id': order.user_id,
            'total_amount': order.total_amount,
            'status': order.status,
            'payment_method': order.payment_method,
            'shipping_address': order.shipping_address,
            'items': order.items,
            'created_at': order.created_at,
            'updated_at': order.updated_at
        })
    return jsonify({'message': 'Order not found!'}), 404

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order_status(order_id):
    data = request.json
    order = Order.query.get(order_id)
    if order:
        order.status = data['status']
        db.session.commit()
        return jsonify({'message': 'Order status updated successfully!'})
    return jsonify({'message': 'Order not found!'}), 404

if __name__ == '__main__':
    app.run(debug=True)
