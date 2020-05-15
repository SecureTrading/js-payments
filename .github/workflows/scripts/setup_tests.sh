git clone --branch=develop --single-branch --depth=1 https://github.com/SecureTrading/py-payments-testing.git
docker-compose -f py-payments-testing/docker-compose.yml pull
docker-compose -f py-payments-testing/docker-compose.yml up -d
