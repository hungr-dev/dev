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
    return '<html><head><script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script></head><body>Hungr</body></html>'

def Restaurant(restaurant):
    rest = {}
    rest['id']=restaurant['id']
    rest['name']=restaurant['name']
    rest['address']=restaurant['address']
    rest['phoneNumber']=restaurant['phone_number']
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


@app.route('/delivery/<id>', methods=['GET'])
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

#no creator_id yet.  need to do authentication
#order_time also has to be given as a valid datetime object string format
@app.route('/delivery',methods=['POST'])
def delivery():
    if 'restaurant_id' in request.form.keys():
        restaurantID = request.form['restaurant_id']
    else:
        return jsonify('No restaurant_id given')
    if 'order_time' in request.form.keys():
        orderTime = request.form['order_time']
    else:
        return jsonify('No order_time given')
    if 'delivery_location' in request.form.keys():
        deliveryLocation = request.form['delivery_location']
    else:
        return jsonify('No delivery_location given')

    query = 'INSERT into deliveries(delivery_location, order_time, restaurant_id) VALUES ("%s", "%s", "%s")' % (deliveryLocation, orderTime, restaurantID)
    update_db(query)

    return jsonify({'message':'None'})

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

