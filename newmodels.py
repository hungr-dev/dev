from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask (__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://smchang:hungrhungrh1ppos@sql.mit.edu/smchang+hungr'
db = SQLAlchemy(app)

cuisine_restaurants = db.Table('cuisine_restaurants',
                               db.Column('cuisine_id', db.Integer, db.ForeignKey('cuisine.id')),
                               db.Column('restaurant_id',db.Integer, db.ForeignKey('restaurant.id'))
                              )
db.session.commit()

class Address(db.Model):
    """
    A class representing an address.

    """
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.String(32))
    lng = db.Column(db.String(32))
    street = db.Column(db.String(32))
    city = db.Column(db.String(32))
    state = db.Column(db.String(32))
    zip = db.Column(db.String(32))
    restaurant = db.relationship('Restaurant',backref='restaurant',lazy='dynamic',uselist=False)

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
        a = Address.query.filter_by(id=id).first()
        return a

        return Address(int(a.id), 
            str(a.lat),
            str(a.lng),
            str(a.street),
            str(a.city),
            str(a.state),
            str(a.zip))

    def __repr__(self):
        return 'Address: {id:%s lat:%s lon:%s street:%s city:%s state:%s zip:%s}' % (self.id, self.lat, self.lng, self.street, self.city, self.state, self.zip)

class Cuisine:
    """
    A class representing a cuisine.

    """
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(32))

    def __init__(self, id, name):
        self.id = id
        self.name = name

    @staticmethod
    def get_cuisine_by_id(id):
        return Cuisine.query.filter_by(id=id).first()

#    @staticmethod
#    def get_cuisines_by_restaurant_id(id):
#        cuisines = query_db("SELECT cuisine_id FROM\
#            cuisine_restaurants WHERE restaurant_id = ?",
#            [id], one=False)
#
#        out = []
#        for c in cuisines:
#            cuisine_id = c['cuisine_id']
#            out.append(Cuisine.get_cuisine_by_id(cuisine_id))
#        return out


class Restaurant(db.Model):
    """
    A class representing a restaurant.

    """
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(32))
    address_id = db.Column(db.Integer, db.ForeignKey('address.id'))
    phone = db.Column(db.String(10))

    def __init__(self, id, name, address_id, phone):
        self.id = id
        self.name = name
        self.address_id = address_id
        self.phone = phone

    def serializable(self):
        d = self.__dict__
        d['address'] = Address.get_address_by_id(self.address_id).__dict__
        return d

    @staticmethod
    def get_restaurant_id(id):
        return Restaurant.query.filter_by(id=id).first()

    @staticmethod
    def get_restaurant_by_cuisine_id(id):
        restaurants = cuisine_restaurants.query.filter_by(cuisine_id=id)

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



