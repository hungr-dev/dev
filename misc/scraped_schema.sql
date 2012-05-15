CREATE TABLE restaurants(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(32),
    address_id VARCHAR(50),
    phone_number VARCHAR(10),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);

CREATE TABLE addresses(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat FLOAT(32),
    lng FLOAT(32),
    street VARCHAR(32),
    city VARCHAR(32),
    state VARCHAR(32),
    zip VARCHAR(10)
);

CREATE TABLE cuisine(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(32)
);

CREATE TABLE cuisine_restaurants(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuisine_id int,
    restaurant_id int,
    FOREIGN KEY (cuisine_id) REFERENCES cuisine(id)
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE food_items(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(32),
    price DOUBLE,
    restaurant_id int,
    FOREIGN KEY (restaurant_id) REFERENCES retaurants(id)
);

CREATE TABLE members(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(32),
    password VARCHAR(32)
);

CREATE TABLE orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_id int,
    member_id int,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE deliveries(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_location VARCHAR(32),
    order_time DATETIME,
    restaurant_id int,
    creator_member_id int,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (creator_member_id) REFERENCES members(id)
);

CREATE TABLE order_food_items(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id int,
    food_item_id int,
    quantity int,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);

INSERT into cuisine(name, id) VALUES ("Chinese", 1);
INSERT into cuisine(name, id) VALUES ("Italian", 2);
INSERT into cuisine(name, id) VALUES ("American", 3);
INSERT into cuisine(name, id) VALUES ("Thai", 4);

INSERT INTO addresses(lat, lng, street, city, state, zip) VALUES (0, 0, "1026 Commonwealth Ave", "Boston", "MA", "02215");
INSERT INTO addresses(lat, lng, street, city, state, zip) VALUES (0, 0, "901 Main Street", "Cambridge", "MA", "02139");
INSERT INTO addresses(lat, lng, street, city, state, zip) VALUES (0, 0, "20 Pearl Street", "Cambridge", "MA", "02139");
INSERT INTO addresses(lat, lng, street, city, state, zip) VALUES (0, 0, "840 Commonwealth Ave", "Boston", "MA", "02215");
INSERT INTO addresses(lat, lng, street, city, state, zip) VALUES (0, 0, "792 Main Street", "Cambridge", "MA", "02139");

INSERT INTO cuisine_restaurants(cuisine_id, restaurant_id) VALUES (1, 1);
INSERT INTO cuisine_restaurants(cuisine_id, restaurant_id) VALUES (2, 2);
INSERT INTO cuisine_restaurants(cuisine_id, restaurant_id) VALUES (4, 3);
INSERT INTO cuisine_restaurants(cuisine_id, restaurant_id) VALUES (2, 4);
INSERT INTO cuisine_restaurants(cuisine_id, restaurant_id) VALUES (1, 5);

INSERT into restaurants(name, address_id, phone_number) VALUES ("Quan's Kitchen", 1, "6172327617");
INSERT into restaurants(name, address_id, phone_number) VALUES ("Cinderella's Restaurant", 2,"6176039908"); 
INSERT into restaurants(name, address_id, phone_number) VALUES ("Pepper Sky's Thai Sensation", 3,"6174922541"); 
INSERT into restaurants(name, address_id, phone_number) VALUES ("Sicilia's Pizzeria", 4,"6175660021"); 
INSERT into restaurants(name, address_id, phone_number) VALUES ("Royal East", 5,"6176611660"); 

INSERT into members(username, password) VALUES ("Stephen", "asdf1");
INSERT into members(username, password) VALUES ("Ryan","asdf2");
INSERT into members(username, password) VALUES ("Andrew","asdf3");
INSERT into members(username, password) VALUES ("Kamran","asdf4");

INSERT into orders(delivery_id, member_id) VALUES ("1","1");
INSERT into orders(delivery_id, member_id) VALUES ("1","2");
INSERT into orders(delivery_id, member_id) VALUES ("1","3");

INSERT into deliveries(delivery_location, order_time, restaurant_id, creator_member_id) VALUES ("Student Center", "18:34","1","1");
INSERT into deliveries(delivery_location, order_time, restaurant_id, creator_member_id) VALUES ("Baker", "16:00","2","3");

INSERT into order_food_items(order_id, food_item_id, quantity) VALUES ("1","1","1");
INSERT into order_food_items(order_id, food_item_id, quantity) VALUES ("1","3","1");
INSERT into order_food_items(order_id, food_item_id, quantity) VALUES ("2","1","2");
INSERT into order_food_items(order_id, food_item_id, quantity) VALUES ("3","2","3");
