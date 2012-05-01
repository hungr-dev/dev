import sqlite3
from flask import g

# should move this out into a library package
def query_db(query, args=(), one=False):
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv

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

        return FoodItem(d['id'], 
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
    def __init__(self, id, name, address_id, phone, cuisine_id):
        self.id = id
        self.name = name
        self.address_id = address_id
        self.phone = phone
        self.cuisine_id = cuisine_id

    @staticmethod
    def get_restaurant_by_id(id):
        r = query_db("SELECT * FROM\
            restaurants WHERE id = ?",
            id, one=True)

        return Restaurant(r['id'], 
            r['name'],
            r['address_id'],
            r['phone_number'],
            r['cuisine_id'])

    def get_address(self):
        return Address.get_address_by_id(address_id)

    def get_cuisine(self):
        c = query_db("SELECT name FROM\
            cuisine WHERE id = ?",
            self.cuisine_id, one=True)
        return c['name']