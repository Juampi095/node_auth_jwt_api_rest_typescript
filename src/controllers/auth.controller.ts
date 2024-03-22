import { Request, Response } from 'express';
import prisma from '../models/user';
import { generateToken } from '../services/auth.service';
import { comparePasswords, hashPassword } from '../services/password.service';

export const register = async (req: Request, res: Response): Promise<void> => {

    const { email, password } = req.body;

    try {

        if (!email) {
            res.status(400).json({ message: "The email must be provided" })
            return
        }
        if (!password) {
            res.status(400).json({ message: "The password must be provided" })
            return
        }

        const hashedPassword = await hashPassword(password);


        const user = await prisma.user.create(
            {
                data: {
                    email,
                    password: hashedPassword
                }
            }
        )

        const token = generateToken(user)
        res.status(201).json({ token })

    } catch (err: any) {

        if (err?.code === 'P2002' && err?.meta?.target?.includes('email')) {
            res.status(400).json({ message: "The email is already exists" })
        }



        console.log(err)
        res.status(500).json({ err: 'Error making SignIn' });
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {

    const { email, password } = req.body;

    try {

        if (!email) {
            res.status(400).json({ message: "The email must be provided" })
            return
        }
        if (!password) {
            res.status(400).json({ message: "The password must be provided" })
            return
        }


        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            res.status(404).json({ err: 'User not found' });
            return
        }

        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ err: 'Email and password not match' });
        }

        const token = generateToken(user)
        res.status(200).json(token);

    } catch (err) {
        console.log('Error: ', err);
    }
}