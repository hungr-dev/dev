from flask import Flask, url_for, g, request, jsonify, session, render_template
import os
import sqlite3
from contextlib import closing
import json
from models import Address, Delivery, FoodItem, Restaurant, Search

DATABASE = os.path.join(os.path.dirname(__file__),"db","hungr.db")
app = Flask(__name__)
app.config.from_object(__name__)

@app.route('/',methods=['GET'])
def hungr():
    return render_template('twopane.html')

@app.route('/login/',methods=['POST'])
def login():
    login = query_db('SELECT * from members WHERE username = ? AND password = ?',[request.form['username'],request.form['password']],one=True)
    if (login == None): 
	return "login failed"
    else:
	session['id']=login['id'] 
	return "login successful"

@app.route('/logout/',methods=['POST'])
def logout():
    session.pop('id',None)
    return "logout successful"

@app.route('/create_user/',methods=['POST'])
def create_user():
    # check if username is already taken
    namecheck = query_db('SELECT * from members WHERE username = ?',[request.form['username']],one=True)
    if namecheck: 
	return "username taken"
    else: 
	update_db('INSERT INTO members (username, password) VALUES (?,?)',[request.form['username'],request.form['password']])
        return "username created"
    #insert into table

@app.route('/delivery/<id>', methods=['GET','DELETE'])
def get_delivery(id):
    if request.method == 'GET':
        delivery = query_db('SELECT * from deliveries WHERE id=?',[id], one=True)
        restID = delivery['restaurant_id']
        restaurant = query_db('SELECT * from restaurants  WHERE id=?',[restID], one=True)
        order = []
        for ord in query_db('SELECT * from orders WHERE delivery_id=?',[delivery['id']]):
            temp_order = {}
            foods = []
            for food in query_db('SELECT food_item_id from order_food_items WHERE order_id=?',[ord['id']]):
                f = {}
                f['id'] = food['food_item_id']
                foodItem = query_db('SELECT * from food_items WHERE id=?',[food['food_item_id']],one=True)
                f['name'] = foodItem['name']
                f['price'] = foodItem['price']
                f['quantity'] = 1
                foods.append(f)
            temp_order['id'] = ord['id']
            temp_order['food_items'] = foods
            temp_order['member'] = Member(ord['member_id'])
            order.append(temp_order)

        return jsonify(id=delivery['id'], restaurant=Restaurant(restaurant), order_time=delivery['order_time'],
                       delivery_location=delivery['delivery_location'], creator=Member(delivery['creator_member_id']),
                       orders=order)
    elif request.method == 'DELETE':
        update_db('DELETE from deliveries WHERE id=?',[id])
        update_db('DELETE from orders WHERE delivery_id=?',[id])
        return jsonify({'message':'deleted delivery'})
    else:
        return jsonify({'message':'NONE'})

@app.route('/search', methods = ['GET'])
def search():
    searchterm = request.args['query']
    searchterm = "%"+searchterm+"%"
    ## need to search the following tables: restaurants, cuisine, food items
    ## not the most efficient way to do it, but it'll work for now
    s = Search(searchterm)
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

                 
#no creator_id yet.  need to do authentication
#order_time also has to be given as a valid datetime object string format
@app.route('/delivery/',methods=['POST'])
def delivery():
    if 'restaurant_id' in request.form.keys():
        restaurantID = request.form['restaurant_id']
    else:
        return jsonify({'message':'No restaurant_id given'})
    if 'order_time' in request.form.keys():
        orderTime = request.form['order_time']
    else:
        return jsonify({'message':'No order_time given'})
    if 'delivery_location' in request.form.keys():
        deliveryLocation = request.form['delivery_location']
    else:
        return jsonify({'message':'No delivery_location given'})
    if not 'id' in session.keys():
        return jsonify({'message':'Not logged in'})
    
    creatorID = session['id']

    query = 'INSERT into deliveries(delivery_location, order_time, restaurant_id, creator_member_id) VALUES ("%s", "%s","%s", "%s")' % (deliveryLocation, orderTime, restaurantID, creatorID)
    update_db(query)

    return jsonify({'message':'post delivery success'})

@app.route('/food_item/', methods=['POST'])
def food_item():
    if 'delivery_id' not in request.form.keys():
        return jsonify({'message':'No delivery id given'})
    if 'quantity' not in request.form.keys():
        return jsonify({'message':'No quantity given'})
    if 'name' not in request.form.keys():
        return jsonify({'message':'No name given'})
    if 'price' not in request.form.keys():
        return jsonify({'message':'No price given'})
    if not 'id' in session.keys():
        return jsonify({'message':'Not logged in'})

    memberID = session['id']

    delivery_id = request.form['delivery_id']
    quantity = int(request.form['quantity'])
    name = request.form['name']
    price = request.form['price']

    restaurant_id = query_db('SELECT restaurant_id from deliveries WHERE id=?',[delivery_id],one=True)['restaurant_id']

    query = 'INSERT into food_items(name, price, restaurant_id) VALUES ("%s","%s","%s")' % (name, price, restaurant_id)
    update_db(query)

    foodID = query_db('SELECT id from food_items WHERE name=? AND price=?',[name, price],one=True)['id']

    for order in query_db('SELECT * from orders WHERE delivery_id=?',[delivery_id]):
        #THIS NEEDS TO BE REPLACED WITH CURRENT USER ID, after AUTHENTICATION IMPLEMENTED
        if order['member_id']==memberID:
            for i in range(quantity):
                update_db('INSERT into order_food_items(order_id, food_item_id) VALUES ("%s","%s")' % (order['id'], foodID))
            f = {}
            f['id'] = foodID
            foodItem = query_db('SELECT * from food_items WHERE id=?',[foodID],one=True)
            f['name'] = foodItem['name']
            f['price'] = foodItem['price']
            f['quantity'] = quantity
            return jsonify(f)

#            return jsonify({'message':'post food item success append'})

    #if you get here, then there is no current order by this user for the specified delivery to add onto.  Creating a new order for user
    update_db('INSERT into orders(delivery_id,member_id) VALUES ("%s","%s")' % (delivery_id,memberID))
    orderID = query_db('SELECT id FROM orders WHERE delivery_id=? AND member_id=?',[delivery_id,memberID],one=True)['id']
    for i in range(quantity):
        update_db('INSERT into order_food_items(order_id, food_item_id) VALUES ("%s","%s")' % (orderID, foodID))
    
    f = {}
    f['id'] = foodID
    foodItem = query_db('SELECT * from food_items WHERE id=?',[foodID],one=True)
    f['name'] = foodItem['name']
    f['price'] = foodItem['price']
    f['quantity'] = quantity
    return jsonify(f)
#    return jsonify({'message':'post food item success create'})




#@app.route('/food_item/<id>', methods=['DELETE'])
#def delete_food_item(id):


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
        with app.open_resource('schema.sql') as f:
            db.cursor().executescript(f.read())
        db.commit()

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port,debug=True)


