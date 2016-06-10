from TwitterAPI import TwitterAPI #https://github.com/geduldig/TwitterAPI

# Your access information goes here
CONSUMER_KEY = "<your key here>"
CONSUMER_SECRET = "<your secret here>"
ACCESS_TOKEN_KEY = "<your key here>"
ACCESS_TOKEN_SECRET = "<your secret here>"

api = TwitterAPI(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET)

SEARCH_TERM = "dog"

# search by search term
r = api.request('search/tweets', {'q': SEARCH_TERM, 'count':100})

# display output
print(r.text)
#print(str(r.text).encode('utf8')) #if encoding errors, try this instead
