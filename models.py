import sqlite3
from flask import g, Flask
import os
import sqlite3
from contextlib import closing

###############################################################################

# should move this out into a library package

DATABASE = os.path.join(os.path.dirname(__file__),"db","hungr.db")
app = Flask(__name__)
app.config.from_object(__name__)

with app.test_request_context():
    app.preprocess_request()
    # now you can use the g.db object

def query_db(query, args=(), one=False):
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv
###############################################################################

class Address:
    """
    A class representing an address.

    """
    def __init__(self, id, lat, lng, street, city, state, zip):
        self.id = id
        self.lat = lat
        self.lng = lng
        self.street = street
        self.city = city
        self.state = state
        self.zip = zip

    @staticmethod
    def get_address_by_id(id):
        a = query_db("SELECT * FROM\
            addresses WHERE id = ?",
            id, one=True)

        return Address(a['id'], 
            a['lat'],
            a['lng'],
            a['street'],
            a['city'],
            a['state'],
            a['zip'])

class Cuisine:
    """
    A class representing a cuisine.

    """
    def __init__(self, id, name):
        self.id = id
        self.name = name

    @staticmethod
    def get_cuisine_by_id(id):
        c = query_db("SELECT * FROM\
            cuisine WHERE id = ?",
            id, one=True)

        return Address(c['id'], 
            c['name'])

    @staticmethod
    def get_cuisines_by_restaurant_id(id):
        cuisines = query_db("SELECT id FROM\
            cuisine_restaurants WHERE restaurant_id = ?",
            id, one=False)

        out = []
        for c in cuisines:
            cuisine_id = c['id']
            out.append(Cuisine.get_cuisine_by_id(cuisine_id))
        return out

class Delivery:
    """
    A class representing a delivery.

    """
    def __init__(self, id, deliver_location, order_time, 
        restaurant_id, creator_member_id):
        self.id = id
        self.delivery_location
        self.order_time
        self.restaurant_id
        self.creator_member_id

    @staticmethod
    def get_delivery_by_id(id):
        d = query_db("SELECT * FROM\
            deliveries WHERE id = ?",
            id, one=True)

        return Delivery(d['id'], 
            d['delivery_location'],
            d['order_time'],
            d['restaurant_id'],
            d['creator_member_id'])     

    @staticmethod
    def get_deliveries_by_restaurant_id(id):
        deliveries = query_db("SELECT id FROM\
            deliveries WHERE restaurant_id = ?",
            id, one=False)

        out = []
        for d in deliveries:
            delivery_id = d['id']
            out.append(Delivery.get_delivery_by_id(delivery_id))
        return out

class FoodItem:
    """
    A class representing a food item.

    """
    def __init__(self, id, name, price, restaurant_id):
        self.id = id
        self.name
        self.price
        self.restaurant_id

    @staticmethod
    def get_food_item_by_id(id):
        f = query_db("SELECT * FROM\
            food_items WHERE id = ?",
            id, one=True)

        return FoodItem(f['id'], 
            f['name'],
            f['price'],
            f['restaurant_id'])     

    @staticmethod
    def get_food_items_by_restaurant_id(id):
        food_items = query_db("SELECT id FROM\
            food_items WHERE restaurant_id = ?",
            id, one=False)

        out = []
        for f in food_items:
            food_id = f['id']
            out.append(FoodItem.get_food_item_by_id(food_id))
        return out

class Restaurant:
    """
    A class representing a restaurant.

    """
    def __init__(self, id, name, address_id, phone):
        self.id = id
        self.name = name
        self.address_id = address_id
        self.phone = phone

    @staticmethod
    def get_restaurant_by_id(id):
        r = query_db("SELECT * FROM\
            restaurants WHERE id = ?",
            id, one=True)

        return Restaurant(r['id'], 
            r['name'],
            r['address_id'],
            r['phone_number'])

    @staticmethod
    def get_restaurants_by_cuisine_id(id):
        restaurants = query_db("SELECT id FROM\
            cuisine_restaurants WHERE cuisine_id = ?",
            id, one=False)

        out = []
        for r in restaurants:
            restaurant_id = r['id']
            out.append(Restaurant.get_restaurant_by_id(restaurant_id))
        return out

    def get_address(self):
        return Address.get_address_by_id(address_id)

    def get_cuisines(self):
        return Cuisine.get_cuisines_by_restaurant_id(self.id)

    def get_deliveries(self):
        return Delivery.get_deliveries_by_restaurant_id(self.id)

    def get_food_items(self):
        return FoodItem.get_food_items_by_restaurant_id(self.id)