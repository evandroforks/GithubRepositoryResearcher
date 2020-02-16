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
: ${REACT_APP_GITHUB_RESEARCHER_BACKEND_IP:="127.0.0.1"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_IP;
: ${REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT:="9000"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT;
: ${REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT:="3000"}; export REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT;

printf "'REACT_APP_GITHUB_RESEARCHER_BACKEND_IP=%s'\\n" "${REACT_APP_GITHUB_RESEARCHER_BACKEND_IP}";
printf "'REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT=%s'\\n" "${REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT}";
printf "'REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT=%s'\\n" "${REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT}";


function run_development_server() {
    printf "Running development server...\\n";

    # https://github.com/facebook/create-react-app/issues/3070 
    export BROWSER="none"
    export PORT="${REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT}"

    cd "${SCRIPT_FOLDER_PATH}/reactfrontend"

    npm start \
        # >> "${SCRIPT_FOLDER_PATH}/console_frontend.log" 2>&1
}

function run_production_server() {
    printf "Running production server...\\n";

    # https://stackoverflow.com/questions/28706180/setting-the-port-for-node-js-server-on-heroku
    if [[ -n ${PORT} ]]; then
        printf "Setting server port to '%s'...\\n" "${PORT}";
        REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT="${PORT}"
    fi

    serve --single --no-clipboard --listen ${REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT} reactfrontend/build
}

# https://github.com/evandrocoan/dotfiles/blob/e7f94508f0d321a66aa8b84b1939432da27fc1cf/.local/bin/_generic_installer.sh#L99
function parse_command_line() {
    local parsed_positional_arguments;
    parsed_positional_arguments=0;

    if [[ "${#}" -lt 1 ]];
    then
        run_development_server;

    else
        while [[ "${#}" -gt 0 ]];
        do
            case ${1} in

                -h|--help)
                    printf "%s [options] [arguments]\\n" "${0}";
                    printf "\\n";
                    printf "This is a small shellscript utility to run this project frontend.\\n";
                    printf "\\n";
                    printf "Arguments:\\n";
                    printf "    -p or --production to run the production server.\\n";
                    printf "    -d or --development to run the development server.\\n";
                    printf "    -h or --help to show this message.\\n";
                    shift;
                    ;;

                -p|--production)
                    run_production_server;
                    exit ${?}
                    shift;
                    ;;

                -d|--development)
                    run_development_server;
                    exit ${?}
                    shift;
                    ;;

                *)
                    parsed_positional_arguments=$((parsed_positional_arguments+1));
                    case ${parsed_positional_arguments} in
                        1)
                            printf "Warning: No positional arguments available yet for '%s'.\\n" "${1}";
                            ;;

                        *)
                            printf "ERROR: Extra positional command line argument '%s' found.\\n" "${1}";
                            exit 1;
                            ;;
                    esac;
                    ;;
            esac;
            shift;
        done;
    fi;
}

parse_command_line "${@}";


