import psycopg2
import redis
import json
from datetime import datetime
import sys

# Configuración de Redis
redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

# Configuración de PostgreSQL
pg_conn = psycopg2.connect(
    dbname='postgres_secret_hitler',  # Nombre de la base de datos
    user='hitler',                   # Usuario
    password='hitlersecreto',        # Contraseña
    host='localhost',                # Host de PostgreSQL
    port='5432'                      # Puerto
)
pg_cursor = pg_conn.cursor()

# Función para verificar si la sala existe
def verificar_sala_existente(id_sala_num):
    query = "SELECT COUNT(*) FROM public.sala WHERE id_sala = %s;"
    pg_cursor.execute(query, (id_sala_num,))
    count = pg_cursor.fetchone()[0]
    return count > 0

# Función para crear una sala si no existe
def crear_sala_si_no_existe(id_sala_num, nombre_sala):
    if not verificar_sala_existente(id_sala_num):
        query = """
        INSERT INTO public.sala (id_sala, nombre_sala)
        VALUES (%s, %s)
        """
        pg_cursor.execute(query, (id_sala_num, nombre_sala))
        pg_conn.commit()
        print(f"Sala {id_sala_num} creada exitosamente.")

# Función para insertar un mensaje en la base de datos
def insertar_mensaje(usuario, mensaje, momento_envio, id_sala_num):
    query = """
    INSERT INTO public.mensajes (usuario, mensaje, momento_envio, id_sala)
    VALUES (%s, %s, %s, %s);
    """
    try:
        pg_cursor.execute(query, (usuario, mensaje, momento_envio, id_sala_num))
        pg_conn.commit()
        print(f"Mensaje insertado: Usuario={usuario}, Momento={momento_envio}, Sala={id_sala_num}")
    except Exception as e:
        print(f"Error al insertar el mensaje: {e}")
        pg_conn.rollback()

# Función principal para transferir mensajes de Redis a PostgreSQL
def transferir_mensajes(id_sala):
    clave_redis = f"room:{id_sala}:messages"
    
    # Extraer solo el número del id_sala (si tiene un prefijo como 'sala_123')
    try:
        id_sala_num = int(id_sala.split("_")[1])  # Convertir a entero
    except (IndexError, ValueError):
        print(f"Error: El formato del id_sala '{id_sala}' no es válido.")
        return

    # Obtener todos los mensajes de Redis
    try:
        mensajes = redis_client.lrange(clave_redis, 0, -1)
        print(f"Mensajes obtenidos para la sala {id_sala}: {len(mensajes)} encontrados.")
        
        # Crear la sala si no existe
        crear_sala_si_no_existe(id_sala_num, id_sala)  # Nombre de la sala es el mismo id_sala en este caso
        
        # Procesar cada mensaje
        for mensaje_str in mensajes:
            try:
                # Los mensajes vienen en formato JSON: ["fecha", "usuario", "mensaje"]
                fecha, usuario, texto = json.loads(mensaje_str)
                
                # Convertir la fecha al formato adecuado para PostgreSQL
                momento_envio = datetime.fromisoformat(fecha.replace("Z", ""))
                
                # Insertar el mensaje en PostgreSQL usando el id_sala_num
                insertar_mensaje(usuario, texto, momento_envio, id_sala_num)
            except Exception as e:
                print(f"Error al procesar el mensaje {mensaje_str}: {e}")
                
        print(f"Transferencia completa para la sala {id_sala}.")
    
    except Exception as e:
        print(f"Error al obtener mensajes de Redis: {e}")

# Punto de entrada
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python transferir_mensajes.py <id_sala>")
        sys.exit(1)
    
    id_sala = sys.argv[1]
    transferir_mensajes(id_sala)

    # Cerrar conexiones
    pg_cursor.close()
    pg_conn.close()
