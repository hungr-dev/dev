CREATE TABLE restaurants(
    id int PRIMARY KEY,
    name VARCHAR(32),
    restaurant_address VARCHAR(50),
    phone_number VARCHAR(10)
);

CREATE TABLE food_items(
    id int PRIMARY KEY,
    name VARCHAR(32),
    price DOUBLE,
    restaurant_id int,
    FOREIGN KEY (restaurant_id) REFERENCES retaurants(id)
);

CREATE TABLE members(
    id INT PRIMARY KEY,
    facebook_id INT
);

CREATE TABLE orders(
    id INT PRIMARY KEY,
    delivery_id int,
    member_id int,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE deliveries(
    id INT PRIMARY KEY,
    delivery_location VARCHAR(32),
    order_time DATETIME,
    restaurant_id int,
    creator_member_id int,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (creator_member_id) REFERENCES members(id)
);

CREATE TABLE order_food_items(
    id INT PRIMARY KEY,
    order_id int,
    food_item_id int,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);
