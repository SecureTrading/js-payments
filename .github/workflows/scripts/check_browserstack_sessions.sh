# Checks if browserstack already has too many active sessions
MAX_RETRY=360 # Will mean we have 3600s of retries ~1hr
SLEEP=10
ATTEMPT=1

SESSION_AVAILABLE=false
while :
do
  echo "Checking if browserstack has active sessions"
  SESSION_DATA=$(curl -su "${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}" "https://api.browserstack.com/automate/plan.json")
  echo $SESSON_DATA
  ACTIVE_SESSIONS=$(echo $SESSION_DATA | jq -r ".parallel_sessions_running")
  MAX_ACTIVE_SESSIONS=$(echo $SESSION_DATA | jq -r ".parallel_sessions_max_allowed")
  QUEUED_SESSIONS=$(echo $SESSION_DATA | jq -r ".queued_sessions")
  echo "Active sessions ${ACTIVE_SESSIONS}/${MAX_ACTIVE_SESSIONS} queued: ${QUEUED_SESSIONS}"

  if [ $ACTIVE_SESSIONS -lt $MAX_ACTIVE_SESSIONS ] && [ $QUEUED_SESSIONS -lt 1 ]
  then
    SESSION_AVAILABLE=true
    break
  fi
  if [ $ATTEMPT -gt $MAX_RETRY ]
  then
    break
  fi
  sleep $SLEEP
done

if (! $SESSION_AVAILABLE)
then
  echo "Session not available"
  exit 1;
fi
