How to deploy in local for dummys

Steps
Backend

1- Open a terminal un root folder
2- Activate virtual enviroment with:

    "source ./venv/bin/activate"
You shuld see "(venv)" now at te begining

3- Navigate to backend folder with:

    "cd backend"

4- Run server with the following command:

    "python manage.py runserver"
    



FrontEnd
1- Open a new terminal in root
2- Navigate to app folder with 

    "cd frontend/"

3- Create docker image: 

    "sudo docker build -f docker/dockerfile -t frontend ."
    
4- Start the proyect with:

    "docker run -d -p 3000:3000 frontend"


