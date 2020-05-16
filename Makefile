GITHUB_REF ?= refs/heads/github-actions-1
BRANCH_NAME = $(subst refs/heads/,,$(GITHUB_REF))
DOCKER_BRANCH = $(GITHUB_RUN_ID)
APP_REPO=js-payments
APP_BRANCH=$(DOCKER_BRANCH)

ifeq ($(BRANCH_NAME),master)
TEST_BRANCH = master
else ifeq ($(findstring release/,$(BRANCH_NAME)),release/)
TEST_BRANCH = master
else ifeq ($(findstring hotfix/,$(BRANCH_NAME)),hotfix/)
TEST_BRANCH = master
else
TEST_BRANCH = develop
endif

build-app-docker:
	docker build . --tag "securetrading1/js-payments:$(DOCKER_BRANCH)"
	echo "$(DOCKER_PASSWORD)" | docker login --username "$(DOCKER_USERNAME)" --password-stdin
	docker push "securetrading1/js-payments:$(DOCKER_BRANCH)"



check-docker-file-exists:
	DOCKER_BRANCH=$(DOCKER_BRANCH) sh ./.github/workflows/scripts/docker_image_exists.sh

DOCKER_COMPOSE_ENV=APP_REPO=$(APP_REPO) APP_BRANCH=$(APP_BRANCH)
docker-compose-up: check-docker-file-exists
	rm -Rf py-payments-testing
	git clone --branch=$(TEST_BRANCH) --single-branch --depth=1 https://github.com/SecureTrading/py-payments-testing.git
	$(DOCKER_COMPOSE_ENV) docker-compose -f py-payments-testing/docker-compose.yml pull
	$(DOCKER_COMPOSE_ENV) docker-compose -f py-payments-testing/docker-compose.yml up -d

docker-compose-down:
	docker-compose -f py-payments-testing/docker-compose.yml down

behave-chrome:
	docker-compose -f py-payments-testing/docker-compose.yml run tests poetry run behave features --tags=$(BEHAVE_TAGS)

behave-browserstack:
	docker-compose -f py-payments-testing/docker-compose.yml run -e OS=$(OS) -e OS_VERSION=$(OS_VERSION) -e BROWSER=$(BROWSER) -e BROWSER_VERSION=$(BROWSER_VERSION) -e BS_ACCESS_KEY=$(BROWSERSTACK_ACCESS_KEY) -e BS_USERNAME=$(BROWSERSTACK_USERNAME) -e BS_LOCAL_IDENTIFIER=$(GITHUB_RUN_ID) -e BUILD_NAME=$(GITHUB_RUN_ID) -e REMOTE=true tests poetry run behave features --tags=$(BEHAVE_TAGS)

browserstack-local-start:
	rm -f ./BrowserStackLocal
	wget https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip
	unzip 'BrowserStackLocal-linux-x64.zip'
	rm 'BrowserStackLocal-linux-x64.zip'
	./BrowserStackLocal --key=$(BROWSERSTACK_ACCESS_KEY) --force-local --daemon start --local-identifier $(GITHUB_RUN_ID)

browserstack-local-stop:
	./BrowserStackLocal --daemon stop

setup-hosts-file:
	sudo echo "127.0.0.1 webservices.securetrading.net" | sudo tee -a /etc/hosts
	sudo echo "127.0.0.1 merchant.securetrading.net" | sudo tee -a /etc/hosts
	sudo echo "127.0.0.1 thirdparty.example.com" | sudo tee -a /etc/hosts

run-behave-browserstack: docker-compose-up setup-hosts-file browserstack-local-start behave-browserstack
run-behave-chrome: docker-compose-up setup-hosts-file behave-chrome
