import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import { body, param, validationResult } from 'express-validator';
import { error } from 'console';

const app = express(); // Crea una instancia de Express
app.use(bodyParser.json()); // Middleware para parsear el cuerpo de las solicitudes como JSON

const readData = () => { // Lee el archivo db.json y devuelve su contenido
    try {
        const data = fs.readFileSync("./db.json");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error al leer el archivo:", error);
        return;
    }
};

const writeData = (data) => { // Escribe el contenido en el archivo db.json
    try {
        fs.writeFileSync("./db.json", JSON.stringify(data));
    }
    catch (error) {
        console.error("Error al leer el archivo:", error);
        return;
    }
};

readData();

const validarErrores = (req, res, next) => { // Middleware para validar errores de las solicitudes
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const primerError = errores.array()[0].msg;
        return res.status(400).json({ error: primerError });
    }
    next();
};


app.get('/menu', (req, res) => { // Ruta para obtener todos los menús
    const data = readData();
    res.json(data.menu);
});

app.get('/menu/:id', // Ruta para obtener un menú por ID
    [param('id').isInt().withMessage('El ID debe ser un número entero')],
    validarErrores,
    (req, res) => {
        const data = readData();
        const id = parseInt(req.params.id);
        const menu = data.menu.find(menu => menu.id === id);
        if (!menu) return res.status(404).json({ error: 'Menú no encontrado' });
        res.json(menu);
    }
);

app.post('/menu', // Ruta para agregar un nuevo menú
    [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
        body('descripcion').isString().withMessage('La descripción debe ser un texto'),
    ],
    validarErrores,
    (req, res) => {
        const data = readData();
        const body = req.body;
        const nuevoMenu = {
            id: data.menu.length + 1,
            ...body
        };
        data.menu.push(nuevoMenu);
        writeData(data);
        res.status(201).json({
            mensaje: 'Comida agregada exitosamente',
            data: nuevoMenu
        });

    }
);

app.put('/menu/:id', // Ruta para actualizar un menú existente
    [
        param('id').isInt().withMessage('El ID debe ser un número entero'),
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
        body('descripcion').isString().withMessage('La descripción debe ser un texto'),
    ],
    validarErrores,
    (req, res) => {
        const data = readData();
        const id = parseInt(req.params.id);
        const body = req.body;
        const menuIndex = data.menu.findIndex(menu => menu.id === id);

        if (menuIndex === -1) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }

        data.menu[menuIndex] = {
            id: id,
            ...body
        };
        writeData(data);
        res.json({
            mensaje: 'Comida actualizada correctamente',
            data: data.menu[menuIndex]
        });

    }
);


app.delete('/menu/:id', // Ruta para eliminar un menú por ID
    [param('id').isInt().withMessage('El ID debe ser un número entero')],
    validarErrores,
    (req, res) => {
        const data = readData();
        const id = parseInt(req.params.id);
        const menuIndex = data.menu.findIndex(menu => menu.id === id);
        if (menuIndex === -1) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }
        data.menu.splice(menuIndex, 1);
        writeData(data);
        res.json({ mensaje: 'Comida eliminada correctamente' });
    }
);

app.listen(3000, () => { // Inicia el servidor en el puerto 3000
    console.log('Servidor iniciado en el puerto 3000');
});