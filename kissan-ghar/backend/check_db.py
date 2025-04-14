from app import app, db, Product

with app.app_context():
    print("Products in database:")
    print(Product.query.all())
    
    print("\nCount:", Product.query.count())
