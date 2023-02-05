import * as dotenv from 'dotenv';
import express = require('express');
import { Express } from 'express';
import cors = require('cors');
import mongoose, {MongooseError} from 'mongoose';
import { hash, compare } from 'bcryptjs';
import jwt = require('jsonwebtoken');
import { Secret } from 'jsonwebtoken';

import User from './database/models/user.model';
import IUser from './util/interfaces/user';
import IUserModal from './util/interfaces/userModal';

dotenv.config();

const server: Express = express();
server.use(cors());
server.use(express.json());

const main = async () => {

    await mongoose.connect(process.env.CONNECTION_STRING as string);
    mongoose.set('strictQuery', false);

    server.get('/test', (req, res) => {
        res.send('Works');
    });

    server.post('/user/register', async (req, res) => {
        try {
            const newUser: IUser = req.body;
            
            await User.create({
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                password: await hash(newUser.password, 10)
            });

            const jwtToken = jwt.sign({
                user: newUser
            }, process.env.SECRET as Secret);

            console.log('New user has been added');
            res.json({status: 'ok', token: jwtToken});
        }catch (err) {
            console.error(`Error while saving new user: ${err}`);
            res.json({status: 'error', err: `${err}`});
        }
    });
    
    server.post('/user/login', async (req,res) => {
        try {
            const user: IUser = req.body;

            const specificUser: IUserModal | null = await User.findOne({
                email: user.email
            });

            if(!specificUser) {
                res.json({status: 'no_user', token: false});
            }else {
                if(await compare(user.password, specificUser?.password as string)) {
                    const jwtToken = jwt.sign({
                        user: specificUser
                    }, process.env.SECRET as Secret);
                    
                    console.log(jwtToken);
    
                    res.json({status: 'ok', token: jwtToken});
                }else {
                    res.json({status: 'wrong_pass', token: false});
                }
            }
        }catch (err) {
            console.error(`Error while retrieving specific user: ${err}`);
            res.json({status: 'error', error: `${err}`});
        }
    });

    server.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}...`);
    });
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    })