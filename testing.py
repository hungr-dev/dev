import models

DATABASE = os.path.join(os.path.dirname(__file__),"db","hungrTesting.db")
db = sqlite3.connect(DATABASE)


def update_db(query, args=()):
    db.execute(query,args)
    db.commit()

def query_db(query, args=(), one=False):
    cur = db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv

# testing address

print query_db("select * from members", [], one=False)
