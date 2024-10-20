const oracledb = require('oracledb');
const dbConfig = require('../db');
const { calcularMediana, calcularModa } = require('../utils/utils');

async function getAllData(req, res) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute('SELECT * FROM v_calificaciones');
        await connection.close();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}

async function getAllTitulaciones(req, res) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const query = `select distinct titulación 
                       from v_calificaciones 
                       where titulación LIKE 'GRADUADO/A%'`;
        const result = await connection.execute(query);
        await connection.close();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}

async function getAsignaturasByTitulacion(req, res) {
    const { titulacion } = req.params;  
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const query = `
            select DISTINCT nombreAsignatura
            FROM v_calificaciones
            WHERE titulación = :titulacion
            ORDER BY nombreAsignatura
        `;
        const result = await connection.execute(query, [titulacion]);
        await connection.close();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}

async function getEstadisticasByTitulacionYAsignatura(req, res) {
    const { titulacion, asignatura, cursoAcademico } = req.params;

    try {
        const connection = await oracledb.getConnection(dbConfig);
        const query = `
            SELECT num_calificación
            FROM v_calificaciones
            WHERE titulación = :titulacion
              AND nombreAsignatura = :asignatura
              AND cursoAcadémico = :cursoAcademico
              AND calificación <> 'NO PRESENTADO'
        `;
        
       // console.log('Query:', query);
        const result = await connection.execute(query, [titulacion, asignatura, cursoAcademico]);
        await connection.close();

        const calificaciones = result.rows.map(row => parseFloat(row[0]));

        const media = calificaciones.reduce((acc, val) => acc + val, 0) / calificaciones.length;
        const desviacionTipica = Math.sqrt(calificaciones.map(val => Math.pow(val - media, 2)).reduce((acc, val) => acc + val, 0) / calificaciones.length);
        const mediana = calcularMediana(calificaciones);
        const moda = calcularModa(calificaciones);
        const maximo = Math.max(...calificaciones);
        const minimo = Math.min(...calificaciones);
        const totalAlumnos = calificaciones.length;

        res.json({ media, desviacionTipica, mediana, moda, maximo, minimo, totalAlumnos });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}


async function getCursosAcademicos(req, res) {
    const { titulacion, asignatura } = req.params;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const query = `
        select DISTINCT cursoAcadémico 
        from v_calificaciones 
        where titulación = :titulacion
        and nombreAsignatura = :asignatura
        order by cursoAcadémico`;
        const result = await connection.execute(query, [titulacion, asignatura]);
        //console.log('Result:', result.rows);
        await connection.close();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}

async function getCalificacionesByTitulacionYAsignaturaYCurso(req, res) {
    const { titulacion, asignatura, cursoAcademico } = req.params;

    try {
        const connection = await oracledb.getConnection(dbConfig);
        const query = `
            SELECT 
                calificación, 
                num_calificación,
                COUNT(*) as count
            FROM 
                v_calificaciones
            WHERE 
                titulación = :titulacion
                AND nombreAsignatura = :asignatura
                AND cursoAcadémico = :cursoAcademico
            GROUP BY 
                calificación, 
                num_calificación
            ORDER BY 
                num_calificación
        `;

        const result = await connection.execute(query, [titulacion, asignatura, cursoAcademico]);
        await connection.close();

        const calificaciones = result.rows.reduce((acc, [calificacion, numCalificacion, count]) => {
            if (!acc[numCalificacion]) {
                acc[numCalificacion] = {
                    calificacion,
                    count: 0,
                };
            }
            acc[numCalificacion].count += count;
            return acc;
        }, {});
        //console.log('Calificaciones:', calificaciones);
        res.json(calificaciones);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}


async function getTopAsignaturasPorCalificacion(req, res) {
    const { titulacion, tipoCalificacion } = req.params;

    try {
        const connection = await oracledb.getConnection(dbConfig);
        const query = `
            SELECT 
                nombreAsignatura, 
                COUNT(*) AS totalCalificaciones, 
                SUM(CASE WHEN calificación = :tipoCalificacion THEN 1 ELSE 0 END) AS numTipoCalificacion,
                (SUM(CASE WHEN calificación = :tipoCalificacion THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS porcentajeTipoCalificacion
            FROM 
                v_calificaciones
            WHERE
                titulación = :titulacion
            GROUP BY 
                nombreAsignatura
            ORDER BY 
                porcentajeTipoCalificacion DESC
            FETCH FIRST 10 ROWS ONLY
        `;

        const result = await connection.execute(query, {tipoCalificacion, titulacion});
        await connection.close();

        const topAsignaturas = result.rows.map(row => ({
            nombreAsignatura: row[0],
            totalCalificaciones: row[1],
            numTipoCalificacion: row[2],
            porcentajeTipoCalificacion: row[3]
        }));
        //console.log('Top asignaturas:', topAsignaturas);
        res.json(topAsignaturas);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send('Error al obtener los datos de la base de datos');
    }
}



module.exports = {
    getAllData,
    getAsignaturasByTitulacion,
    getAllTitulaciones,
    getEstadisticasByTitulacionYAsignatura,
    getCursosAcademicos,
    getCalificacionesByTitulacionYAsignaturaYCurso,
    getTopAsignaturasPorCalificacion
};
