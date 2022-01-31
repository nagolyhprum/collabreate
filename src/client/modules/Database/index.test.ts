import { prismaMock } from './singleton'
import { Database } from './'
import { Dependencies } from '../../../server/dependencies'
import express, { Router } from 'express'
import request from 'supertest'

describe("Database", () => {
  describe("default", () => {
    it("can conntect to the room", (done) => {
      const dependencies = new Dependencies()
      const router = Router();
      dependencies.set("router", router)
      dependencies.set("socket.io", {
        on(name : string, callback : (socket : any) => void) {
          if(name === "connect") {
            callback({
              handshake : {
                headers : {
                  host : "subdomain.domain.com"
                }
              },
              join(name : string) {
                expect(name).toBe("domain.com_subdomain")
                done()
              }
            })
          }
        }
      })
      Database(dependencies)
    })
    it("can get an existing project and branch", (done) => {
      const dependencies = new Dependencies()
      const router = Router();
      dependencies.set("router", router)
      dependencies.set("socket.io", {
        on() {
          // DO NOTHINGNOTING
        }
      })
      Database(dependencies)
      const app = express();
      app.use(router)
      prismaMock.project.findFirst.mockResolvedValue({
        id : "",
        latestBranchId : ""
      })
      prismaMock.branch.findFirst.mockResolvedValue({
        id : "",
        projectId : "",
        previousBranchId : ""
      })
      prismaMock.file.findMany.mockResolvedValue([])
      request(app)
        .get("/api/project")
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(200)
        .end((err, res) => {
          expect(res.body).toMatchSnapshot()
          done(err)
        })
    })
    it("can create files", (done) => {
      const dependencies = new Dependencies()
      const router = Router();
      dependencies.set("router", router)
      dependencies.set("socket.io", {
        on() {
          // DO NOTHINGNOTING
        },
        to(room : string) {
          expect(room).toBe("domain.com_subdomain")
          return {
            emit(name : string, value : any) {
              expect(name).toBe("file.upsert")
              expect(value).toEqual({
                branchId: "",
                id: -1,
                uiId : "",
                isFolder : false,
                name : "",
                parentId : -1
              })
              done()
            }
          }
        }
      })
      Database(dependencies)
      const app = express();
      app.use(express.json())
      app.use(router)
      prismaMock.file.aggregate.mockResolvedValue({
        _count : {
          _all : 0
        },
        _avg : {},
        _max : {},
        _min : {},
        _sum : {}
      })
      prismaMock.file.create.mockResolvedValue({
        branchId: "",
        id: -1,
        uiId : "",
        isFolder : false,
        name : "",
        parentId : -1
      })
      request(app)
        .post("/api/file")
        .set('Content-type', 'application/json')
        .set('Host', 'subdomain.domain.com')
        .send({
          isFolder : false,
          branchId : "",
          parentId : -1
        })
        .expect(200)
        .end(err => {
          if(err) {
            done(err)
          }
        })
    })
  })
})