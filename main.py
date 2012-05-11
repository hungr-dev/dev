from flask import Flask, url_for, g, request, jsonify, session, render_template
import os
import sqlite3
from contextlib import closing
import json
from models import Address, Delivery, FoodItem, Restaurant, Search, Order
import urlparse 

DATABASE = os.path.join(os.path.dirname(__file__),"db","hungr.db")
app = Flask(__name__)
app.config.from_object(__name__)

# we used this to scrape using the Chrome userscript in the git repo
@app.route('/quans_scraper', methods=['POST'])
def quans_scrape():
    food= request.form['food']
    price = request.form['price']
    print "SCRAPING", food, price

    update_db('INSERT INTO food_items (name, price, restaurant_id) VALUES (?,?,?)',(food,price,5))
    return jsonify(foo='bar')

@app.route('/',methods=['GET'])
def hungr():
    if 'id' in session.keys():
        return render_template('twopane.html')
    else:
        return render_template('login.html')

@app.route('/login',methods=['POST'])
def login():
    login = query_db('SELECT * from members WHERE username = ? AND password = ?',[request.form['username'],request.form['password']],one=True)
    if (login == None): 
	return "login failed"
    else:
	session['id']=login['id'] 
	return "login successful"

@app.route('/logout',methods=['POST'])
def logout():
    session.pop('id',None)
    return "logout successful"

@app.route('/create_user',methods=['POST'])
def create_user():
    # check if username is already taken
    namecheck = query_db('SELECT * from members WHERE username = ?',[request.form['username']],one=True)
    if namecheck: 
	return "username taken"
    else: 
	update_db('INSERT INTO members (username, password) VALUES (?,?)',[request.form['username'],request.form['password']])
        return "username created"
    #insert into table



@app.route('/search/', methods = ['GET'])
def search():
    searchterms = request.args['query']
    searchterms = searchterms.split()
    searchterms = ["%"+searchterm+"%" for searchterm in searchterms]
    ## need to search the following tables: restaurants, cuisine, food items
    ## not the most efficient way to do it, but it'll work for now
    s = Search(searchterms)
    restaurants_ranked = s.search_db()
    result = []
    for restaurant in restaurants_ranked:
        rdict={}
        rdict['id'] = restaurant.id
	rdict['name'] = restaurant.name
        rdict['address_city'] = restaurant.get_address().city
        rdict['cuisine'] = [c.name for c in restaurant.get_cuisines()]
        rdict['food_items'] = [fi.name for fi in restaurant.get_food_items()]
	rdict['deliveries'] = [(d.id, d.order_time) for d in restaurant.get_deliveries()]
        result.append(rdict)
    print result
    return jsonify(results=result)  

#adds a new delivery
@app.route('/delivery', methods = ['POST'])
def process_delivery():
    restaurantID = request.json['restaurantID']

    userID = session['id']
    createdDeliveryID = Delivery.create_delivery(None, None, restaurantID, userID)
    return jsonify(Delivery.get_delivery_by_id(createdDeliveryID).serializable())

#edits a delivery 
@app.route('/delivery/<id>', methods=['PUT'])
def update_delivery(id):
    #needs to update location, datetime
    if 'delivery_location' in request.json.keys():
        Delivery.update_delivery(id, 'delivery_location', request.json['delivery_location'])
    if 'order_time' in request.json.keys():
        Delivery.update_delivery(id, 'order_time', request.json['order_time'])
    return jsonify(Delivery.get_delivery_by_id(id).serializable())

#gets a delivery 
@app.route('/delivery/<id>', methods = ['GET'])
def get_delivery(id):
    return jsonify(Delivery.get_delivery_by_id(id).serializable())

#adds a new order to a delivery
#for now, no editing. just creates a new order, adds it to the delivery
#creates a new food item for everything in here. 
#then associates food items with orders 
@app.route('/order', methods = ['POST'])
def add_order():
    
    deliveryid = request.json['delivery_id']
    #userID = session['userID']
    userID = session['id']
    
    orderID = Order.create_order(deliveryid, userID)
    
    return jsonify(order = Order.get_order_by_id(orderID).serializable())

@app.route('/order/<id>', methods=['GET'])
def get_order(id):
    return jsonify(order = Order.get_order_by_id(id).serializable())

#creates a new (empty) food item in food_times table (NOT NECESSARY with menu data now)
#associates the food item with an existing order with given order_id
## todo:  should now take food item id, and just associate given food item with order
##@app.route('/fooditem', methods = ['POST'])
##def add_fooditem():
##    orderid = request.json['order_id']
##    restaurant_id = Delivery.get_delivery_by_id(Order.get_order_by_id(orderid).delivery_id).restaurant_id
##    fooditem_id = FoodItem.create_fooditem(None, None, restaurant_id)
##    FoodItem.associate_fooditem_with_order(fooditem_id, orderid, 0)
##    return jsonify(fooditem = FoodItem.get_food_item_by_id(fooditem_id).serializable())

#need to update fooditem name, price, quantity
##@app.route('/fooditem/<id>',methods=['PUT'])
##def update_fooditem(id):
##    #assigns values to empty food_item columns for given id
##    if 'name' in request.json.keys():
##        FoodItem.update_fooditem(id, 'name',request.json['name'])
##    if 'price' in request.json.keys():
##        FoodItem.update_fooditem(id, 'price', request.json['price'])
##    if 'quantity' in request.json.keys():
##        FoodItem.update_fooditem(id, 'quantity', request.json['quantity'])
##    return jsonify(fooditem = FoodItem.get_food_item_by_id(id).serializable())

@app.route('/fooditem/<id>', methods = ['GET'])
def get_fooditem(id):
    return jsonify(fooditem = FoodItem.get_food_item_by_id(id).serializable())



app.secret_key="&v\xff\x939\x1e\x93\xc2\x8ar\xee\xee\xbehhIS\xe00\x15'\xaee!"

def connect_db():
    return sqlite3.connect(DATABASE)

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()

with app.test_request_context():
    app.preprocess_request()
    # now you can use the g.db object

def update_db(query, args=()):
    g.db.execute(query,args)
    g.db.commit()

def query_db(query, args=(), one=False):
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv

#called from setupdb.py
def init_db():
    try:
        os.remove(DATABASE)
    except:
        pass

    with closing(connect_db()) as db:
        with app.open_resource('scraped_schema.sql') as f:
            db.cursor().executescript(f.read())
        db.commit()

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port,debug=True)


