GITHUB_REF ?= refs/heads/github-actions-1
BRANCH_NAME = $(subst refs/heads/,,$(GITHUB_REF))
DOCKER_BRANCH = $(subst /,-,$(BRANCH_NAME))
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

DOCKER_COMPOSE_ENV=APP_REPO=$(APP_REPO) APP_BRANCH=$(APP_BRANCH)
docker-compose-up:
	rm -Rf py-payments-testing
	git clone --branch=$(TEST_BRANCH) --single-branch --depth=1 https://github.com/SecureTrading/py-payments-testing.git
	$(DOCKER_COMPOSE_ENV) docker-compose -f py-payments-testing/docker-compose.yml pull
	$(DOCKER_COMPOSE_ENV) docker-compose -f py-payments-testing/docker-compose.yml up -d

docker-compose-down:
	docker-compose -f py-payments-testing/docker-compose.yml down

behave-chrome:
	docker-compose -f py-payments-testing/docker-compose.yml run tests poetry run behave features --tags=$(BEHAVE_TAGS)
