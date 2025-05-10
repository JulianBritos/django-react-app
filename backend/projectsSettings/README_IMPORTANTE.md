## Cuando creamos la db, es importante agregar los privilegios al USER DE DJANGO en settings.py para que pueda acceder bien a la base de datos con los siguientes comandos: 

GRANT ALL PRIVILEGES ON DATABASE ecommerce TO admin;
GRANT USAGE ON SCHEMA public TO admin;
GRANT CREATE ON SCHEMA public TO admin;
