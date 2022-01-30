import { File } from '@prisma/client'
import { defaultAdminState } from '../../server/state'
import { test } from '../components'
import { RenameModal, FileComponent } from './'

describe("Components", () => {
    describe("RenameModal", () => {
        it("save enabled is properly tracked", () => {
            const global = defaultAdminState()
            const document = test(RenameModal, global, global)
            // it gets enabled
            document.input("rename_modal_name_input", "test")
            expect(document.id("rename_modal_save_button")?.enabled).toBe(true)
            // it gets disabled
            document.input("rename_modal_name_input", "")
            expect(document.id("rename_modal_save_button")?.enabled).toBe(false)
        })
        it("can open and close", () => {
            const global = defaultAdminState({
                modal : {
                    rename : {
                        id : 1,                        
                    }
                }
            })
            const document = test(RenameModal, global, global)
            expect(document.id("rename_modal")?.visible).toBe(true)
            // lets cancel the rename
            document.click("rename_modal_cancel_button")
            expect(document.id("rename_modal")?.visible).toBe(false)
        })
        it("can rename a folder / file", () => {
            const global = defaultAdminState({
                modal : {
                    rename : {
                        id : 1,
                        input : "test 123",
                        name : "test"
                    }
                }
            })
            const fetch = jest.fn();
            const document = test(RenameModal, global, global, {
                fetch
            })
            // make sure it observes properly
            expect(document.id("rename_modal")?.visible).toBe(true)
            expect(document.id("rename_modal_title")?.text).toBe("Renaming: test")
            // save it
            document.click("rename_modal_save_button")
            expect(fetch).toBeCalledWith("/api/file", {
                method : "PATCH",
                headers : {
                    "Content-Type" : "application/json; charset=utf-8"
                },
                body : JSON.stringify({
                    id : 1,
                    name : "test 123"
                })
            })
            // it should close now
            expect(document.id("rename_modal")?.visible).toBe(false)
        })
    })
    describe("FileComponent", () => {
        const file = (file : Partial<File> = {}) => ({
            branchId : "",
            id : -1,
            isFolder : false,
            name : "",
            parentId : -1,
            uiId : "",
            ...file
        })
        it("shows the files name", () => {
            const global = defaultAdminState()
            const local = file({
                name : "test"
            })
            const document = test(FileComponent, global, local)
            expect(document.id("file_component_name")?.text).toBe("test")
        })
        it("can open rename", () => {
            const global = defaultAdminState()
            const local = file({
                id : 1,
                name : "test"
            })
            const document = test(FileComponent, global, local)
            document.click("file_component_rename_buttom")
            expect(global.modal.rename).toEqual({
                id : 1,
                name : "test",
                input : "test"
            })
        })
        it("can open move", () => {
            const global = defaultAdminState()
            const local = file({
                id : 1,
                name : "test",
                parentId : 2
            })
            const document = test(FileComponent, global, local)
            document.click("file_component_move_buttom")
            expect(global.modal.move).toEqual({
                id : 1,
                name : "test",
                parentId : 2
            })
        })
        it("can open remove", () => {
            const global = defaultAdminState()
            const local = file({
                id : 1,
                name : "test"
            })
            const document = test(FileComponent, global, local)
            document.click("file_component_remove_buttom")
            expect(global.modal.remove).toEqual({
                id : 1,
                name : "test",
                input : ""
            })
        })
    })
})