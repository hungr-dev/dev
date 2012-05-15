from modelsTesting import *
import sqlite3
import os




# testing Address
assert Address.get_address_by_id(1).city == 'Boston'


#testing cuisine
assert Cuisine.get_cuisine_by_id(1).name == 'Chinese'
assert Cuisine.get_cuisines_by_restaurant_id(1)[0].name == 'Chinese'

#testing delivery
assert Delivery.get_delivery_by_id(3).delivery_location == 'Student Center'
assert Delivery.get_deliveries_by_restaurant_id(2)[0].delivery_location == 'Baker'

d = Delivery.create_delivery('athena', '1:00pm', 3, 2)
assert Delivery.get_delivery_by_id(d).delivery_location == 'athena'

Delivery.update_delivery(d, 'delivery_location', "Maseeh")
assert Delivery.get_delivery_by_id(d).delivery_location == 'Maseeh'

#testing order
order1 = Order.create_order(d, 1)
assert Order.get_order_by_id(order1).member_id == 1

Order.add_fooditems_and_quantity_to_order(order1, [{'id': 431, 'quantity': 2},{'id': 432, 'quantity':3},{'id': 433, 'quantity':10}])

Order.get_order_by_id(order1).serializable()['food_items'] == [{'quantity': 2, 'food_item': {'price': 5.95, 'restaurant_id': 3, 'id': 431, 'name': u'Fish Cake'}}, {'quantity': 3, 'food_item': {'price': 5.95, 'restaurant_id': 3, 'id': 432, 'name': u'Chicken Wings'}}, {'quantity': 10, 'food_item': {'price': 5.95, 'restaurant_id': 3, 'id': 433, 'name': u'Crispy Wontons'}}]

Order.get_order_by_id(order1).deleteAllFoodItems()
assert len(Order.get_order_by_id(order1).serializable()['food_items']) == 0

#testing for fooditem and fooditemandquantity already implicit in previous tests yay

#testing search
#test various searches, show that they display different results
search1 = Search(['%pizz%'])
search1result = search1.search_db()
assert len(search1result) == 2

search2 = Search(['%chicken%', '%pad thai%', '%chinese%'])
search2result = search2.search_db()
assert len(search2result) ==5
