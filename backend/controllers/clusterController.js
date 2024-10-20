const oracledb = require('oracledb');
const dbConfig = require('../db');

async function getAsignaturas(req, res) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute('SELECT NOMBREASIGNATURA FROM CLUSTERS');
        await connection.close();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}

async function getAsignaturasMismoCluster(req, res) {
    const { nombreAsignatura } = req.params;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query1 = `
            SELECT tipocluster, curso 
            FROM CLUSTERS 
            WHERE nombreasignatura = :nombreAsignatura
        `;
        console.log(nombreAsignatura);
        const result1 = await connection.execute(query1, [nombreAsignatura]);
        console.log(result1.rows);
        if (result1.rows.length === 0) {
            await connection.close();
            return res.status(404).send('Asignatura no encontrada');
        }

        const tipocluster = result1.rows[0][0];  
        const curso = result1.rows[0][1];   

        const query2 = `
            SELECT nombreasignatura, peso
            FROM CLUSTERS 
            WHERE tipocluster = :tipocluster 
            AND curso <= :curso
            AND nombreasignatura <> :nombreAsignatura
        `;

        const result2 = await connection.execute(query2, [tipocluster, curso, nombreAsignatura]);
        await connection.close();
        console.log(result2.rows);
        const asignaturas = result2.rows.map(row => ({
            nombreAsignatura: row[0],
            peso: row[1]
        }));
        res.json(asignaturas);
        console.log(asignaturas);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}


module.exports = {
    getAsignaturas,
    getAsignaturasMismoCluster
};
