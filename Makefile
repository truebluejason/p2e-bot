VERSION := 1.0.0

db_user := root
db_password := path2enlightenment
db_name := P2E
server_port := 3000
test_uid := 1411757238924436

.DEFAULT_GOAL := help

build:
	docker build . -t p2e/p2e-bot:${VERSION}

deploy:
	docker tag p2e/p2e-bot:${VERSION} latest
	docker push p2e/p2e-bot:${VERSION}
	docker push p2e/p2e-bot:latest

# docker run -d -p 3000:3000 -v /home/ec2-user/p2e-bot/production.json:/p2e-bot/config/production.json p2e/p2e-bot:latest

debug:
	node inspect index.js

help:
	@echo
	@echo 'Provisioning Dev Environment'
	@echo '1. Run "make setup".'
	@echo
	@echo 'Developing in Dev Environment'
	@echo '1. In 3 different tabs, run "make start", "make start_db", and "make start_ngrok".'
	@echo '2. Sign onto Facebook through the opened tab.'
	@echo '3. Modify webhook address to <ngrok https address>/gateway.'
	@echo

poll:
	curl --header "Content-Type: application/json" --request POST --data '{"userID":"${test_uid}", "payload":"Not one, not two.", "contentID": "1", "contentType": "Quote"}' localhost:${server_port}/poll

poll_image:
	curl --header "Content-Type: application/json" --request POST --data '{"userID":"${test_uid}", "payload":"https://image.shutterstock.com/image-photo/sand-lily-spa-stones-zen-260nw-268875851.jpg", "contentID": "2", "contentType": "Image"}' localhost:${server_port}/poll

poll_link:
	curl --header "Content-Type: application/json" --request POST --data '{"userID":"${test_uid}", "payload":"https://path-to-enlightenment.firebaseapp.com/", "contentID": "3", "contentType": "Link"}' localhost:${server_port}/poll

purge_db:
	$(MAKE) start_db
	@echo 'Dropping database in 5 seconds...'
	sleep 5
	mysql --user=${db_user} --password=${db_password} -e "DROP DATABASE ${db_name};"
	$(MAKE) stop_db

setup:
	npm install
	brew update
	brew install mysql 2>/dev/null
	brew tap homebrew/services
	$(MAKE) setup_db

setup_db:
	$(MAKE) start_db
	-mysqladmin -u ${db_user} password ${db_password} 2>/dev/null
	mysql --user=${db_user} --password=${db_password} -e "CREATE DATABASE ${db_name};"
	mysql --user=${db_user} --password=${db_password} ${db_name} < "./scripts/seed_db.sql"
	$(MAKE) stop_db

start:
	node index.js

start_db:
	brew services start mysql
	sleep 5

start_db_cli:
	$(MAKE) start_db
	mysql --user=${db_user} --password=${db_password}

start_ngrok:
	@echo 'Opening Facebook Developer Console and starting ngrok...'
	sleep 5
	open https://developers.facebook.com/apps/411787595955770/webhooks/
	./ngrok http ${server_port}

stop_db:
	brew services stop mysql

