import initSqlJs from 'sql.js';

const initializeDatabase = async () => {
    try {
        
        const SQL = await initSqlJs({
            locateFile: file => `sql-wasm.wasm`,
        });

        
        const db = new SQL.Database();

        
        db.run(`
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                body TEXT NOT NULL UNIQUE
            );
        `);

        console.log('Database initialized successfully');
        return db;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

export default initializeDatabase;