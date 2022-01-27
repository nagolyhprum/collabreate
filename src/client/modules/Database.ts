import { Router } from "express";

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const Database = (dependencies : Dependencies) => {
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
    const getProject = async (projectId : string, branchId : string) => {
        const project = await prisma.project.findFirst({
            where : {
                id : projectId
            }
        })
        const branch = await prisma.branch.findFirst({
            where : {
                id : branchId
            },
            select : {
                files : true
            }
        })
        // if(isNew) {
        //     const www = await getProject(projectId, "www");
        //     // TODO
        // }
        return {
            project,
            branch,
            files : branch?.files ?? []
        }
    }
    router.get("/api/project", async (req, res) => {
        const host = (req.header("host") ?? "").split(".");
        const domain = host.splice(-2).join(".")
        const subdomain = host.join(".")
        res.send(await getProject(domain, subdomain))
    })
};