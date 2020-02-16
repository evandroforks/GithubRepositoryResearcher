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

: ${REACT_APP_GITHUB_RESEARCHER_BACKEND_IP:="127.0.0.1"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_IP;
: ${REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT:="9000"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT;

printf "'GITHUB_RESEARCHER_PIP_PATH=%s'\\n" "${GITHUB_RESEARCHER_PIP_PATH}";
printf "'GITHUB_RESEARCHER_PYTHON_PATH=%s'\\n" "${GITHUB_RESEARCHER_PYTHON_PATH}";
printf "'GITHUB_RESEARCHER_DEBUG_LEVEL=%s'\\n" "${GITHUB_RESEARCHER_DEBUG_LEVEL}";

printf "'REACT_APP_GITHUB_RESEARCHER_BACKEND_IP=%s'\\n" "${REACT_APP_GITHUB_RESEARCHER_BACKEND_IP}";
printf "'REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT=%s'\\n" "${REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT}";


function reactfrontend_tests() {
    printf "Running reactfrontend tests...\\n";
    export CI="true"

    # https://create-react-app.dev/docs/running-tests/#continuous-integration
    cd "${SCRIPT_FOLDER_PATH}/reactfrontend"
    npm test || exit $?
    printf "\\n";
}

function pythonbackend_tests() {
    testscase="${1}";

    # https://stackoverflow.com/questions/15971735/running-single-test-from-unittest-testcase-via-command-line
    if [[ -z ${testscase} ]];
    then
        printf "Running pythonbackend tests...\\n";
        "${GITHUB_RESEARCHER_PYTHON_PATH}" "${SCRIPT_FOLDER_PATH}/pythonbackend/tests/run_all.py" || exit $?

    else
        printf "Running pythonbackend single test(s) '%s'...\\n" "${testscase}";
        cd "${SCRIPT_FOLDER_PATH}/pythonbackend"

        "${GITHUB_RESEARCHER_PYTHON_PATH}" -m unittest "tests.${testscase}" || exit $?
        printf "\\n";
        return 0
    fi

    printf "\\n";
    return 1
}

# https://github.com/evandrocoan/dotfiles/blob/e7f94508f0d321a66aa8b84b1939432da27fc1cf/.local/bin/_generic_installer.sh#L99
function parse_command_line() {
    local parsed_positional_arguments;
    parsed_positional_arguments=0;

    if [[ "${#}" -lt 1 ]];
    then
        pythonbackend_tests;
        reactfrontend_tests;

    else
        while [[ "${#}" -gt 0 ]];
        do
            case ${1} in

                -h|--help)
                    printf "%s [options] [arguments]\\n" "${0}";
                    printf "\\n";
                    printf "This is a small shellscript utility to run this project unit tests.\\n";
                    printf "\\n";
                    printf "Arguments:\\n";
                    printf "    -p or --python to run the python backend tests.\\n";
                    printf "           You can also pass a test 'module' to run individual module.\\n";
                    printf "           Alternatively 'module.class.testname' to run individual test.\\n";
                    printf "           For example 'bash %s -p module.class.testname' .\\n" "${0}";
                    printf "    -r or --react to run the react tests.\\n";
                    printf "    -h or --help to show this message.\\n";
                    shift;
                    ;;

                -r|--react)
                    reactfrontend_tests;
                    shift;
                    ;;

                -p|--python)
                    if ! pythonbackend_tests "${2}";
                    then
                        shift; # consume the second argument after -p
                    fi
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
