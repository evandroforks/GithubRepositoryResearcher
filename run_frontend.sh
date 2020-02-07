#!/bin/bash

pushd `dirname $0` > /dev/null
SCRIPT_FOLDER_PATH=`pwd`
cd "${SCRIPT_FOLDER_PATH}"
popd > /dev/null

# Note: User environment variables have priority over variables defined in `env.sh`
if [[ -f "${SCRIPT_FOLDER_PATH}/env.sh" ]];
then
    source ${SCRIPT_FOLDER_PATH}/env.sh
fi


# Set default values for undefined environment variables
# https://stackoverflow.com/questions/11686208/check-if-environment-variable-is-already-set
: ${REACT_APP_GITHUB_RESEARCHER_BACKEND_IP="127.0.0.1"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_IP;
: ${REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT="9000"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT;
: ${REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT="3000"}; export REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT;


# https://github.com/facebook/create-react-app/issues/3070 
export BROWSER="none"
export PORT="${REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT}"

cd "${SCRIPT_FOLDER_PATH}/reactfrontend"

npm start \
    # >> "${SCRIPT_FOLDER_PATH}/console_frontend.log" 2>&1
