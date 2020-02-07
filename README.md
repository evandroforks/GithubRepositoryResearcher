# Github Repository Researcher

Search and
list repositories throughout Github.
Given a repository name,
returns a repositories list within the name of the repository, its description,
the name of the author and
the number of stars.

When clicking on one of the results,
the system presents more detailed results about the repository,
as the number of open issues,
the main language of the project,
its date of creation and
a list of other repositories by the same author.

This work was mostly based on the tutorials:
1. https://github.com/sazzer/docker-test ([blog post](https://blog.pusher.com/full-stack-testing-docker-compose/))
1. https://github.com/ryanjyost/react-responsive-tutorial ([blog post](https://codeburst.io/how-to-build-fully-responsive-react-apps-with-nothing-but-inline-styles-and-javascript-242c091b6ba1))


## Deployment (Docker)

For easy deployment,
you can use docker with a pre-built docker container image.
The project works by using **`docker-compose`** to launch the backend and
frontend servers.

### Requirements

1. **`Docker 19.03.5`** or superior
    1. Do not install docker from your distro package manager because it is GUI application and not the real docker!
        1. https://stackoverflow.com/questions/30379381/docker-command-not-found-even-though-installed-with-apt-get
    1. For Ubuntu:
        1. https://docs.docker.com/install/linux/docker-ce/ubuntu/
    1. For Debian 9:
        1. https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-debian-9
    1. For Windows:
        1. https://www.docker.com/get-started
    1. For any other distro, search on google with **`docker install <distro name>`**
        1. https://docker-curriculum.com/
        1. https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user
1. **`docker-compose 1.23.1`** or superior
    1. For Debian 9:
        1. https://linuxize.com/post/how-to-install-and-use-docker-compose-on-debian-9/

### Installation

1. **`git clone https://github.com/evandrocoan/GithubRepositoryResearcher`**
1. **`cd GithubRepositoryResearcher`**
1. **`docker-compose up reactfrontend pythonbackend`**
    1. **`docker-compose up reactfrontend pythonbackend -d`** (to run in background)
    1. **`docker-compose stop`** (to stop background dockers)

### Debugging Commands

1. To rebuild the docker container:
    1. **`docker rmi <image>`**
    1. **`docker rm <container>`**
    1. **`docker image ls`**
    1. **`docker image prune -f`**
    1. **`docker-compose build reactfrontend pythonbackend`**
    1. **`docker-compose up --force-recreate --build reactfrontend pythonbackend`**
    1. **`docker build . -f Dockerfile-nodejs -t evandrocoan/ubuntu18nodejspython`**
1. **`docker-compose ps`**
1. **`docker-compose --verbose up`**
1. **`docker-compose run --entrypoint /bin/bash <container>`**
    1. It is the same as **`docker run -it <container> /bin/bash`**
    1. Then run: **`nslookup pythonbackend`** inside a docker to resolve the container ip address
1. Working with images:
    1. **`docker image ls`** (to list containers images)
    1. **`docker ps -n10 -s`** (to list exited containers)
    1. **`docker containers ls`** (running containers)
1. Open an image and run a iterative shell:
    1. **`docker imagens`** (to list available images/containers)
    1. **`docker run -it githubrepositoryresearcher_tests /bin/bash`**
    1. **`docker run -it evandrocoan/ubuntu18nodejspython /bin/bash`**
1. Useful links:
    1. https://docs.docker.com/engine/reference/builder/
    1. https://vsupalov.com/docker-arg-env-variable-guide/
    1. https://nickjanetakis.com/blog/docker-tip-3-chain-your-docker-run-instructions-to-shrink-your-images
    1. https://stackoverflow.com/questions/31222377/what-are-docker-image-layers
    1. https://stackoverflow.com/questions/40801772/what-is-the-difference-between-docker-compose-ports-vs-expose

### Running Tests (Continuous Integration)

Uses **`docker-compose`** to run all services,
including the tests service.

1. **`docker-compose build reactfrontend`** (build **`reactfrontend`** first because the **`tests`** service depends on it)
1. **`docker-compose up --exit-code-from tests`** (automatically stop the containers when the tests are finished)
    1. https://stackoverflow.com/questions/38440876/stand-up-select-services-with-docker-compose
    1. https://www.ostechnix.com/explaining-docker-volumes-with-examples/


## Development

To develop this project,
locally install its dependencies and
directly run the Python backend (**`run_backend.sh`**) and
Nodejs frontend (**`run_frontend.sh`**) servers on different terminals.

### Requirements

1. **`Python 3.6.7`** or superior (https://www.python.org/downloads/)
    1. https://linuxize.com/post/how-to-install-python-3-7-on-debian-9/
1. **`pip 3`** (https://pypi.org/project/pip/)
1. **`NodeJS v12.14.1`** or superior
    1. https://nodejs.org/en/download/
    1. https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions-enterprise-linux-fedora-and-snap-packages

### Installation

1. **`git clone https://github.com/evandrocoan/GithubRepositoryResearcher`**
1. **`cd GithubRepositoryResearcher`**
1. **`python3 -m pip install -r requirements.txt`**
1. Create the environment variables file **`env.sh`** as the following or
   just export these variables before running the project.
    ```shell
    #!/bin/bash
    : ${GITHUB_RESEARCHER_PIP_PATH:="pip3"}; export GITHUB_RESEARCHER_PIP_PATH
    : ${GITHUB_RESEARCHER_PYTHON_PATH:="python3"}; export GITHUB_RESEARCHER_PYTHON_PATH

    : ${REACT_APP_GITHUB_RESEARCHER_TOKEN:=""}; export REACT_APP_GITHUB_RESEARCHER_TOKEN
    : ${REACT_APP_GITHUB_RESEARCHER_DEBUG_LEVEL:="127"}; export REACT_APP_GITHUB_RESEARCHER_DEBUG_LEVEL

    : ${REACT_APP_GITHUB_RESEARCHER_BACKEND_IP:="127.0.0.1"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_IP
    : ${REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT:="9000"}; export REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT
    : ${REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT:="3000"}; export REACT_APP_GITHUB_RESEARCHER_FRONTEND_PORT
    ```
    1. Do not forget to fill out the **`REACT_APP_GITHUB_RESEARCHER_TOKEN`** variable.
    1. You only need to export the variables which their presented default is requires change.
1. Open a command line and run **`bash run_backend.sh`**
1. Now, open another command line and run the commands:
    1. **`cd reactfrontend`**
    1. **`npm install`**
    1. **`cd ..`**
    1. **`bash run_frontend.sh`**

### Running Tests

1. First follow the **`Installation`** steps just above and
   put the backend and
   frontend servers up and
   running.
1. **`bash run_tests.sh`**
1. Alternatively,
   you can run only the frontend or
   backend tests with:
    1. **`bash run_tests.sh -h`** or **`bash run_tests.sh --help`**
    1. **`bash run_tests.sh -r`** or **`bash run_tests.sh --react`**
    1. **`bash run_tests.sh -p`** or **`bash run_tests.sh --python`**
