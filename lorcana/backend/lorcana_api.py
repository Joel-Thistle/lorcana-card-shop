"""
Lorcana Card Shop API Backend

This Flask application provides the backend API for the Lorcana Card Shop.
It handles card data, pricing settings, and admin functions.

Routes:
- /api/cards - Get all cards
- /api/cards/<card_id> - Get a specific card
- /api/cards/search - Search for cards
- /api/cards/<card_id>/price - Update a card's price
- /api/admin/pricing - Get or update pricing settings
- /api/admin/apply-rarity-pricing - Apply rarity-based pricing to all cards
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import json
import os

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Get MongoDB connection details from environment variables with fallbacks
mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
mongo_user = os.getenv('MONGODB_USER', '')
mongo_pass = os.getenv('MONGODB_PASSWORD', '')

# Determine if we need to use authentication
if mongo_user and mongo_pass:
    mongo_client = MongoClient(mongo_uri, 
                            username=mongo_user,
                            password=mongo_pass)
    print("Connecting to MongoDB with authentication")
else:
    mongo_client = MongoClient(mongo_uri)
    print(f"Connecting to MongoDB without authentication at {mongo_uri}")

# MongoDB connection
db = mongo_client['lorcana']
cards_collection = db['Cards']
shipping_collection = db['ShippingRates']
pricing_collection = db['PricingSettings']

# Initialize pricing settings if not exists
if pricing_collection.count_documents({}) == 0:
    default_pricing = {
        "premiumPackPrice": 19.99,
        "shippingPrices": {
            "GTA": 5.99,
            "Southern Ontario": 7.99,
            "Northern Ontario": 9.99,
            "Canada Wide": 12.99,
            "International": 24.99
        },
        "rarityPrices": {
            "Common": 0.99,
            "Uncommon": 1.99,
            "Rare": 4.99,
            "Super Rare": 9.99,
            "Legendary": 24.99
        },
        "lastUpdated": datetime.now()
    }
    pricing_collection.insert_one(default_pricing)

def convert_mongo_doc(doc):
    """
    Convert MongoDB document to JSON-serializable format
    
    Converts ObjectId to strings and handles nested documents
    
    Args:
        doc: MongoDB document to convert
        
    Returns:
        Dict: JSON-serializable version of the document
    """
    if doc is None:
        return None
    
    doc_copy = doc.copy()
    # Convert ObjectId to string
    if '_id' in doc_copy and isinstance(doc_copy['_id'], ObjectId):
        doc_copy['_id'] = str(doc_copy['_id'])
    
    # Process nested documents if needed
    for key, value in doc_copy.items():
        if isinstance(value, ObjectId):
            doc_copy[key] = str(value)
        elif isinstance(value, dict):
            doc_copy[key] = convert_mongo_doc(value)
        elif isinstance(value, list):
            doc_copy[key] = [convert_mongo_doc(item) if isinstance(item, dict) else 
                             str(item) if isinstance(item, ObjectId) else item 
                             for item in value]
    
    return doc_copy

# === Card Routes ===

@app.route('/api/cards', methods=['GET'])
def get_all_cards():
    """
    Get all cards from the database
    
    Returns:
        JSON array of all cards
    """
    cards = list(cards_collection.find())
    serializable_cards = [convert_mongo_doc(card) for card in cards]
    return jsonify(serializable_cards)

@app.route('/api/cards/<card_id>', methods=['GET'])
def get_card(card_id):
    """
    Get a specific card by ID
    
    Args:
        card_id: MongoDB ObjectId of the card
        
    Returns:
        JSON object of the card or 404 error
    """
    try:
        card = cards_collection.find_one({'_id': ObjectId(card_id)})
        if card:
            return jsonify(convert_mongo_doc(card))
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cards/search', methods=['GET'])
def search_cards():
    """
    Search for cards by name, set number, or rarity
    
    Query Parameters:
        q: Search query string
        
    Returns:
        JSON array of matching cards
    """
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify([])
        
        # Search in name, set, and rarity fields
        search_results = list(cards_collection.find({
            '$or': [
                {'Name': {'$regex': query, '$options': 'i'}},
                {'Set_Num': {'$regex': query, '$options': 'i'}},
                {'Rarity': {'$regex': query, '$options': 'i'}}
            ]
        }).limit(50))
        
        return jsonify([convert_mongo_doc(card) for card in search_results])
    
    except Exception as e:
        app.logger.error(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cards/<card_id>/price', methods=['PUT'])
def update_card_price(card_id):
    """
    Update the price of a specific card
    
    Args:
        card_id: MongoDB ObjectId of the card
        
    Request Body:
        price: New price value
        
    Returns:
        JSON confirmation or error
    """
    try:
        data = request.json
        
        if 'price' not in data:
            return jsonify({'error': 'Price field is required'}), 400
        
        price = float(data['price'])
        
        result = cards_collection.update_one(
            {'_id': ObjectId(card_id)},
            {'$set': {'Price': price}}
        )
        
        if result.modified_count > 0:
            return jsonify({
                'success': True,
                'message': 'Card price updated successfully'
            })
        else:
            return jsonify({'error': 'Card not found or price not changed'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# === Admin/Pricing Routes ===

@app.route('/api/admin/pricing', methods=['GET'])
def get_pricing_settings():
    """
    Get current pricing settings
    
    Returns:
        JSON object with pricing settings
    """
    try:
        settings = pricing_collection.find_one()
        if settings:
            return jsonify(convert_mongo_doc(settings))
        return jsonify({'error': 'No pricing settings found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/pricing', methods=['PUT'])
def update_pricing_settings():
    """
    Update pricing settings
    
    Request Body:
        premiumPackPrice: Price for premium packaging
        shippingPrices: Object with shipping rates by region
        rarityPrices: Object with prices by card rarity
        
    Returns:
        JSON confirmation or error
    """
    try:
        data = request.json
        
        # Validate required fields
        if not all(key in data for key in ['premiumPackPrice', 'shippingPrices', 'rarityPrices']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Update the settings document
        result = pricing_collection.update_one(
            {}, 
            {
                '$set': {
                    'premiumPackPrice': data['premiumPackPrice'],
                    'shippingPrices': data['shippingPrices'],
                    'rarityPrices': data['rarityPrices'],
                    'lastUpdated': datetime.now()
                }
            },
            upsert=True
        )
        
        return jsonify({
            'success': True,
            'message': 'Pricing settings updated successfully',
            'modifiedCount': result.modified_count
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/apply-rarity-pricing', methods=['POST'])
def apply_rarity_pricing():
    """
    Apply rarity-based pricing to all cards
    
    Request Body:
        rarityPrices: Object mapping rarity names to prices
        
    Returns:
        JSON confirmation with count of updated cards
    """
    try:
        data = request.json
        
        if 'rarityPrices' not in data:
            return jsonify({'error': 'rarityPrices field is required'}), 400
        
        rarity_prices = data['rarityPrices']
        updates = 0
        
        # Update each card based on its rarity
        for rarity, price in rarity_prices.items():
            result = cards_collection.update_many(
                {'Rarity': rarity},
                {'$set': {'Price': float(price)}}
            )
            updates += result.modified_count
        
        return jsonify({
            'success': True,
            'message': f'Prices updated for {updates} cards based on rarity'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# === CORS Handling ===

@app.after_request
def add_cors_headers(response):
    """
    Add CORS headers to all responses
    """
    origin = request.headers.get('Origin')
    if origin and (origin == 'http://localhost:5173' or origin == 'http://127.0.0.1:5175'):
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('/api/cards', methods=['OPTIONS'])
@app.route('/api/cards/<path:card_id>', methods=['OPTIONS'])
@app.route('/api/admin/pricing', methods=['OPTIONS'])
@app.route('/api/admin/apply-rarity-pricing', methods=['OPTIONS'])
@app.route('/api/cards/search', methods=['OPTIONS'])
def options_handler(card_id=None):
    """
    Handle OPTIONS requests for CORS preflight
    """
    return '', 204

if __name__ == '__main__':
    app.run(debug=True, port=5000)