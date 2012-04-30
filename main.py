from flask import Flask, url_for, g, request, jsonify, session
import os
import sqlite3
from contextlib import closing
import json

DATABASE = os.path.join(os.path.dirname(__file__),"db","hungr.db")
app = Flask(__name__)
app.config.from_object(__name__)

@app.route('/',methods=['GET'])
def hungr():
    return "hungr"

def Restaurant(restaurant):
    rest = {}
    rest['id']=restaurant['id']
    rest['name']=restaurant['name']
    rest['address']=restaurant['address']
    rest['phoneNumber']=restaurant['phone_number']

    #sql query that takes cuisine ID and returns cuisine name
    rest['cuisine']=query_db('select name from cuisine where id = ?',[restaurant['cuisine_id']],one=True)['name']
    return rest

def Delivery(delivery):
    deliv = {}
    deliv['id'] = delivery['id']
    deliv['location'] = delivery['delivery_location']
    deliv['order_time'] = delivery['order_time']
    deliv['restaurantID'] = delivery['restaurant_id']
    deliv['creatorID'] = delivery['creator_member_id']
    return deliv

def FoodItem(food, orderID, quantity):
    item = {}
    item['id'] = food['id']
    item['name'] = food['name']
    item['price'] = food['price']
    item['order'] = orderID
    item['quantity'] = quantity
    return item

def Order(order, foods, owner):
    ord = {}
    ord['id'] = order['id']
    ord['member'] = owner
    ord['food_items'] = json.dumps(foods)
    return ord

##no photo_url right now so just return facebook_id
def Member(id):
    member = query_db('SELECT * from members WHERE id=?',[id],one=True)
    memb = {}
    memb['id'] = member['id']
    memb['name'] = member['name']
    memb['photo_url'] = member['facebook_id']
    return memb


@app.route('/get_delivery/<id>', methods=['GET'])
def get_delivery(id):
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

@app.route('/search/', methods = ['GET'])
def search():
    searchterm = request.form['query']
    ## need to search the following tables: restaurants, cuisine, food items
    ## not the most efficient way to do it, but it'll work for now
    resultset =set()
    for r in query_db('SELECT * from restaurants where name LIKE ?', [searchterm],one=False):
        resultset.add(r['id'])
    for c in query_db('SELECT * from cuisine where name like ?', [searchterm], one=False):
	#if matches cuisine, get every restaurant name that has that cuisine
        for cr in query_db('SELECT * from restaurants where cuisine_id LIKE ?', [c['id']],one=FALSE):
	    resultset.add(cr['id'])
    for f in query_db('SELECT * from food_items where name LIKE ?',[searchterm],one=False):
        #if a food item matches, return the restaurant for which it matches
        #(yeah could probably just use joins)
        for fr in query_db('SELECT * from restaurants where id=?',[f['restaurant_id']],one=FALSE):
	    resultset.add(fr['id'])
    #now that we have a result set, create restaurant objects and jsonify them
    resultlist= list(resultset)
    return resultlist
     
                    

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


