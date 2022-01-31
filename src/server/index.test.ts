import collabreate from './'
import request from 'supertest'
import express from 'express'

describe("server", () => {
    describe("default", () => {
        it("handles admin pages", (done) => {
            const app = express();
            app.use(collabreate([]))
            request(app)
                .get('/admin')
                .expect('Content-Type', "text/html; charset=utf-8")
                .expect(200)
                .end(done);
        })
    })
})