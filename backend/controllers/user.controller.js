const schema = require('../models/usuario.model');
const service = require('../services/usuario.service');
const hasher = require('../utils/bcrypt.utils');
const waitlist = require('../models/waitlist.model');
const jwtCreator = require('../utils/jwt.utils');
//Creacion del usuario
const CreateUser = async (req, res)=>{
    try{
        let {error, value} = schema.validate(req.body);
        if(error){
            return res.status(400).send(error.message);
        }
        if(await service.FindUserByUsername(value.username)){
            return res.status(400).send("Usuario con el nombre de usuario ya registrado");
        }
        if(await service.FindUserByEmail(value.email)){
            return res.status(400).send("Usuario con el correo ya registrado");
        }
        value.password = await hasher.hashPassword(value.password); // Encriptacion de contraseña
        await service.CreateUser(value);
        return res.status(201).send("Usuario creado con exito");
    }catch(error){
        return res.status(500).send(error.message);
    }
};
//Encontrar a usuario por email
const FindUserByEmail = async(req,res)=>{
    try{
        const search = await service.FindUserByEmail(req.body.email);
        if(search){
            return res.status(200).send(search);
        }
        else{
            return res.status(404).send("Usuario no encontrado")
        }
    }catch(error){
        return res.status(500).send(error);
    }
}
//Login
const LoginUsuario = async(req,res,next) =>{
    try{
        const search = await service.LoginUsuario(req.body.data);
        if(search){
            const compare = await hasher.checkPassword(req.body.password,search.password);
            if(compare){
                //Creacion del JWT y cookie de usuario
                const token = await jwtCreator.generateJWT({
                    userId:search.username,
                    userRole:search.role
                });
                req.token = token;
                req.role = search.role;
                next();
                return
            }
        }
        return res.status(404).send("Correo o contraseña incorrecta");
    }catch(error){
        console.error(error.message);
        return res.status(500).send(error.message);
    }
}
//Encontrar a usuario por rol
const FindUserByUsername = async(req,res)=>{
    try{
        const search = await service.FindUserByUsername(req.body.username);
        if(search){
            return res.status(200).send(search);
        }
        else{
            return res.status(404).send("Usuario no encontrado");
        }
    }catch(err){
        console.error(err);
        return res.status(500).send(err);
    }

}
//Encontrar meseros
const FindWaiters = async(req,res) =>{
    try{
        const search = await service.FindWaiters();
        if(search){
            return res.status(200).send(search);
        }
        else{
            return res.status(404).send("No se encontraron meseros");
        }
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);  
    }
}

const GetWaitList = async(req,res) =>{
    try{
        const Search = await service.GetWaitList();
        return res.status(200).send(Search);
    }catch(exp){
        console.error(exp.message);
        return res.status(500).send(exp);
    }
}
const DeleteWaitList = async(req,res) =>{
    try{
        const result = await service.DeleteWaitList(req.params.id);
        return res.status(200).send(result);
    }catch(exp){
        console.error(exp.message);
        return res.status(500).send(exp);
    }
}
const AddWaitList = async(req,res) =>{
    try{
        let {error, value} = waitlist.validate(req.body);
        if(error){
            return res.status(400).send(error.message);
        }
        await service.AddWaitList(value);
        return res.status(200).send("Añadido a la wait list");
    }catch(exp){
        console.error(exp.message);
        return res.status(500).send(exp);
    }
}
module.exports ={
    CreateUser,
    FindUserByEmail,
    LoginUsuario,
    FindUserByUsername,
    FindWaiters,
    GetWaitList,
    DeleteWaitList,
    AddWaitList
};