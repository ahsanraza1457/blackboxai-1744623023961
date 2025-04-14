from app import app, db, Product

def add_sample_products():
    sample_products = [
        {
            "name": "Premium Wheat Seeds",
            "company": "Kissan Seeds",
            "price": 450.00,
            "stock": 100,
            "description": "High yield wheat seeds with 95% germination rate",
            "images": ["/static/images/wheat_seeds.jpg"],
            "category": "Seeds"
        },
        {
            "name": "Organic Fertilizer",
            "company": "Green Earth",
            "price": 320.00,
            "stock": 50,
            "description": "Natural fertilizer for all crops, 5kg pack",
            "images": ["/static/images/fertilizer.jpg"],
            "category": "Fertilizers"
        },
        {
            "name": "Agricultural Spray Pump",
            "company": "Farm Tools",
            "price": 1250.00,
            "stock": 20,
            "description": "16L capacity, pressure spray pump",
            "images": ["/static/images/spray_pump.jpg"],
            "category": "Tools"
        }
    ]

    with app.app_context():
        # Clear existing products
        Product.query.delete()
        
        # Add new products
        for product_data in sample_products:
            product = Product(**product_data)
            db.session.add(product)
        
        db.session.commit()
        print(f"Added {len(sample_products)} sample products")

if __name__ == '__main__':
    add_sample_products()
