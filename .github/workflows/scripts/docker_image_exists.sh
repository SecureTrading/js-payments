# Checks if a docker image already exists
TOKEN=$( curl -sSLd "username=${DOCKER_USERNAME}&password=${DOCKER_PASSWORD}" https://hub.docker.com/v2/users/login | jq -r ".token" )
TAG_EXISTS=null
MAX_RETRY=2 # Will mean we have 300s of retries ~5minutes
SLEEP=1

ATTEMPT=1
while :
do
  echo "Checking if docker has been tagged ${ATTEMPT}/${MAX_RETRY}"
  TAG_EXISTS=$(curl -sH "Authorization: JWT $TOKEN" "https://hub.docker.com/v2/repositories/securetrading1/${APP_REPO}/tags/${DOCKER_BRANCH}/" | jq -r ".id")
  echo "Tag id ${TAG_EXISTS}"
  ATTEMPT=$((ATTEMPT+1));
  if [ $ATTEMPT -gt $MAX_RETRY ] || [ $TAG_EXISTS != "null" ]
  then
    break
  fi
  sleep $SLEEP
done

if [ $TAG_EXISTS = "null" ];
then
  echo "Tag not found ${DOCKER_BRANCH}"
  exit 1;
fi
