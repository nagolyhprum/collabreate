import { Router } from "express";
import crypto from "crypto";

import prisma from './client'
import { Socket, Server } from "socket.io";
import { MATCH, WRAP } from "../../components";

export const Database = (dependencies : IDependencies) => {
    dependencies.set("admin:database", prisma);
    const router = dependencies.get("router") as Router;
    router.use((req, res, next) => {
        const host = (req.header("host") ?? "").split(".");
        const domain = host.splice(-2).join(".")
        const subdomain = host.join(".")
        if(domain && subdomain) {
            next();
        } else {
            res.status(302).header({
                "Location" : `www.${domain}`
            }).end()
        }
    })
    if(process.env.NODE_ENV !== "production") {
        router.delete("/api", async (_, res) => {
            try {
                await prisma.component.deleteMany()
                await prisma.file.deleteMany()
                await prisma.branch.deleteMany()
                await prisma.project.deleteMany()
                res.status(200).end()
            } catch(e) {
                console.log(e);
                res.status(400).end()
            }
        })
    }
    const getProject = async (projectId : string, branchId : string) => {
        const project = (await prisma.project.findFirst({
            where : {
                id : projectId
            }
        })) || (await prisma.project.create({
            data : {
                id : projectId
            }
        }))
        const branch = (await prisma.branch.findFirst({
            where : {
                id : branchId,
                projectId
            }
        })) || (await prisma.branch.create({
            data : {
                id : branchId,
                projectId                
            }
        }))
        // TODO : IF IT IS NEW THEN LOAD FROM WWW
        const files = await prisma.file.findMany({
            where : {
                branch
            }
        })
        const components = await prisma.component.findMany({
            where : {
                branch
            }
        })
        return {
            project,
            branch,
            files,
            components,
        }
    }
    const io = dependencies.get("socket.io") as Server
    const getMains = (host : string | undefined) => {
        const split = (host ?? "").split(".");
        const domain = split.splice(-2).join(".")
        const subdomain = split.join(".")
        return {
            domain,
            subdomain
        }
    }
    router.get("/api/project", async (req, res) => {
        try {
            const { domain, subdomain } = getMains(req.header("host"))
            res.send(await getProject(domain, subdomain))
        } catch(e) {
            console.log(e)
            res.status(400).end()
        }
    })
    io.on("connect", (socket : Socket) => {
        const { domain, subdomain } = getMains(socket.handshake.headers.host)
        socket.join(`${domain}_${subdomain}`)
    })
    router.post("/api/file", async (req, res) => {
        try {
            const {
                domain,
                subdomain
            } = getMains(req.header("host"))
            const {
                _count : {
                    _all : files
                }
            } = await prisma.file.aggregate({
                _count : {
                    _all : true
                },
                where : {
                    isFolder : req.body.isFolder,
                    branchId : req.body.branchId,
                }
            })
            const file = await prisma.file.create({
                data : {
                    isFolder : req.body.isFolder,
                    branchId : req.body.branchId,
                    parentId : req.body.parentId,
                    name : `${req.body.isFolder ? "Folder" : "File"}_${files}`,
                    uiId : crypto.randomBytes(20).toString('hex'),
                }
            })
            io.to(`${domain}_${subdomain}`).emit("file.upsert", file);
            res.status(200).end()
        } catch(e) {
            console.log(e)
            res.status(400).end()
        }
    })
    router.patch("/api/file", async (req, res) => {
        try {
            const {
                domain,
                subdomain
            } = getMains(req.header("host"))
            const file = await prisma.file.update({
                where : {
                    id : req.body.id
                },            
                data : {
                    parentId : req.body.parentId,
                    name : req.body.name
                }
            })
            io.to(`${domain}_${subdomain}`).emit("file.upsert", file);
            res.status(200).end()
        } catch(e) {
            console.log(e)
            res.status(400).end()
        }
    })
    router.delete("/api/file", async (req, res) => {
        try {
            const {
                domain,
                subdomain
            } = getMains(req.header("host"))
            await prisma.file.delete({
                where : {
                    id : req.body.id
                }
            })
            io.to(`${domain}_${subdomain}`).emit("file.remove", req.body.id);
            res.status(200).end()
        } catch(e) {
            console.log(e)
            res.status(400).end()
        }
    })
    router.post("/api/component", async (req, res) => {
        try { 
            const {
                domain,
                subdomain
            } = getMains(req.header("host"))
            const component = await prisma.component.create({
                data : {
                    uiId : crypto.randomBytes(20).toString('hex'),                    
                    props : {
                        type : req.body.props.type,
                        index : req.body.props.index,
                        width : MATCH,
                        height : WRAP,
                        text : "THIS IS A TEST"
                    },
                    parentId : req.body.parentId,
                    branchId : req.body.branchId,
                    fileId : req.body.fileId,
                }
            })
            io.to(`${domain}_${subdomain}`).emit("component.upsert", component);
            res.status(200).end()

        } catch(e) {
            console.log(e)
            res.status(400).end()
        }
    })
};