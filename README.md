How to run the project: 

1. Make sure you don't have any ports being used such as 3000, 80, 5432 and 8000. 
2. docker compose build (if you have any changes)
3. docker compose up -d 
4. open localhost:3000
5. WARNING: remember to shut down docker after using it with docker compose down. If you forget about this just on step 3 run "docker compose up" without -d. 