const crudModel = require('../models/crud');

// Controller methods
async function createCrud(req, res, next) {
    try {
        const crudData = await crudModel.query().insert(req.body);
        res.status(201).json(crudData);
    } catch (error) {
        console.log('error')
        next(error);
    }
}

async function getCrud(req, res, next) {
    try {
        const crudData = await crudModel.query();
        res.status(200).json(crudData);
    } catch (error) {
        console.log('error')
        next(error);
    }
}

async function getCrudList(req, res, next) {
    try {
        const crudData = await crudModel.query();
        res.status(200).json(crudData);
    } catch (error) {
        next(error);
    }
}


async function updateCrud(req, res, next) {
    try {
        const crudData = await crudModel.query().patchAndFetchById(req.params.id, req.body);
        res.status(200).json(crudData);
    } catch (error) {
        next(error);
    }
}

async function deleteCrud(req, res, next) {
    try {
        const crudData = await crudModel.query().deleteById(req.params.id);
        res.status(200).json(crudData);
    } catch (error) {
        next(error);
    }
}

// Add more controller methods as needed

module.exports = {
    createCrud,
    getCrudList,
    getCrud,
    updateCrud,
    deleteCrud,
};
