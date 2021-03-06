import sqlite3
from flask import g, Flask
import os
import sqlite3
from contextlib import closing
from collections import Counter

###############################################################################

# should move this out into a library package

DATABASE = os.path.join(os.path.dirname(__file__),"db","hungr.db")
app = Flask(__name__)
app.config.from_object(__name__)

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
            [id], one=True)

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
            [id], one=True)

        return Cuisine(c['id'], 
            c['name'])

    @staticmethod
    def get_cuisines_by_restaurant_id(id):
        cuisines = query_db("SELECT cuisine_id FROM\
            cuisine_restaurants WHERE restaurant_id = ?",
            [id], one=False)

        out = []
        for c in cuisines:
            cuisine_id = c['cuisine_id']
            out.append(Cuisine.get_cuisine_by_id(cuisine_id))
        return out

class Delivery:
    """
    A class representing a delivery.

    """
    def __init__(self, id, delivery_location, order_time, 
        restaurant_id, creator_member_id):
        self.id = id
        self.delivery_location = delivery_location
        self.order_time = order_time
        self.restaurant_id = restaurant_id
        self.creator_member_id = creator_member_id
        self.orders = []
        for o in query_db("SELECT id FROM orders WHERE delivery_id = ?", [id], one=False):
            self.orders.append(Order.get_order_by_id(o['id']))

    #we include these serializable functions to make it easy for json to process. Json.dump handles dictionaries well, doesn't handle lists or objects well... 
    def serializable(self):
        d = self.__dict__
        d['restaurant'] = Restaurant.get_restaurant_by_id(self.restaurant_id).serializable()
        d['orders'] = [order.serializable() for order in self.orders]
        d['member'] = User.get_user_by_userid(self.creator_member_id).serializable()
        
        return d

    @staticmethod
    def get_delivery_by_id(id):
        d = query_db("SELECT * FROM\
            deliveries WHERE id = ?",
            [id], one=True)

        return Delivery(d['id'], 
            d['delivery_location'],
            d['order_time'],
            d['restaurant_id'],
            d['creator_member_id'])     

    @staticmethod
    def get_deliveries_by_restaurant_id(id):
        deliveries = query_db("SELECT id FROM\
            deliveries WHERE restaurant_id = ? AND order_time IS NOT NULL ORDER BY order_time DESC",
            [id], one=False)

        out = []
        for d in deliveries:
            delivery_id = d['id']
            out.append(Delivery.get_delivery_by_id(delivery_id))
        return out

    @staticmethod
    def create_delivery(deliverylocation, ordertime, restaurantid, userid):
		query = "INSERT into deliveries (delivery_location, order_time,\
				restaurant_id, creator_member_id) VALUES (?,?,?,?)"
		update_db(query, [deliverylocation, ordertime, restaurantid, userid])
		query = "SELECT last_insert_rowid() as deliveryid from deliveries"
		result = query_db(query, [], one=True)
		return result['deliveryid']

    @staticmethod 
    def update_delivery(deliveryID, param, value):

        query = "UPDATE deliveries SET " + param +" = ? WHERE id = ?"
        update_db(query, [value, deliveryID])
        return True
class Order:
    """
    A class representing an order. 
    """
    def __init__(self, id, delivery_id, member_id):
        self.id = id
        self.delivery_id = delivery_id
        self.member_id = member_id

    def serializable(self):
        d = self.__dict__
        d['member'] = User.get_user_by_userid(self.member_id).serializable()
        d['food_items'] = [fooditemAndQuantity.serializable() for fooditemAndQuantity in \
            FoodItem.get_food_items_and_quantity_by_order_id(self.id)]
        return d

    def deleteAllFoodItems(self):
        query = "DELETE FROM order_food_items WHERE order_id = ?"
        update_db(query, [self.id])
        return True

    @staticmethod
    def create_order(deliveryid, memberid):
        query = "INSERT into orders (delivery_id, member_id) VALUES (?,?)"
        update_db(query, [deliveryid, memberid])
        query = "SELECT last_insert_rowid() as orderid from orders"
        result = query_db(query,[],one=True)
        return result['orderid'] 

    @staticmethod 
    def get_order_by_id(id):
        order = query_db("SELECT * FROM orders WHERE id=?",\
                         [id], one=True)
        return Order(order['id'], order['delivery_id'], order['member_id'])

    #this is a little awkward, but a good hack to fix. we really have two different "fooditem" objects
    #"fooditem" which is purely a restaurantid, name, and price
    # and 'fooditemandquantity' which is a fooditem but also with a quantity, which is a line item in an order/delivery
    @staticmethod 
    def add_fooditems_and_quantity_to_order(orderid, fooditemsAndQuantities):
        order = Order.get_order_by_id(orderid)
        order.deleteAllFoodItems();
        for fq in fooditemsAndQuantities:
            
            FoodItem.associate_fooditem_with_order(fq['id'], orderid, fq['quantity'])
        return True

class FoodItemAndQuantity:
    """
    A class representing a food item.

    """
    def __init__(self,fooditem, quantity):
        self.fooditem = fooditem;
        self.quantity = quantity;

    def serializable(self):
        d = {}
        d['food_item'] = self.fooditem.serializable()
        d['quantity'] = self.quantity
        return d

class FoodItem:
    """
    A class representing a food item.

    """
    def __init__(self, id, name, price, restaurant_id):
        self.id = id
        self.name = name
        self.price = price
        self.restaurant_id = restaurant_id

    def serializable(self):
        d = self.__dict__
        return d
    
    @staticmethod
    def get_food_item_by_id(id):
        f = query_db("SELECT * FROM\
            food_items WHERE id = ?",
            [id], one=True)

        return FoodItem(f['id'], 
            f['name'],
            f['price'],
            f['restaurant_id'])     

    @staticmethod
    def get_food_items_by_restaurant_id(id):
        food_items = query_db("SELECT id FROM\
            food_items WHERE restaurant_id = ?",
            [id], one=False)

        out = []
        for f in food_items:
            food_id = f['id']
            out.append(FoodItem.get_food_item_by_id(food_id))
        return out

    @staticmethod
    def get_top_food_items_by_restaurant_id(id):
        food_items = query_db("SELECT food_item_id FROM\
            top_food_items WHERE restaurant_id = ?",
            [id], one=False)

        out = []
        for f in food_items:
            food_id = f['food_item_id']
            out.append(FoodItem.get_food_item_by_id(food_id))
        return out

    @staticmethod
    def get_food_items_and_quantity_by_order_id(id):
        food_items_and_quantities = query_db("SELECT food_item_id, quantity FROM\
            order_food_items WHERE order_id = ?", [id], one = False)
        out = []
        for fq in food_items_and_quantities: 
            food_id = fq['food_item_id']
            out.append(FoodItemAndQuantity(FoodItem.get_food_item_by_id(food_id), fq['quantity']))
        return out
    
 
    #necessary since order_food_items is a separate table 
    @staticmethod
    def associate_fooditem_with_order(fooditemid, orderid, quantity):
        query = "INSERT INTO order_food_items (order_id, food_item_id, quantity) VALUES (?, ?, ?)"
        update_db(query, [orderid, fooditemid, quantity])
        return True


class User:
    """
    A class representing a user

    """
    
    def __init__(self, id, name):
        self.id = id
	self.name = name 

    def serializable(self):
        d = self.__dict__
        return d
    
    @staticmethod
    def get_user_by_userid(id):
        u = query_db("SELECT * FROM\
            members WHERE id = ?",
            [id], one=True)

        return User(u['id'], 
            u['username'])


class Restaurant:
    """
    A class representing a restaurant.

    """
    def __init__(self, id, name, address_id, phone):
        self.id = id
        self.name = name
        self.address_id = address_id
        self.phone = phone

    def serializable(self):
        d = self.__dict__
        d['address'] = Address.get_address_by_id(self.address_id).__dict__
        d['food_items'] = [fi.serializable() for fi in FoodItem.get_food_items_by_restaurant_id(self.id)]
        return d

    @staticmethod
    def get_restaurant_by_id(id):
        r = query_db("SELECT * FROM\
            restaurants WHERE id = ?",
            [id], one=True)

        return Restaurant(r['id'], 
            r['name'],
            r['address_id'],
            r['phone_number'])

    @staticmethod
    def get_restaurants_by_cuisine_id(id):
        restaurants = query_db("SELECT id FROM\
            cuisine_restaurants WHERE cuisine_id = ?",
            [id], one=False)

        out = []
        for r in restaurants:
            restaurant_id = r['id']
            out.append(Restaurant.get_restaurant_by_id(restaurant_id))
        return out

    def get_address(self):
        return Address.get_address_by_id(self.address_id)

    def get_cuisines(self):
        return Cuisine.get_cuisines_by_restaurant_id(self.id)

    def get_deliveries(self):
        return Delivery.get_deliveries_by_restaurant_id(self.id)

    def get_food_items(self):
        return FoodItem.get_food_items_by_restaurant_id(self.id)

    def get_top_food_items(self):
        return FoodItem.get_top_food_items_by_restaurant_id(self.id)

class FoodSearch:
	def __init__(self,restaurantid, query):
		self.rid = restaurantid
		self.query = query
	def search_db(self):
		q = query_db("SELECT id from food_items WHERE restaurant_id = ? and \
				name LIKE ?", [self.rid,self.query], one=False)
		fooditems = [row['id'] for row in q ]
		return fooditems
        
class Search:
    """
    A class for restaurant searching and ranking.

    Attributes:
        query: A list of search terms
    """
    def __init__(self, query):
        self.query = query

    def search_db(self):
        """
        Searches for search term matches on restaurant, food, and cuisine names.
        Ranks the restaurants based on number of matches associated.

        Returns:
            A list of Restaurant objects sorted descending by "relevance"
        """
        restaurant_ids = []
        for searchTerm in self.query:
            q = query_db("SELECT cuisine_restaurants.restaurant_id AS id\
                    FROM\
                    cuisine\
                    LEFT JOIN cuisine_restaurants\
                    ON cuisine.id = cuisine_restaurants.cuisine_id\
                    WHERE cuisine.name LIKE ?\
                    UNION ALL\
                    SELECT restaurants.id\
                    FROM\
                    restaurants\
                    LEFT JOIN food_items\
                    ON restaurants.id = food_items.restaurant_id\
                    WHERE food_items.name LIKE ?\
                    UNION ALL\
                    SELECT restaurants.id\
                    FROM restaurants\
                    WHERE restaurants.name LIKE ?",
                    [searchTerm, searchTerm, searchTerm], one=False)
            restaurant_ids+=[row['id'] for row in q]

        restaurant_ids_ranked = [(freq, id) for id, freq in Counter(restaurant_ids).iteritems() if id != None]
        restaurant_ids_ranked.sort(reverse=True)
        restaurants_ranked = [Restaurant.get_restaurant_by_id(id) for freq, id in restaurant_ids_ranked]
        return restaurants_ranked
