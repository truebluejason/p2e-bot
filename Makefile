poll:
	curl --header "Content-Type: application/json" --request POST --data '{"userID":"1411757238924436", "message":"Not one, not two."}' localhost:3000/poll

start:
	node index.js