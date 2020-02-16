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
: ${GITHUB_RESEARCHER_PIP_PATH:="pip3"}; export GITHUB_RESEARCHER_PIP_PATH;
: ${GITHUB_RESEARCHER_PYTHON_PATH:="python3"}; export GITHUB_RESEARCHER_PYTHON_PATH;
: ${GITHUB_RESEARCHER_DEBUG_LEVEL:="127"}; export GITHUB_RESEARCHER_DEBUG_LEVEL;

: ${REACT_APP_GITHUB_RESEARCHER_TOKEN:=""}; export REACT_APP_GITHUB_RESEARCHER_TOKEN;
: ${REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT:="9000"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT;


# https://stackoverflow.com/questions/23513045/how-to-check-if-a-process-is-running-inside-docker-container
if [[ -f /.dockerenv ]];
then
    "${GITHUB_RESEARCHER_PYTHON_PATH}" \
        "${SCRIPT_FOLDER_PATH}/pythonbackend/run.py"

else
    "${GITHUB_RESEARCHER_PYTHON_PATH}" \
        "${SCRIPT_FOLDER_PATH}/pythonbackend/run.py" \
        # >> "${SCRIPT_FOLDER_PATH}/console_backend.log" 2>&1
fi
