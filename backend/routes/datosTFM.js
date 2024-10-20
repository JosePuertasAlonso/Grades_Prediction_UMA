const express = require('express');
const router = express.Router();
const { getAllData,
        getAllTitulaciones, 
        getAsignaturasByTitulacion, 
        getEstadisticasByTitulacionYAsignatura, 
        getCursosAcademicos, 
        getCalificacionesByTitulacionYAsignaturaYCurso,
        getTopAsignaturasPorCalificacion } = require('../controllers/datosTFMController');

const {getAsignaturas, getAsignaturasMismoCluster} = require('../controllers/clusterController');

router.get('/', getAllData);
router.get('/titulaciones', getAllTitulaciones);
router.get('/asignaturas/:titulacion', getAsignaturasByTitulacion);
router.get('/estadisticas/:titulacion/:asignatura/:cursoAcademico', getEstadisticasByTitulacionYAsignatura);
router.get('/cursosAcademicos/:titulacion/:asignatura', getCursosAcademicos);
router.get('/calificaciones/:titulacion/:asignatura/:cursoAcademico', getCalificacionesByTitulacionYAsignaturaYCurso);
router.get('/top-asignaturas/:titulacion/:tipoCalificacion', getTopAsignaturasPorCalificacion);
router.get('/cluster/asignaturas', getAsignaturas);
router.get('/cluster/asignaturas/:nombreAsignatura', getAsignaturasMismoCluster);


module.exports = router;
