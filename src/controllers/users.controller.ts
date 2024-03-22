import { Request, Response } from 'express';
import prisma from '../models/user';
import { hashPassword } from '../services/password.service';


export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {

        const { email, password } = req.body

        if (!email) {
            res.status(400).json({ message: "The email must be provided" })
            return
        }
        if (!password) {
            res.status(400).json({ message: "The password must be provided" })
            return
        }

        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create(
            {
                data: {
                    email,
                    password: hashedPassword
                }
            }
        )

        res.status(201).json(user)



    } catch (err: any) {
        if (err?.code === 'P2002' && err?.meta?.target?.includes('email')) {
            res.status(400).json({ message: "The email is already exists" })
        }



        console.log(err)
        res.status(500).json({ err: 'Error, try later' });
    }

}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany()
        res.status(200).json(users);

    } catch (err: any) {
        console.log(err)
        res.status(500).json({ err: 'Error, try later' });
    }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)

    try {

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            res.status(404).json({ err: 'User not found' });
            return
        }

        res.status(200).json(user)

    } catch (err: any) {
        res.status(500).json({ err: 'Error, try later' });
    }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    const { email, password } = req.body;

    try {
        let dataToUpdate: any = { ...req.body }

        if (password) {
            const hashedPassword = await hashPassword(password)
            dataToUpdate.password = hashedPassword
        }
        if (email) {
            dataToUpdate.email = email
        }

        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: dataToUpdate
        })
        res.status(200).json(user)

    } catch (err: any) {
        if (err?.code === 'P2002' && err?.meta?.target?.includes('email')) {
            res.status(400).json({ err: 'The email is already exists' })
        } else if (err?.code === 'P2025') {
            res.status(404).json({ err: 'User not found' })
        } else {
            console.log(err)
            res.status(500).json({ err: 'Error,try later' })
        }
    }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    try {
        await prisma.user.delete({
            where: {
                id: userId
            }
        })
        res.status(200).json({
            message: `The user ${userId} has been deleted successfully`
        }).end()

    } catch (err: any) {
        console.log(err)
        res.status(500).json({ err: 'Error,try later' })
    }

}