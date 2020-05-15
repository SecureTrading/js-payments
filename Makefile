GITHUB_REF ?= refs/heads/feature/branchname
BRANCH_NAME = $(subst refs/heads/,,$(GITHUB_REF))
DOCKER_BRANCH = $(subst /,-,$(BRANCH_NAME))

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

docker-compose-up:
	git clone --branch=$(TEST_BRANCH) --single-branch --depth=1 https://github.com/SecureTrading/py-payments-testing.git
	docker-compose -f py-payments-testing/docker-compose.yml pull
	APP_REPO=js-payments APP_BRANCH=$(DOCKER_BRANCH) docker-compose -f py-payments-testing/docker-compose.yml up -d

docker-compose-down:
	docker-compose -f py-payments-testing/docker-compose.yml down
