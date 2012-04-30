CREATE TABLE restaurants(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(32),
    address VARCHAR(50),
    phone_number VARCHAR(10),
    cuisine_id int,
    FOREIGN KEY (cuisine_id) REFERENCES cuisine(id)
);

CREATE TABLE cuisine{
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(32)
};

CREATE TABLE food_items(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(32),
    price DOUBLE,
    restaurant_id int,
    FOREIGN KEY (restaurant_id) REFERENCES retaurants(id)
);

CREATE TABLE members(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(32),
    facebook_id INT
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
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);

INSERT into cuisine(name) VALUES ("Chinese");
INSERT into cuisine(name) VALUES ("Italian");
INSERT into cuisine(name) VALUES ("American");

INSERT into restaurants(name, address, phone_number, cuisine_id) VALUES ("Quan's Kitchen", "1026Commonwealth Ave, Boston, MA 02215", "6172327617", 1);
INSERT into restaurants(name, address, phone_number, cuisine_id) VALUES ("Domino's Pizza", "1260 Boylston St", "6174249000", 2);
INSERT into restaurants(name, address, phone_number, cuisine_id) VALUES ("Restaurant", "123 Main St", "6175550123", 1);

INSERT into food_items(name, price, restaurant_id) VALUES ("General Gao's Chicken", "8.99", "1");
INSERT into food_items(name, price, restaurant_id) VALUES ("Sesame Chicken", "9.79", "1");
INSERT into food_items(name, price, restaurant_id) VALUES ("Fried Rice", "4.49", "1");
INSERT into food_items(name, price, restaurant_id) VALUES ("Pepperoni Pizza", "12.99", "2");
INSERT into food_items(name, price, restaurant_id) VALUES ("Buffalo Wings", "5.99", "2");

INSERT into members(name, facebook_id) VALUES ("Stephen", "123");
INSERT into members(name, facebook_id) VALUES ("Ryan","321");
INSERT into members(name, facebook_id) VALUES ("Andrew","4213");
INSERT into members(name, facebook_id) VALUES ("Kamran","421332");

INSERT into orders(delivery_id, member_id) VALUES ("1","1");
INSERT into orders(delivery_id, member_id) VALUES ("1","2");
INSERT into orders(delivery_id, member_id) VALUES ("1","3");

INSERT into deliveries(delivery_location, order_time, restaurant_id, creator_member_id) VALUES ("Student Center", "18:34","1","1");
INSERT into deliveries(delivery_location, order_time, restaurant_id, creator_member_id) VALUES ("Baker", "16:00","2","3");

INSERT into order_food_items(order_id, food_item_id) VALUES ("1","1");
INSERT into order_food_items(order_id, food_item_id) VALUES ("1","3");
INSERT into order_food_items(order_id, food_item_id) VALUES ("2","1");
INSERT into order_food_items(order_id, food_item_id) VALUES ("3","2");
