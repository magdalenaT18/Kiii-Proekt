const { Client } = require('pg');

async function setup() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',          // администратор корисник (пр. postgres)
    password: 'magdalena', // лозинка на администраторот
  });

  try {
    await client.connect();

    // Креирање корисникот "user" со лозинка "password"
    await client.query(`CREATE USER "user" WITH PASSWORD 'password';`);
    console.log('User "user" created (ако не постоеше)');

    // Креирање база "app" со сопственик "user"
    await client.query(`CREATE DATABASE app OWNER "user";`);
    console.log('Database "app" created (ако не постоеше)');

    // Дај привилегии на корисникот "user" на базата "app"
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE app TO "user";`);
    console.log('Granted all privileges on database "app" to user "user"');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

setup();
