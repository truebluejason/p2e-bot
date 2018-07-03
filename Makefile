poll:
	curl --header "Content-Type: application/json" --request POST --data '{"userID":"1411757238924436", "message":"Not one, not two."}' localhost:3000/poll

setup:
	npm install || echo 'install npm please.'
	brew update || echo 'install Homebrew please.'
	brew install mysql 2>/dev/null || echo 'mysql is already installed.'
	brew tap homebrew/services
	mysqladmin -u root password 'apassword'

start:
	node index.js

start_db:
	brew services start mysql

start_db_cli:
	brew services start mysql
	sleep 5
	mysql -u root --password=apassword

stop_db:
	brew services stop mysql

test:
	[ -z "$(shell command -v brew || echo)" ] && echo 'brew not here' || echo 'brew here'