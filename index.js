import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const readData = () => {
    try {
        const data = fs.readFileSync("./db.json");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error al leer el archivo:", error);
        return;
    }
}

const writeData = (data) => {try {
        fs.writeFileSync("./db.json", JSON.stringify(data));
    }
    catch (error) {
        console.error("Error al leer el archivo:", error);
        return;
    }
}

readData();

app.get('/', (req, res) => {
    res.send('Bienvenido a la API de Comidas');
});

app.get('/menu', (req, res) => {
    const data = readData();
        res.json(data.menu);
});

app.get('/menu/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const menu = data.menu.find(menu => menu.id === id);
    res.json(menu);
});

app.post('/menu', (req, res) => {
    const data = readData();
    const body = req.body;
    const nuevoMenu = {
        id: data.menu.length + 1,
        ...body
    };
    data.menu.push(nuevoMenu);
    writeData(data);
    res.json(nuevoMenu);
});

app.put('/menu/:id', (req, res) => {  
    const data = readData();
    const body = req.body;
    const id = parseInt(req.params.id);
    const menuIndex = data.menu.findIndex(menu => menu.id === id);
    data.menu[menuIndex] = {
        id: id,
        ...body
    };
    writeData(data);
    res.json(data.menu[menuIndex]);
});

app.delete('/menu/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const menuIndex = data.menu.findIndex(menu => menu.id === id);
    data.menu.splice(menuIndex, 1);
    writeData(data);
    res.json({ message: 'comida eliminado correctamente' });
});

app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});